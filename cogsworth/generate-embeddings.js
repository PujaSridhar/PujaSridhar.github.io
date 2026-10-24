// cogsworth/generate-embeddings.js
// Offline script that embeds every portfolio chunk with Xenova/bge-small-en-v1.5
// and writes the normalized vectors to cogsworth/embeddings.json.
//
//   npm run cogsworth:embed

import { writeFileSync } from 'node:fs';
import { buildChunks } from './chunks.js';
import { splitSentences } from './text.js';
import { createEmbedder, DEFAULT_EMBED_MODEL_ID } from './embeddings.js';
import { portfolioData } from '../portfolio-data.js';

const OUTPUT_URL = new URL('./embeddings.json', import.meta.url);

// Four decimals keep cosine scores stable to ~1e-4 while roughly halving the file size.
const round = vector => vector.map(v => Number(v.toFixed(4)));

async function main() {
  const chunks = buildChunks(portfolioData);
  console.log(`Loading ${DEFAULT_EMBED_MODEL_ID} via transformers.js...`);
  const embedder = await createEmbedder();

  const records = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const inputText = `${chunk.title}. ${chunk.team ? `${chunk.team}. ` : ''}${chunk.text}`;
    const vector = round(await embedder.embed(inputText));
    // Sentence vectors let a single line ("the part I'm most proud of") be found even when
    // the rest of its paragraph is about something else.
    const sentences = [];
    for (const sentence of splitSentences(chunk.text)) {
      const sentenceVector = await embedder.embed(sentence);
      if (sentenceVector) sentences.push({ text: sentence, vector: round(sentenceVector) });
    }
    records.push({
      id: i,
      section: chunk.section,
      entity: chunk.entity,
      title: chunk.title,
      text: chunk.text,
      vector,
      sentences,
    });
  }

  const payload = {
    model: embedder.modelId,
    dimension: records[0]?.vector.length || 384,
    chunks: records,
  };

  writeFileSync(OUTPUT_URL, JSON.stringify(payload) + '\n', 'utf8');
  console.log(`Wrote ${records.length} chunk embeddings (${payload.dimension}-d) to cogsworth/embeddings.json`);
}

main();
