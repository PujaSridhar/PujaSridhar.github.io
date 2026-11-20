// cogsworth/train/facts.js
// Hand-written, third-person summaries of each item in portfolio-data.js, in Cogsworth's voice.
// They are the building blocks of the training answers.
//
// Rule: every word here must come from portfolio-data.js or be plain conversational framing.
// build-dataset.js checks this with grounding.js and refuses to write the dataset otherwise,
// and `npm test` runs the same check. When portfolio-data.js changes, update the matching entry.
//
// Keys are project slugs, experience company names and hackathon names from portfolio-data.js.

export const PROJECT_FACTS = {
  finsight: {
    what: 'FinSight fine-tunes Mistral-7B-Instruct with QLoRA to read an earnings press release and return its key figures as JSON: revenue, net income, diluted EPS and the period end.',
    problem: 'When a company reports a quarter, the four numbers a trading desk wants first sit in a press release next to year-ago and year-to-date figures that look almost the same.',
    how: 'The labels come free from the SEC: Puja pulls each release (8-K Exhibit 99.1) from EDGAR, labels it with the figures the company later filed in XBRL, and keeps it only when those exact figures appear in the text the model reads. Train, validation and test are split by company, so the test set is made of companies the model never saw.',
    detail: 'Training runs in 4-bit on a free 16 GB T4. The repo also has vLLM serving behind a FastAPI endpoint, a CI eval gate, and a live watcher that answers new releases as they are filed and scores itself weeks later against the 10-Q.',
    status: 'A first adapter is trained. The comparison against base Mistral, base Mistral with retrieved examples, and a large hosted model, on accuracy, cost per release and latency, is the next result.',
  },
  silhouette: {
    what: 'Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit.',
    problem: 'Most wardrobe apps match garments by how they look, while Silhouette picks the outfit with a solver and explicit rules that explain why it works.',
    how: 'The core measurement is lift: how much longer the leg line reads than it really is, based on where the outfit puts the visual break. Eighteen rules, written as YAML, score proportion, volume balance and CIEDE2000 colour contrast at the break.',
    detail: 'An exact solver checks every candidate outfit (158 µs each), a CP-SAT planner picks a week of outfits from one shared wardrobe, and every line of explanation comes from a rule that fired, not from generated text.',
    status: 'The rule weights were set by hand, so Puja built an eval harness to fit them, with a fitter that only writes new weights when they beat the hand-set ones on held-out outfits. Next are real expert labels (none yet) and garment segmentation with a Mask2Former model on Fashionpedia that is written but not yet trained.',
  },
  posthog: {
    what: 'The PostHog Engineering Impact Dashboard is a full data pipeline Puja built around one question: what does a fair, comparable measure of engineering output actually look like?',
    problem: 'Engineering teams generate a lot of data and almost no insight: commits, PRs, reviews and issues are all happening, none of it connected.',
    how: 'Airflow pulls daily from GitHub, dbt shapes it across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders leaderboards, trend charts and a custom impact score Puja designed.',
    detail: 'Puja designed the impact score formula, because the formula matters as much as the infrastructure.',
    quote: 'In Puja\'s words: "The interesting part wasn\'t the stack. It was deciding what to measure and why."',
  },
  locallens: {
    what: 'LocalLens treats local search as intent instead of keyword matching, so it can find the cozy cafe with good wifi that isn\'t too loud on a Tuesday afternoon, not just every coffee shop within two miles.',
    problem: '"Cafe" returns every coffee shop within two miles, and that\'s not what you asked: you asked for the cozy one with good wifi that isn\'t too loud on a Tuesday afternoon.',
    how: 'A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing a neighborhood snapshot.',
    detail: 'There is no static data and there are no pre-curated lists: every result comes from live APIs.',
  },
  lexai: {
    what: 'LexAI is a contract analysis tool that runs five agents on your contract, because most people sign contracts they don\'t fully understand.',
    problem: 'Contract review is genuinely hard, slow, and expensive if you want it done right, so most people sign contracts they don\'t fully understand.',
    how: 'One agent figures out what kind of document it is, one summarizes your obligations, two run in parallel (one grading every clause on fairness and clarity, one hunting for predatory terms), and the fifth writes counter-proposals with actual suggested wording.',
    detail: 'A full analysis takes 15–25 seconds, and the parallelism is what makes the wait time feel respectful of your time.',
  },
  'neighborhood-watch': {
    what: 'AI Neighborhood Watch is a real-time incident map: residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time.',
    problem: 'Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone\'s memory, with no map and no categories.',
    how: 'For the daily briefing, two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.',
    detail: 'The result is a neighborhood safety podcast, generated overnight, every night, automatically. Puja built it solo at HackRU.',
  },
  'smart-doc-finder': {
    what: 'Smart Doc Finder is a natural language document search system where one Redis instance does three jobs: event streaming, vector database and semantic cache.',
    problem: 'Keyword search has one fatal flaw: you have to remember exactly how something was worded to find it.',
    how: 'It watches your document directory in real time via Redis Streams, chunks anything large into contextual blocks, embeds every chunk into Redis Vector Search, and checks a semantic cache before it even runs a query, so if someone asked something similar recently, it returns instantly.',
    detail: 'Puja and a teammate built it for the Redis Hackathon (Dev.to) as a team of 2.',
  },
  'systems-sandbox': {
    what: 'The Systems Sandbox is three systems demos, written in C and compiled to WebAssembly, running live in your browser on this portfolio.',
    problem: 'It answers a question Puja kept getting, implicitly, in every ML and AI role: do you actually understand what\'s happening underneath?',
    how: 'The demos are a free-list memory allocator with coalescing, a mini shell with pipes, redirection, and a virtual filesystem, and a round-robin thread scheduler that shows you deadlocks as they happen.',
    detail: 'They are not simulated: type sys --alloc, sys --shell, or sys --threads and run them yourself.',
  },
  'ai-rescue-bot': {
    what: 'AI Bot Rescue Mission is a Python project with four bots, one trapped captain, and a ship full of moving aliens, built on the A-Star Algorithm and heuristics.',
    how: 'The fun wasn\'t building the pathfinder: it was watching how quickly a "smart" bot falls apart the moment the aliens start moving, and designing the next one to handle it.',
  },
  'algo-transform': {
    what: 'Algorithmic Transformation is an NP reduction from Independent Set to Clique: Puja built the reduction in Python, then made it visible with a 3D force graph.',
    how: 'It works through complement graphs and cliques, because the complement is doing all the work, and the visual output exists because math you can see is math you actually understand.',
  },
  'health-misinfo': {
    what: 'Multilingual Health Misinformation Detection is a Transformer model Puja trained to flag false health claims across multiple languages, including culturally specific ones that monolingual models quietly miss.',
    how: 'The idea is that health misinformation doesn\'t stay in one language, and neither should the tools that catch it.',
  },
  'emotion-detection': {
    what: 'Emotion Detection from Facial Expressions is a CNN Puja trained on FER-2013 and wired into OpenCV for real-time video, reaching 96% accuracy.',
    how: 'Puja wanted to know how well a CNN could read a face in real time, and came away with a new appreciation for how much information lives in a half-second expression.',
  },
  'sentiment-analysis': {
    what: 'Sentiment Analysis of Movie Reviews uses Naive Bayes on 1,000+ reviews and reaches 95% accuracy.',
    how: 'It was Puja\'s first real look at how probabilistic models handle language, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier.',
  },
  'fraud-detection': {
    what: 'Credit Card Fraud Detection compares Isolation Forest, LOF, and SVM for anomaly detection, and Isolation Forest won.',
    how: 'Puja built it independently because the problem was genuinely interesting: how do you find the needle when the haystack has millions of legitimate transactions? The gap between the three models was the education.',
  },
};

