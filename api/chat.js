// api/chat.js
// Cogsworth's chat endpoint. Answers come from the local engine in cogsworth/engine.js:
// BM25 retrieval, the reviewed answer cache and structured answers, all built from
// portfolio-data.js. No Gemini or Pinecone calls, so no API keys and no quota.

import { createEngine } from '../cogsworth/engine.js';
import { portfolioData } from '../portfolio-data.js';

const engine = createEngine(portfolioData);

export default async function handler(req, res) {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://pujasridhar.github.io',
        'https://puja-sridhar-github-io.vercel.app'
    ];

    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
        res.status(403).json({ error: 'Origin not allowed' });
        return;
    }

    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { prompt, conversationHistory } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required' });
        return;
    }

    try {
        const history = Array.isArray(conversationHistory)
            ? conversationHistory.filter(turn => turn && typeof turn.text === 'string')
            : [];
        const { text } = engine.answer(prompt, history);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(200).send(text);
    } catch (error) {
        console.error('Error in Cogsworth engine:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
}
