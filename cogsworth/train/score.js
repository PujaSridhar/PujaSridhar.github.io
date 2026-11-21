// cogsworth/train/score.js
// Scores the fine-tuned model next to the current engine and Gemini on every eval suite.
//
//   node cogsworth/train/score.js                                         # engine only
//   node cogsworth/train/score.js --trained out/trained-answers.jsonl    # + answers from generate.py
//   node cogsworth/train/score.js --base out/base-answers.jsonl          # + the untuned base model
//   node cogsworth/train/score.js --onnx out/cogsworth-web --dtype q8    # + the exported browser model, run here
//   node cogsworth/train/score.js --gemini cogsworth/train/eval/gemini-answers.json
//   node cogsworth/train/score.js --fetch-gemini                          # fill gemini-answers.json from the live site
//
// Metrics, per system:
//   accuracy   eval/run-eval.js grade(): required facts present, out-of-scope questions declined
//   made-up    share of answers stating a number, name, email or link that is not in portfolio-data.js
//   chatty     share of answers that read as conversation: plain sentences (no markdown dump),
//              5-120 words, not mostly copied verbatim from the portfolio
//   copied     average share of the answer's 6-word runs copied verbatim from the portfolio
// "chatty" and "copied" are rough proxies. Read the side-by-side report for the real judgment:
// cogsworth/train/eval/out/report.md

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { portfolioData } from '../../portfolio-data.js';
import { createEngine } from '../engine.js';
import { grade } from '../eval/run-eval.js';
import { loadEvalCases } from './build-dataset.js';
import { indexSource, findUnsupportedFacts, portfolioText } from './grounding.js';
import { buildMessages, createContextBuilder } from './context.js';
import { checkGrounding, createTransformersGenerator, REFUSAL_RE } from './runtime.js';

const PROD_URL = 'https://puja-sridhar-github-io.vercel.app/api/chat';
const GEMINI_FILE = new URL('./eval/gemini-answers.json', import.meta.url);
const OUT_DIR = new URL('./eval/out/', import.meta.url);

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const key = c => `${c.suite}#${c.index}`;

const fullText = portfolioText(portfolioData);
const fullIndex = indexSource(fullText);
const flatFull = fullText.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ');

