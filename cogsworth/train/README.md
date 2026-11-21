# Training Cogsworth's own chat model

This kit fine-tunes a small open model to write Cogsworth's replies, so the site can chat without Gemini.
The engine keeps doing what it already does well: it finds the right parts of `portfolio-data.js`.
The trained model only turns those parts into a conversational answer, and a grounding check sends the
reply back to the engine whenever the model states a fact that isn't in what it was given.

```
question ─► engine retrieval (BM25 + facts card + overview) ─► small model writes the reply ─► grounding check
                                                                                                │
                                                       engine.answer() ◄── invented a fact ─────┘
```

What's here:

| file | what it does |
|---|---|
| `build-dataset.js` | Builds ~1,100 grounded Q&A examples from `portfolio-data.js` (facts, follow-ups, multi-turn, casual, refusals, prompt injection), each with the retrieved context the model will see at runtime. Drops any answer that states a fact not in its context, and any question that matches an eval question. |
| `context.js` | The one place that decides what context the model reads. Training, eval and the site all use it, so they can't drift apart. |
| `runtime.js` | `createModelResponder()`: retrieve, generate, check, fall back. `createTransformersGenerator()` loads the exported model with transformers.js in the browser or Node. |
| `score.js` | Scores the trained model next to the engine and Gemini on all six eval suites. |
| `chat.js` | Chat with the trained model in the terminal. |
| `python/` | `train_lora.py` (LoRA fine-tune), `generate.py` (answer the eval questions), `export_onnx.py` (merge, ONNX, q8/q4), `smoke_test.sh`. |
| `kaggle/cogsworth-train.ipynb` | The whole run on a free Kaggle T4. Main path. |
| `slurm/train.sbatch` | The same run on a GPU cluster. |

## Train on Kaggle (main path)

Kaggle's free T4 (16 GB) is plenty: the default 0.5B model trains in fp16 one example at a time (larger batches run
out of memory on Qwen's big vocabulary), and the whole notebook takes roughly an hour. You get about 30 GPU hours a week.

1. **Import the notebook:** kaggle.com → Code → New Notebook → File → Import Notebook → `cogsworth/train/kaggle/cogsworth-train.ipynb`.
2. **Settings → Accelerator → GPU T4** (x1 or x2, it uses one). **Settings → Internet → On** (Kaggle asks you
   to verify a phone number once). With Internet on, the notebook clones the repo (`REPO_REF` in the second
   cell, `main` by default), so it always trains on the current data and needs no dataset.
3. **Save Version → Save & Run All.** It runs in the background; the log prints the score table twice, first for
   the answers (right after training) and then for the browser model. Then download `cogsworth-out.zip` and
   `report.md` from the Output tab.

Without Internet, zip the kit (`cd cogsworth/train && zip -r ~/cogsworth-train.zip data python -x 'python/__pycache__/*' 'python/out/*'`),
upload it as a private dataset and add it as the notebook's input. Training then works, but scoring needs the
whole repo, so upload the repo instead (Datasets → New Dataset → GitHub) if you want the scores on Kaggle.

The adapter and answers are zipped before the browser export, and the export is capped at 40 minutes, so a stuck
export can't lose the training run or burn the GPU quota.

The notebook trains, answers every eval question with the trained model and with the untuned base model, exports
the browser model and zips the LoRA adapter (~35 MB), `cogsworth-web/` and both answer files. To try the
bigger model, change `BASE` in the second cell to `Qwen/Qwen2.5-1.5B-Instruct` (about 3x slower).

## Or train on a Slurm cluster

```
cd cogsworth/train
# edit the partition in slurm/train.sbatch, then
sbatch slurm/train.sbatch                      # or: BASE=Qwen/Qwen2.5-1.5B-Instruct sbatch slurm/train.sbatch
```

Outputs land in `cogsworth/train/python/out/`, same as the Kaggle zip. The script picks bf16 on A100/H100 and fp16 on older cards.

## After training: score it and chat with it

Unzip `cogsworth-out.zip` into `cogsworth/train/python/out/`, then from the repo root:

```
npm run cogsworth:setup                                   # once: installs transformers.js for Node
node cogsworth/train/score.js \
  --trained cogsworth/train/python/out/trained-answers.jsonl \
  --base cogsworth/train/python/out/base-answers.jsonl \
  --onnx cogsworth/train/python/out/cogsworth-web --dtype q8
node cogsworth/train/chat.js --model cogsworth/train/python/out/cogsworth-web --debug
```

`score.js` prints one row per system and writes every answer side by side to `cogsworth/train/eval/out/report.md`.
That report is the real test: read twenty answers from the trained model next to Gemini's and the engine's.

| column | meaning |
|---|---|
| accuracy | the eval's own `grade()`: required facts present, off-topic questions declined |
| made-up | answers that state a number, name, email or link not in `portfolio-data.js` |
| chatty | rough proxy: plain sentences, 5–120 words, not mostly pasted from the portfolio |
| copied | share of 6-word runs copied word for word from the portfolio |

