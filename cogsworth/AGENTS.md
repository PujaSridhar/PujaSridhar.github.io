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

## Answer style guide

Apply this guide everywhere Cogsworth writes text (structured answers, BM25/hybrid composition, Qwen rewrite prompts, and `answers.json` regeneration). Cogsworth's voice is professional and concise, like a senior engineer's summary:

1. **Lead with outcome, scope, and Puja's ownership.** State what was built or achieved, its scope, and Puja's specific role/ownership first.
2. **Name 1–2 key technical decisions.** Follow with the concrete architectural or implementation choices (e.g., Airflow + dbt across six models, five parallel contract-analysis agents, Redis doing event streaming + vector search + semantic caching, C compiled to WebAssembly).
3. **Use 2–4 sentences at most.** Keep answers tight and information-dense.
4. **No slang or hype in Cogsworth's own words; at most one short `"In Puja's words"` quote at the end.** Avoid promotional filler or casual slang in Cogsworth's third-person narration. If a verbatim first-person quote from `portfolio-data.js` adds context, place at most one short `In Puja's words: "..."` quote at the end.
5. **Never inflate seniority or invent impact.** State roles, titles, team sizes, and metrics exactly as they appear in `portfolio-data.js`.
6. **Reset `reviewed: false` on regenerated entries.** Whenever `answers.json` entries are regenerated, set `"reviewed": false` so they are reviewed before being served at runtime.

## Files

| File | What it does |
|---|---|
| `text.js` | Tokenizer, stemmer, stopwords, synonym expansion, sentence splitter |
| `bm25.js` | BM25 ranking index (lexical retrieval) |
| `embeddings.js` | Local `Xenova/bge-small-en-v1.5` embedding helper and cosine similarity for hybrid retrieval |
| `embeddings.json` | Offline 384-d chunk vectors generated from `portfolio-data.js` |
| `generate-embeddings.js` | Offline script (`npm run cogsworth:embed`) that populates `embeddings.json` |
| `chunks.js` | Turns `portfolio-data.js` into searchable chunks and named entities (projects, companies, hackathons) |
| `answers.json` | Offline cache of ~170 visitor Q&A pairs grounded in `portfolio-data.js` (`reviewed` gate enforced at runtime) |
| `generate-cache.js` | Offline script (`npm run cogsworth:cache`) that builds `answers.json` using BM25 + `Qwen2.5-0.5B-Instruct` |
| `review-answers.js` | Interactive CLI (`npm run cogsworth:review`) to approve (`y`), edit (`e`), or delete (`d`) unreviewed cache entries |
| `neural.js` | Optional `Qwen2.5-0.5B-Instruct` rewriter via `transformers.js` (WebGPU/WASM) with strict grounding checks |
| `engine.js` | The pipeline: follow-up resolution → reviewed cache match → intent detection → tech usage → hybrid (BM25 + cosine) retrieval → answer composition |
| `cli.js` | Terminal chat (`npm run cogsworth -- --debug`, `--neural` to enable `Qwen2.5-0.5B-Instruct`) |
| `vite-plugin.js` | Serves `/api/chat` from the engine when running `npm run dev:local` |
| `eval/questions.json` | Main evaluation suite |
| `eval/held-out.json` | Held-out evaluation suite (never copied into `answers.json`) |
| `eval/regressions.json` | Regression evaluation suite (never copied into `answers.json`) |
| `eval/review.json` | Round 2 review evaluation suite (never copied into `answers.json`) |
| `eval/round3.json` | Round 3 evaluation suite (never copied into `answers.json`) |
| `eval/run-eval.js` | Scores BM25, Cache + BM25, Hybrid (`bge + bm25`), and `Qwen2.5-0.5B-Instruct`; `--compare-prod` also scores live Gemini |
| `engine.test.js` | Unit tests (Vitest) |

## Workflow for any change

1. `npm run cogsworth -- --debug`: reproduce the bad answer and see the intent, resolved query, and sources.
2. Add the failing question to the relevant `eval/*.json` file (`contains` = facts the answer must include,
   or `"outOfScope": true` for questions it should decline).
3. Fix it in `text.js` (vocabulary), `chunks.js` (what's indexed), or `engine.js` (logic).
4. Before finishing, all of these must pass:
   ```bash
   npm test
   npm run cogsworth:eval
   npm run build
   ```
5. Don't overfit: a fix for one question shouldn't break others. The eval catches that.
