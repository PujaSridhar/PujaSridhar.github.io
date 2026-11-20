// cogsworth/train/grounding.js
// Checks that an answer only states things that exist in a source text.
//
// Two levels:
//   findUnsupportedFacts(answer, source)  numbers, proper nouns, emails/URLs that the source
//                                         does not contain. Used by the eval as the
//                                         "made-up facts" score. Any hit is a likely invention.
//   findUnsupportedWords(answer, source)  stricter: every content word must exist in the source
//                                         or in a small list of conversational words. Used to
//                                         validate the training set before it is written.

import { stem } from '../text.js';

// Conversational words Cogsworth may use that the portfolio itself never says.
// Keep this list free of facts: no tools, places, numbers, titles or results.
export const FRAMING_WORDS = new Set(`
puja sridhar cogsworth i'm i'll you're you'd it's that's here's there's what's let's i've
take takes speak speaks outside give gives internship internships stopping visiting spans span cover
hi hello hey welcome anytime try through instead idea came away find full around while multiple hear technical result results holds title ran runs exists visual compares independently featured
tell know start started explain explains share thanks thank glad happy sure yes yeah no nope okay ok great good nice
cogsworth assistant portfolio website site ask asking question questions answer answers
want wants like would could might happy help covers cover covered information info details detail
mention mentions mentioned list lists listed listing includes include including included say says
short version quick summary overview highlights highlight main headline
anything else something specific feel free curious interested more less
here there where what which who when how why whether
directly best way reach reached contact contacts touch get in
built build builds building used use uses using worked work works working working made make
project projects role roles job jobs company companies employer employers experience experiences
skill skills tool tools stack tech technology technologies language languages spoken
earlier recent recently latest newest first second third fourth fifth last
link links repo repository github demo live code source page
also too as well plus along alongside another other others both each every
total count counts number numbers
team teammate teammates solo own
date dates period timeline year years month months
area areas topic topics kind kinds type types
done doing did does do
yes no correct right
studied study studies degree degrees school university
based located location
looking open
currently today now
day days
dont don't doesnt doesn't isnt isn't can't cannot only rules instructions ignore
bye goodbye later luck day
part parts piece pieces bit
called named name
point points
bunch range ranging mix
say said
specifically particular
behind
answer answers
fine-tune fine-tunes fine-tuning fine-tuned
overall
focus focused focuses
pick picks
`.split(/\s+/).filter(Boolean).map(w => stem(w)));

const STOP = new Set(`a an the and or but if then so of to in on at by for with from into onto over under
about as is are was were be been being am it its it's this that these those there here their they them
he she him her his hers i me my we our you your yours can could would should will shall may might must
do does did done has have had having not no nor than too very just also more most such what which who whom
whose when where why how all any some each few both either neither one two three via per up out off
own same other only s t ll re ve d m don doesn isn wasn aren weren won can't don't i'm i'll you're it's that's here's there's what's let's i've`.split(/\s+/));

function words(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .match(/[a-zµ0-9][a-zµ0-9+#.'/-]*[a-zµ0-9+#]|[a-zµ0-9]/g) || [];
}

function normalizeWord(word) {
  return word.replace(/'s$/, '').replace(/[.]+$/, '');
}

/** Builds a reusable lookup for a source text. */
export function indexSource(sourceText) {
  const lower = (sourceText || '').toLowerCase().replace(/[’']/g, "'");
  const stems = new Set();
  for (const w of words(lower)) {
    const n = normalizeWord(w);
    stems.add(n);
    stems.add(stem(n));
    for (const part of n.split(/[-/.]/)) if (part) { stems.add(part); stems.add(stem(part)); }
  }
  return { lower, stems };
}

const asIndex = source => (typeof source === 'string' ? indexSource(source) : source);

/** Numbers, emails, URLs and capitalized terms in the answer that the source lacks. */
export function findUnsupportedFacts(answer, source, { allow = [] } = {}) {
  const src = asIndex(source);
  const allowed = new Set(['cogsworth', 'puja', 'sridhar', 'puja\'s', 'i', "i'm", "i'll", "i've", "i'd", ...allow.flatMap(a => a.toLowerCase().split(/[\s/]+/))]);
  const problems = new Set();
  const text = (answer || '').replace(/[’']/g, "'");

  for (const m of text.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+|https?:\/\/\S+/g)) {
    const raw = m[0].replace(/[).,]+$/, '');
    if (!src.lower.includes(raw.toLowerCase())) problems.add(raw);
  }
  for (const m of text.matchAll(/\d[\d.,]*(?:\+|%)?/g)) {
    const v = m[0].replace(/[.,]+$/, '');
    if (!src.lower.includes(v.toLowerCase())) problems.add(v);
  }
  // Capitalized words that are not the first word of a sentence.
  const sentences = text.split(/(?<=[.!?:])\s+|\n+/);
  for (const sentence of sentences) {
    const tokens = sentence.match(/[A-Za-z][A-Za-z0-9+#.'-]*/g) || [];
    tokens.slice(1).forEach(tok => {
      if (!/^[A-Z]/.test(tok)) return;
      const n = normalizeWord(tok.toLowerCase());
      if (allowed.has(n)) return;
      if (!src.stems.has(n) && !src.stems.has(stem(n)) && !src.lower.includes(n)) problems.add(tok.replace(/[.]+$/, ''));
    });
  }
  return [...problems];
}

/** Every content word of the answer that is neither in the source nor a framing word. */
export function findUnsupportedWords(answer, source, { allow = [], facts = true } = {}) {
  const src = asIndex(source);
  const allowed = new Set(allow.flatMap(a => a.toLowerCase().split(/[\s/]+/)).map(a => stem(a)));
  const problems = new Set();
  for (const raw of words(answer)) {
    const n = normalizeWord(raw);
    if (!n || STOP.has(n)) continue;
    if (/\d/.test(n)) { if (!facts) continue; }
    const s = stem(n);
    if (src.stems.has(n) || src.stems.has(s) || FRAMING_WORDS.has(s) || FRAMING_WORDS.has(n) || allowed.has(s)) continue;
    if (n.split(/[-/]/).every(p => !p || STOP.has(p) || src.stems.has(p) || src.stems.has(stem(p)) || FRAMING_WORDS.has(stem(p)))) continue;
    problems.add(n);
  }
  const factProblems = facts ? findUnsupportedFacts(answer, src, { allow }) : [];
  return [...problems, ...factProblems].filter((v, i, a) => a.indexOf(v) === i);
}

/** All text in portfolio-data.js, flattened. */
export function portfolioText(data) {
  const out = [];
  const walk = v => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { out.push(k); walk(x); });
  };
  walk(data);
  return out.join('\n');
}