`browser model` is the exported model as the site would run it; `+ guard` is the same with the grounding check and engine fallback on.
Today the engine scores 100% accuracy, 0% made-up, 30% chatty and 40% copied over the 142 eval questions.
A good trained model keeps accuracy close to that with made-up near 0%, and pushes chatty up and copied down.

### Adding Gemini to the comparison

`cogsworth/train/eval/gemini-answers.json` has a slot for every eval question. Fill it from the live site with

```
node cogsworth/train/score.js --fetch-gemini
```

Do this **before PR 20 merges**: after that, the live `/api/chat` answers with the engine, not Gemini. It takes about
12 minutes (one question every 5 seconds to stay polite to the API). You can also paste answers in by hand.

## How it fits with PR 20

PR 20 makes `/api/chat` answer with `engine.answer()`. This kit doesn't change that file or the engine. It adds a layer on top:

```js
import { createEngine } from '../engine.js';
import { createModelResponder, createTransformersGenerator } from './train/runtime.js';

const engine = createEngine(portfolioData);
const generate = await createTransformersGenerator({ model: '/models/cogsworth-web', dtype: 'q8' });
const cogsworth = createModelResponder({ engine, data: portfolioData, generate });
const { text, source } = await cogsworth.reply(question, history);   // source: 'model' or 'engine'
```

Where it can run:

- **Not inside `/api/chat` on Vercel.** A Vercel function is capped at 250 MB, and the model alone is about 500 MB. So the
  engine stays the server answer, exactly as PR 20 has it.
- **In the visitor's browser (the realistic option).** transformers.js runs the export with WebGPU where available and
  WASM otherwise. Load it only when someone opens Cogsworth or turns on a "smarter replies" toggle, and show the
  engine's answer until the model is ready. Host the weights on Hugging Face (upload `cogsworth-web/` as a model repo)
  rather than in this repo or GitHub Pages, which caps files at 100 MB.
- **On a separate host** with a GPU or a large CPU box, if you'd rather not make visitors download it.

Wiring it into the terminal UI is a follow-up PR once you're happy with the scores. This one only adds the kit.

## The model, and honest expectations

**Base model: Qwen2.5-0.5B-Instruct.** Apache 2.0, strong for its size at following a system prompt and quoting
context, already published in transformers.js format by onnx-community, and the repo's optional neural rewriter
(`cogsworth/neural.js`) already uses it. Qwen2.5-1.5B-Instruct is the step up if 0.5B isn't good enough.

**Size in the browser** (downloaded once, then cached):

| model | q8 | q4 |
|---|---|---|
| 0.5B | ~0.5 GB | ~0.8 GB |
| 1.5B | ~1.5 GB | ~2 GB |

Ship q8 (the default; the Kaggle run made a 497 MB q8 model in about two minutes). The q4 export only quantizes the matrix multiplies, and Qwen's large vocabulary table stays in full precision, so q4 ends up bigger, and on Kaggle it ran for over an hour without finishing. Build it only with `--formats q8,q4`.
On a laptop with WebGPU expect a reply in a second or two; on WASM, several seconds; most phones will struggle.

**How close to Gemini?** On questions about the portfolio, with the facts handed to it, a fine-tuned 0.5B model can
read about as naturally as Gemini does today, and it won't wander off topic. It won't match Gemini on open-ended
conversation, odd phrasings it never saw, or questions that need reasoning across several projects, and it will now and
then mix up details between two projects. The grounding check catches invented names, numbers and links (falling back
to the engine), but it can't catch a real fact attached to the wrong project. A model small enough to run in a browser
being "as good as Gemini" in general isn't realistic; "as accurate as the engine, and much more conversational" is,
and the scores will show how close it gets.

**Retrieval sets the ceiling.** For 125 of the 128 eval questions that require specific facts, those facts are in the
context the model sees. The three misses are "Why should I hire Puja?", "Has she used React?" and "What frontend
frameworks has she used?", where the needed project isn't among the retrieved parts. No amount of training fixes
those; better retrieval in `context.js` does.

The eval questions are kept out of the training data (exact and near-duplicate matches are removed), so the scores
measure new phrasings. The facts themselves necessarily overlap, since there is one portfolio.

## When the portfolio changes

The training data is built from `portfolio-data.js`, so after editing it:

```
node cogsworth/train/build-dataset.js            # rewrites data/ (train, val, eval prompts, samples.md to skim)
npx vitest run cogsworth/train                   # checks grounding, determinism and eval leakage
```

Then retrain. New projects need a short entry in `facts.js` for the richer "how does it work" answers; without one
they still get trained on from the data file itself. Regenerate `data/eval-prompts.jsonl` the same way whenever an eval
suite changes (PR 20 adds two questions to `fresh.json`).

## Checking the pipeline without a GPU

```
cd cogsworth/train/python && pip install -r requirements.txt torch && bash smoke_test.sh
```

This trains a tiny random model for four steps, generates, exports to ONNX q8/q4, and then
`node cogsworth/train/score.js --onnx <its output>/run/cogsworth-web` loads the export in transformers.js. The tiny model's
answers are gibberish; the point is that every step runs.
