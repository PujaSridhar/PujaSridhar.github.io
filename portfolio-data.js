export const portfolioData = {
    about: `I build things that don't fit a clean job description.\n\nMy MS is from Rutgers, my undergrad in AI/ML is from India, but my actual education happened somewhere between watching five agents split a contract analysis into parallel threads and finish in 15 seconds, and asking myself why Redis was sitting there doing one job when it could clearly handle three.\n\nThat's the question that keeps showing up in my work. Not just: does it work. But: why isn't it smarter. The PostHog dashboard taught me what a real data pipeline feels like under pressure: Airflow, dbt, FastAPI, Redis, all of it talking to each other in production. LocalLens taught me that agentic systems need choreography, not just capability. LexAI taught me that parallelism isn't a nice-to-have when the user is waiting. And a free-list allocator compiled to WebAssembly taught me that the lowest layer of the stack is just as interesting as the highest.\n\nI care about the decisions underneath the code. The ones that don't show up in the README.\n\nBased in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other.`,
    education: [
        { school: "Rutgers University, The State University of New Jersey", degree: "Masters of Science in Computer Science", details: "Graduated Jan 2026 | GPA: 3.8/4.0" },
        { school: "BMS Institute of Technology and Management, India", degree: "Bachelor of Engineering in Artificial Intelligence and Machine Learning", details: "Graduated May 2023 | GPA: 8.64/10.0" }
    ],
    experience:[
        {
            role: "AI Engineering Intern",
            company: "Pennant Education",
            period: "July 2025 - September 2025",
            desc: [
                "My first real taste of building AI that has to work inside someone else's constraints, not a clean dataset, not a controlled environment, but actual educational workflows with actual stakes.",
                "I built agentic RPA solutions in UiPath to automate grading and internal workflows, work that held up well enough to be shaped into a submission for a UAE government-backed startup hackathon, where shortlisted projects got fully funded to build out their vision. I also contributed to an adaptive assessment platform that adjusted to how students were actually learning, and explored how IBM Watson fit into the broader picture.",
                "The thing I kept learning: automation is only as smart as the decisions you make about what to automate, and who it's actually for."
            ]
        },
        {
            role: "Graduate Teaching Assistant",
            company: "Rutgers University - School of Communication and Information",
            period: "September 2024 - December 2025",
            desc: [
                "Helped students get their footing in object-oriented programming: classes, inheritance, polymorphism, and fielded a lot of questions that turned out to be about deeper confusion than the assignment itself revealed."
            ]
        },
        {
            role: "Computer Science Grader",
            company: "Rutgers University",
            period: "September 2024 - December 2025",
            desc: [
                "Graded assignments covering graph search, probabilistic inference, constraint satisfaction, and deep learning, which meant I had to understand every concept well enough to spot where someone's thinking went wrong, not just whether their output was right.",
                "That's a different kind of understanding than passing a course."
            ]
        },
        {
            role: "AI Co-pilot Developer",
            company: "HumanFractal.ai (Resolute)",
            period: "February 2023 - May 2023",
            desc: [
                "Filomena was built for people navigating their medications, treatment processes, and health questions, the kind of questions people usually wait hours to get answered by a human.",
                "My job was to make her trustworthy. That meant sitting down with a nutritionist and nurses to understand what a good answer actually looks like before writing a single prompt. From those conversations I designed the response logic myself, including the boundary: where Filomena stops answering and routes to a medical professional instead. Getting that line right wasn't a technical problem. It was a judgment call, and it had to be the right one.",
                "That's the part of AI development most people skip. We didn't."
            ]
        },
        {
            role: "Data Science Intern",
            company: "Exposys Data Labs",
            period: "September 2022 - October 2022",
            desc: [
                "Built and compared four regression models to predict startup profitability. Random Forest won at 96% accuracy. Good reminder that the model selection process matters as much as the model itself."
            ]
        },
        {
            role: "Alumni Relations Intern",
            company: "Vaave",
            period: "November 2020 - December 2021",
            desc: [
                "Coordinated alumni outreach across 200+ contacts, organized virtual networking events, and helped build the connective tissue between people who'd already graduated and students figuring out what came next."
            ]
        }
    ],
    projects: [
        {
            name: "PostHog Engineering Impact Dashboard",
            slug: "posthog",
            tech: "Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel",
            date: "March 2026",
            featured: true,
            desc: [
                "Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like?",
                "So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure).",
                "The interesting part wasn't the stack. It was deciding what to measure and why."
            ],
            url: "https://github.com/PujaSridhar/posthog-impact-dashboard",
            liveUrl: "https://posthog-impact-dashboard-pujasridhar2001.vercel.app/",
            screenshots: ['/projects/posthog/posthog.png', '/projects/posthog/posthog1.png', '/projects/posthog/posthog2.png']
        },
        {
            name: "LocalLens",
            slug: "locallens",
            tech: "FastAPI · React · Groq · Google Places API · Foursquare · WalkScore",
            date: "February 2026",
            featured: true,
            desc: [
                "\"Cafe\" returns every coffee shop within two miles. That's not what you asked. You asked for the cozy one with good wifi that isn't too loud on a Tuesday afternoon.",
                "LocalLens is what happens when you stop treating search as keyword matching and start treating it as intent. A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing you a neighborhood snapshot.",
                "No static data. No pre-curated lists. Just a pipeline that understands the difference between coffee shop and that kind of coffee shop."
            ],
            url: "https://github.com/PujaSridhar/LocalLens",
            liveUrl: "https://local-lens-six.vercel.app/",
            screenshots: ['/projects/locallens/localLens.png', '/projects/locallens/localLens1.png']
        },
        {
            name: "LexAI",
            slug: "lexai",
            tech: "Gemini 2.5 Flash · Vercel Serverless · React 18 (CDN) · Node.js",
            date: "January 2026",
            featured: true,
            desc: [
                "Most people sign contracts they don't fully understand. Not because they're careless. Because contract review is genuinely hard, slow, and expensive if you want it done right.",
                "LexAI runs five agents on your contract. One figures out what kind of document it is. One summarizes your obligations. Two run in parallel: one grading every clause on fairness and clarity, one hunting for predatory terms. The fifth writes you counter-proposals with actual suggested wording.",
                "Full analysis in 15–25 seconds. The parallelism isn't a flex: it's what makes the wait time feel respectful of your time."
            ],
            url: "https://github.com/PujaSridhar/Lexai",
            liveUrl: "https://lexai-gem.vercel.app/",
            screenshots: ['/projects/lexai/lexai.png', '/projects/lexai/lexai1.png']
        },
        {
            name: "AI Neighborhood Watch",
            slug: "neighborhood-watch",
            tech: "Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub",
            date: "December 2025",
            featured: true,
            desc: [
                "Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby.",
                "I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.",
                "A neighborhood safety podcast, generated overnight, every night, automatically."
            ],
            url: "https://github.com/PujaSridhar/ai-neighborhood-watch",
            liveUrl: "https://ai-neighborhood-watch.vercel.app/",
            screenshots: ['/projects/neighborhood-watch/aineighborhood.png']
        },
        {
            name: "Smart Doc Finder",
            slug: "smart-doc-finder",
            tech: "Python · Redis (Streams + Vector DB + Semantic Cache) · MongoDB · React · Docker",
            date: "August 2025",
            featured: true,
            desc: [
                "Keyword search has one fatal flaw: you have to remember exactly how something was worded to find it. That's not how memory works, and it's not how understanding works either.",
                "Smart Doc Finder watches your document directory in real time via Redis Streams, chunks anything large into contextual blocks, embeds every chunk into Redis Vector Search, and checks a semantic cache before it even runs a query, so if someone asked something similar recently, it returns instantly.",
                "One Redis instance. Three jobs: event streaming, vector database, semantic cache. The architecture was the puzzle. Natural language search that actually works was the point."
            ],
            url: "https://github.com/krshsl/smart-doc-finder",
            screenshots: ['/projects/smart-doc-finder/smartdoc.png', '/projects/smart-doc-finder/smartdoc1.png', '/projects/smart-doc-finder/smartdoc2.png', '/projects/smart-doc-finder/smartdoc3.png']
        },
        {
            name: "Systems Sandbox (sys namespace)",
            slug: "systems-sandbox",
            tech: "C, WebAssembly, Emscripten, React",
            date: "May 2026",
            desc: [
                "The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath?",
                "So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.",
                "Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself."
            ],
            url: "https://github.com/PujaSridhar/PujaSridhar.github.io"
        },
        {
            name: "AI Bot Rescue Mission",
            slug: "ai-rescue-bot",
            tagline: "Four bots, one captain, a ship full of moving aliens — a study in how quickly pathfinders break",
            tech: "Python, A-Star Algorithm, Heuristics",
            date: "March 2024",
            desc: [
                "Four bots, one trapped captain, a ship full of moving aliens. The fun wasn't building the pathfinder: it was watching how quickly a \"smart\" bot falls apart the moment the aliens start moving, and designing the next one to handle it."
            ],
            url: "https://github.com/PujaSridhar/AI-Project1"
        },
        {
            name: "Algorithmic Transformation (Independent Set to Clique)",
            slug: "algo-transform",
            tagline: "NP reduction made visible — complement graphs, cliques, and 3D force graph output",
            tech: "Python, NetworkX, Pandas, 3D Force Graph",
            date: "May 2024",
            desc: [
                "One of those problems that sounds abstract until you're staring at a graph and realizing the complement is doing all the work. Built the reduction in Python, then made it visible: because math you can see is math you actually understand."
            ],
            url: "https://github.com/PujaSridhar/Algorithmic-Transformation"
        },
        {
            name: "Multilingual Health Misinformation Detection",
            slug: "health-misinfo",
            tagline: "Transformer model that flags false health claims across languages, including ones monolingual models quietly miss",
            tech: "Python, NLP, Transformers",
            date: "April 2025",
            desc: [
                "Health misinformation doesn't stay in one language, and neither should the tools that catch it. Trained a Transformer model to flag false claims across multiple languages, including culturally specific ones that monolingual models quietly miss."
            ],
            url: "https://github.com/PujaSridhar/Multilingual-Health-Misinformation-Detection"
        },
        {
            name: "Emotion Detection from Facial Expressions",
            slug: "emotion-detection",
            tagline: "CNN trained on FER-2013, wired into OpenCV for real-time video — 96% accuracy",
            tech: "Python, TensorFlow, Keras, OpenCV",
            date: "March 2023",
            desc: [
                "Wanted to know how well a CNN could read a face in real time. Trained on FER-2013, wired it into OpenCV, and got to 96% accuracy, and a new appreciation for how much information lives in a half-second expression."
            ],
            url: "https://github.com/PujaSridhar/Emotion-Recognition-using-Facial-Expressions"
        },
        {
            name: "Sentiment Analysis of Movie Reviews",
            slug: "sentiment-analysis",
            tagline: "Naive Bayes on 1,000+ reviews, 95% accuracy — simple models, done well",
            tech: "Python, NLP, Scikit-learn, Naive Bayes",
            date: "December 2022",
            desc: [
                "My first real look at how probabilistic models handle language. Naive Bayes on 1,000+ reviews, 95% accuracy, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier."
            ],
            url: "https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews"
        },
        {
            name: "Credit Card Fraud Detection",
            slug: "fraud-detection",
            tagline: "Isolation Forest beats LOF and SVM on anomaly detection — the gap between them was the education",
            tech: "Python, Scikit-learn, Isolation Forest",
            date: "October 2022",
            desc: [
                "Built this on my own because the problem genuinely interested me: how do you find the needle when the haystack has millions of legitimate transactions? Compared Isolation Forest, LOF, and SVM. Isolation Forest won, and the gap between them taught me more about anomaly detection than I expected going in."
            ],
            url: "https://github.com/PujaSridhar/Credit_Card_Fraud_Detection"
        }
    ],
    certifications: [
        { name: "Academy Accreditation - Generative AI Fundamentals", issuer: "Databricks", url: "https://credentials.databricks.com/2526c33a-4740-4a6d-bb85-800b03abb9b4#acc.n7JYaGTp" },
        { name: "Academy Accreditation - Databricks Fundamentals", issuer: "Databricks", url: "https://credentials.databricks.com/b5972ee4-a9b9-439a-84d4-f84a6bd04326#acc.2RYi5IGo" },
        { name: "Oracle Cloud Infrastructure 2023 Foundations Associate", issuer: "Oracle", url: "https://drive.google.com/file/d/1HiIjc0MNB5iEeUawWgNuQVs051v2f7mu/view?usp=sharing" },
        { name: "Demystifying Machine Learning Concepts", issuer: "Impavid Technologies", url: "https://drive.google.com/file/d/1rP8fQXfc1Q8gB6MNXZPyHo2wY9JhZfRU/view?usp=sharing" },
        { name: "AI for Everyone", issuer: "DeepLearning.AI", url: "https://coursera.org/share/7c044a28fe65edc8d23c984ab3c51a50" },
        { name: "Programming for Everybody", issuer: "University of Michigan", url: "https://coursera.org/share/eb846c2ec1f83b2472db7c5efe0ce4da" },
        { name: "Python Data Structures", issuer: "University of Michigan", url: "https://coursera.org/share/c5f8756b5e841c310c431b27d2057b20" }
    ],
    hackathons: [
        {
            name: "RWJ Health Hackathon",
            date: "October 2025",
            team: "Team of 10 (4 medical students, 6 engineers)",
            url: "https://github.com/krshsl/coatXcode",
            desc: "Ten people in a room, four medical students, six engineers, with one question: can we make care coordination faster without making it worse?\n\nI owned the backend with one other engineer. We built a cross-platform AI chat app that streamed responses across five LLMs simultaneously, ChatGPT, Claude, Gemini, Cohere, Mistral, with image generation and AWS Cognito auth on top. The medical students kept asking for things that sounded simple and turned out not to be. That tension between \"just add a feature\" and \"this is going into a clinical context\" was the most useful thing I learned that weekend."
        },
        {
            name: "HackRU",
            date: "September 2025",
            team: "Solo",
            url: "https://github.com/PujaSridhar/ai-neighborhood-watch",
            desc: "Solo. One sprint. No teammates to blame if it broke.\n\nI built AI Neighborhood Watch from scratch, real-time incident reporting, Gemini-powered categorization, a live Leaflet map, and an ElevenLabs audio briefing pipeline, in a single hackathon. Every architectural decision was mine to own, which meant every wrong one was mine to fix at 2am. It shipped. It worked. It's still live."
        },
        {
            name: "Redis Hackathon (Dev.to)",
            date: "Summer 2025",
            team: "Team of 2",
            url: "https://github.com/PujaSridhar/smart-doc-finder",
            desc: "The constraint was Redis. The question was: how far can you push it past the obvious use case?\n\nTwo of us built Smart Doc Finder, a document search system where Redis does event streaming via Streams, vector similarity search via Redis Cloud, and semantic caching all at once. One service, three jobs, zero excuses for keyword-only search. We built it because the architecture was interesting, not because it was easy."
        }
    ],
    talks: [
        { title: "How to Prepare for an AI Developer role through Campus Placements", venue: "BMS Institute of Technology and Management", date: "Summer 2023" },
        { title: "Traffic Management Using AI", venue: "BMS Institute of Technology and Management", date: "Spring 2023" }
    ],
    leadership: [
        { role: "Class Representative", org: "BMS Institute of Technology and Management", period: "June 2020 - May 2023", points: ["Communicated essential updates and announcements from the school administration to over 60 classmates.", "Maintained departmental discipline, resulting in a 15% annual reduction in misconduct incidents."] },
        { role: "Event Head", org: "BMS Institute of Technology and Management", period: "Nov 2022 - Dec 2022", points: ["Executed event strategies aligned with organizational objectives, leading to a 20% increase in event attendance.", "Fostered a collaborative and high-performance environment among the team members."] },
        { role: "Finance Head", org: "BMS Institute of Technology and Management", period: "Sep 2019 - Oct 2019", points: ["Implemented cost-saving measures that resulted in a 15% reduction in operational expenses.", "Led and motivated a finance team, fostering a culture of excellence and accountability."] }
    ],
    contact: { email: "pujasridhar28@gmail.com", linkedin: "https://www.linkedin.com/in/pujasridhar/", github: "https://github.com/pujasridhar" },
    skills: {
        "Languages": ["Python", "C", "SQL", "JavaScript", "Bash"],
        "AI & ML": ["LLMs", "Agentic Pipelines", "NLP", "Computer Vision", "Deep Learning", "Transformers", "RAG", "Vector Search", "Prompt Engineering"],
        "Data Engineering": ["Apache Airflow", "dbt", "PostgreSQL", "Redis", "MongoDB", "Pinecone", "ETL/ELT", "Data Modeling", "Medallion Architecture"],
        "Systems": ["WebAssembly", "Emscripten", "Memory Allocators", "C Systems Programming", "WASM ABI"],
        "Web & API": ["FastAPI", "Flask", "React", "Vite", "Vercel Serverless", "REST APIs"],
        "Cloud & Infra": ["AWS (Lambda, EC2, S3, DynamoDB)", "Docker", "GitHub Actions", "CI/CD"],
        "Tools": ["Git", "UiPath", "Tableau", "TensorFlow", "Keras", "Scikit-learn"]
    },
    languages: [
        { lang: "English", proficiency: "Native / Bilingual" },
        { lang: "Hindi", proficiency: "Native / Bilingual" },
        { lang: "Tamil", proficiency: "Native / Bilingual" },
        { lang: "Kannada", proficiency: "Professional Working Proficiency" },
        { lang: "Telugu", proficiency: "Conversational" }
    ]};
