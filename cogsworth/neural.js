// cogsworth/neural.js
// Optional neural rewriter using Qwen2.5-0.5B-Instruct via transformers.js (ONNX).
// Works in Node.js (WASM/CPU) and in the browser (WebGPU with WASM fallback).
// Facts always come from BM25-retrieved portfolio chunks; the model only rewrites
// the retrieved sentences into natural third-person prose using "Puja" / "Puja's",
// and a grounding check falls back to the extractive BM25 answer if the model
// hallucinates or drops key facts.

import { rawWords, splitSentences, tokenize } from './text.js';

export const DEFAULT_MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

const PRONOUN_RE = /\b(she|her|hers|herself|he|him|his|himself|i|i'm|i've|i'd|my|me|myself)\b/i;

const FRAMING_STEMS = new Set([
  'puja', 'sridhar', 'portfolio', 'build', 'use', 'project', 'role', 'work',
  'includ', 'develop', 'creat', 'base', 'utiliz', 'feature', 'allow', 'provid',
  'system', 'application', 'tool', 'technology', 'stack', 'design', 'help',
]);

const ALLOWED_CAPS = new Set([
  'puja', 'sridhar', 'cogsworth', 'project', 'intern', 'assistant', 'developer', 'grader',
  'head', 'representative', 'university', 'school', 'hackathon', 'dashboard',
]);

// Deterministically converts first-person portfolio prose into third-person ("Puja" / "Puja's").
export function toThirdPerson(text) {
  return (text || '')
    .replace(/In Puja's words:\s*"/g, '')
    .replace(/"$/gm, '')
    .replace(/\bSo I answered it directly\b/gi, 'Puja answered it directly')
    .replace(/\bmake her trustworthy\b/gi, 'make Filomena trustworthy')
    .replace(/\b(I|Puja)\s+(designed|built|wrote|made|created|ran|owned)\s+([^.!?]*?)\s+myself\b/gi, 'Puja $2 $3')
    .replace(/\bBuilt this on my own\b/g, 'Puja built this independently')
    .replace(/\bBuilt and compared\b/g, 'Puja built and compared')
    .replace(/\bBuilt the reduction\b/g, 'Puja built the reduction')
    .replace(/\bHelped students\b/g, 'Puja helped students')
    .replace(/\bGraded assignments\b/g, 'Puja graded assignments')
    .replace(/\bCoordinated alumni\b/g, 'Puja coordinated alumni')
    .replace(/\bTrained a Transformer\b/g, 'Puja trained a Transformer')
    .replace(/\bTrained on FER-2013\b/g, 'Puja trained it on FER-2013')
    .replace(/\bWanted to know\b/g, 'Puja wanted to know')
    .replace(/\bCompared Isolation Forest\b/g, 'Puja compared Isolation Forest')
    .replace(/\bTwo of us built\b/g, 'Puja and a teammate built')
    .replace(/\bI'm\b/g, 'Puja is')
    .replace(/\bI've\b/g, 'Puja has')
    .replace(/\bI'd\b/g, 'Puja would')
    .replace(/\bI\s+am\b/gi, 'Puja is')
    .replace(/\bI\s+was\b/gi, 'Puja was')
    .replace(/\bI\s+have\b/gi, 'Puja has')
    .replace(/\bI\s+had\b/gi, 'Puja had')
    .replace(/\bI\s+care\b/g, 'Puja cares')
    .replace(/\bI\s+build\b/g, 'Puja builds')
    .replace(/\bI\b/g, 'Puja')
    .replace(/\bMy\b/g, "Puja's")
    .replace(/\bmy\b/g, "Puja's")
    .replace(/\bmine\b/g, "Puja's")
    .replace(/\bme\b/g, 'Puja')
    .replace(/\bmyself\b/g, 'Puja')
    .replace(/\bWe\b/g, 'Puja and the team')
    .replace(/\bwe\b/g, 'Puja and the team')
    .replace(/\bour\b/g, 'their')
    .trim();
}

async function loadTransformers() {
  try {
    return await import('@huggingface/transformers');
  } catch {
    const cdnUrl = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0';
    return await import(/* @vite-ignore */ cdnUrl);
  }
}

export async function createRewriter({
  modelId = DEFAULT_MODEL_ID,
  dtype = 'q4',
  device,
  onProgress,
} = {}) {
  const { pipeline, env } = await loadTransformers();
  if (typeof window === 'undefined') {
    env.allowLocalModels = true;
  }

  let resolvedDevice = device;
  if (!resolvedDevice && typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) resolvedDevice = 'webgpu';
    } catch {
      resolvedDevice = undefined;
    }
  }

  let generator;
  try {
    generator = await pipeline('text-generation', modelId, {
      dtype,
      ...(resolvedDevice ? { device: resolvedDevice } : {}),
      ...(onProgress ? { progress_callback: onProgress } : {}),
    });
  } catch {
    generator = await pipeline('text-generation', modelId, {
      dtype,
      ...(onProgress ? { progress_callback: onProgress } : {}),
    });
  }

  async function rewrite({ query, contextText, extractiveText, entity }) {
    // Take only the top chunk group when multiple unrelated chunks were combined,
    // so the 0.5B model never mixes facts from two different projects/roles.
    const primarySection = (extractiveText || contextText || '').split('\n\n')[0] || '';
    const header = primarySection.split('\n')[0]?.startsWith('**') ? primarySection.split('\n')[0] : null;
    const thirdPersonContext = toThirdPerson(primarySection);
    if (!thirdPersonContext) {
      return { text: extractiveText, rewritten: false, reason: 'empty-context' };
    }

    const messages = [
      {
        role: 'system',
        content: [
          "You are Cogsworth, the assistant for Puja Sridhar's portfolio.",
          'Combine ALL sentences in the Context into 2 factual sentences that directly answer the Question.',
          'Copy every tool name, metric, hyphenated term, and key noun verbatim from the Context.',
          'Never expand acronyms, never explain what tools are, and never add commentary outside the Context.',
          'Always use "Puja" or "Puja\'s" (never "she", "her", "I", or "my").',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          'Context:',
          '**Data Science Intern at Exposys Data Labs (September 2022 - October 2022)**',
          'Puja built and compared four regression models to predict startup profitability. Random Forest won at 96% accuracy.',
          '',
          'Question: What did Puja do at Exposys Data Labs?',
        ].join('\n'),
      },
      {
        role: 'assistant',
        content:
          'As a Data Science Intern at Exposys Data Labs (September 2022 - October 2022), Puja built and compared four regression models to predict startup profitability, where Random Forest won at 96% accuracy.',
      },
      {
        role: 'user',
        content: [
          'Context:',
          '**Project: PostHog Engineering Impact Dashboard**',
          'PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it.',
          '',
          'Question: Tell me about the PostHog dashboard',
        ].join('\n'),
      },
      {
        role: 'assistant',
        content:
          'Puja built the PostHog Engineering Impact Dashboard with Python, Airflow, dbt, PostgreSQL, FastAPI, Redis, React, and Vercel. In the pipeline, Airflow pulls daily from GitHub, dbt shapes the data across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it.',
      },
      {
        role: 'user',
        content: `Context:\n${thirdPersonContext}\n\nQuestion: ${query}`,
      },
    ];

    const output = await generator(messages, {
      max_new_tokens: 95,
      temperature: 0,
      do_sample: false,
      return_full_text: false,
    });

    const gen = output?.[0]?.generated_text;
    const raw = (typeof gen === 'string' ? gen : gen?.[gen.length - 1]?.content || '').trim();
    const fullContext = `${thirdPersonContext} ${contextText || ''}`;
    const cleanedBody = pruneUngroundedSentences(normalizeOutput(raw), fullContext);
    const cleaned = header && !cleanedBody.startsWith('**') ? `${header}\n${cleanedBody}` : cleanedBody;
    const check = verifyGrounded({
      candidate: cleaned,
      contextText: fullContext,
      extractiveText: extractiveText || primarySection,
      query,
      entity,
    });

    if (!check.ok) {
      return { text: toThirdPerson(extractiveText), rewritten: false, reason: check.reason, raw: cleanedBody || raw };
    }
    return { text: cleaned, rewritten: true, reason: 'ok' };
  }

  return { rewrite, modelId };
}

// Replace accidental pronouns with "Puja" / "Puja's", strip wrapper quotes,
// and drop any trailing incomplete sentence if token generation hit max_new_tokens.
export function normalizeOutput(text) {
  let cleaned = (text || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\bPujas\b/g, "Puja's")
    .replace(/\b(to|with|for|from|about|reach|contact|ask)\s+(her|him)\b/gi, '$1 Puja')
    .replace(/\b(She|He)\b/g, 'Puja')
    .replace(/\b(she|he)\b/g, 'Puja')
    .replace(/\b(Her|His|Hers)\b/g, "Puja's")
    .replace(/\b(her|his|hers)\b/g, "Puja's")
    .replace(/\b(herself|himself|myself)\b/gi, 'Puja')
    .replace(/\bI'm\b/g, 'Puja is')
    .replace(/\bI've\b/g, 'Puja has')
    .replace(/\bI'd\b/g, 'Puja would')
    .replace(/\bI\s+am\b/gi, 'Puja is')
    .replace(/\bI\s+was\b/gi, 'Puja was')
    .replace(/\bI\s+have\b/gi, 'Puja has')
    .replace(/\bI\s+care\b/g, 'Puja cares')
    .replace(/\bI\s+([a-z]+ed|built|wrote|made|ran|led|won|spoke|taught|did|went|knew|kept)\b/g, 'Puja $1')
    .replace(/\bMy\b/g, "Puja's")
    .replace(/\bmy\b/g, "Puja's")
    .replace(/\bPuja's\s+Puja's\b/gi, "Puja's")
    .replace(/\bPuja\s+Puja\b/gi, 'Puja')
    .trim();

  if (cleaned && !/[.!?]["')]?$/.test(cleaned)) {
    const sentences = splitSentences(cleaned);
    const complete = sentences.filter(s => /[.!?]["')]?$/.test(s));
    if (complete.length > 0) {
      cleaned = complete.join(' ');
    }
  }
  return cleaned;
}

function findInventedProperNoun(text, contextLower, contextStems) {
  const midSentenceCaps = text.match(/(?<=[a-z0-9,;:(-]\s+)[A-Z][a-zA-Z0-9.+-]{2,}\b/g) || [];
  for (const word of midSentenceCaps) {
    const wLower = word.toLowerCase();
    if (!ALLOWED_CAPS.has(wLower) && !contextLower.includes(wLower) && !contextStems.has(tokenize(wLower)[0])) {
      return word;
    }
  }
  return null;
}

// Prunes sentences generated by the LLM that drift away from the retrieved context or invent proper nouns.
export function pruneUngroundedSentences(text, contextText) {
  const sentences = splitSentences(text);
  if (sentences.length <= 1) return text;
  const contextLower = contextText.toLowerCase();
  const contextStems = new Set(tokenize(contextLower));
  const kept = [];
  for (const sentence of sentences) {
    if (findInventedProperNoun(sentence, contextLower, contextStems)) continue;
    const words = tokenize(sentence.toLowerCase()).filter(t => !FRAMING_STEMS.has(t));
    if (words.length === 0) continue;
    const overlap = words.filter(t => contextStems.has(t)).length / words.length;
    if (overlap >= 0.6) {
      kept.push(sentence);
    }
  }
  return kept.length > 0 ? kept.join(' ') : text;
}

// Grounding guard: ensures the neural rewrite never invents numbers/facts outside
// the retrieved context, never introduces pronouns, and stays faithful to the context.
export function verifyGrounded({ candidate, contextText, extractiveText, query, entity }) {
  const bodyCandidate = (candidate || '')
    .split('\n')
    .filter(l => !l.startsWith('**'))
    .join(' ')
    .trim();

  if (!bodyCandidate || bodyCandidate.length < 15) {
    return { ok: false, reason: 'too-short' };
  }
  if (!/[.!?]["')]?$/.test(bodyCandidate)) {
    return { ok: false, reason: 'incomplete-sentence' };
  }
  if (PRONOUN_RE.test(bodyCandidate)) {
    return { ok: false, reason: 'contains-pronoun' };
  }

  const contextLower = `${contextText} ${extractiveText}`.toLowerCase();
  const candidateLower = candidate.toLowerCase();
  const bodyLower = bodyCandidate.toLowerCase();
  const contextStems = new Set(tokenize(contextLower));

  // 1. Every number in the candidate body must appear in the context.
  const candidateNums = bodyLower.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
  for (const num of candidateNums) {
    if (!contextLower.includes(num)) {
      return { ok: false, reason: `invented-number:${num}` };
    }
  }

  // 2. Mid-sentence capitalized words (proper nouns / tools) must exist in the context.
  const inventedNoun = findInventedProperNoun(bodyCandidate, contextLower, contextStems);
  if (inventedNoun) {
    return { ok: false, reason: `invented-proper-noun:${inventedNoun}` };
  }

  // 3. If an entity was matched, at least one significant word of its name must appear.
  if (entity) {
    const entityWords = rawWords(entity.name).filter(w => w.length >= 3);
    const hasEntityWord = entityWords.some(w => candidateLower.includes(w));
    if (entityWords.length > 0 && !hasEntityWord) {
      return { ok: false, reason: 'missing-entity' };
    }
  }

  // 4. Query stems that were present in the extractive answer (excluding generic verbs) must still appear.
  const genericStems = new Set([
    'do', 'build', 'make', 'use', 'work', 'have', 'know', 'what', 'which', 'how', 'where',
    'when', 'who', 'tell', 'about', 'project', 'role', 'kind', 'type', 'long', 'last',
  ]);
  const queryTerms = new Set(tokenize(query).filter(t => !genericStems.has(t)));
  const extractiveTerms = new Set(tokenize(extractiveText));
  const candidateTerms = new Set(tokenize(candidate));
  for (const term of queryTerms) {
    if (extractiveTerms.has(term) && !candidateTerms.has(term)) {
      return { ok: false, reason: `dropped-query-term:${term}` };
    }
  }

  // 5. Preserve capitalized technical terms (or hyphenated domain terms when no capitalized tools exist),
  // and ensure quantity/time questions preserve numbers from the extractive answer.
  const bodyLines = (extractiveText || '')
    .split('\n')
    .filter(l => !l.startsWith('**'))
    .join(' ')
    .replace(/In Puja's words:\s*"/g, '')
    .replace(/"$/g, '');

  if (/\b(how (many|much|long|fast)|what (percentage|accuracy|gpa|year|date)|when|by what)\b/i.test(query)) {
    const extractiveNums = bodyLines.toLowerCase().match(/\b\d+(?:[–-]\d+|\.\d+)?%?\b/g) || [];
    if (extractiveNums.length > 0 && !extractiveNums.some(n => bodyLower.includes(n))) {
      return { ok: false, reason: 'dropped-number' };
    }
  }

  const builtWithMatch = bodyLines.match(/is built with ([^.]+)\./i);
  if (builtWithMatch && /\b(tech|stack|tool|use|database|framework|language|besides|built)\b/i.test(query)) {
    const stackCaps = builtWithMatch[1].match(/\b[A-Z][a-zA-Z0-9.+-]{2,}\b/g) || [];
    for (const tool of stackCaps) {
      if (!bodyLower.includes(tool.toLowerCase())) {
        return { ok: false, reason: `dropped-stack-tool:${tool}` };
      }
    }
  }

  const extractiveCaps = bodyLines.match(/\b[A-Z][a-zA-Z0-9.+-]{2,}\b/g) || [];
  const skipCap = new Set([
    'puja', 'most', 'one', 'two', 'three', 'four', 'five', 'six', 'ten', 'full', 'good',
    'new', 'real', 'built', 'helped', 'graded', 'wanted', 'trained', 'compared', 'solo',
    'every', 'keyword', 'safety', 'health', 'the', 'that', 'this', 'from', 'getting',
  ]);
  const queryLower = (query || '').toLowerCase();
  const importantCaps = [...new Set(extractiveCaps.map(w => w.toLowerCase()))].filter(w => !skipCap.has(w));
  const nonQueryCaps = importantCaps.filter(w => !queryLower.includes(w));
  if (importantCaps.length > 0) {
    const targetCaps = nonQueryCaps.length > 0 ? nonQueryCaps : importantCaps;
    const keptCaps = targetCaps.filter(w => bodyLower.includes(w));
    const minRequired = targetCaps.length >= 4 ? Math.ceil(targetCaps.length * 0.5) : 1;
    if (keptCaps.length < minRequired) {
      return { ok: false, reason: `dropped-tech-terms:${targetCaps.slice(0, 3).join(',')}` };
    }
  } else {
    const hyphenTerms = bodyLines.toLowerCase().match(/\b[a-z]{3,}-[a-z]{3,}\b/g) || [];
    for (const hTerm of hyphenTerms) {
      if (!bodyLower.includes(hTerm)) {
        return { ok: false, reason: `dropped-hyphen-term:${hTerm}` };
      }
    }
  }

  // 6. When the extractive body has multiple sentences, ensure the rewrite doesn't drop
  // either the intro sentence (for roles/hackathons) or the rest of the description.
  const entityStems = new Set(entity ? tokenize(entity.name) : []);
  const bodyCandidateStems = new Set(tokenize(bodyLower));
  const extractiveSentences = splitSentences(bodyLines);
  if (extractiveSentences.length >= 2 && !/\b(tech|stack|tool|use)\b/i.test(query)) {
    if (!builtWithMatch) {
      const introTarget = extractiveSentences[0].includes(': ')
        ? extractiveSentences[0].split(/:\s+/).pop()
        : extractiveSentences[0];
      const firstStems = tokenize(introTarget).filter(
        t => !FRAMING_STEMS.has(t) && !entityStems.has(t)
      );
      const matchedFirst = firstStems.filter(t => bodyCandidateStems.has(t));
      const minFirst = Math.min(2, firstStems.length);
      if (minFirst > 0 && matchedFirst.length < minFirst) {
        return { ok: false, reason: 'incomplete-context-coverage' };
      }
    }
    const restStems = tokenize(extractiveSentences.slice(1).join(' ')).filter(
      t => !FRAMING_STEMS.has(t) && !entityStems.has(t)
    );
    const matchedRest = restStems.filter(t => bodyCandidateStems.has(t));
    if (restStems.length >= 2 && matchedRest.length < 2) {
      return { ok: false, reason: 'incomplete-context-coverage' };
    }
  }

  // 7. When the extractive answer spans multiple distinct sections, ensure none are completely dropped.
  const sections = (extractiveText || '').split('\n\n').filter(Boolean);
  if (sections.length > 1) {
    const allSectionStems = sections.map(sec =>
      new Set(tokenize(sec).filter(t => !FRAMING_STEMS.has(t) && !genericStems.has(t) && !queryTerms.has(t)))
    );
    for (let i = 0; i < allSectionStems.length; i++) {
      const uniqueToSection = [...allSectionStems[i]].filter(
        t => allSectionStems.every((other, j) => j === i || !other.has(t))
      );
      if (uniqueToSection.length > 0 && !uniqueToSection.some(t => candidateTerms.has(t))) {
        return { ok: false, reason: 'dropped-section' };
      }
    }
  }

  // 8. At least 62% of content stems in the candidate body must come from the retrieved context.
  const candWords = tokenize(bodyLower).filter(t => !FRAMING_STEMS.has(t));
  if (candWords.length > 0) {
    const groundedCount = candWords.filter(t => contextStems.has(t)).length;
    if (groundedCount / candWords.length < 0.62) {
      return { ok: false, reason: 'low-context-overlap' };
    }
  }

  return { ok: true };
}
