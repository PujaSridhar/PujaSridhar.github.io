// cogsworth/train/runtime.js
// Serves the fine-tuned model behind the engine: the engine retrieves, the model writes the reply
// from those chunks, and a grounding check falls back to the engine's own answer if the model
// states a number, name or link that isn't in the chunks it was given.
//
//   const responder = createModelResponder({ engine, data, generate: await createTransformersGenerator({ model }) });
//   const { text, source } = await responder.reply(prompt, conversationHistory);
//
// Dependency-free apart from transformers.js, which is only loaded by createTransformersGenerator.

import { buildMessages, createContextBuilder, formatContext } from './context.js';
import { findUnsupportedFacts } from './grounding.js';

export const REFUSAL_RE = /don't have|(doesn't|does not) (mention|list|include|cover|say)|do not have|no information|not (mentioned|available|specified|included|provided|listed)|isn't (mentioned|available|included|listed)|only answer questions/i;

/** Words from the question a refusal may repeat ("I don't have anything about Kubernetes"). */
function questionTerms(question) {
  return (question.match(/[A-Za-z][A-Za-z0-9+#.-]*/g) || []);
}

/** Facts in `text` that the context (and earlier turns) don't support. */
export function checkGrounding(text, chunks, history = [], question = '') {
  const source = `${formatContext(chunks)}\n${history.map(h => h.text ?? h.content ?? '').join('\n')}`;
  const allow = REFUSAL_RE.test(text) ? questionTerms(question) : [];
  return findUnsupportedFacts(text, source, { allow });
}

export function createModelResponder({ engine, data, generate, maxNewTokens = 220, guard = true }) {
  const contextFor = createContextBuilder(engine, data);

  async function reply(question, history = []) {
    const { chunks } = contextFor(question, history);
    const fallback = reason => ({ text: engine.answer(question, history).text, source: 'engine', reason, chunks: chunks.map(c => c.title) });
    let text;
    try {
      text = String(await generate(buildMessages(question, chunks, history), { maxNewTokens })).trim();
    } catch (error) {
      return fallback(`model-error: ${error.message}`);
    }
    if (!text) return fallback('empty');
    const problems = guard ? checkGrounding(text, chunks, history, question) : [];
    if (problems.length) return { ...fallback('ungrounded'), problems, modelText: text };
    return { text, source: 'model', chunks: chunks.map(c => c.title) };
  }

  return { reply, contextFor };
}

// The site bundles this file (src/utils/cogsworthLocal.js), so nothing here may be resolvable by the
// bundler: browsers load transformers.js from the CDN (the version cogsworth/ installs for Node), Node
// loads the installed package. Specifiers are built at runtime so Vite leaves them alone.
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1';

async function loadTransformers() {
  if (typeof window !== 'undefined') return import(/* @vite-ignore */ TRANSFORMERS_CDN);
  const pkg = ['@huggingface', 'transformers'].join('/');
  try {
    return await import(/* @vite-ignore */ pkg);
  } catch {
    const local = ['..', 'node_modules', pkg, 'dist', 'transformers.node.mjs'].join('/');
    return import(/* @vite-ignore */ new URL(local, import.meta.url).href);
  }
}

/**
 * A generate(messages) function backed by transformers.js.
 * `model` is a Hugging Face model id (e.g. "your-name/cogsworth-0.5b") or, in Node, a local folder
 * produced by export_onnx.py. dtype 'q4' or 'q8' picks onnx/model_q4.onnx or onnx/model_quantized.onnx.
 */
export async function createTransformersGenerator({ model, dtype = 'q8', device, onProgress } = {}) {
  const { pipeline, env } = await loadTransformers();
  let modelId = model;
  if (typeof window === 'undefined' && model && (model.startsWith('/') || model.startsWith('.'))) {
    const { resolve, dirname, basename } = await import('node:path');
    const full = resolve(model);
    env.allowLocalModels = true;
    env.allowRemoteModels = false;
    env.localModelPath = `${dirname(full)}/`;
    modelId = basename(full);
  }
  let resolvedDevice = device;
  if (!resolvedDevice && typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      if (await navigator.gpu.requestAdapter()) resolvedDevice = 'webgpu';
    } catch { /* WASM fallback */ }
  }
  const generator = await pipeline('text-generation', modelId, {
    dtype,
    ...(resolvedDevice ? { device: resolvedDevice } : {}),
    ...(onProgress ? { progress_callback: onProgress } : {}),
  });
  return async function generate(messages, { maxNewTokens = 220 } = {}) {
    const out = await generator(messages, { max_new_tokens: maxNewTokens, do_sample: false, repetition_penalty: 1.05 });
    const last = out[0].generated_text;
    return Array.isArray(last) ? last[last.length - 1].content : String(last);
  };
}
