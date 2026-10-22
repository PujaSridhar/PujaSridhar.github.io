// cogsworth/cli.js
// Chat with the local engine in a terminal. Remembers the conversation so
// follow-ups work.
//
//   npm run cogsworth            # chat
//   npm run cogsworth -- --debug # also show intent, resolved query, and sources

import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { createEngine } from './engine.js';
import { portfolioData } from '../portfolio-data.js';

const debug = process.argv.includes('--debug');
const engine = createEngine(portfolioData);
const history = [];
const rl = readline.createInterface({ input, output });

console.log('Cogsworth (local engine). Ask about Puja\'s portfolio. Ctrl+C or "exit" to quit.\n');
rl.setPrompt('you> ');
rl.prompt();
for await (const line of rl) {
  const prompt = line.trim();
  if (prompt === 'exit' || prompt === 'quit') break;
  if (prompt) {
    const result = engine.answer(prompt, history);
    console.log(`\n${result.text.replace(/\*\*(.*?)\*\*/g, '\x1b[1m$1\x1b[0m')}\n`);
    if (debug) {
      console.log(`\x1b[2m  intent=${result.intent} entity=${result.entity ?? '-'} followUp=${result.followUp}`);
      console.log(`  query="${result.resolvedQuery}"  sources=${result.sources.join(' | ') || '-'}\x1b[0m\n`);
    }
    history.push({ role: 'user', text: prompt }, { role: 'assistant', text: result.text });
  }
  rl.prompt();
}
rl.close();
