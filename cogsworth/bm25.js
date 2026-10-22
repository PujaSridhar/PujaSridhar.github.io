// cogsworth/bm25.js
// Okapi BM25 ranking, implemented from scratch. Replaces embedding + Pinecone lookup.

import { tokenize } from './text.js';

export class BM25Index {
  constructor({ k1 = 1.4, b = 0.6 } = {}) {
    this.k1 = k1;
    this.b = b;
    this.docs = [];
    this.docFreq = new Map();
    this.totalLength = 0;
  }

  add(id, text, meta = {}) {
    const terms = tokenize(text);
    const termFreq = new Map();
    for (const term of terms) termFreq.set(term, (termFreq.get(term) || 0) + 1);
    for (const term of termFreq.keys()) this.docFreq.set(term, (this.docFreq.get(term) || 0) + 1);
    this.docs.push({ id, text, meta, termFreq, length: terms.length });
    this.totalLength += terms.length;
  }

  idf(term) {
    const n = this.docFreq.get(term) || 0;
    return Math.log(1 + (this.docs.length - n + 0.5) / (n + 0.5));
  }

  scoreDoc(doc, queryWeights) {
    const avgLength = this.totalLength / this.docs.length || 1;
    let score = 0;
    for (const [term, weight] of queryWeights) {
      const tf = doc.termFreq.get(term);
      if (!tf) continue;
      const norm = tf * (this.k1 + 1) / (tf + this.k1 * (1 - this.b + this.b * doc.length / avgLength));
      score += weight * this.idf(term) * norm;
    }
    return score;
  }

  // queryWeights: Map<term, weight> from expandQuery().
  search(queryWeights, { topK = 5, boost } = {}) {
    return this.docs
      .map(doc => ({ doc, score: this.scoreDoc(doc, queryWeights) * (boost ? boost(doc) : 1) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
