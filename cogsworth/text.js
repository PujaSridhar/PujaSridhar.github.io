// cogsworth/text.js
// Tokenizer, stemmer, and query expansion, all written from scratch.

const STOPWORDS = new Set(`
a about above after again against all am an and any are as at be because been before being below
between both but by can could did do does doing down during each few for from further had has have
having he her here hers herself him himself his how i if in into is it its itself just me more most
my myself no nor not now of off on once only or other our ours ourselves out over own same she should
so some such than that the their theirs them themselves then there these they this those through to
too under until up very was we were what when where which while who whom why will with would you your
yours yourself yourselves puja sridhar puja's tell know show give please also any anything something
`.split(/\s+/).filter(Boolean));

// Light suffix stripper. Not Porter, but close enough for a small corpus,
// and it treats "projects"/"project" and "built"/"building" consistently.
const IRREGULAR = {
  built: 'build', made: 'make', ran: 'run', led: 'lead', wrote: 'write', taught: 'teach',
  did: 'do', done: 'do', won: 'win', spoke: 'speak', studied: 'study', went: 'go',
};

export function stem(word) {
  if (IRREGULAR[word]) return IRREGULAR[word];
  if (word.length <= 3 || /[^a-z]/.test(word)) return word; // leave "node.js", "c++", "fer-2013" alone
  const rules = [
    ['ational', 'ate'], ['ization', 'ize'], ['ically', 'ic'], ['iness', 'y'],
    ['ments', 'ment'], ['ings', ''], ['ing', ''], ['ies', 'y'], ['ied', 'y'],
    ['edly', ''], ['ed', ''], ['ly', ''], ['es', ''], ['s', ''],
  ];
  for (const [suffix, replacement] of rules) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      if (suffix === 's' && /(ss|us|is)$/.test(word)) return word;
      if (suffix === 'es' && !/(ches|shes|sses|xes|zes)$/.test(word)) continue;
      return word.slice(0, -suffix.length) + replacement;
    }
  }
  return word;
}

export function rawWords(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .match(/[a-z0-9][a-z0-9+#.']*[a-z0-9+#]|[a-z0-9]/g) || [];
}

// Too common across the portfolio to help ranking ("has she done any X work?").
const STOP_STEMS = new Set(['work']);

export function tokenize(text) {
  return rawWords(text)
    .map(word => word.replace(/'s$/, ''))
    .filter(word => !STOPWORDS.has(word))
    .map(stem)
    .filter(term => !STOP_STEMS.has(term));
}

// Each group maps everyday phrasing onto the vocabulary the portfolio uses.
// Expansion terms are weighted lower than the words actually typed.
const SYNONYM_GROUPS = [
  ['job', 'work', 'role', 'employ', 'experience', 'intern', 'internship', 'career', 'company', 'position'],
  ['school', 'study', 'degree', 'university', 'college', 'education', 'gpa', 'graduate', 'master', 'bachelor', 'ms'],
  ['project', 'build', 'built', 'app', 'made', 'create', 'portfolio'],
  ['contact', 'email', 'reach', 'linkedin', 'github', 'touch', 'repo', 'repository'],
  ['skill', 'tech', 'stack', 'tool', 'technology', 'framework', 'proficient'],
  ['language', 'speak', 'spoken', 'fluent'],
  ['certification', 'certificate', 'certified', 'credential', 'accreditation', 'course'],
  ['talk', 'speech', 'lecture', 'present', 'presentation'],
  ['hackathon', 'competition', 'hack', 'sprint'],
  ['leadership', 'leader', 'lead', 'head', 'representative'],
  ['location', 'live', 'based', 'city', 'jose', 'san'],
  ['ai', 'ml', 'llm', 'agent', 'agentic', 'machine', 'learning'],
  ['data', 'pipeline', 'etl', 'airflow', 'dbt', 'warehouse'],
  ['wasm', 'webassembly', 'emscripten', 'allocator', 'system'],
  ['vision', 'image', 'facial', 'opencv', 'face', 'video', 'camera'],
  ['teach', 'teaching', 'ta', 'assistant', 'grader', 'grade'],
];

const SYNONYMS = new Map();
for (const group of SYNONYM_GROUPS) {
  const stems = [...new Set(group.map(stem))];
  for (const term of stems) {
    SYNONYMS.set(term, [...(SYNONYMS.get(term) || []), ...stems.filter(other => other !== term)]);
  }
}

// Returns Map<term, weight>: typed terms weigh 1, synonym expansions 0.3.
export function expandQuery(text) {
  const weights = new Map();
  const terms = tokenize(text);
  for (const term of terms) weights.set(term, 1);
  for (const term of terms) {
    for (const synonym of SYNONYMS.get(term) || []) {
      if (!weights.has(synonym)) weights.set(synonym, 0.3);
    }
  }
  return weights;
}

export function splitSentences(text) {
  return (text || '')
    .split(/\n\s*\n/)
    // Break only where punctuation is followed by whitespace and a capital, so
    // "Gemini 2.5" and "Node.js" stay intact.
    .flatMap(paragraph => paragraph.split(/(?<=[.!?]["”)]?)\s+(?=[A-Z"“(])/))
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}
