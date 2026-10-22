import { describe, expect, it } from 'vitest';
import { BM25Index } from './bm25.js';
import { createEngine } from './engine.js';
import { expandQuery, splitSentences, stem, tokenize } from './text.js';
import { portfolioData } from '../portfolio-data.js';

describe('text', () => {
  it('stems plurals and irregular verbs consistently', () => {
    expect(stem('projects')).toBe(stem('project'));
    expect(stem('built')).toBe('build');
    expect(stem('class')).toBe('class');
  });

  it('drops stopwords and keeps technical terms', () => {
    expect(tokenize('What is her experience with Node.js and C++?')).toEqual(['experience', 'node.js', 'c++']);
  });

  it('weights typed terms above synonym expansions', () => {
    const weights = expandQuery('job');
    expect(weights.get('job')).toBe(1);
    expect(weights.get('experience')).toBeLessThan(1);
  });

  it('does not split sentences on decimals or file extensions', () => {
    expect(splitSentences('Built with Gemini 2.5 and Node.js. It works.')).toEqual(['Built with Gemini 2.5 and Node.js.', 'It works.']);
  });
});

describe('BM25Index', () => {
  it('ranks the document with the rarer matching term first', () => {
    const index = new BM25Index();
    index.add('a', 'redis cache layer');
    index.add('b', 'react frontend app');
    index.add('c', 'react redis app');
    const results = index.search(expandQuery('redis cache'));
    expect(results[0].doc.id).toBe('a');
    expect(results.every(result => result.doc.id !== 'b')).toBe(true);
  });
});

describe('engine', () => {
  const engine = createEngine(portfolioData);

  it('answers contact questions from structured data', () => {
    const result = engine.answer('How can I reach out to Puja?');
    expect(result.intent).toBe('contact');
    expect(result.text).toContain(portfolioData.contact.email);
  });

  it('does not treat a company name as an intent keyword', () => {
    const result = engine.answer('What did she do at Pennant Education?');
    expect(result.intent).toBe('retrieval');
    expect(result.entity).toBe('Pennant Education');
  });

  it('resolves follow-ups to the entity from the previous turn', () => {
    const history = [{ role: 'user', text: 'Tell me about LocalLens' }, { role: 'assistant', text: '...' }];
    const result = engine.answer('What tech does it use?', history);
    expect(result.followUp).toBe(true);
    expect(result.entity).toBe('LocalLens');
    expect(result.text).toContain('Groq');
  });

  it('declines questions the portfolio cannot answer', () => {
    expect(engine.answer('Who won the 2018 World Cup?').intent).toBe('unknown');
  });

  it('only answers with sentences that exist in the portfolio', () => {
    const corpus = engine.chunks.map(chunk => `${chunk.title} ${chunk.text}`).join(' ');
    const { text } = engine.answer('How did she use Redis?');
    const quoted = text.split('\n').filter(line => !line.startsWith('**')).join(' ')
      .replace(/In Puja's words: "|"$/g, '');
    for (const sentence of splitSentences(quoted)) expect(corpus).toContain(sentence.replace(/"$/, ''));
  });
});
