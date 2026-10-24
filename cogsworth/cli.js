// cogsworth/cli.js
// Chat with the local engine in a terminal. Remembers the conversation so
// follow-ups work.
//
//   npm run cogsworth                     # chat (answer cache + BM25 fallback)
//   npm run cogsworth -- --neural         # also load Qwen2.5-0.5B-Instruct for uncached questions
//   npm run cogsworth -- --no-cache       # skip the answer cache (pure BM25 or neural+BM25)
//   npm run cogsworth -- --debug          # show intent, cache hit, neural rewrite, and sources

import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { createEngine } from './engine.js';
import { createRewriter, DEFAULT_MODEL_ID } from './neural.js';
import { portfolioData } from '../portfolio-data.js';

const debug = process.argv.includes('--debug');
const neural = process.argv.includes('--neural');
const useCache = !process.argv.includes('--no-cache');

let rewriter = null;
if (neural) {
  console.log(`Loading ${DEFAULT_MODEL_ID} via transformers.js...`);
  rewriter = await createRewriter();
}

const engine = createEngine(portfolioData, { rewriter });
const history = [];
const rl = readline.createInterface({ input, output });

const modeLabel = [useCache ? 'cache' : null, neural ? 'qwen2.5-0.5b' : null, 'bm25'].filter(Boolean).join(' + ');
console.log(`Cogsworth (${modeLabel}). Ask about Puja's portfolio. Ctrl+C or "exit" to quit.\n`);
rl.setPrompt('you> ');
rl.prompt();
for await (const line of rl) {
  const prompt = line.trim();
  if (prompt === 'exit' || prompt === 'quit') break;
  if (prompt) {
    const result = neural
      ? await engine.answerAsync(prompt, history, { useCache })
      : engine.answer(prompt, history, { useCache });
    console.log(`\n${result.text.replace(/\*\*(.*?)\*\*/g, '\x1b[1m$1\x1b[0m')}\n`);
    if (debug) {
      console.log(
        `\x1b[2m  intent=${result.intent} entity=${result.entity ?? '-'} followUp=${result.followUp} cached=${Boolean(result.cached)} rewritten=${Boolean(result.rewritten)}`
      );
      console.log(`  query="${result.resolvedQuery}"  sources=${result.sources.join(' | ') || '-'}\x1b[0m\n`);
    }
    history.push({ role: 'user', text: prompt }, { role: 'assistant', text: result.text });
  }
  rl.prompt();
}
rl.close();
