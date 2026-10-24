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
  { name: 'greeting', pattern: /^\s*(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))(\s+(there|cogsworth))?\b[\s!.?]*$|\b(what(['’]?s| is)|who(['’]?s| is)|tell me about)\s+cogsworth\b/i },
  { name: 'pitch', pattern: /\b(why (should (i|we|you) )?(hire|work with|choose)|reasons? to hire|pitch|what makes (her|puja) stand out)\b/i },
  { name: 'featured_projects', pattern: /\b(featured|strongest|best|top|favorite|main|notable|impressive|biggest|proudest)\s+(portfolio\s+)?projects?\b/i },
  { name: 'contact', pattern: /\b(contact|e-?mail|reach (her|out|puja)|linkedin|github|repositor\w*|repos?|get in touch|phone)\b/i },
  { name: 'talks', pattern: /\b(talks?|lectures?|speeches|spoken at|where has (she|puja) spoken|presentations?)\b/i },
  { name: 'skills', pattern: /\b(skills?|tech(nical)? stack|technolog(y|ies)|tools|programming languages?|proficient|good at)\b/i, listOnly: true },
  { name: 'languages', pattern: /\b(languages?|speak|spoken languages?|fluent|bilingual)\b/i },
  { name: 'certifications', pattern: /\b(certific\w*|certified|credentials?|accreditations?|coursera|deeplearning\.ai)\b/i },
  { name: 'education', pattern: /\b(educat\w*|degrees?|stud(y|ied)|schools?|universit(y|ies)|college|gpa|graduat\w*|masters?|bachelors?|rutgers)\b/i },
  { name: 'availability', pattern: /\b(based|located|location|live|lives|where is she|open to|looking for|interested in|available|availability|relocat\w*|hire|hiring)\b/i },
  { name: 'hackathons', pattern: /\bhackathons?\b/i, listOnly: true },
  { name: 'projects', pattern: /\b(projects?|built|portfolio pieces)\b/i, listOnly: true },
  { name: 'experience', pattern: /\b(experience|worked|work history|jobs?|internships?|employ\w*|career|roles?)\b/i, listOnly: true },
  { name: 'leadership', pattern: /\b(leadership|led|leader)\b/i, listOnly: true },
  { name: 'about', pattern: /\b(who is|about (her|puja)(?!['’]s)|introduce|summary|background|tell me about (her|puja|yourself)(?!['’]s)|what does (she|puja) do|passionate about)\b/i },
];

const TECH_QUERY_RE = /\b(has (she|puja) (ever )?(used|worked with|built|done)|does (she|puja) (know|use|have experience with)|did (she|puja) (do anything|work) with|what experience does (she|puja) have with|is (she|puja) (familiar|experienced|good) with)\b/i;
const SUBSTANCE_RE = /\b(built|runs|pulls|parses|renders|synthesizes|stitches|automate|contributed|designed|trained|compiled|allocator|shell|scheduler|pipes|deadlocks|agents|models|streamed|graded|helped|coordinated|\d+)\b/i;

function buildTechCatalog(data) {
  const catalog = [];
  const add = (label, aliases, skillCategory = null, displaySkill = label) => {
    const existing = catalog.find(c => c.label.toLowerCase() === label.toLowerCase());
    if (existing) {
      if (skillCategory && !existing.categories.includes(skillCategory)) existing.categories.push(skillCategory);
      aliases.forEach(a => {
        if (!existing.aliases.includes(a.toLowerCase())) existing.aliases.push(a.toLowerCase());
      });
      return;
    }
    catalog.push({
      label,
      displaySkill,
      aliases: [...new Set([label.toLowerCase(), ...aliases.map(a => a.toLowerCase())])],
      categories: skillCategory ? [skillCategory] : [],
    });
  };

  for (const [category, items] of Object.entries(data.skills)) {
    for (const item of items) {
      const base = item.replace(/\s*\(.*\)/, '').trim();
      const aliases = [item, base];
      if (base === 'Apache Airflow') aliases.push('airflow');
      if (base === 'C Systems Programming') aliases.push('c programming');
      if (base === 'Vector Search') aliases.push('vector db', 'vector database');
      add(base, aliases, category, item);
    }
  }

  for (const proj of data.projects) {
    for (const rawTech of proj.tech.split(/\s*[·,]\s*/)) {
      const base = rawTech.replace(/\s*\(.*\)/, '').trim();
      if (base) add(base, [rawTech, base]);
    }
  }
  return catalog;
}

