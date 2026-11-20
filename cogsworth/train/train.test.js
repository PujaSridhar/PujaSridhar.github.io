import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../portfolio-data.js';
import { createEngine } from '../engine.js';
import { buildDataset, loadEvalCases } from './build-dataset.js';
import { createContextBuilder } from './context.js';
import { findUnsupportedFacts, indexSource } from './grounding.js';
import { checkGrounding, createModelResponder } from './runtime.js';

const norm = s => s.toLowerCase().replace(/[^a-z0-9+# ]+/g, ' ').replace(/\s+/g, ' ').trim();

describe('grounding check', () => {
  const source = indexSource('Puja built LocalLens with React in 2025. Email: puja@example.com');

  it('accepts an answer that only restates the source', () => {
    expect(findUnsupportedFacts('Puja built LocalLens with React in 2025.', source)).toEqual([]);
  });

  it('flags invented numbers, names and contacts', () => {
    const problems = findUnsupportedFacts('Puja built LocalLens with Angular in 2019 at Google, email puja@fake.com.', source);
    expect(problems).toEqual(expect.arrayContaining(['Angular', '2019', 'Google', 'puja@fake.com']));
  });
});

describe('training data', () => {
  const a = buildDataset({ seed: 7 });

  it('is deterministic for a seed', () => {
    const b = buildDataset({ seed: 7 });
    expect(b.train.map(r => r.messages.at(-1).content)).toEqual(a.train.map(r => r.messages.at(-1).content));
  });

  it('has enough examples, all ending with the assistant reply', () => {
    expect(a.train.length + a.val.length).toBeGreaterThanOrEqual(800);
    for (const row of [...a.train, ...a.val]) {
      expect(row.messages[0].role).toBe('system');
      expect(row.messages.at(-1).role).toBe('assistant');
      expect(row.messages.at(-1).content.trim().length).toBeGreaterThan(0);
    }
  });

  it('only keeps answers whose facts are in the context the model reads', () => {
    expect(a.stats.ungrounded).toBe(0);
    for (const row of [...a.train, ...a.val]) {
      const answer = row.messages.at(-1).content;
      const prompt = row.messages.slice(1, -1).map(m => m.content).join('\n');
      for (const contact of answer.match(/\S+@\S+\.\w+|https?:\/\/\S+/g) || []) {
        expect(prompt).toContain(contact.replace(/[.,)]+$/, ''));
      }
    }
  });

  it('leaves the eval questions out of training', () => {
    const evalQs = new Set(loadEvalCases().map(c => norm(c.q)));
    const leaked = [...a.train, ...a.val].filter(r => {
      const user = r.messages.at(-2).content;
      return evalQs.has(norm(user.slice(user.lastIndexOf('Question:') + 9)));
    });
    expect(leaked).toEqual([]);
  });
});

describe('context builder', () => {
  const engine = createEngine(portfolioData);
  const contextFor = createContextBuilder(engine, portfolioData);

  it('puts the facts card first for a named project', () => {
    const project = portfolioData.projects[0];
    const { chunks } = contextFor(`When did Puja build ${project.name}?`, []);
    expect(chunks.some(c => c.id.startsWith?.('card:'))).toBe(true);
  });

  it('always includes the profile so basics never depend on retrieval', () => {
    expect(contextFor('Where is Puja based?', []).chunks.some(c => c.id === 'profile')).toBe(true);
  });

  it('routes list questions to the right overview', () => {
    expect(contextFor('Where has she worked?', []).chunks.some(c => c.id === 'overview:experience')).toBe(true);
  });
});

describe('model responder', () => {
  const engine = createEngine(portfolioData);

  it('uses the model reply when it is grounded', async () => {
    const generate = async () => 'Puja is a software engineer.';
    const responder = createModelResponder({ engine, data: portfolioData, generate });
    const out = await responder.reply('Who is Puja?');
    expect(out.source).toBe('model');
  });

  it('falls back to the engine when the model invents a fact', async () => {
    const generate = async () => 'Puja worked at Netflix for 7 years.';
    const responder = createModelResponder({ engine, data: portfolioData, generate });
    const out = await responder.reply('Where has Puja worked?');
    expect(out.source).toBe('engine');
    expect(out.reason).toBe('ungrounded');
    expect(out.problems).toEqual(expect.arrayContaining(['Netflix']));
  });

  it('falls back when the model throws or returns nothing', async () => {
    const broken = createModelResponder({ engine, data: portfolioData, generate: async () => { throw new Error('no GPU'); } });
    expect((await broken.reply('Who is Puja?')).source).toBe('engine');
    const empty = createModelResponder({ engine, data: portfolioData, generate: async () => '  ' });
    expect((await empty.reply('Who is Puja?')).reason).toBe('empty');
  });

  it('lets a refusal repeat the asked-about term', () => {
    const chunks = [{ title: 'Skills', text: 'Python, React' }];
    expect(checkGrounding("The portfolio doesn't mention Kubernetes.", chunks, [], 'Has Puja used Kubernetes?')).toEqual([]);
  });
});
