// cogsworth/engine.js
// Local, from-scratch replacement for the Gemini + Pinecone pipeline in api/chat.js.
// Runs entirely client-side / locally with no paid APIs or external services:
//   1. resolve follow-ups against conversation history (rule-based)
//   2. match against the reviewed offline answer cache (cogsworth/answers.json) with BM25
//   3. if no confident cache match, expand the query with synonyms and rank portfolio chunks with BM25
//   4. compose an extractive answer from portfolio-data.js (or optionally rewrite it with Qwen2.5-0.5B-Instruct)

import defaultCache from './answers.json' with { type: 'json' };
import { BM25Index } from './bm25.js';
import { buildChunks, buildEntities } from './chunks.js';
import { expandQuery, splitSentences, tokenize } from './text.js';

const NO_ANSWER = "I don't have that information in Puja's portfolio. Try asking about projects, experience, education, skills, hackathons, or how to get in touch.";

const FOLLOW_UP = /\b(it|its|that|this|they|them|those|these|there|more|else|another|same|the project|the role|the company)\b/i;
const FIRST_PERSON = /\b(I|I'm|I've|I'd|my|me|myself)\b/;

// Ordered: the first matching intent wins. Each answers straight from structured data.
const INTENTS = [
  { name: 'greeting', pattern: /^\s*(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))(\s+(there|cogsworth))?\b[\s!.?]*$/i },
  { name: 'contact', pattern: /\b(contact|e-?mail|reach (her|out|puja)|linkedin|github|repositor\w*|repos?|get in touch|phone)\b/i },
  { name: 'skills', pattern: /\b(skills?|tech(nical)? stack|technolog(y|ies)|tools|programming languages?|proficient|good at)\b/i },
  { name: 'languages', pattern: /\b(languages?|speak|spoken|fluent|bilingual)\b/i },
  { name: 'certifications', pattern: /\b(certific\w*|certified|credentials?|accreditations?)\b/i },
  { name: 'talks', pattern: /\b(talks?|lectures?|speeches|spoken at|presentations?)\b/i },
  { name: 'education', pattern: /\b(educat\w*|degrees?|stud(y|ied)|schools?|universit(y|ies)|college|gpa|graduat\w*|masters?|bachelors?|rutgers)\b/i },
  { name: 'availability', pattern: /\b(based|located|location|live|lives|where is she|open to|looking for|available|availability|relocat\w*|hire|hiring)\b/i },
  { name: 'hackathons', pattern: /\bhackathons?\b/i, listOnly: true },
  { name: 'projects', pattern: /\b(projects?|built|portfolio pieces)\b/i, listOnly: true },
  { name: 'experience', pattern: /\b(experience|worked|work history|jobs?|internships?|employ\w*|career|roles?)\b/i, listOnly: true },
  { name: 'leadership', pattern: /\b(leadership|led|leader)\b/i, listOnly: true },
  { name: 'about', pattern: /\b(who is|about (her|puja)|introduce|summary|background|tell me about (her|puja|yourself)|what does (she|puja) do|passionate about)\b/i },
];

