// Cogsworth in the visitor's browser, loaded only when needed:
// - a safety net: when /api/chat can't be reached or returns nothing, the from-scratch engine answers instead
//   (the server already does the same when Gemini itself fails, for example on quota);
// - an opt-in: "cogsworth --model on" downloads Puja's own fine-tuned model and answers with it, behind the
//   grounding guard that falls back to the engine whenever an answer isn't backed by the portfolio.

// Hugging Face model id of the browser build (the cogsworth-web folder from the Kaggle run). Empty hides the
// "cogsworth --model" command. See cogsworth/train/README.md, "Put the model on the site".
export const OWN_MODEL_ID = '';
export const OWN_MODEL_DOWNLOAD = '~500 MB';

export async function engineFallbackAnswer(prompt) {
  const { localFallbackAnswer } = await import('../../cogsworth/fallback.js');
  return localFallbackAnswer(prompt);
}

let responderPromise = null;

export function isOwnModelLoading() {
  return responderPromise !== null;
}

// Resolves to { reply(question, history) -> { text, source: 'model' | 'engine', reason? } }.
export function loadOwnModel({ onProgress } = {}) {
  if (!OWN_MODEL_ID) return Promise.reject(new Error('The model is not published yet.'));
  if (!responderPromise) {
    responderPromise = (async () => {
      const [{ createEngine }, { portfolioData }, { createModelResponder, createTransformersGenerator }] = await Promise.all([
        import('../../cogsworth/engine.js'),
        import('../../portfolio-data.js'),
        import('../../cogsworth/train/runtime.js'),
      ]);
      const generate = await createTransformersGenerator({ model: OWN_MODEL_ID, dtype: 'q8', onProgress });
      return createModelResponder({ engine: createEngine(portfolioData), data: portfolioData, generate });
    })();
    responderPromise.catch(() => {
      responderPromise = null;
    });
  }
  return responderPromise;
}

// transformers.js progress events -> one line for the terminal, or null to skip.
export function describeDownload(event) {
  if (event?.status !== 'progress' || !event.total || !/\.onnx/.test(event.file || '')) return null;
  const mb = (bytes) => Math.round(bytes / 1e6);
  return `Downloading Puja's model: ${mb(event.loaded)} / ${mb(event.total)} MB (${Math.floor(event.progress)}%)`;
}
