# Puja Sridhar - Interactive AI Portfolio

An interactive portfolio with a retro terminal experience, a tabbed GUI mode, and a custom RAG-powered assistant named **Cogsworth**.

![Portfolio Screenshot](Terminal.png)

## Overview

This project combines a React frontend with a Vercel serverless backend to answer questions about Puja Sridhar's background, projects, and experience. The assistant uses portfolio-specific context stored in Pinecone, so the answers stay grounded in real portfolio data instead of generic model guesses.

## Features

- Terminal-style interface with command shortcuts like `help`, `projects`, and `skills`
- Shell-like terminal UX with `Tab` autocomplete, `Ctrl+C` cancellation, and `man [command]`
- Alternate GUI mode for more traditional browsing
- Light and dark theme toggle
- Animated background and sound effects
- Real-time clock and IP-based weather display
- RAG-backed assistant that answers questions using portfolio context
- Responsive layout for desktop and mobile

## Tech Stack

- Frontend: React 19 + Vite
- Styling: CSS + Tailwind utility classes
- Backend: Vercel Serverless Functions
- LLM: Google Gemini
- Vector database: Pinecone

## Project Structure

```text
.
├── api/chat.js          # Vercel serverless chat endpoint
├── src/App.jsx          # Main React portfolio app
├── src/main.jsx         # Vite/React entry point
├── portfolio-data.js    # Portfolio content used by the UI and indexing
├── index-data.mjs       # Pinecone indexing script
├── style.css            # Global styling
└── vite.config.js       # Vite config, including local /api proxy
```

## How the Assistant Works

When someone asks Cogsworth a question:

1. The question is optionally rewritten into a standalone form if there is prior conversation context.
2. The question is embedded with Gemini.
3. Pinecone is queried for the most relevant chunks from the portfolio dataset.
4. Those retrieved chunks are added to the prompt.
5. Gemini generates the final grounded response.

That flow keeps the assistant focused on Puja's actual portfolio content.

## Terminal UX

The terminal is designed to feel closer to a real shell than a novelty interface.

- `Tab` autocompletes supported commands
- `Ctrl+C` cancels an in-flight AI response
- `man [command]` opens a built-in manual page for terminal commands
- Arrow-up and arrow-down walk command history

## Local Development

### Prerequisites

- Node.js 20+
- A Google AI API key
- A Pinecone API key
- A populated Pinecone index named `portfolio-rag`

### Setup

1. Clone the repo:

```bash
git clone https://github.com/PujaSridhar/PujaSridhar.github.io.git
cd PujaSridhar.github.io
```

2. Install dependencies:

```bash
npm install
```

3. Create a local env file:

```bash
cp .env.example .env
```

4. Add your keys to `.env`:

```env
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

5. Start the frontend:

```bash
npm run dev
```

By default, Vite runs on `http://127.0.0.1:4173/`.

## Local API Behavior

The frontend calls `/api/chat`.

During local Vite development, `/api/*` requests are proxied to the deployed Vercel backend via `vite.config.js`, so you can test the React app locally without separately running `vercel dev`.

## Production Build

To generate a production bundle:

```bash
npm run build
```

To preview that build locally:

```bash
npm run preview
```

## Data Indexing

The repository includes `index-data.mjs` for embedding and uploading portfolio content into Pinecone. Run it only after your `.env` is configured and your Pinecone index is ready.

## Contact

- LinkedIn: [linkedin.com/in/pujasridhar](https://www.linkedin.com/in/pujasridhar/)
- GitHub: [github.com/pujasridhar](https://github.com/pujasridhar)
- Email: [pujasridhar28@gmail.com](mailto:pujasridhar28@gmail.com)