export function createEngine(data, { cache = defaultCache, rewriter = null, cacheThreshold = 2.4 } = {}) {
  const chunks = buildChunks(data);
  const entities = buildEntities(data);
  const index = new BM25Index();
  chunks.forEach((chunk, i) => index.add(i, `${chunk.title}. ${chunk.text}`, chunk));

  const cacheIndex = new BM25Index();
  (cache || []).forEach((entry, i) => {
    if (entry && entry.q && entry.a && entry.intent !== 'unknown') {
      cacheIndex.add(i, entry.q, entry);
    }
  });

  let activeRewriter = rewriter;

  function setRewriter(nextRewriter) {
    activeRewriter = nextRewriter;
  }

  function findEntity(text) {
    const lower = (text || '').toLowerCase();
    let best = null;
    for (const entity of entities) {
      for (const alias of entity.aliases) {
        const at = lower.search(new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
        if (at !== -1 && (!best || alias.length > best.alias.length)) best = { entity, alias };
      }
    }
    return best?.entity || null;
  }

  // Step 1: turn "tell me more about it" into a self-contained query.
  function resolveQuery(prompt, history = []) {
    const entity = findEntity(prompt);
    const contentTerms = tokenize(prompt).length;
    const isFollowUp = history.length > 0 && !entity && (FOLLOW_UP.test(prompt) || contentTerms <= 1);
    if (!isFollowUp) return { query: prompt, entity, followUp: false };

    for (let i = history.length - 1; i >= 0; i--) {
      const previous = findEntity(history[i].text);
      if (previous) return { query: `${prompt} ${previous.name}`, entity: previous, followUp: true };
    }
    const lastUser = [...history].reverse().find(turn => turn.role === 'user');
    return { query: lastUser ? `${prompt} ${lastUser.text}` : prompt, entity: null, followUp: true };
  }

  // Words that say *how* to answer rather than *what about*; they don't stop a
  // list intent from firing ("what projects has she worked on recently").
  const GENERIC = new Set([
    'work', 'on', 'ha', 'have', 'had', 'held', 'hold', 'recent', 'latest', 'list', 'all', 'main',
    'major', 'favorite', 'featur', 'best', 'kind', 'type', 'role', 'position', 'mani', 'much',
    'ever', 'done', 'do', 'make', 'build', 'past', 'current', 'notable', 'participat', 'earn',
    'complete', 'attend', 'area', 'proficient', 'given', 'give', 'demonstrat', 'demonstrate', 'undergrad',
  ]);

  function detectIntent(query, entity) {
    // Ignore entity names so "Pennant Education" doesn't read as an education question.
    let text = query;
    if (entity) for (const alias of entity.aliases) text = text.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), ' ');
    for (const intent of INTENTS) {
      if (!intent.pattern.test(text)) continue;
      if (intent.listOnly) {
        // "Has she worked with Airflow?" is a question about Airflow, not a request for the job list.
        const leftover = tokenize(text.replace(new RegExp(intent.pattern.source, 'ig'), ' ')).filter(t => !GENERIC.has(t));
        if (entity || leftover.length > 0) continue;
      }
      return intent.name;
    }
    return null;
  }

  // Step 2: match the visitor's question against the reviewed offline cache (answers.json)
  // above a strict BM25 + token-coverage threshold.
  function matchCache(query, entity) {
    if (!cacheIndex.docs.length) return null;

    const cleanPrompt = (query || '').trim().toLowerCase();
    for (const doc of cacheIndex.docs) {
      if (doc.meta.q.trim().toLowerCase() === cleanPrompt) {
        return { entry: doc.meta, score: 100 };
      }
    }

    const typedTerms = tokenize(query);
    if (typedTerms.length === 0) return null;

    const weights = expandQuery(query);
    const entityName = entity?.name || null;
    const entityTokens = new Set(entity ? tokenize(entity.name) : []);
    const candidates = cacheIndex
      .search(weights, { topK: 5 })
      .filter(r => (r.doc.meta.entity || null) === entityName);

    for (const candidate of candidates) {
      const entry = candidate.doc.meta;
      const cacheTerms = tokenize(entry.q);
      if (cacheTerms.length === 0) continue;

      if (typedTerms.join(' ') === cacheTerms.join(' ')) {
        return { entry, score: candidate.score };
      }

      const cacheExpanded = expandQuery(entry.q);
      const queryHits = typedTerms.filter(t => cacheExpanded.has(t) || entityTokens.has(t)).length;
      const cacheHits = cacheTerms.filter(t => weights.has(t) || entityTokens.has(t)).length;
      const queryCoverage = queryHits / typedTerms.length;
      const cacheCoverage = cacheHits / cacheTerms.length;
      const normScore = candidate.score / Math.sqrt(typedTerms.length);

      if (normScore >= cacheThreshold && queryCoverage >= 0.75 && cacheCoverage >= 0.65) {
        return { entry, score: candidate.score };
      }
    }
    return null;
  }

  const structured = {
    greeting: () => "Hi, I'm Cogsworth, Puja's portfolio assistant. Ask me about Puja's projects, experience, education, skills, hackathons, or how to get in touch.",
    contact: () => `You can reach Puja at:\n**Email:** ${data.contact.email}\n**LinkedIn:** ${data.contact.linkedin}\n**GitHub:** ${data.contact.github}`,
    skills: () => 'Puja\'s skills by area:\n' + Object.entries(data.skills).map(([category, list]) => `**${category}:** ${list.join(', ')}`).join('\n'),
    languages: () => 'Puja speaks:\n' + data.languages.map(l => `**${l.lang}:** ${l.proficiency}`).join('\n'),
    certifications: () => 'Puja\'s certifications:\n' + data.certifications.map(c => `**${c.name}** (${c.issuer})`).join('\n'),
    talks: () => 'Talks Puja has given:\n' + data.talks.map(t => `**${t.title}**, ${t.venue} (${t.date})`).join('\n'),
    education: () => 'Puja\'s education:\n' + data.education.map(e => `**${e.degree}**, ${e.school}. ${e.details}`).join('\n'),
    availability: () => {
      const sentences = splitSentences(data.about).filter(s => /^(Based in|Looking for)/.test(s));
      return `In Puja's words: "${sentences.join(' ')}"`;
    },
    hackathons: () => 'Puja\'s hackathons:\n' + data.hackathons.map(h => `**${h.name}** (${h.date}, ${h.team})`).join('\n') + '\nAsk about any of them for details.',
    projects: () => 'Puja\'s projects:\n' + data.projects.map(p => `**${p.name}** (${p.date}): ${p.tech}`).join('\n') + '\nAsk about any of them for details.',
    experience: () => 'Puja\'s experience:\n' + data.experience.map(e => `**${e.role}**, ${e.company} (${e.period})`).join('\n') + '\nAsk about any role for details.',
    leadership: () => 'Puja\'s leadership roles:\n' + data.leadership.map(l => `**${l.role}**, ${l.org} (${l.period})`).join('\n'),
    about: () => `In Puja's words: "${splitSentences(data.about).slice(0, 2).join(' ')}"\n` + structured.availability().replace("In Puja's words: ", ''),
  };

  // Steps 2–4 for open questions: retrieve chunks, then pick the sentences
  // that share the most (rare) terms with the question.
  function retrieve(query, entity) {
    const weights = expandQuery(query);
    if (entity) {
      // A named project/role/hackathon: answer only from its own chunks, best match first,
      // falling back to document order so "tell me about X" starts with the intro.
      const results = index.docs
        .filter(doc => doc.meta.entity === entity.name)
        .map((doc, order) => ({ doc, score: index.scoreDoc(doc, weights) + 1 / (order + 1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      return { weights, results };
    }
    return { weights, results: index.search(weights, { topK: 4 }) };
  }

  function composeFromChunks(weights, results, entity) {
    const typedTerms = [...weights].filter(([, w]) => w === 1).map(([t]) => t);
    const candidates = [];
    results.forEach((result, rank) => {
      splitSentences(result.doc.meta.text).forEach((sentence, position) => {
        const terms = new Set(tokenize(sentence));
        let score = 0;
        for (const [term, weight] of weights) if (terms.has(term)) score += weight * index.idf(term);
        score += result.score * 0.15;
        if (entity) score += 1.5 / (position + 1);
        if (sentence.length < 25) score *= 0.5;
        candidates.push({ sentence, score, rank, position, chunkId: result.doc.id, chunk: result.doc.meta });
      });
    });

    const picked = [];
    const perChunk = new Map();
    for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
      if (picked.length >= (entity ? 4 : 3)) break;
      const used = perChunk.get(candidate.chunk) || 0;
      if (used >= (entity ? 3 : 2) || candidate.score <= 0) continue;
      perChunk.set(candidate.chunk, used + 1);
      picked.push(candidate);
    }
    // Entity answers read in the portfolio's own order; topical answers lead with the best chunk.
    picked.sort((a, b) => (entity ? a.chunkId - b.chunkId : a.rank - b.rank) || a.position - b.position);

    const groups = new Map();
    for (const item of picked) groups.set(item.chunk.title, [...(groups.get(item.chunk.title) || []), item.sentence]);
    const text = [...groups].map(([title, sentences]) => {
      const body = sentences.join(' ');
      return FIRST_PERSON.test(body) ? `**${title}**\nIn Puja's words: "${body}"` : `**${title}**\n${body}`;
    }).join('\n\n');
    return { text, typedTerms };
  }

  function answer(prompt, history = [], { useCache = true } = {}) {
    const { query, entity, followUp } = resolveQuery(prompt, history);

    if (useCache) {
      const hit = matchCache(query, entity);
      if (hit) {
        return {
          text: hit.entry.a,
          intent: hit.entry.intent || 'retrieval',
          entity: hit.entry.entity || entity?.name || null,
          resolvedQuery: query,
          followUp,
          sources: hit.entry.sources || [hit.entry.intent || 'cache'],
          cached: true,
          matchedQuestion: hit.entry.q,
          topScore: hit.score,
        };
      }
    }

    const intent = detectIntent(query, entity);
    if (intent && !(entity && ['availability', 'about', 'skills'].includes(intent))) {
      return { text: structured[intent](), intent, entity: entity?.name || null, resolvedQuery: query, followUp, sources: [intent], cached: false };
    }

    const { weights, results } = retrieve(query, entity);
    // Confidence gate: without a named entity, require a decent BM25 score
    // relative to how many terms the visitor actually typed.
    const typedCount = [...weights.values()].filter(w => w === 1).length || 1;
    const topDoc = results[0]?.doc;
    const topScore = results[0]?.score || 0;
    const matchedTerms = topDoc ? [...weights.keys()].filter(t => topDoc.termFreq.has(t)).length : 0;
    const confident = Boolean(entity) || (topScore / Math.sqrt(typedCount) >= 2.2 && (typedCount < 3 || matchedTerms >= 2));
    if (!confident) {
      return { text: NO_ANSWER, intent: 'unknown', entity: null, resolvedQuery: query, followUp, sources: [], cached: false, topScore };
    }

    const { text } = composeFromChunks(weights, results, entity);
    return {
      text: text || NO_ANSWER,
      intent: 'retrieval',
      entity: entity?.name || null,
      resolvedQuery: query,
      followUp,
      sources: [...new Set(results.map(r => r.doc.meta.title))],
      cached: false,
      topScore,
    };
  }

  // Async pipeline: checks the answer cache first (unless useCache=false), falls back
  // to BM25 retrieval, and if a neural rewriter (Qwen2.5-0.5B-Instruct) is attached,
  // rewrites uncached BM25 retrieval answers into natural third-person prose.
  async function answerAsync(prompt, history = [], { useCache = true } = {}) {
    const base = answer(prompt, history, { useCache });
    if (base.cached || base.intent !== 'retrieval' || !activeRewriter) {
      return { ...base, rewritten: false };
    }
    const entityObj = base.entity ? entities.find(e => e.name === base.entity) || { name: base.entity } : null;
    const res = await activeRewriter.rewrite({
      query: base.resolvedQuery,
      contextText: base.text,
      extractiveText: base.text,
      entity: entityObj,
    });
    return {
      ...base,
      text: res.text,
      rewritten: res.rewritten,
      rewriteReason: res.reason,
    };
  }

  return { answer, answerAsync, setRewriter, matchCache, resolveQuery, retrieve, chunks, entities };
}