export const EXPERIENCE_FACTS = {
  'Pennant Education': {
    what: 'As an AI Engineering Intern at Pennant Education (July 2025 - September 2025), Puja built agentic RPA solutions in UiPath to automate grading and internal workflows.',
    how: 'That work was shaped into a submission for a UAE government-backed startup hackathon, where shortlisted projects got fully funded. Puja also contributed to an adaptive assessment platform that adjusted to how students were actually learning, and explored how IBM Watson fit into the broader picture.',
    detail: 'It was Puja\'s first real taste of building AI that has to work inside someone else\'s constraints, with actual educational workflows and actual stakes.',
  },
  'Rutgers University - School of Communication and Information': {
    what: 'Puja was a Graduate Teaching Assistant at the Rutgers University School of Communication and Information from September 2024 to December 2025.',
    how: 'Puja helped students get their footing in object-oriented programming: classes, inheritance and polymorphism.',
  },
  'Rutgers University': {
    what: 'Puja was a Computer Science Grader at Rutgers University from September 2024 to December 2025.',
    how: 'Puja graded assignments covering graph search, probabilistic inference, constraint satisfaction, and deep learning, which meant understanding every concept well enough to spot where someone\'s thinking went wrong.',
  },
  'HumanFractal.ai (Resolute)': {
    what: 'As an AI Co-pilot Developer at HumanFractal.ai (Resolute) from February 2023 to May 2023, Puja worked on Filomena, an assistant built for people navigating their medications, treatment processes, and health questions.',
    how: 'Puja sat down with a nutritionist and nurses to understand what a good answer actually looks like before writing a single prompt, then designed the response logic, including the boundary where Filomena stops answering and routes to a medical professional.',
  },
  'Exposys Data Labs': {
    what: 'As a Data Science Intern at Exposys Data Labs (September 2022 - October 2022), Puja built and compared four regression models to predict startup profitability.',
    how: 'Random Forest won at 96% accuracy.',
  },
  Vaave: {
    what: 'As an Alumni Relations Intern at Vaave (November 2020 - December 2021), Puja coordinated alumni outreach across 200+ contacts.',
    how: 'Puja also organized virtual networking events and helped connect people who\'d already graduated with students figuring out what came next.',
  },
};

