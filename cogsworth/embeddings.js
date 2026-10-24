// cogsworth/embeddings.js
// Local semantic embedding helper for hybrid (BM25 + cosine similarity) retrieval.
// Uses Xenova/bge-small-en-v1.5 via @huggingface/transformers with zero server calls.

export const DEFAULT_EMBED_MODEL_ID = 'Xenova/bge-small-en-v1.5';

export function cleanTextForEmbedding(text) {
  return (text || '')
    .replace(/\b(puja['’]?s?|sridhar|cogsworth)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

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

  async function embed(text) {
    const cleaned = cleanTextForEmbedding(text);
    if (!cleaned) return null;
    const out = await extractor(cleaned, { pooling: 'mean', normalize: true });
    return Array.from(out.data);
  }

  return { embed, modelId };
}
