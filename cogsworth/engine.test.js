import { describe, expect, it } from 'vitest';
import cachedAnswers from './answers.json' with { type: 'json' };
import { BM25Index } from './bm25.js';
import { createEngine } from './engine.js';
import { normalizeOutput, toThirdPerson, verifyGrounded } from './neural.js';
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

  it('only answers with sentences that exist in the portfolio when using the BM25 fallback', () => {
    const corpus = engine.chunks.map(chunk => `${chunk.title} ${chunk.text}`).join(' ');
    const { text } = engine.answer('How did she use Redis?', [], { useCache: false });
    const quoted = text.split('\n').filter(line => !line.startsWith('**')).join(' ')
      .replace(/In Puja's words: "|"$/g, '');
    for (const sentence of splitSentences(quoted)) expect(corpus).toContain(sentence.replace(/"$/, ''));
  });

  it('only serves reviewed cache entries at runtime (structured count as reviewed; qwen/template have reviewed: false)', () => {
    expect(cachedAnswers.length).toBeGreaterThanOrEqual(150);
    for (const entry of cachedAnswers) {
      expect(['qwen', 'template', 'structured']).toContain(entry.generator);
      if (entry.generator === 'qwen' || entry.generator === 'template') {
        expect(entry.reviewed).toBe(false);
      }
    }

    // Unreviewed qwen/template entry is skipped at runtime until reviewed is flipped to true.
    const unreviewed = engine.answer('What tech does LocalLens use?');
    expect(unreviewed.cached).toBe(false);
    expect(unreviewed.entity).toBe('LocalLens');
    expect(unreviewed.text).toContain('Groq');

    // Structured entry counts as reviewed and hits cache.
    const structuredHit = engine.answer('How can I contact Puja?');
    expect(structuredHit.cached).toBe(true);
    expect(structuredHit.text).toContain(portfolioData.contact.email);

    // Explicitly reviewed qwen/template entry is served from cache.
    const reviewedEngine = createEngine(portfolioData, {
      cache: cachedAnswers.map(e => (e.q === 'What tech does LocalLens use?' ? { ...e, reviewed: true } : e)),
    });
    const reviewedHit = reviewedEngine.answer('What tech does LocalLens use?');
    expect(reviewedHit.cached).toBe(true);
    expect(reviewedHit.entity).toBe('LocalLens');
    expect(reviewedHit.text).toContain('Groq');

    const miss = engine.answer('Does she know Rust or Elixir?');
    expect(miss.cached).toBe(false);
  });

  it('answers the 7 regression questions and never copies them into answers.json', async () => {
    const { default: regressions } = await import('./eval/regressions.json', { with: { type: 'json' } });
    const cacheQuestions = new Set(cachedAnswers.map(e => e.q.trim().toLowerCase()));
    for (const item of regressions) {
      expect(cacheQuestions.has(item.q.trim().toLowerCase())).toBe(false);
    }

    const healthcare = engine.answer('Has Puja done anything in healthcare?');
    expect(healthcare.text).toContain('RWJ');
    expect(healthcare.text).toContain('Filomena');

    const frontend = engine.answer('What frontend frameworks does she use?');
    expect(frontend.text).toContain('React');

    const db = engine.answer('Is Puja good with databases?');
    expect(db.text).toContain('PostgreSQL');
    expect(db.text).toContain('Redis');
    expect(db.text).toContain('MongoDB');
    expect(db.text).toContain('Pinecone');

    const citizen = engine.answer('Is Puja a US citizen?');
    expect(citizen.intent).toBe('unknown');

    const cogsworth = engine.answer('What’s Cogsworth?');
    expect(cogsworth.text).toContain('Cogsworth');

    const hire = engine.answer('Why should I hire Puja?');
    expect(hire.intent).toBe('pitch');
    expect(hire.text).toContain('Rutgers');
    expect(hire.text).toContain('Pennant Education');
    expect(hire.text).toContain('PostHog');

    const strongest = engine.answer('What’s her strongest project?');
    expect(strongest.intent).toBe('featured_projects');
    expect(strongest.text).toContain('PostHog Engineering Impact Dashboard');
    expect(strongest.text).toContain('LocalLens');
    expect(strongest.text).toContain('LexAI');
    expect(strongest.text).toContain('AI Neighborhood Watch');
    expect(strongest.text).toContain('Smart Doc Finder');
  });

  it('answers every question in eval/review.json and never copies them into answers.json', async () => {
    const { default: reviewCases } = await import('./eval/review.json', { with: { type: 'json' } });
    const cacheQuestions = new Set(cachedAnswers.map(e => e.q.trim().toLowerCase()));
    for (const tc of reviewCases) {
      expect(cacheQuestions.has(tc.q.trim().toLowerCase())).toBe(false);
      const res = engine.answer(tc.q, tc.history || []);
      for (const expected of tc.contains) {
        expect(res.text.toLowerCase()).toContain(expected.toLowerCase());
      }
    }
  });
});

describe('neural grounding guard', () => {
  it('converts first-person portfolio sentences into third-person, drops emphasis myself, and quotes reflexive myself', () => {
    const converted = normalizeOutput(toThirdPerson('In Puja\'s words: "I built my pipeline and designed the formula myself."'));
    expect(converted).toBe("Puja built Puja's pipeline and designed the formula.");

    const emphasisInline = normalizeOutput(toThirdPerson('A custom impact score I designed myself (because the formula matters).'));
    expect(emphasisInline).toBe('A custom impact score Puja designed (because the formula matters).');
    expect(emphasisInline).not.toContain('Puja designed Puja');

    const reflexive = normalizeOutput(toThirdPerson('My MS is from Rutgers, and asking myself why Redis was sitting there doing one job.'));
    expect(reflexive).toBe('In Puja\'s words: "My MS is from Rutgers, and asking myself why Redis was sitting there doing one job."');
  });

  it('rejects invented numbers, pronouns, and ungrounded proper nouns', () => {
    const context = 'Puja built Credit Card Fraud Detection with Python, Scikit-learn, Isolation Forest.';
    expect(
      verifyGrounded({
        candidate: 'In Credit Card Fraud Detection, Isolation Forest won.',
        contextText: context,
        extractiveText: context,
        query: 'Which model won in the fraud detection project?',
        entity: { name: 'Credit Card Fraud Detection' },
      }).ok
    ).toBe(true);

    expect(
      verifyGrounded({
        candidate: 'In Credit Card Fraud Detection, Isolation Forest won with 99% accuracy.',
        contextText: context,
        extractiveText: context,
        query: 'Which model won in the fraud detection project?',
        entity: { name: 'Credit Card Fraud Detection' },
      }).reason
    ).toContain('invented-number');

    expect(
      verifyGrounded({
        candidate: 'She built Credit Card Fraud Detection with Isolation Forest.',
        contextText: context,
        extractiveText: context,
        query: 'Which model won in the fraud detection project?',
        entity: { name: 'Credit Card Fraud Detection' },
      }).reason
    ).toBe('contains-pronoun');

    expect(
      verifyGrounded({
        candidate: 'Puja built Credit Card Fraud Detection with PyTorch and Isolation Forest.',
        contextText: context,
        extractiveText: context,
        query: 'Which model won in the fraud detection project?',
        entity: { name: 'Credit Card Fraud Detection' },
      }).reason
    ).toContain('invented-proper-noun');
  });
});