export const HACKATHON_FACTS = {
  'RWJ Health Hackathon': {
    what: 'At the RWJ Health Hackathon (October 2025), Puja was on a team of 10: four medical students and six engineers.',
    how: 'Puja owned the backend with one other engineer, building a cross-platform AI chat app that streamed responses across five LLMs simultaneously (ChatGPT, Claude, Gemini, Cohere, Mistral), with image generation and AWS Cognito auth on top.',
  },
  HackRU: {
    what: 'At HackRU (September 2025), Puja worked solo and built AI Neighborhood Watch from scratch in a single hackathon.',
    how: 'It has real-time incident reporting, Gemini-powered categorization, a live Leaflet map, and an ElevenLabs audio briefing pipeline, and every architectural decision was Puja\'s to own.',
  },
  'Redis Hackathon (Dev.to)': {
    what: 'For the Redis Hackathon (Dev.to) in Summer 2025, Puja and a teammate built Smart Doc Finder.',
    how: 'Redis does event streaming via Streams, vector similarity search via Redis Cloud, and semantic caching all at once: one service, three jobs.',
  },
};

// Topics a recruiter asks about, mapped to the portfolio items that show them.
// Each evidence line is a grounded sentence; `ask` lists ways visitors phrase the topic.
export const TOPIC_EVIDENCE = [
  {
    topic: 'agentic systems',
    ask: ['agentic systems', 'AI agents', 'multi-agent systems', 'agent pipelines', 'agentic workflows'],
    evidence: [
      'LexAI runs five agents on a contract, two of them in parallel.',
      'In LocalLens, a Groq agent parses what you actually mean and a second agent scores each venue against your vibe.',
      'At Pennant Education, Puja built agentic RPA solutions in UiPath.',
    ],
  },
  {
    topic: 'LLMs',
    ask: ['LLMs', 'large language models', 'generative AI', 'GenAI', 'language models'],
    evidence: [
      'FinSight fine-tunes Mistral-7B-Instruct with QLoRA.',
      'LexAI is built on Gemini 2.5 Flash, and LocalLens uses Groq.',
      'At the RWJ Health Hackathon, Puja\'s team streamed responses across five LLMs simultaneously.',
    ],
  },
  {
    topic: 'fine-tuning',
    ask: ['fine-tuning', 'fine-tuning models', 'LoRA or QLoRA', 'training language models'],
    evidence: [
      'FinSight fine-tunes Mistral-7B-Instruct with QLoRA (PEFT, bitsandbytes) to return an earnings release\'s key figures as JSON.',
      'Training runs in 4-bit on a free 16 GB T4, and the repo has vLLM serving behind a FastAPI endpoint.',
    ],
  },
  {
    topic: 'RAG and vector search',
    ask: ['RAG', 'retrieval augmented generation', 'vector search', 'vector databases', 'semantic search', 'embeddings'],
    evidence: [
      'RAG and Vector Search are in Puja\'s AI & ML skills, and Pinecone is in Puja\'s Data Engineering skills.',
      'Smart Doc Finder embeds every chunk into Redis Vector Search and checks a semantic cache before it runs a query.',
    ],
  },
  {
    topic: 'data engineering',
    ask: ['data engineering', 'data pipelines', 'ETL', 'Airflow and dbt', 'building data pipelines'],
    evidence: [
      'In the PostHog Engineering Impact Dashboard, Airflow pulls daily from GitHub, dbt shapes it across six models, FastAPI serves it and Redis caches it.',
      'Puja\'s Data Engineering skills include Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling and Medallion Architecture.',
    ],
  },
  {
    topic: 'computer vision',
    ask: ['computer vision', 'image models', 'CNNs', 'OpenCV'],
    evidence: [
      'In Emotion Detection from Facial Expressions, Puja trained a CNN on FER-2013 and wired it into OpenCV for real-time video, reaching 96% accuracy.',
      'In Silhouette, garment segmentation with a Mask2Former model on Fashionpedia is written but not yet trained.',
    ],
  },
  {
    topic: 'NLP',
    ask: ['NLP', 'natural language processing', 'text classification'],
    evidence: [
      'In Multilingual Health Misinformation Detection, Puja trained a Transformer model to flag false health claims across multiple languages.',
      'Sentiment Analysis of Movie Reviews uses Naive Bayes on 1,000+ reviews and reaches 95% accuracy.',
    ],
  },
  {
    topic: 'systems programming',
    ask: ['systems programming', 'low-level programming', 'C programming', 'WebAssembly', 'memory allocators'],
    evidence: [
      'The Systems Sandbox is three systems demos written in C and compiled to WebAssembly: a free-list memory allocator with coalescing, a mini shell with pipes and redirection, and a round-robin thread scheduler.',
      'Puja\'s Systems skills include WebAssembly, Emscripten, Memory Allocators, C Systems Programming and WASM ABI.',
    ],
  },
  {
    topic: 'healthcare AI',
    ask: ['healthcare', 'health tech', 'medical AI', 'healthcare AI'],
    evidence: [
      'At HumanFractal.ai (Resolute), Puja designed the response logic for Filomena, including where Filomena stops answering and routes to a medical professional.',
      'At the RWJ Health Hackathon, Puja owned the backend on a team with four medical students.',
      'In Multilingual Health Misinformation Detection, Puja trained a Transformer model to flag false health claims across multiple languages.',
    ],
  },
  {
    topic: 'cloud and DevOps',
    ask: ['cloud', 'AWS', 'DevOps', 'CI/CD', 'Docker'],
    evidence: [
      'Puja\'s Cloud & Infra skills are AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions and CI/CD.',
      'At the RWJ Health Hackathon, the team\'s app had AWS Cognito auth, and FinSight has a CI eval gate.',
    ],
  },
  {
    topic: 'backend and APIs',
    ask: ['backend development', 'APIs', 'FastAPI', 'web development', 'full stack'],
    evidence: [
      'Puja\'s Web & API skills are FastAPI, Flask, React, Vite, Vercel Serverless and REST APIs.',
      'The PostHog Engineering Impact Dashboard and LocalLens both use FastAPI with React, and AI Neighborhood Watch uses Flask and PostgreSQL.',
    ],
  },
  {
    topic: 'classical machine learning',
    ask: ['classical machine learning', 'scikit-learn', 'regression models', 'anomaly detection'],
    evidence: [
      'At Exposys Data Labs, Puja built and compared four regression models, and Random Forest won at 96% accuracy.',
      'Credit Card Fraud Detection compares Isolation Forest, LOF, and SVM, and Isolation Forest won.',
    ],
  },
  {
    topic: 'optimization and solvers',
    ask: ['optimization', 'constraint solvers', 'OR-Tools', 'constraint satisfaction'],
    evidence: [
      'Silhouette uses an exact solver that checks every candidate outfit (158 µs each) and a CP-SAT planner that picks a week of outfits from one shared wardrobe.',
    ],
  },
  {
    topic: 'teaching',
    ask: ['teaching', 'mentoring', 'TA experience'],
    evidence: [
      'Puja was a Graduate Teaching Assistant at Rutgers, helping students get their footing in object-oriented programming.',
      'Puja was also a Computer Science Grader at Rutgers for graph search, probabilistic inference, constraint satisfaction, and deep learning.',
    ],
  },
];
