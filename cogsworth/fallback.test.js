import { describe, expect, it } from 'vitest';
import { localFallbackAnswer } from './fallback.js';
import { portfolioData } from '../portfolio-data.js';

const UNAVAILABLE = /temporarily unavailable/;

describe('localFallbackAnswer', () => {
  it('serves answers built directly from portfolio data', () => {
    expect(localFallbackAnswer('How can I contact Puja?')).toContain(portfolioData.contact.email);
    expect(localFallbackAnswer('Does she know React?')).toContain('LocalLens');
    expect(localFallbackAnswer('Where has she worked?')).toContain('Pennant Education');
  });

  it('declines free-form answers rather than risk a wrong one', () => {
    for (const q of ['What did she build at HackRU?', 'Why should I hire Puja?', 'Who is Puja?', 'What is the weather in Paris?']) {
      expect(localFallbackAnswer(q)).toMatch(UNAVAILABLE);
    }
  });

  it('does not claim skills the portfolio does not list', () => {
    expect(localFallbackAnswer('Does she know Java?')).toMatch(UNAVAILABLE);
    expect(localFallbackAnswer('Has she used Kubernetes?')).toMatch(UNAVAILABLE);
  });
});
