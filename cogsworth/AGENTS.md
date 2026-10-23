# Cogsworth local engine — notes for coding agents

This folder is a from-scratch replacement for the production chat pipeline
(`api/chat.js`, which uses Gemini + Pinecone). It runs entirely on the local
machine: no API keys, no network, no external services.

## Ground rules

- Do **not** edit `api/chat.js`, `index-data.mjs`, or `.github/workflows/`. Those are production.
  The local engine only replaces production once its eval score matches Gemini's.
- Keep it dependency-free (plain Node.js ESM). No paid APIs or hosted model calls.
- Answers must only contain text that exists in `portfolio-data.js`. Never invent facts.
- Don't guess pronouns for Puja in generated answer text; use "Puja" / "Puja's".

## Files

| File | What it does |
|---|---|
| `text.js` | Tokenizer, stemmer, stopwords, synonym expansion, sentence splitter |
| `bm25.js` | BM25 ranking index (replaces embeddings + Pinecone) |
| `chunks.js` | Turns `portfolio-data.js` into searchable chunks and named entities (projects, companies, hackathons) |
| `engine.js` | The pipeline: follow-up resolution → intent detection → retrieval → answer composition |
| `cli.js` | Terminal chat (`npm run cogsworth -- --debug`) |
| `vite-plugin.js` | Serves `/api/chat` from the engine when running `npm run dev:local` |
| `eval/questions.json` | Test questions with the facts each answer must contain |
| `eval/run-eval.js` | Scores the engine; `--compare-prod` also scores live Gemini |
| `engine.test.js` | Unit tests (Vitest) |

## Workflow for any change

1. `npm run cogsworth -- --debug`: reproduce the bad answer and see the intent, resolved query, and sources.
2. Add the failing question to `eval/questions.json` (`contains` = facts the answer must include,
   or `"outOfScope": true` for questions it should decline).
3. Fix it in `text.js` (vocabulary), `chunks.js` (what's indexed), or `engine.js` (logic).
4. Before finishing, all of these must pass:
   ```bash
   npm test
   npm run cogsworth:eval
   npm run build
   ```
5. Don't overfit: a fix for one question shouldn't break others. The eval catches that.