export function madeUpFacts(answer, question) {
  const allow = REFUSAL_RE.test(answer) ? (question.match(/[A-Za-z][A-Za-z0-9+#.-]*/g) || []) : [];
  // The engine's and Gemini's own framing words are fine; only facts count.
  return findUnsupportedFacts(answer, fullIndex, { allow: [...allow, 'Gemini', 'Pinecone', 'Cogsworth'] })
    .filter(t => !/^(I|I'm|I'll|Puja's|Sure|Yes|No)$/i.test(t));
}

export function copiedShare(answer) {
  const words = (answer.toLowerCase().replace(/[’']/g, "'").match(/[a-z0-9']+/g)) || [];
  if (words.length < 6) return 0;
  let copied = 0;
  let total = 0;
  for (let i = 0; i + 6 <= words.length; i++) {
    total++;
    const gram = words.slice(i, i + 6).join(' ');
    if (flatFull.includes(gram)) copied++;
  }
  return total ? copied / total : 0;
}

export function isChatty(answer) {
  const words = (answer.match(/\S+/g) || []).length;
  const markdownDump = /^\s*(\*\*|#{1,6}\s|[-*•]\s)/m.test(answer);
  return !markdownDump && words >= 5 && words <= 120 && copiedShare(answer) < 0.6;
}

function summarize(name, cases, answers) {
  let passed = 0, madeUp = 0, chatty = 0, copied = 0, n = 0, words = 0;
  const failures = [];
  for (const c of cases) {
    const a = answers.get(key(c));
    if (a == null) continue;
    n++;
    const problem = grade(c, a);
    if (problem) failures.push({ c, problem, a }); else passed++;
    const invented = madeUpFacts(a, c.q);
    if (invented.length) madeUp++;
    if (isChatty(a)) chatty++;
    copied += copiedShare(a);
    words += (a.match(/\S+/g) || []).length;
  }
  return { name, n, passed, madeUp, chatty, copied: n ? copied / n : 0, words: n ? words / n : 0, failures };
}

function readAnswersJsonl(path, cases) {
  const rows = readFileSync(path, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const byKey = new Map(cases.map(c => [key(c), c]));
  const map = new Map();
  let stale = 0;
  const missing = cases.filter(c => !rows.some(r => key(r) === key(c))).length;
  for (const r of rows) {
    const c = byKey.get(key(r));
    if (!c) continue;
    if (c.q !== r.q) { stale++; continue; }
    map.set(key(r), r.answer);
  }
  if (stale || missing) console.log(`  note: ${stale + missing} eval questions in ${path} are missing or changed the eval files (regenerate eval-prompts.jsonl and re-run generate.py)`);
  return map;
}

function readGemini(cases) {
  if (!existsSync(GEMINI_FILE)) return new Map();
  const rows = JSON.parse(readFileSync(GEMINI_FILE, 'utf8'));
  const map = new Map();
  const byKey = new Map(cases.map(c => [key(c), c]));
  for (const r of rows) {
    const c = byKey.get(key(r));
    if (c && c.q === r.q && r.answer && r.answer.trim()) map.set(key(r), r.answer.trim());
  }
  return map;
}

function writeGeminiTemplate(cases, existing = new Map()) {
  const rows = cases.map(c => ({ suite: c.suite, index: c.index, q: c.q, history: c.history || [], answer: existing.get(key(c)) || '' }));
  mkdirSync(new URL('./eval/', import.meta.url), { recursive: true });
  writeFileSync(GEMINI_FILE, JSON.stringify(rows, null, 2) + '\n');
}

async function fetchGemini(cases) {
  // Only meaningful while production still answers with Gemini (before the local-engine swap).
  const existing = readGemini(cases);
  let i = 0;
  for (const c of cases) {
    if (existing.has(key(c))) continue;
    if (i++ > 0) await new Promise(r => setTimeout(r, 5000));
    try {
      const res = await fetch(PROD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: c.q, conversationHistory: c.history || [] }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      existing.set(key(c), (await res.text()).trim());
      process.stdout.write('.');
    } catch (error) {
      console.log(`\n  could not fetch "${c.q}": ${error.message}`);
    }
    writeGeminiTemplate(cases, existing);
  }
  console.log(`\nSaved ${existing.size}/${cases.length} Gemini answers to cogsworth/train/eval/gemini-answers.json`);
}

function pct(a, b) {
  return b ? `${((100 * a) / b).toFixed(0)}%` : '-';
}

function printTable(reports) {
  console.log('\nsystem                      answered  accuracy  made-up  chatty  copied  words');
  for (const r of reports) {
    console.log(`${r.name.padEnd(28)}${String(r.n).padStart(8)}  ${pct(r.passed, r.n).padStart(8)}  ${pct(r.madeUp, r.n).padStart(7)}  ${pct(r.chatty, r.n).padStart(6)}  ${(100 * r.copied).toFixed(0).padStart(5)}%  ${r.words.toFixed(0).padStart(5)}`);
  }
}

function writeReport(cases, systems, reports) {
  mkdirSync(OUT_DIR, { recursive: true });
  const lines = ['# Cogsworth eval: side by side', '', '| system | answered | accuracy | made-up facts | chatty | copied | avg words |', '|---|---|---|---|---|---|---|'];
  for (const r of reports) lines.push(`| ${r.name} | ${r.n} | ${pct(r.passed, r.n)} | ${pct(r.madeUp, r.n)} | ${pct(r.chatty, r.n)} | ${(100 * r.copied).toFixed(0)}% | ${r.words.toFixed(0)} |`);
  lines.push('');
  for (const c of cases) {
    lines.push(`## ${c.q}`, '', `_${c.suite} #${c.index}${c.outOfScope ? ', should decline' : c.contains ? `, must mention: ${c.contains.join(', ')}` : ''}_`, '');
    if (c.history?.length) lines.push(...c.history.map(h => `> ${h.role}: ${h.text}`), '');
    for (const [name, answers] of systems) {
      const a = answers.get(key(c));
      if (a == null) continue;
      const problem = grade(c, a);
      const invented = madeUpFacts(a, c.q);
      lines.push(`**${name}** ${problem ? `❌ ${problem}` : '✅'}${invented.length ? ` ⚠ not in portfolio: ${invented.join(', ')}` : ''}`, '', a.replace(/\n/g, '  \n'), '');
    }
  }
  writeFileSync(new URL('report.md', OUT_DIR), lines.join('\n'));
}

async function main() {
  const suites = opt('--suites')?.split(',');
  const allCases = loadEvalCases();
  const inSuites = suites ? allCases.filter(c => suites.includes(c.suite)) : allCases;
  // --limit N scores an evenly spaced sample of N questions (every suite stays represented): the browser model
  // runs on CPU, which on Kaggle takes about 45 seconds an answer.
  const limit = Number(opt('--limit')) || 0;
  const cases = limit && limit < inSuites.length
    ? inSuites.filter((_, i) => Math.floor((i * limit) / inSuites.length) !== Math.floor(((i - 1) * limit) / inSuites.length))
    : inSuites;
  if (cases.length < inSuites.length) console.log(`Scoring a sample of ${cases.length} of ${inSuites.length} eval questions`);
  if (args.includes('--fetch-gemini')) return fetchGemini(allCases);
  if (!existsSync(GEMINI_FILE)) writeGeminiTemplate(allCases);

  const engine = createEngine(portfolioData);
  const systems = [];
  systems.push(['engine (bm25)', new Map(cases.map(c => [key(c), engine.answer(c.q, c.history || [], { useCache: false }).text]))]);
  systems.push(['engine (cache + bm25)', new Map(cases.map(c => [key(c), engine.answer(c.q, c.history || [], { useCache: true }).text]))]);
  if (opt('--base')) systems.push(['base model (no fine-tune)', readAnswersJsonl(opt('--base'), cases)]);
  if (opt('--trained')) systems.push(['trained model', readAnswersJsonl(opt('--trained'), cases)]);
  if (opt('--onnx')) {
    const dtype = opt('--dtype') || 'q8';
    console.log(`Loading ${opt('--onnx')} (${dtype}) with transformers.js ...`);
    const generate = await createTransformersGenerator({ model: opt('--onnx'), dtype });
    const contextFor = createContextBuilder(engine, portfolioData);
    const guarded = new Map();
    const plain = new Map();
    let fellBack = 0;
    for (const [i, c] of cases.entries()) {
      const history = c.history || [];
      const { chunks } = contextFor(c.q, history);
      const text = String(await generate(buildMessages(c.q, chunks, history))).trim();
      plain.set(key(c), text);
      if (!text || checkGrounding(text, chunks, history, c.q).length) {
        fellBack++;
        guarded.set(key(c), engine.answer(c.q, history).text);
      } else guarded.set(key(c), text);
      if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${cases.length}`);
    }
    systems.push([`browser model (${dtype})`, plain]);
    systems.push([`browser model (${dtype}) + guard`, guarded]);
    console.log(`  grounding guard fell back to the engine on ${fellBack}/${cases.length} answers`);
  }
  const gemini = readGemini(cases);
  if (gemini.size) systems.push(['gemini (pasted)', gemini]);
  else console.log('  no Gemini answers yet: paste them into cogsworth/train/eval/gemini-answers.json, or run --fetch-gemini while production still serves Gemini');

  const reports = systems.map(([name, answers]) => summarize(name, cases, answers));
  printTable(reports);
  if (args.includes('--verbose')) {
    for (const r of reports) for (const f of r.failures) console.log(`  [${r.name}] ✗ ${f.c.q} → ${f.problem}`);
  }
  writeReport(cases, systems, reports);
  console.log('\nSide-by-side answers: cogsworth/train/eval/out/report.md');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
