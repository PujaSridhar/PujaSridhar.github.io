// cogsworth/eval/run-eval.js
// Scores the local engine paths (BM25 fallback, Answer Cache + BM25, and
// Qwen2.5-0.5B-Instruct via transformers.js) on eval/questions.json and the
// held-out set eval/held-out.json.
// With --compare-prod it also asks the live Gemini endpoint the same questions
// with a 5 s delay between requests to respect rate limits.
//
//   node cogsworth/eval/run-eval.js                 # local (bm25, cache, qwen2.5-0.5b) on main + held-out
//   node cogsworth/eval/run-eval.js --compare-prod  # also score live Gemini (5s delay between requests)
//   node cogsworth/eval/run-eval.js --fast          # skip neural model run
//   node cogsworth/eval/run-eval.js --verbose       # print every answer

import { readFileSync } from 'node:fs';
import { createEngine } from '../engine.js';
import { createRewriter } from '../neural.js';
import { portfolioData } from '../../portfolio-data.js';

const PROD_URL = 'https://puja-sridhar-github-io.vercel.app/api/chat';
const PROD_DELAY_MS = 5000;
const REFUSAL = /don't have|do not have|no information|not (mentioned|available|specified|included|provided)|isn't (mentioned|available|included)|unable to|can't (help|answer)|cannot (help|answer)|only answer questions/i;

export function grade(testCase, text) {
  if (testCase.outOfScope) return REFUSAL.test(text) ? null : 'answered an out-of-scope question';
  const missing = testCase.contains.filter(fact => !text.toLowerCase().includes(fact.toLowerCase()));
  if (REFUSAL.test(text) && missing.length) return 'refused an answerable question';
  return missing.length ? `missing: ${missing.join(', ')}` : null;
}

async function askProd(testCase, index) {
  if (index > 0) {
    await new Promise(resolve => setTimeout(resolve, PROD_DELAY_MS));
  }
  const response = await fetch(PROD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: testCase.q, conversationHistory: testCase.history || [] }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 120)}` : ''}`);
  }
  return response.text();
}

async function runSuite(suiteName, cases, name, ask, verbose) {
  let passed = 0;
  let totalMs = 0;
  let errors = 0;
  const extras = { cached: 0, retrievalTotal: 0, rewritten: 0, fallback: 0, reasons: {} };
  const failures = [];
  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    const started = performance.now();
    let text;
    try {
      const res = await ask(testCase, i);
      if (typeof res === 'string') {
        text = res;
      } else {
        text = res.text;
        if (res.cached) extras.cached++;
        if (res.intent === 'retrieval') {
          extras.retrievalTotal++;
          if (res.rewritten) {
            extras.rewritten++;
          } else if ('rewritten' in res) {
            extras.fallback++;
            const reason = res.rewriteReason || 'fallback';
            extras.reasons[reason] = (extras.reasons[reason] || 0) + 1;
          }
        }
      }
    } catch (error) {
      errors++;
      text = `ERROR: ${error.cause?.message || error.message}`;
    }
    totalMs += performance.now() - started;
    const problem = grade(testCase, text);
    if (problem) failures.push({ q: testCase.q, problem, text });
    else passed++;
    if (verbose) console.log(`\n[${suiteName} | ${name}] ${problem ? 'FAIL' : 'pass'}  Q: ${testCase.q}\n${text}`);
  }
  return { suiteName, name, passed, total: cases.length, avgMs: totalMs / cases.length, failures, errors, extras };
}

function printReports(reports) {
  for (const report of reports) {
    if (report.errors === report.total) {
      console.log(`\n== [${report.suiteName}] ${report.name}: could not reach the endpoint (${report.failures[0].text}). Skipped.`);
      continue;
    }
    const pct = (100 * report.passed / report.total).toFixed(1);
    const meta = [];
    if (report.extras.cached) meta.push(`cache hits: ${report.extras.cached}/${report.total}`);
    if (report.extras.rewritten || report.extras.fallback) {
      meta.push(`verifyGrounded passed: ${report.extras.rewritten}/${report.extras.retrievalTotal} retrieval, BM25 fallback: ${report.extras.fallback}/${report.extras.retrievalTotal}`);
    }
    const metaSuffix = meta.length ? ` [${meta.join(', ')}]` : '';
    console.log(`\n== [${report.suiteName}] ${report.name}: ${report.passed}/${report.total} passed (${pct}%), avg ${report.avgMs.toFixed(1)} ms/question${metaSuffix}`);
    if (Object.keys(report.extras.reasons).length > 0) {
      const breakdown = Object.entries(report.extras.reasons).map(([k, v]) => `${k}=${v}`).join(', ');
      console.log(`   ↳ fallback reasons: ${breakdown}`);
    }
    for (const failure of report.failures) console.log(`   ✗ ${failure.q}  →  ${failure.problem}`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const verbose = args.has('--verbose');
  const mainCases = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url), 'utf8'));
  const heldOutCases = JSON.parse(readFileSync(new URL('./held-out.json', import.meta.url), 'utf8'));
  const regressionCases = JSON.parse(readFileSync(new URL('./regressions.json', import.meta.url), 'utf8'));
  const engine = createEngine(portfolioData);

  let rewriter = null;
  if (!args.has('--fast')) {
    try {
      rewriter = await createRewriter();
    } catch (error) {
      console.log(`\n== local (qwen2.5-0.5b + bm25): could not load model (${error.cause?.message || error.message}). Skipped.`);
    }
  }
  const neuralEngine = rewriter ? createEngine(portfolioData, { rewriter }) : null;

  const suites = [
    ['questions.json', mainCases],
    ['held-out.json', heldOutCases],
    ['regressions.json', regressionCases],
  ];

  const reports = [];
  for (const [suiteName, cases] of suites) {
    reports.push(
      await runSuite(suiteName, cases, 'local (bm25)', async tc => engine.answer(tc.q, tc.history || [], { useCache: false }), verbose),
      await runSuite(suiteName, cases, 'local (cache + bm25)', async tc => engine.answer(tc.q, tc.history || [], { useCache: true }), verbose),
    );
    if (neuralEngine) {
      reports.push(
        await runSuite(suiteName, cases, 'local (qwen2.5-0.5b + bm25)', async tc =>
          neuralEngine.answerAsync(tc.q, tc.history || [], { useCache: false }), verbose
        )
      );
    }
  }

  if (args.has('--compare-prod')) {
    reports.push(await runSuite('questions.json', mainCases, 'gemini (prod)', askProd, verbose));
  }

  printReports(reports);

  const allLocalPassed = reports
    .filter(r => r.name.startsWith('local') && r.errors < r.total)
    .every(r => r.passed === r.total);
  process.exitCode = allLocalPassed ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
