// cogsworth/fallback.js
// What api/chat.js serves when the Gemini pipeline fails (quota, outage, bad key).
// Rule: a correct answer or none. Only intents whose text is assembled directly from
// portfolio-data.js fields are served; everything else, including extracted-sentence
// answers and the free-form about/pitch summaries, gets an honest "unavailable" note.

import { createEngine } from './engine.js';
import { portfolioData } from '../portfolio-data.js';

const EXACT_INTENTS = new Set([
  'greeting',
  'contact',
  'education',
  'skills',
  'languages',
  'certifications',
  'talks',
  'leadership',
  'availability',
  'hackathons',
  'projects',
  'experience',
  'tech_usage',
]);

const { contact } = portfolioData;
const UNAVAILABLE =
  "Cogsworth's full assistant is temporarily unavailable. Right now I can only answer the basics: " +
  "Puja's contact details, skills, education, and lists of projects, roles, and hackathons.\n" +
  `For anything else, reach Puja directly:\n**Email:** ${contact.email}\n**LinkedIn:** ${contact.linkedin}`;

// No answer cache: every answer is rebuilt from portfolio-data.js, so an edit there (a new
// email, a new skill) can never be contradicted by a stale cached entry.
const engine = createEngine(portfolioData, { cache: [] });

// Conversation history is deliberately ignored. None of the exact answers depend on context,
// and follow-up resolution can borrow the previous question: after "how can I contact Puja?",
// a terse "what did do at RWJ?" was answered with contact details.
export function localFallbackAnswer(prompt) {
  const result = engine.answer(prompt, [], { useCache: false });
  return EXACT_INTENTS.has(result.intent) ? result.text : UNAVAILABLE;
}
