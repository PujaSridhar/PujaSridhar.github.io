// cogsworth/generate-cache.js
// Offline generator for cogsworth/answers.json (~150 likely visitor questions).
// Uses cogsworth's BM25 retrieval as the sole source of facts, then rewrites
// retrieved chunks into natural third-person answers using Qwen2.5-0.5B-Instruct
// (via transformers.js) or an optional local Ollama model (--ollama <model>).
// Every generated answer is checked by verifyGrounded() and required-token checks;
// if the model drops a required fact or invents anything outside the context,
// it falls back to a clean third-person rewrite of the BM25-retrieved sentences.
//
// Usage:
//   node cogsworth/generate-cache.js                      # Qwen2.5-0.5B-Instruct + grounding guard
//   node cogsworth/generate-cache.js --ollama qwen2.5:3b  # Local Ollama model + grounding guard
//   node cogsworth/generate-cache.js --extractive         # Deterministic 3rd-person BM25 rewrite only

import { writeFileSync } from 'node:fs';
import { createEngine } from './engine.js';
import { createRewriter, normalizeOutput, toThirdPerson, verifyGrounded } from './neural.js';
import { portfolioData } from '../portfolio-data.js';

// ~150 likely visitor questions across every section, project, role, hackathon, and skill.
export const QUESTION_BANK = [
  // Greeting & About (10)
  { q: 'Hi', mustContain: ['Cogsworth'] },
  { q: 'Hello', mustContain: ['Cogsworth'] },
  { q: 'Who is Puja?', mustContain: ['San Jose', 'Rutgers'] },
  { q: 'Tell me about Puja', mustContain: ['San Jose', 'Rutgers'] },
  { q: 'Give me a quick summary of Puja\'s background', mustContain: ['Rutgers', 'San Jose'] },
  { q: 'What is Puja\'s background?', mustContain: ['Rutgers', 'San Jose'] },
  { q: 'Introduce Puja Sridhar', mustContain: ['Rutgers', 'San Jose'] },
  { q: 'What does Puja do?', mustContain: ['AI Engineering', 'San Jose'] },
  { q: 'What is Puja passionate about building?', mustContain: ['PostHog', 'LocalLens', 'LexAI'] },
  { q: 'Tell me about yourself', mustContain: ['San Jose'] },

  // Availability, Location, Roles (10)
  { q: 'Where is she based?', mustContain: ['San Jose'] },
  { q: 'Where does Puja live?', mustContain: ['San Jose'] },
  { q: 'What is Puja\'s current location?', mustContain: ['San Jose'] },
  { q: 'What kind of roles is she looking for?', mustContain: ['AI Engineering', 'Data Engineering', 'ML Engineering', 'SWE'] },
  { q: 'Is Puja open to new roles?', mustContain: ['San Jose', 'AI Engineering'] },
  { q: 'Is she available for hire?', mustContain: ['San Jose', 'AI Engineering'] },
  { q: 'What positions is Puja interested in?', mustContain: ['AI Engineering', 'Data Engineering'] },
  { q: 'Is Puja looking for full-time opportunities?', mustContain: ['AI Engineering', 'San Jose'] },
  { q: 'Is she open to AI Engineering or Data Engineering roles?', mustContain: ['AI Engineering', 'Data Engineering'] },
  { q: 'Where is she located right now?', mustContain: ['San Jose'] },

  // Contact (8)
  { q: 'How can I contact Puja?', mustContain: ['pujasridhar28@gmail.com'] },
  { q: 'How can I reach out to Puja?', mustContain: ['pujasridhar28@gmail.com'] },
  { q: 'What is Puja\'s email address?', mustContain: ['pujasridhar28@gmail.com'] },
  { q: 'What\'s her LinkedIn?', mustContain: ['linkedin.com/in/pujasridhar'] },
  { q: 'What is Puja\'s GitHub?', mustContain: ['github.com/pujasridhar'] },
  { q: 'How do I get in touch with her?', mustContain: ['pujasridhar28@gmail.com'] },
  { q: 'Where can I find Puja\'s GitHub and LinkedIn links?', mustContain: ['github.com/pujasridhar', 'linkedin.com/in/pujasridhar'] },
  { q: 'Can you share Puja\'s contact details?', mustContain: ['pujasridhar28@gmail.com'] },

  // Education (12)
  { q: 'Where did she do her masters?', mustContain: ['Rutgers'] },
  { q: 'What was her GPA at Rutgers?', mustContain: ['3.8'] },
  { q: 'What did she study in undergrad?', mustContain: ['Artificial Intelligence and Machine Learning'] },
  { q: 'Tell me about Puja\'s education', mustContain: ['Rutgers', 'BMS Institute of Technology'] },
  { q: 'When did Puja graduate from Rutgers?', mustContain: ['Jan 2026', 'Rutgers'] },
  { q: 'Where did Puja go to university?', mustContain: ['Rutgers', 'BMS Institute of Technology'] },
  { q: 'What degree did Puja get at Rutgers University?', mustContain: ['Masters of Science in Computer Science', 'Rutgers'] },
  { q: 'Where did Puja complete her bachelor\'s degree?', mustContain: ['BMS Institute of Technology', 'Artificial Intelligence and Machine Learning'] },
  { q: 'What was Puja\'s undergrad GPA?', mustContain: ['8.64'] },
  { q: 'When did Puja finish her undergrad in India?', mustContain: ['May 2023', 'BMS Institute of Technology'] },
  { q: 'Does Puja have a master\'s degree in Computer Science?', mustContain: ['Rutgers', 'Masters of Science in Computer Science'] },
  { q: 'What schools did Puja attend?', mustContain: ['Rutgers', 'BMS Institute of Technology'] },

  // Skills & Technologies (28)
  { q: 'What are her skills?', mustContain: ['FastAPI', 'Airflow', 'Python'] },
  { q: 'What is Puja\'s tech stack?', mustContain: ['Python', 'FastAPI', 'Airflow'] },
  { q: 'What programming languages does she know?', mustContain: ['Python', 'SQL', 'C', 'JavaScript'] },
  { q: 'What AI and ML skills does Puja have?', mustContain: ['LLMs', 'Agentic Pipelines', 'RAG'] },
  { q: 'What data engineering tools does Puja know?', mustContain: ['Airflow', 'dbt', 'PostgreSQL', 'Redis'] },
  { q: 'What cloud and infrastructure tools has Puja used?', mustContain: ['AWS', 'Docker', 'GitHub Actions'] },
  { q: 'What web frameworks does Puja use?', mustContain: ['FastAPI', 'Flask', 'React'] },
  { q: 'What systems programming skills does Puja have?', mustContain: ['WebAssembly', 'Emscripten', 'C'] },
  { q: 'Does she know Docker?', mustContain: ['Docker'] },
  { q: 'How did she use Redis?', mustContain: ['Redis', 'Smart Doc Finder'] },
  { q: 'Has she worked with Airflow?', mustContain: ['Airflow', 'PostHog'] },
  { q: 'Did she do anything with WebAssembly?', mustContain: ['WebAssembly'] },
  { q: 'Has Puja used dbt?', mustContain: ['dbt', 'PostHog'] },
  { q: 'What experience does Puja have with FastAPI?', mustContain: ['FastAPI'] },
  { q: 'Does Puja know Python and SQL?', mustContain: ['Python', 'SQL'] },
  { q: 'Has Puja worked with AWS?', mustContain: ['AWS'] },
  { q: 'What databases has Puja worked with?', mustContain: ['PostgreSQL', 'Redis', 'MongoDB', 'Pinecone'] },
  { q: 'Has Puja built RAG or vector search systems?', mustContain: ['Vector', 'Redis'] },
  { q: 'Does Puja have experience with TensorFlow and Keras?', mustContain: ['TensorFlow', 'Keras'] },
  { q: 'Has Puja used Scikit-learn?', mustContain: ['Scikit-learn'] },
  { q: 'Has Puja worked with React?', mustContain: ['React'] },
  { q: 'Does Puja have experience with C programming?', mustContain: ['C', 'WebAssembly'] },
  { q: 'Has Puja used ElevenLabs?', mustContain: ['ElevenLabs', 'Neighborhood Watch'] },
  { q: 'Has Puja worked with Groq?', mustContain: ['Groq', 'LocalLens'] },
  { q: 'Has Puja worked with UiPath?', mustContain: ['UiPath', 'Pennant Education'] },
  { q: 'Has she done computer vision work?', mustContain: ['Facial', 'OpenCV'] },
  { q: 'Has Puja worked with NLP and Transformers?', mustContain: ['Transformer', 'NLP'] },
  { q: 'What tools is Puja proficient in?', mustContain: ['Python', 'FastAPI', 'Airflow'] },

  // Spoken Languages (6)
  { q: 'Which languages does she speak?', mustContain: ['Tamil', 'Kannada', 'English', 'Hindi', 'Telugu'] },
  { q: 'What spoken languages is Puja fluent in?', mustContain: ['English', 'Hindi', 'Tamil'] },
  { q: 'Does Puja speak Tamil and Kannada?', mustContain: ['Tamil', 'Kannada'] },
  { q: 'How many human languages does Puja speak?', mustContain: ['English', 'Hindi', 'Tamil', 'Kannada', 'Telugu'] },
  { q: 'Does Puja speak Hindi?', mustContain: ['Hindi'] },
  { q: 'What languages can Puja communicate in?', mustContain: ['English', 'Tamil', 'Kannada'] },

  // Certifications (7)
  { q: 'What certifications does she have?', mustContain: ['Databricks', 'Oracle', 'DeepLearning.AI'] },
  { q: 'Is Puja certified in Databricks?', mustContain: ['Databricks'] },
  { q: 'Does Puja have any cloud certifications?', mustContain: ['Oracle Cloud Infrastructure'] },
  { q: 'What credentials or accreditations has Puja earned?', mustContain: ['Databricks', 'Oracle'] },
  { q: 'Has Puja completed any DeepLearning.AI or Coursera certificates?', mustContain: ['DeepLearning.AI', 'University of Michigan'] },
  { q: 'Tell me about Puja\'s Generative AI certification', mustContain: ['Generative AI Fundamentals', 'Databricks'] },
  { q: 'List all of Puja\'s certifications', mustContain: ['Databricks', 'Oracle'] },

  // Talks (5)
  { q: 'Has she given any talks?', mustContain: ['Traffic Management Using AI'] },
  { q: 'What presentations or lectures has Puja given?', mustContain: ['Traffic Management Using AI', 'Campus Placements'] },
  { q: 'Tell me about Puja\'s talk on Traffic Management Using AI', mustContain: ['Traffic Management Using AI', 'BMS Institute of Technology'] },
  { q: 'Did Puja give a talk on preparing for AI developer roles?', mustContain: ['How to Prepare for an AI Developer role through Campus Placements'] },
  { q: 'Where has Puja spoken?', mustContain: ['BMS Institute of Technology', 'Traffic Management Using AI'] },

  // Leadership (6)
  { q: 'What leadership roles has she had?', mustContain: ['Class Representative', 'Event Head', 'Finance Head'] },
  { q: 'Tell me about Puja\'s leadership experience', mustContain: ['Class Representative', 'Event Head', 'Finance Head'] },
  { q: 'What did Puja do as Class Representative?', mustContain: ['Class Representative', '60 classmates', '15%'] },
  { q: 'What did Puja accomplish as Event Head?', mustContain: ['Event Head', '20%'] },
  { q: 'What did Puja do as Finance Head?', mustContain: ['Finance Head', '15%'] },
  { q: 'How did Puja demonstrate leadership in undergrad?', mustContain: ['Class Representative', 'BMS Institute of Technology'] },

  // Experience Overview & Specific Roles (28)
  { q: 'Where has she worked?', mustContain: ['Pennant Education', 'Rutgers', 'HumanFractal', 'Exposys', 'Vaave'] },
  { q: 'What is Puja\'s work experience?', mustContain: ['Pennant Education', 'Rutgers', 'HumanFractal'] },
  { q: 'What internships has Puja done?', mustContain: ['Pennant Education', 'Exposys Data Labs', 'Vaave'] },
  { q: 'Tell me about Puja\'s career and jobs', mustContain: ['Pennant Education', 'Rutgers'] },
  { q: 'What roles has Puja held?', mustContain: ['AI Engineering Intern', 'Graduate Teaching Assistant', 'AI Co-pilot Developer'] },

  // Pennant Education
  { q: 'What did she do at Pennant Education?', mustContain: ['UiPath', 'Pennant Education'] },
  { q: 'Tell me about Puja\'s AI Engineering Intern role at Pennant Education', mustContain: ['UiPath', 'grading', 'UAE'] },
  { q: 'When did Puja intern at Pennant Education?', mustContain: ['July 2025 - September 2025', 'Pennant Education'] },
  { q: 'How long did the Pennant Education internship last?', mustContain: ['2025', 'Pennant Education'] },
  { q: 'What did Puja build with UiPath at Pennant Education?', mustContain: ['UiPath', 'grading'] },
  { q: 'Did Puja work with IBM Watson at Pennant Education?', mustContain: ['IBM Watson', 'Pennant Education'] },

  // Rutgers GTA & Grader
  { q: 'What did she do as a teaching assistant?', mustContain: ['object-oriented', 'classes', 'inheritance', 'polymorphism'] },
  { q: 'Tell me about Puja\'s Graduate Teaching Assistant role at Rutgers', mustContain: ['Rutgers', 'object-oriented'] },
  { q: 'What did Puja do as a Computer Science Grader at Rutgers?', mustContain: ['graph search', 'probabilistic inference', 'deep learning'] },
  { q: 'What topics did Puja grade at Rutgers University?', mustContain: ['graph search', 'probabilistic inference', 'constraint satisfaction', 'deep learning'] },
  { q: 'When was Puja a Teaching Assistant at Rutgers?', mustContain: ['September 2024 - December 2025', 'object-oriented'] },

  // HumanFractal.ai / Filomena
  { q: 'What is Filomena?', mustContain: ['medications', 'treatment'] },
  { q: 'What did Puja do at HumanFractal.ai?', mustContain: ['Filomena', 'medications'] },
  { q: 'Tell me about Puja\'s role at Resolute / HumanFractal', mustContain: ['Filomena', 'medications', 'medical professional'] },
  { q: 'How did Puja make Filomena trustworthy?', mustContain: ['nutritionist', 'nurses', 'medical professional'] },
  { q: 'When did Puja work as an AI Co-pilot Developer?', mustContain: ['February 2023 - May 2023', 'Filomena'] },

  // Exposys Data Labs & Vaave
  { q: 'What did Puja do at Exposys Data Labs?', mustContain: ['regression', 'Random Forest', '96%'] },
  { q: 'Which model won during Puja\'s internship at Exposys Data Labs?', mustContain: ['Random Forest', '96%'] },
  { q: 'What did Puja do at Vaave?', mustContain: ['alumni', '200+'] },
  { q: 'Tell me about Puja\'s Alumni Relations Intern role', mustContain: ['Vaave', '200+'] },

  // Hackathons (12)
  { q: 'What hackathons has she done?', mustContain: ['HackRU', 'RWJ', 'Redis Hackathon'] },
  { q: 'List the hackathons Puja has participated in', mustContain: ['RWJ Health Hackathon', 'HackRU', 'Redis Hackathon'] },
  { q: 'What did she build at HackRU?', mustContain: ['Neighborhood Watch'] },
  { q: 'Tell me about Puja\'s HackRU project', mustContain: ['Neighborhood Watch', 'Leaflet', 'ElevenLabs'] },
  { q: 'Did Puja compete solo at HackRU?', mustContain: ['Solo', 'Neighborhood Watch'] },
  { q: 'What was the RWJ Health Hackathon about?', mustContain: ['care coordination'] },
  { q: 'What did Puja build at the RWJ Health Hackathon?', mustContain: ['care coordination', 'ChatGPT', 'Claude', 'Gemini'] },
  { q: 'Which LLMs were used in the RWJ Health Hackathon project?', mustContain: ['ChatGPT', 'Claude', 'Gemini', 'Cohere', 'Mistral'] },
  { q: 'What was Puja\'s role in the RWJ Health Hackathon team?', mustContain: ['backend', 'care coordination'] },
  { q: 'Tell me about the Redis Hackathon on Dev.to', mustContain: ['Smart Doc Finder', 'Redis'] },
  { q: 'What did Puja build for the Redis Hackathon?', mustContain: ['Smart Doc Finder', 'Streams', 'Redis'] },

  // Projects Overview & Specific Projects (42)
  { q: 'What projects has she built?', mustContain: ['LexAI', 'LocalLens', 'PostHog'] },
  { q: 'Tell me about Puja\'s portfolio projects', mustContain: ['PostHog', 'LocalLens', 'LexAI', 'Smart Doc Finder'] },
  { q: 'What are Puja\'s featured projects?', mustContain: ['PostHog', 'LocalLens', 'LexAI', 'Neighborhood Watch', 'Smart Doc Finder'] },

  // PostHog Engineering Impact Dashboard
  { q: 'Tell me about the PostHog dashboard', mustContain: ['Airflow', 'dbt', 'FastAPI', 'Redis'] },
  { q: 'What is the PostHog Engineering Impact Dashboard?', mustContain: ['Airflow', 'dbt', 'FastAPI', 'Redis'] },
  { q: 'What tech stack does the PostHog dashboard use?', mustContain: ['Python', 'Airflow', 'dbt', 'PostgreSQL', 'FastAPI', 'Redis', 'React'] },
  { q: 'How does the PostHog Engineering Impact Dashboard pipeline work?', mustContain: ['Airflow', 'dbt', 'six models', 'FastAPI', 'Redis'] },

  // LocalLens
  { q: 'What is LocalLens?', mustContain: ['Groq', 'intent'] },
  { q: 'Tell me about LocalLens', mustContain: ['Groq', 'FastAPI', 'React'] },
  { q: 'What tech does LocalLens use?', mustContain: ['Groq', 'FastAPI', 'React', 'Google Places'] },
  { q: 'How does LocalLens work?', mustContain: ['Groq', 'vibe'] },

  // LexAI
  { q: 'What is LexAI?', mustContain: ['agents', 'contract'] },
  { q: 'Tell me about LexAI', mustContain: ['five agents', 'contract', '15–25 seconds'] },
  { q: 'What tech stack does LexAI use?', mustContain: ['Gemini 2.5 Flash', 'Vercel Serverless', 'React 18', 'Node.js'] },
  { q: 'How do the five agents in LexAI work?', mustContain: ['five agents', 'contract', 'counter-proposals'] },
  { q: 'How fast does LexAI analyze a contract?', mustContain: ['15–25 seconds', 'five agents'] },

  // AI Neighborhood Watch
  { q: 'Tell me about AI Neighborhood Watch', mustContain: ['Leaflet', 'Gemini', 'ElevenLabs'] },
  { q: 'What is AI Neighborhood Watch?', mustContain: ['Leaflet', 'ElevenLabs', 'Ava', 'Mateo'] },
  { q: 'What tech stack does AI Neighborhood Watch use?', mustContain: ['Flask', 'PostgreSQL', 'Gemini', 'ElevenLabs', 'Leaflet.js', 'pydub'] },
  { q: 'How does the daily audio briefing in AI Neighborhood Watch work?', mustContain: ['Ava', 'Mateo', 'ElevenLabs', 'pydub'] },

  // Smart Doc Finder
  { q: 'Tell me about Smart Doc Finder', mustContain: ['Redis', 'Streams', 'Vector'] },
  { q: 'What is Smart Doc Finder?', mustContain: ['Redis', 'Streams', 'semantic cache'] },
  { q: 'What tech stack does Smart Doc Finder use?', mustContain: ['Python', 'Redis', 'MongoDB', 'React', 'Docker'] },
  { q: 'What three jobs does Redis do in Smart Doc Finder?', mustContain: ['event streaming', 'vector', 'semantic cache'] },

  // Systems Sandbox
  { q: 'Tell me about Systems Sandbox', mustContain: ['WebAssembly', 'C', 'Emscripten'] },
  { q: 'What is the Systems Sandbox project?', mustContain: ['WebAssembly', 'free-list memory allocator', 'mini shell', 'thread scheduler'] },
  { q: 'What three C demos are in Systems Sandbox?', mustContain: ['allocator', 'shell', 'scheduler'] },
  { q: 'How can I run the Systems Sandbox demos in the terminal?', mustContain: ['sys --alloc', 'sys --shell', 'sys --threads'] },

  // AI Bot Rescue Mission
  { q: 'Tell me about AI Bot Rescue Mission', mustContain: ['A-Star', 'aliens'] },
  { q: 'What algorithm does AI Bot Rescue Mission use?', mustContain: ['Python', 'A-Star', 'Heuristics'] },

  // Algorithmic Transformation
  { q: 'Tell me about the Algorithmic Transformation project', mustContain: ['Independent Set', 'Clique', 'complement'] },
  { q: 'What tech does the Algorithmic Transformation project use?', mustContain: ['Python', 'NetworkX', 'Pandas', '3D Force Graph'] },

  // Multilingual Health Misinformation Detection
  { q: 'Tell me about Multilingual Health Misinformation Detection', mustContain: ['Transformer', 'languages'] },
  { q: 'How does the health misinformation detection project work?', mustContain: ['Transformer', 'false claims', 'languages'] },

  // Emotion Detection from Facial Expressions
  { q: 'What did the emotion detection project use?', mustContain: ['TensorFlow', 'Keras', 'OpenCV', 'FER-2013'] },
  { q: 'Tell me about Emotion Detection from Facial Expressions', mustContain: ['FER-2013', 'OpenCV', '96%'] },
  { q: 'What accuracy did the emotion detection CNN achieve?', mustContain: ['96%', 'FER-2013'] },

  // Sentiment Analysis of Movie Reviews
  { q: 'Tell me about the Sentiment Analysis of Movie Reviews project', mustContain: ['Naive Bayes', '95%', '1,000+'] },
  { q: 'What model and accuracy did the movie review sentiment analysis project have?', mustContain: ['Naive Bayes', 'Scikit-learn', '95%'] },

  // Credit Card Fraud Detection
  { q: 'Which model won in the fraud detection project?', mustContain: ['Isolation Forest'] },
  { q: 'Tell me about the Credit Card Fraud Detection project', mustContain: ['Isolation Forest', 'LOF', 'SVM'] },
  { q: 'Which models did Puja compare in the credit card fraud detection project?', mustContain: ['Isolation Forest', 'LOF', 'SVM'] },
];

