// cogsworth/review-answers.js
// Interactive terminal tool to review unreviewed entries in cogsworth/answers.json.
// Shows each unreviewed entry next to its portfolio source sentences and lets you:
//   [y] approve (sets reviewed: true and saves immediately)
//   [e] edit    (edit the answer text, sets reviewed: true, and saves immediately)
//   [d] delete  (removes the entry from answers.json and saves immediately)
//   [s] skip    (leave reviewed: false for later)
//   [q] quit
//
//   npm run cogsworth:review

import { readFileSync, writeFileSync } from 'node:fs';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { createEngine } from './engine.js';
import { portfolioData } from '../portfolio-data.js';

const ANSWERS_URL = new URL('./answers.json', import.meta.url);

export function getSourcePreview(engine, entry) {
  const base = engine.answer(entry.q, entry.history || [], { useCache: false });
  if (base && base.text) return base.text;
  if (entry.sources?.length) {
    const matched = engine.chunks.filter(c => entry.sources.includes(c.title));
    if (matched.length) return matched.map(c => `**${c.title}**\n${c.text}`).join('\n\n');
  }
  return '(no direct chunk match)';
}

export function applyReviewAction(answers, index, action, editedText = null) {
  if (index < 0 || index >= answers.length) return { changed: false };
  const cmd = (action || '').trim().toLowerCase();
  if (cmd === 'y') {
    answers[index].reviewed = true;
    return { changed: true, status: 'approved' };
  }
  if (cmd === 'e') {
    if (editedText && editedText.trim()) {
      answers[index].a = editedText.replace(/\\n/g, '\n').trim();
      answers[index].reviewed = true;
      return { changed: true, status: 'edited' };
    }
    return { changed: false, status: 'cancelled' };
  }
  if (cmd === 'd') {
    answers.splice(index, 1);
    return { changed: true, status: 'deleted' };
  }
  return { changed: false, status: 'skipped' };
}

function saveAnswers(answers, url = ANSWERS_URL) {
  writeFileSync(url, JSON.stringify(answers, null, 2) + '\n', 'utf8');
}

function askQuestion(rl, promptText) {
  return new Promise(resolve => rl.question(promptText, answer => resolve(answer)));
}

async function main() {
  const answers = JSON.parse(readFileSync(ANSWERS_URL, 'utf8'));
  const engine = createEngine(portfolioData, { cache: [] });
  const unreviewedCount = answers.filter(e => e.reviewed === false).length;

  if (unreviewedCount === 0) {
    console.log('All entries in cogsworth/answers.json are already reviewed (reviewed: true).');
    return;
  }

  console.log(`\nCogsworth Answer Reviewer — ${unreviewedCount} unreviewed entries in cogsworth/answers.json`);
  console.log('Commands: [y] approve  [e] edit  [d] delete  [s] skip  [q] quit\n');

  const rl = readline.createInterface({ input, output });
  let seen = 0;

  try {
    for (let i = 0; i < answers.length; i++) {
      const entry = answers[i];
      if (entry.reviewed !== false) continue;
      seen++;

      const sourceSentences = getSourcePreview(engine, entry);
      console.log('─'.repeat(78));
      console.log(`\x1b[1m[${seen}/${unreviewedCount}]\x1b[0m  generator=${entry.generator}  intent=${entry.intent}  entity=${entry.entity ?? '-'}`);
      console.log(`\x1b[36mQuestion:\x1b[0m  ${entry.q}\n`);
      console.log(`\x1b[33mSource sentences:\x1b[0m\n${sourceSentences}\n`);
      console.log(`\x1b[32mProposed answer:\x1b[0m\n${entry.a}\n`);

      const choice = (await askQuestion(rl, '[y] approve  [e] edit  [d] delete  [s] skip  [q] quit > ')).trim().toLowerCase();
      if (choice === 'q' || choice === 'quit') {
        console.log('Exiting review.');
        break;
      }

      if (choice === 'e') {
        const edited = await askQuestion(rl, 'Enter new answer (use \\n for newlines, leave empty to cancel):\n> ');
        const res = applyReviewAction(answers, i, 'e', edited);
        if (res.changed) {
          saveAnswers(answers);
          console.log('✓ Updated answer, set reviewed: true, and saved cogsworth/answers.json.\n');
        } else {
          console.log('Edit cancelled.\n');
          i--;
          seen--;
        }
        continue;
      }

      const res = applyReviewAction(answers, i, choice);
      if (res.status === 'approved') {
        saveAnswers(answers);
        console.log('✓ Approved (reviewed: true) and saved cogsworth/answers.json.\n');
      } else if (res.status === 'deleted') {
        saveAnswers(answers);
        console.log('✗ Deleted entry and saved cogsworth/answers.json.\n');
        i--;
      } else {
        console.log('→ Skipped.\n');
      }
    }
  } finally {
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
