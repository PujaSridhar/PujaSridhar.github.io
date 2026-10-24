// cogsworth/embeddings.js
// Local semantic embedding helper for hybrid (BM25 + cosine similarity) retrieval.
// Uses Xenova/bge-small-en-v1.5 via @huggingface/transformers with zero server calls.

export const DEFAULT_EMBED_MODEL_ID = 'Xenova/bge-small-en-v1.5';

// From the BAAI/bge-small-en-v1.5 model card: the [CLS] token is the sentence embedding
// (1_Pooling/config.json sets pooling_mode_cls_token), and short retrieval queries get
// this instruction prefix while the passages they search do not.
const POOLING = 'cls';
export const QUERY_INSTRUCTION = 'Represent this sentence for searching relevant passages: ';

export function cleanTextForEmbedding(text) {
  return (text || '')
    .replace(/\b(puja['’]?s?|sridhar|cogsworth)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Re-exported so callers that already import it from here keep working.
export { cosineSimilarity } from './similarity.js';

export async function createEmbedder({
  modelId = DEFAULT_EMBED_MODEL_ID,
  dtype = 'fp32',
  device,
  onProgress,
} = {}) {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  let extractor;
  try {
    extractor = await pipeline('feature-extraction', modelId, {
      dtype,
      ...(device ? { device } : {}),
      ...(onProgress ? { progress_callback: onProgress } : {}),
    });
  } catch {
    extractor = await pipeline('feature-extraction', modelId, {
      dtype,
      ...(onProgress ? { progress_callback: onProgress } : {}),
    });
  }

  // Passages (portfolio chunks and sentences) are embedded as-is.
  async function embed(text) {
    const cleaned = cleanTextForEmbedding(text);
    if (!cleaned) return null;
    const out = await extractor(cleaned, { pooling: POOLING, normalize: true });
    return Array.from(out.data);
  }

  // Visitor questions get the retrieval instruction so they land near the passages that answer them.
  async function embedQuery(text) {
    const cleaned = cleanTextForEmbedding(text);
    if (!cleaned) return null;
    const out = await extractor(QUERY_INSTRUCTION + cleaned, { pooling: POOLING, normalize: true });
    return Array.from(out.data);
  }

  return { embed, embedQuery, modelId };
}