export function createEngine(data, { cache = defaultCache, rewriter = null, cacheThreshold = 2.4 } = {}) {
  const chunks = buildChunks(data);
  const entities = buildEntities(data);
  const techCatalog = buildTechCatalog(data);
  const index = new BM25Index();
  chunks.forEach((chunk, i) => index.add(i, `${chunk.title}. ${chunk.text}`, chunk));

  // Only serve cache entries that have been reviewed (structured entries count as reviewed).
  const cacheIndex = new BM25Index();
  (cache || []).forEach((entry, i) => {
    const isReviewed = entry?.reviewed === true || (entry?.generator === 'structured' && entry?.reviewed !== false);
    if (entry && entry.q && entry.a && entry.intent !== 'unknown' && isReviewed) {
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
    'work', 'on', 'ha', 'have', 'had', 'hold', 'held', 'recent', 'latest', 'list', 'all', 'main',
    'major', 'favorite', 'featur', 'best', 'kind', 'type', 'role', 'position', 'mani', 'much',
    'ever', 'done', 'do', 'make', 'build', 'past', 'current', 'notable', 'participat', 'earn',
    'complete', 'attend', 'area', 'proficient', 'given', 'give', 'demonstrat', 'demonstrate', 'undergrad',
    'background', 'summary', 'passionate', 'short', 'tell', 'about', 'portfolio', 'experience',
    'program', 'programming', 'language',
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

  function findUsedIn(techItem) {
    const used = [];
    const patterns = techItem.aliases.map(
      a => new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\.js|\\b)`, 'i')
    );
    if (techItem.label === 'Computer Vision') patterns.push(/\b(OpenCV|Facial|CNN)\b/i);
    if (techItem.label === 'RAG' || techItem.label === 'Vector Search') {
      patterns.push(/\b(Vector DB|semantic cache|vector similarity)\b/i);
    }

    for (const p of data.projects) {
      const hay = `${p.name} ${p.tech} ${(p.desc || []).join(' ')}`;
      const inTech = patterns.some(re => re.test(p.tech));
      const inConcept =
        (techItem.label === 'Computer Vision' || techItem.label === 'RAG' || techItem.label === 'Vector Search') &&
        patterns.some(re => re.test(hay));
      if (inTech || inConcept) used.push(p.name);
    }
    if (used.length === 0) {
      for (const e of data.experience) {
        if (patterns.some(re => re.test(e.desc.join(' ')))) used.push(`${e.role} at ${e.company}`);
      }
      for (const h of data.hackathons) {
        if (patterns.some(re => re.test(h.desc))) used.push(h.name);
      }
    }
    return used;
  }

  // Deterministic "tech usage" answer for "has she used / does she know X" and tech categories
  // like "databases" or "frontend frameworks", looking X up in skills and in every project's tech field.
  function answerTechUsage(query, entity) {
    if (entity) return null;
    const lower = (query || '').toLowerCase();

    if (/\b(databases?|db)\b/i.test(lower)) {
      const dbSkills = ['PostgreSQL', 'Redis', 'MongoDB', 'Pinecone', 'SQL'];
      const used = data.projects
        .filter(p => dbSkills.some(t => new RegExp(`\\b${t}\\b`, 'i').test(p.tech)))
        .map(p => p.name);
      return `Yes. PostgreSQL, Redis, MongoDB, and Pinecone are in Puja's Data Engineering skills (and SQL is in Puja's Languages skills) and were used in: ${used.join(', ')}.`;
    }

    if (/\b(frontend|front-end|web|ui)\s+(frameworks?|libraries|stack|tools?)\b/i.test(lower)) {
      const webSkills = data.skills['Web & API'] || [];
      const used = data.projects
        .filter(p => ['React', 'Vite', 'FastAPI', 'Flask', 'Vercel', 'Tailwind'].some(t => new RegExp(`\\b${t}\\b`, 'i').test(p.tech)))
        .map(p => p.name);
      return `Yes. ${webSkills.join(', ')} are in Puja's Web & API skills and were used in: ${used.join(', ')}.`;
    }

    const catMatches = [
      { re: /\b(ai\s*(and|&|\/)\s*ml|machine learning)\s+(skills?|tools?)\b/i, cat: 'AI & ML' },
      { re: /\bdata engineering\s+(skills?|tools?)\b/i, cat: 'Data Engineering' },
      { re: /\bcloud(\s+and\s+infra(structure)?)?\s+(skills?|tools?)\b/i, cat: 'Cloud & Infra' },
      { re: /\bsystems(\s+programming)?\s+(skills?|tools?)\b/i, cat: 'Systems' },
    ];
    for (const { re, cat } of catMatches) {
      if (re.test(lower)) {
        const list = data.skills[cat] || [];
        const catItems = techCatalog.filter(t => t.categories.includes(cat));
        const used = [...new Set(catItems.flatMap(t => findUsedIn(t)))];
        return `Yes. ${list.join(', ')} are in Puja's ${cat} skills${used.length ? ` and were used in: ${used.join(', ')}` : ''}.`;
      }
    }

    if (!TECH_QUERY_RE.test(lower)) return null;

    const matched = [];
    for (const item of techCatalog) {
      const hit = item.aliases.some(
        a => lower.search(new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')) !== -1
      );
      if (hit) matched.push(item);
    }
    if (matched.length === 0) return null;

    // Deduplicate when both "C" and "C Systems Programming" match on "C programming".
    const filtered = matched.filter(
      item => !(item.label === 'C Systems Programming' && matched.some(other => other.label === 'C'))
    );

    const details = filtered.map(item => ({
      item,
      used: findUsedIn(item),
    }));

    if (details.length === 1) {
      const { item, used } = details[0];
      const skillPart = item.categories.length
        ? `${item.displaySkill} is in Puja's ${item.categories.join(' and ')} skills`
        : `Puja has used ${item.displaySkill}`;
      const usedPart = used.length
        ? item.categories.length
          ? ` and was used in: ${used.join(', ')}`
          : ` in: ${used.join(', ')}`
        : '';
      return `Yes. ${skillPart}${usedPart}.`;
    }

    const sameCats = details.every(d => d.item.categories.join('|') === details[0].item.categories.join('|'));
    const sameUsed = details.every(d => d.used.join('|') === details[0].used.join('|'));
    if (sameCats && sameUsed) {
      const names = details.map(d => d.item.displaySkill).join(' and ');
      const cats = details[0].item.categories;
      const used = details[0].used;
      const skillPart = cats.length ? `${names} are in Puja's ${cats.join(' and ')} skills` : `Puja has used ${names}`;
      const usedPart = used.length ? (cats.length ? ` and were used in: ${used.join(', ')}` : ` in: ${used.join(', ')}`) : '';
      return `Yes. ${skillPart}${usedPart}.`;
    }

    const sentences = details.map(({ item, used }) => {
      const skillPart = item.categories.length
        ? `${item.displaySkill} is in Puja's ${item.categories.join(' and ')} skills`
        : `Puja has used ${item.displaySkill}`;
      const usedPart = used.length
        ? item.categories.length
          ? ` and was used in: ${used.join(', ')}`
          : ` in: ${used.join(', ')}`
        : '';
      return `${skillPart}${usedPart}.`;
    });
    return `Yes. ${sentences.join(' ')}`;
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
    const queryIntent = detectIntent(query, entity);
    const candidates = cacheIndex
      .search(weights, { topK: 5 })
      .filter(r => (r.doc.meta.entity || null) === entityName)
      .filter(r => !queryIntent || r.doc.meta.intent === queryIntent);

    for (const candidate of candidates) {
      const entry = candidate.doc.meta;
      const cacheTerms = tokenize(entry.q);
      if (cacheTerms.length > 0 && typedTerms.join(' ') === cacheTerms.join(' ')) {
        return { entry, score: candidate.score };
      }
    }

    for (const candidate of candidates) {
      const entry = candidate.doc.meta;
      const cacheTerms = tokenize(entry.q);
      if (cacheTerms.length === 0) continue;

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
    pitch: () => {
      const featured = data.projects.filter(p => p.featured).map(p => p.name).join(', ');
      const roles = data.experience.slice(0, 3).map(e => `${e.role} at ${e.company}`).join(', ');
      const deg = data.education[0];
      const skillSummary = Object.entries(data.skills)
        .map(([cat, list]) => `${cat} (${list.slice(0, 4).join(', ')})`)
        .join('; ');
      return [
        'Why hire Puja:',
        `**Education:** ${deg.degree} at ${deg.school} (${deg.details}).`,
        `**Experience:** Hands-on roles including ${roles} — building LLM validation and safety frameworks, serverless AWS pipelines, and production ML systems.`,
        `**Featured projects:** ${featured}.`,
        `**Technical skills:** ${skillSummary}.`,
      ].join('\n');
    },
    featured_projects: () => {
      const featured = data.projects.filter(p => p.featured);
      return "Puja's featured (strongest) portfolio projects:\n" +
        featured.map(p => `**${p.name}** (${p.date}): ${p.tech}${p.tagline ? ` — ${p.tagline}` : ''}`).join('\n') +
        '\nAsk about any of them for details.';
    },
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
      let qStripped = query;
      for (const alias of entity.aliases) {
        qStripped = qStripped.replace(new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'ig'), ' ');
      }
      const nonEntityWeights = expandQuery(qStripped);
      // A named project/role/hackathon: answer only from its own chunks, best match first,
      // falling back to document order so "tell me about X" starts with the intro.
      const results = index.docs
        .filter(doc => doc.meta.entity === entity.name)
        .map((doc, order) => ({ doc, score: index.scoreDoc(doc, nonEntityWeights) + 1 / (order + 1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      return { weights, nonEntityWeights, results };
    }
    return { weights, nonEntityWeights: null, results: index.search(weights, { topK: 4 }) };
  }

  function composeFromChunks(weights, results, entity, nonEntityWeights = null) {
    const typedTerms = [...weights].filter(([, w]) => w === 1).map(([t]) => t);
    const scoreWeights = entity && nonEntityWeights ? nonEntityWeights : weights;
    const candidates = [];
    results.forEach((result, rank) => {
      splitSentences(result.doc.meta.text).forEach((sentence, position) => {
        const terms = new Set(tokenize(sentence));
        let score = 0;
        for (const [term, weight] of scoreWeights) if (terms.has(term)) score += weight * index.idf(term);
        score += result.score * 0.15;
        if (entity) {
          score += 1.2 / (position + 1);
          if (SUBSTANCE_RE.test(sentence)) score += 1.0;
        }
        if (sentence.length < 30) score *= 0.5;
        candidates.push({ sentence, score, rank, position, chunkId: result.doc.id, chunk: result.doc.meta });
      });
    });

    const sortedCandidates = candidates.sort((a, b) => b.score - a.score);
    const bestScore = sortedCandidates[0]?.score || 0;
    const bestChunk = sortedCandidates[0]?.chunk;

    const picked = [];
    const perChunk = new Map();
    for (const candidate of sortedCandidates) {
      const used = perChunk.get(candidate.chunk) || 0;
      const allowShortExtra = Boolean(entity && candidate.sentence.length < 80 && picked.length === 4 && used === 3);
      if (picked.length >= (entity ? 4 : 3) && !allowShortExtra) break;
      if ((used >= (entity ? 3 : 2) && !allowShortExtra) || candidate.score <= 0) continue;
      // Drop sentences from other chunks that score much lower than the best one.
      if (!entity && candidate.chunk !== bestChunk && candidate.score < bestScore * 0.45) continue;
      const candTokens = tokenize(candidate.sentence);
      const isDuplicate = picked.some(p => {
        if (p.chunk.title !== candidate.chunk.title || candTokens.length === 0) return false;
        const pTokens = tokenize(p.sentence);
        if (pTokens.length === 0) return false;
        const pSet = new Set(pTokens);
        const candSet = new Set(candTokens);
        const overlapA = candTokens.filter(t => pSet.has(t)).length / candTokens.length;
        const overlapB = pTokens.filter(t => candSet.has(t)).length / pTokens.length;
        return overlapA >= 0.75 || overlapB >= 0.75;
      });
      if (isDuplicate) continue;
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

    const techAnswer = answerTechUsage(query, entity);
    if (techAnswer) {
      return { text: techAnswer, intent: 'tech_usage', entity: null, resolvedQuery: query, followUp, sources: ['skills', 'projects'], cached: false };
    }

    const { weights, nonEntityWeights, results } = retrieve(query, entity);
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

    const { text } = composeFromChunks(weights, results, entity, nonEntityWeights);
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
