// api/chat.js

import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('portfolio-rag');

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export default async function handler(req, res) {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://pujasridhar.github.io',
        'https://puja-sridhar-github-io.vercel.app'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { prompt, conversationHistory } = req.body;

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            let standaloneQuestion = prompt;

            // 1. Create standalone query based on history & prompt
            if (conversationHistory && conversationHistory.length > 0) {
                const historyText = conversationHistory.map(item => `${item.role}: ${item.text}`).join('\n');

                const questionGenPrompt = `
                    Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone question.
                    
                    Chat History:
                    ${historyText}
                    
                    Follow Up Input: ${prompt}
                    
                    Standalone question:`;

                const questionGenResult = await genAI.models.generateContent({
                    model: "gemini-2.5-flash-lite",
                    contents: questionGenPrompt,
                });
                standaloneQuestion = questionGenResult.text;
            }

            // 2. Embed the user's question
            const { embeddings } = await genAI.models.embedContent({
                model: "gemini-embedding-001",
                contents: standaloneQuestion,
                config: { outputDimensionality: 768 }
            });

            // 3. Retrieve relevant documents from Pinecone
            const queryResponse = await index.query({
                vector: embeddings[0].values,
                topK: 4,
                includeMetadata: true,
            });

            const context = queryResponse.matches.map(match => match.metadata.text).join('\n\n');

            // 4. Construct the augmented prompt
            const augmentedPrompt = `
        You are an AI assistant for Puja Sridhar's portfolio.
        Use the following pieces of context to answer the question at the end.
        If you don't know the answer from the context, just say that you don't have that information.

        Context:
        ${context}

        Question: ${prompt}
      `;

            // 5. Generate and stream the response
            const result = await genAI.models.generateContentStream({
                model: "gemini-2.5-flash-lite",
                contents: augmentedPrompt,
            });

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            for await (const chunk of result) {
                res.write(chunk.text);
            }

            res.end();

        } catch (error) {
            console.error('Error in RAG pipeline:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    } else {
        // ❌ If the method is not POST, send a 405 error
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