// Cleanly formats a BM25 extractive retrieval answer into natural third-person prose
// without any first-person pronouns or "In Puja's words:" wrappers, keeping only the
// relevant primary section when the top chunk already contains all required facts.
export function buildCleanExtractiveAnswer(baseResult, mustContain = []) {
  if (baseResult.intent !== 'retrieval') return baseResult.text;

  const sections = baseResult.text.split('\n\n');
  const firstSection = sections[0] || baseResult.text;
  const firstLower = firstSection.toLowerCase();
  const firstCoversAll = mustContain.every(fact => firstLower.includes(fact.toLowerCase()));
  const chosen = firstCoversAll ? [firstSection] : sections;

  return chosen
    .map(section => {
      const lines = section.split('\n');
      const header = lines[0]?.startsWith('**') ? lines[0] : null;
      const body = (header ? lines.slice(1) : lines).join(' ');
      const thirdPersonBody = normalizeOutput(toThirdPerson(body));
      return header ? `${header}\n${thirdPersonBody}` : thirdPersonBody;
    })
    .join('\n\n');
}

async function generateWithOllama(model, query, contextText) {
  const response = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature: 0 },
      messages: [
        {
          role: 'system',
          content:
            "You are Cogsworth, the assistant for Puja Sridhar's portfolio. Rewrite the Context into 1-3 factual sentences answering the Question. Use ONLY facts from the Context, keep all technical terms verbatim, and refer to Puja as 'Puja' or 'Puja's' (no pronouns).",
        },
        {
          role: 'user',
          content: `Context:\n${toThirdPerson(contextText)}\n\nQuestion: ${query}`,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  const data = await response.json();
  return normalizeOutput(data.message?.content || '');
}

async function main() {
  const args = process.argv.slice(2);
  const extractiveOnly = args.includes('--extractive');
  const ollamaIdx = args.indexOf('--ollama');
  const ollamaModel = ollamaIdx !== -1 ? args[ollamaIdx + 1] : null;

  const engine = createEngine(portfolioData, { cache: [] });
  const rewriter = !extractiveOnly && !ollamaModel ? await createRewriter() : null;

  const entries = [];
  const rewriteMemo = new Map();
  let neuralAccepted = 0;
  let fallbackUsed = 0;

  for (let i = 0; i < QUESTION_BANK.length; i++) {
    const item = QUESTION_BANK[i];
    const base = engine.answer(item.q, [], { useCache: false });
    let finalAnswer = buildCleanExtractiveAnswer(base, item.mustContain);

    if (base.intent === 'retrieval' && !extractiveOnly) {
      const primarySection = base.text.split('\n\n')[0] || base.text;
      const header = primarySection.split('\n')[0]?.startsWith('**') ? primarySection.split('\n')[0] : null;
      const memoKey = `${base.entity || ''}::${primarySection}::${(item.mustContain || []).join('|')}`;
      try {
        let candidateText = rewriteMemo.get(memoKey) || null;
        if (!candidateText) {
          if (ollamaModel) {
            candidateText = await generateWithOllama(ollamaModel, base.resolvedQuery, primarySection);
          } else if (rewriter) {
            const res = await rewriter.rewrite({
              query: base.resolvedQuery,
              contextText: primarySection,
              extractiveText: primarySection,
              entity: base.entity ? { name: base.entity } : null,
            });
            if (res.rewritten) candidateText = res.text;
          }
          if (candidateText) rewriteMemo.set(memoKey, candidateText);
        }

        if (candidateText) {
          const withHeader = header && !candidateText.startsWith('**') ? `${header}\n${candidateText}` : candidateText;
          const hasAllRequired = (item.mustContain || []).every(fact =>
            withHeader.toLowerCase().includes(fact.toLowerCase())
          );
          const grounded = verifyGrounded({
            candidate: candidateText,
            contextText: toThirdPerson(primarySection),
            extractiveText: primarySection,
            query: base.resolvedQuery,
            entity: base.entity ? { name: base.entity } : null,
          });
          if (hasAllRequired && grounded.ok) {
            finalAnswer = withHeader;
            neuralAccepted++;
          } else {
            fallbackUsed++;
          }
        } else {
          fallbackUsed++;
        }
      } catch {
        fallbackUsed++;
      }
    }

    // Final sanity check that every required fact exists in the answer
    const missing = (item.mustContain || []).filter(f => !finalAnswer.toLowerCase().includes(f.toLowerCase()));
    if (missing.length > 0) {
      finalAnswer = base.text;
    }

    entries.push({
      q: item.q,
      a: finalAnswer,
      intent: base.intent,
      entity: base.entity || null,
      sources: base.sources,
    });

    if ((i + 1) % 25 === 0 || i === QUESTION_BANK.length - 1) {
      console.log(`[generate-cache] ${i + 1}/${QUESTION_BANK.length} processed (neural=${neuralAccepted}, extractive-3p=${fallbackUsed})`);
    }
  }

  const outUrl = new URL('./answers.json', import.meta.url);
  writeFileSync(outUrl, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log(`Saved ${entries.length} cached answers to cogsworth/answers.json`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
