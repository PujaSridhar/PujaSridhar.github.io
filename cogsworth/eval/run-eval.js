// cogsworth/eval/run-eval.js
// Scores the local engine on eval/questions.json. With --compare-prod it asks the
// live Gemini endpoint the same questions and scores both the same way, so we can
// see when the local engine is good enough to replace production.
//
//   node cogsworth/eval/run-eval.js                 # local engine only
//   node cogsworth/eval/run-eval.js --compare-prod  # local vs. live Gemini
//   node cogsworth/eval/run-eval.js --verbose       # print every answer

import { readFileSync } from 'node:fs';
import { createEngine } from '../engine.js';
import { portfolioData } from '../../portfolio-data.js';

const PROD_URL = 'https://puja-sridhar-github-io.vercel.app/api/chat';
const REFUSAL = /don't have|do not have|no information|not (mentioned|available|specified|included|provided)|isn't (mentioned|available|included)|unable to|can't (help|answer)|cannot (help|answer)|only answer questions/i;

const args = new Set(process.argv.slice(2));
const cases = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'));
const engine = createEngine(portfolioData);

export function grade(testCase, text) {
  if (testCase.outOfScope) return REFUSAL.test(text) ? null : 'answered an out-of-scope question';
  const missing = testCase.contains.filter(fact => !text.toLowerCase().includes(fact.toLowerCase()));
  if (REFUSAL.test(text) && missing.length) return 'refused an answerable question';
  return missing.length ? `missing: ${missing.join(', ')}` : null;
}

async function askProd(testCase) {
  const response = await fetch(PROD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: testCase.q, conversationHistory: testCase.history || [] }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function run(name, ask) {
  let passed = 0;
  let totalMs = 0;
  let errors = 0;
  const failures = [];
  for (const testCase of cases) {
    const started = performance.now();
    let text;
    try {
      text = await ask(testCase);
    } catch (error) {
      errors++;
      text = `ERROR: ${error.cause?.message || error.message}`;
    }
    totalMs += performance.now() - started;
    const problem = grade(testCase, text);
    if (problem) failures.push({ q: testCase.q, problem, text });
    else passed++;
    if (args.has('--verbose')) console.log(`\n[${name}] ${problem ? 'FAIL' : 'pass'}  Q: ${testCase.q}\n${text}`);
  }
  return { name, passed, total: cases.length, avgMs: totalMs / cases.length, failures, errors };
}

const reports = [await run('local', async testCase => engine.answer(testCase.q, testCase.history || []).text)];
if (args.has('--compare-prod')) reports.push(await run('gemini (prod)', askProd));

for (const report of reports) {
  if (report.errors === report.total) {
    console.log(`\n== ${report.name}: could not reach the endpoint (${report.failures[0].text}). Skipped.`);
    continue;
  }
  const pct = (100 * report.passed / report.total).toFixed(1);
  console.log(`\n== ${report.name}: ${report.passed}/${report.total} passed (${pct}%), avg ${report.avgMs.toFixed(1)} ms/question`);
  for (const failure of report.failures) console.log(`   ✗ ${failure.q}  →  ${failure.problem}`);
}

const local = reports[0];
process.exitCode = local.passed === local.total ? 0 : 1;
