// cogsworth/train/chat.js
// Chat with the fine-tuned model in the terminal, through the same path the site would use.
//
//   npm run cogsworth:setup                                   # once: installs transformers.js
//   node cogsworth/train/chat.js --model path/to/cogsworth-web [--dtype q8|q4] [--debug]

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { portfolioData } from '../../portfolio-data.js';
import { createEngine } from '../engine.js';
import { createModelResponder, createTransformersGenerator } from './runtime.js';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const model = opt('--model');
if (!model) {
  console.error('Usage: node cogsworth/train/chat.js --model <folder or HF id> [--dtype q8|q4] [--debug]');
  process.exit(1);
}
const debug = args.includes('--debug');
console.log(`Loading ${model} ...`);
const engine = createEngine(portfolioData);
const responder = createModelResponder({ engine, data: portfolioData, generate: await createTransformersGenerator({ model, dtype: opt('--dtype') || 'q8' }) });
const rl = createInterface({ input: stdin, output: stdout });
const history = [];
console.log('Ask Cogsworth something (Ctrl+C to quit).');
for (;;) {
  const q = (await rl.question('\n> ')).trim();
  if (!q) continue;
  const started = performance.now();
  const res = await responder.reply(q, history);
  console.log(`\n${res.text}`);
  if (debug) console.log(`\n[${res.source}${res.reason ? `: ${res.reason}` : ''} | ${(performance.now() - started).toFixed(0)} ms | context: ${res.chunks.join(' / ')}]${res.modelText ? `\n[model said: ${res.modelText}]` : ''}`);
  history.push({ role: 'user', text: q }, { role: 'assistant', text: res.text });
  history.splice(0, Math.max(0, history.length - 6));
}
