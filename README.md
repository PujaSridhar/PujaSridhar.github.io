# Cogsworth Protocol — Puja Sridhar's Portfolio

> A terminal-style AI portfolio that actually talks back.

[![Live](https://img.shields.io/badge/live-pujasridhar.github.io-5A6050?style=flat-square)](https://pujasridhar.github.io)

![Portfolio Screenshot](Terminal.png)

---

## What is this?

This is my personal portfolio — built as a fully interactive terminal with an AI assistant named **Cogsworth**. Instead of a static page with a PDF link, you get a shell-like experience where you can run commands, ask questions in plain English, switch colour themes, and read my career history formatted as a deployment log.

Type `help` to see what's available. Type `diff` or `patch notes` if you want the release story first.

---

## Commands worth trying

| Command | What it does |
|---|---|
| `log` | My career as a system log — from Pondicherry to San Jose |
| `diff` | What changed between v24 and v25 of me |
| `patch notes` | v25.0.0 release notes — deprecations, additions, known bugs |
| `cogsworth --version` | Current system profile |
| `availability` | Role types, location, start date |
| `download resume` | Downloads my resume without leaving the terminal |
| `sudo hire` | The short case for hiring me |
| `theme --list` | Switch between built-in colour themes |
| `man [command]` | Unix-style manual page for any command |

---

## Tech stack

- **Frontend** — React 19 + Vite
- **Styling** — CSS custom properties + Tailwind utility classes
- **Backend** — Vercel Serverless Functions
- **AI** — Google Gemini with a RAG pipeline
- **Vector DB** — Pinecone

---

## How Cogsworth works

When you ask a question in plain English, Cogsworth doesn't just pass it to a language model and hope for the best:

1. If there's conversation history, the question is rewritten into a standalone form
2. The question is embedded with Gemini
3. Pinecone is queried for the most relevant chunks from my actual portfolio data
4. Those chunks are injected into the prompt as grounding context
5. Gemini generates a response based only on what's in my portfolio

This keeps the answers accurate and specific to my actual background — not a model hallucinating a plausible-sounding resume.

---

## Terminal UX details

The terminal is designed to feel like a real shell, not a novelty widget:

- `Tab` autocompletes commands with shared-prefix support (like bash)
- `Ctrl+C` cancels an in-flight AI request mid-stream
- `↑` / `↓` navigates command history
- `man [command]` opens a formatted manual page
- `theme [name]` switches the colour theme instantly and persists across visits

---

## Project structure

```text
.
├── api/chat.js                  # Vercel serverless chat endpoint (RAG pipeline)
├── src/App.jsx                  # Main app — terminal state, input handling, routing
├── src/main.jsx                 # React + Vite entry point
├── src/components/              # TerminalEntry, GuiView, SocialIcons
├── src/constants/terminal.js    # Command registry, manuals, theme definitions
├── src/hooks/                   # useIpWeather, useAudio, useAnimatedNetwork
├── src/utils/                   # terminalContent, terminalHelpers, themeUtils
├── portfolio-data.js            # Portfolio content (used by UI and Pinecone indexer)
├── index-data.mjs               # One-time Pinecone indexing script
├── style.css                    # Global styles with CSS custom property theming
└── vite.config.js               # Vite config with local /api proxy
```

---

## Local development

### Prerequisites

- Node.js 20+
- Google AI API key
- Pinecone API key + a populated index named `portfolio-rag`

### Setup

```bash
git clone https://github.com/PujaSridhar/PujaSridhar.github.io.git
cd PujaSridhar.github.io
npm install
cp .env.example .env
# add your keys to .env
npm run dev
```

Vite proxies `/api/*` requests to the deployed Vercel backend during local development so you don't need to run `vercel dev` separately.

Prebuilt `.wasm` binaries for the systems demos (`sys --alloc`, `sys --shell`) are committed under `public/wasm/`, so they work out of the box. If you change the C sources under `systems/`, rebuild them with:

```bash
npm run build:wasm
```

This requires Emscripten (`emcc`) to be installed and on your `PATH`.

### Build and preview

```bash
npm run build
npm run preview
```

---

## Contact

Built by Puja Sridhar — MS in CS, Rutgers University. Based in San Jose, CA.

- [linkedin.com/in/pujasridhar](https://www.linkedin.com/in/pujasridhar/)
- [github.com/pujasridhar](https://github.com/pujasridhar)
- [pujasridhar28@gmail.com](mailto:pujasridhar28@gmail.com)
