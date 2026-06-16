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
                "Developed and modularized agentic RPA solutions using UiPath to create scalable tools for enterprise use.",
                "Contributed to an AI-powered assessment platform featuring adaptive testing and dynamic learning recommendations.",
                "Explored the integration of AI and RPA to automate internal business workflows using platforms like Bitrix24 and Keap.",
                "Leveraged IBM AI toolkits, including Watson, to build and enhance intelligent systems."
            ]
        },
        {
            role: "Graduate Teaching Assistant",
            company: "Rutgers University - School of Communication and Information",
            period: "September 2024 - December 2025",
            desc: [
                "Assist in teaching key Object-Oriented Programming (OOP) concepts in Python, including classes, inheritance, polymorphism, and encapsulation.",
                "Grade weekly assignments, ensuring timely and constructive feedback to enhance student learning.",
                "Address student queries via email, providing clarification on course materials and resolving doubts."
            ]
        },
        {
            role: "Computer Science Grader",
            company: "Rutgers University",
            period: "September 2024 - December 2025",
            desc: [
                "Assess assignments covering key AI topics such as graph-based search algorithms (DFS, BFS, A*), probabilistic inference, constraint satisfaction, machine learning, and deep learning.",
                "Provide detailed feedback to enhance student understanding and performance in AI concepts.",
                "Collaborate with course instructor to ensure consistent grading standards and maintain academic integrity."
            ]
        },
        {
            role: "AI Co-pilot Developer",
            company: "HumanFractal.ai (Resolute)",
            period: "February 2023 - May 2023",
            desc: [
                "Worked on building the Resolute co-pilot, Filomena.",
                "Explored OpenAI models and AWS products, enhancing user interaction by Writing prompts for Filomena using the principles of prompt engineering.",
                "Explored various OpenAI models, LLMs and few AWS products, enhancing AI capabilities and enhancing user interaction by 40%."
            ]
        },
        {
            role: "Data Science Intern",
            company: "Exposys Data Labs",
            period: "September 2022 - October 2022",
            desc: [
                "I was given a project where I had to predict the profit of 50 startups using various regression model and evaluate the best regression model.",
                "The four different models built were Linear regression, SVR, Decision Tree regressor and Random forest regressor.",
                "Achieved 96.04% accuracy with Random Forest, providing insights to optimize financial and investment strategies for the company."
            ]
        },
        {
            role: "Alumni Relations Intern",
            company: "Vaave",
            period: "November 2020 - December 2021",
            desc: [
                "Coordinated outreach efforts with over 200 alumni to foster connections between alumni and current students.",
                "Organized virtual events and networking opportunities to facilitate mentorship and career guidance.",
                "Increased student engagement by 30% through targeted alumni interaction and outreach programs."
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
                "<strong>Problem:</strong> Portfolio lacked proof of low-level systems knowledge beyond ML/AI projects.",
                "<strong>Action:</strong> Built three systems demos compiled to WASM and embedded live in the terminal: a free-list malloc/free backed by a static heap with coalescing, a mini shell with pipes/redirection/virtual filesystem, and a round-robin thread scheduler with deadlock visualization.",
                "<strong>Result:</strong> Each demo runs in-browser with a JS fallback. Type sys --alloc, sys --shell, or sys --threads to run them."
            ],
            url: "https://github.com/PujaSridhar/PujaSridhar.github.io"
        },
        {
            name: "AI Bot Rescue Mission",
            slug: "ai-rescue-bot",
            tech: "Python, A-Star Algorithm, Heuristics",
            date: "March 2024",
            desc: [
                "<strong>Problem:</strong> A captain is trapped in a randomly generated ship layout with moving aliens, requiring an intelligent bot to navigate obstacles and rescue them.",
                "<strong>Action:</strong> Developed and compared four distinct bot algorithms using the A-Star algorithm with different heuristics—from simple pathfinding to complex alien avoidance and threat penalization.",
                "<strong>Result:</strong> Successfully simulated and evaluated each bot's performance, creating visualizations to compare success rates and demonstrate advanced pathfinding strategies in dynamic environments."
            ],
            url: "https://github.com/PujaSridhar/AI-Project1"
        },
        {
            name: "Algorithmic Transformation (Independent Set to Clique)",
            slug: "algo-transform",
            tech: "Python, NetworkX, Pandas, 3D Force Graph",
            date: "May 2024",
            desc: [
                "<strong>Problem:</strong> Transforming an Independent Set problem into a Clique problem is a fundamental concept in computational theory, requiring efficient graph manipulation and visualization.",
                "<strong>Action:</strong> Wrote a Python script to find independent sets of a given size 'k' in a graph and then transform the graph's complement to find the corresponding clique sets.",
                "<strong>Result:</strong> The script successfully identifies and displays the sets and generates a JSON file for a 3D force graph visualization, clearly distinguishing the resulting cliques with color-coding."
            ],
            url: "https://github.com/PujaSridhar/Algorithmic-Transformation"
        },
        {
            name: "Multilingual Health Misinformation Detection",
            slug: "health-misinfo",
            tech: "Python, NLP, Transformers",
            date: "April 2025",
            desc: [
                "<strong>Problem:</strong> The rapid spread of health misinformation online poses a significant public health risk, especially across different languages and cultures.",
                "<strong>Action:</strong> Built and trained a Transformer-based NLP model to identify and flag health-related misinformation with high accuracy across multiple languages.",
                "<strong>Result:</strong> Created a robust system capable of addressing nuanced and culturally specific misinformation, contributing to a safer online information ecosystem."
            ],
            url: "https://github.com/PujaSridhar/Multilingual-Health-Misinformation-Detection"
        },
        {
            name: "Emotion Detection from Facial Expressions",
            slug: "emotion-detection",
            tech: "Python, TensorFlow, Keras, OpenCV",
            date: "March 2023",
            desc: [
                "<strong>Problem:</strong> Understanding human emotion is a key challenge in human-computer interaction.",
                "<strong>Action:</strong> Trained a Convolutional Neural Network (CNN) on the FER-2013 dataset and integrated it with OpenCV for real-time video processing.",
                "<strong>Result:</strong> Achieved 96% accuracy in classifying facial expressions into emotions like happiness, sadness, and anger, creating a practical tool for affective computing applications."
            ],
            url: "https://github.com/PujaSridhar/Emotion-Recognition-using-Facial-Expressions"
        },
        {
            name: "Sentiment Analysis of Movie Reviews",
            slug: "sentiment-analysis",
            tech: "Python, NLP, Scikit-learn, Naive Bayes",
            date: "December 2022",
            desc: [
                "<strong>Problem:</strong> Manually analyzing thousands of movie reviews to gauge audience sentiment is inefficient and doesn't scale.",
                "<strong>Action:</strong> Developed a predictive model using Naive Bayes' Theorem and natural language processing to classify over 1,000 movie reviews as positive or negative.",
                "<strong>Result:</strong> Achieved a 95% accuracy rate in predicting viewer sentiment and improved overall review classification accuracy by 25%, providing a highly effective tool for data-driven analysis."
            ],
            url: "https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews"
        },
        {
            name: "Credit Card Fraud Detection",
            slug: "fraud-detection",
            tech: "Python, Scikit-learn, Isolation Forest",
            date: "October 2022",
            desc: [
                "<strong>Problem:</strong> Financial institutions require fast and accurate methods to detect fraudulent credit card transactions among millions of legitimate ones.",
                "<strong>Action:</strong> Implemented and compared multiple anomaly detection algorithms, including Isolation Forest, Local Outlier Factor, and SVMs.",
                "<strong>Result:</strong> The Isolation Forest model proved most effective, successfully identifying 95% of fraudulent transactions in the dataset and improving detection speed by 25% over other models."
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
