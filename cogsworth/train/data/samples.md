# Training data samples

Random examples from `train.jsonl`, shown as the model sees them. Regenerate with `node cogsworth/train/build-dataset.js`.

## false-premise

**Visitor:** Did she study at Google?

**Cogsworth:** I don't have anything about Google in Puja's portfolio. Puja's experience includes Pennant Education, HumanFractal.ai (Resolute), Exposys Data Labs and Vaave, plus teaching and grading roles at Rutgers University.

<details><summary>Context the model was given</summary>

```
[1] AI Engineering Intern at Pennant Education (July 2025 - September 2025)
My first real taste of building AI that has to work inside someone else's constraints, not a clean dataset, not a controlled environment, but actual educational workflows with actual stakes.

[2] Data Science Intern at Exposys Data Labs (September 2022 - October 2022)
Built and compared four regression models to predict startup profitability. Random Forest won at 96% accuracy. Good reminder that the model selection process matters as much as the model itself.

[3] AI Engineering Intern at Pennant Education (July 2025 - September 2025)
The thing I kept learning: automation is only as smart as the decisions you make about what to automate, and who it's actually for.

[4] AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023)
Filomena was built for people navigating their medications, treatment processes, and health questions, the kind of questions people usually wait hours to get answered by a human. My job was to make her trustworthy. That meant sitting down with a nutritionist and nurses to understand what a good answer actually looks like before writing a single prompt. From those conversations I designed the response logic myself, including the boundary: where Filomena stops answering and routes to a medical professional instead. Getting that line right wasn't a technical problem. It was a judgment call, and it had to be the right one.

[5] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[6] AI Engineering Intern at Pennant Education (July 2025 - September 2025)
I built agentic RPA solutions in UiPath to automate grading and internal workflows, work that held up well enough to be shaped into a submission for a UAE government-backed startup hackathon, where shortlisted projects got fully funded to build out their vision. I also contributed to an adaptive assessment platform that adjusted to how students were actually learning, and explored how IBM Watson fit into the broader picture.

[7] AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023)
That's the part of AI development most people skip. We didn't.

[8] Alumni Relations Intern at Vaave (November 2020 - December 2021)
Coordinated alumni outreach across 200+ contacts, organized virtual networking events, and helped build the connective tissue between people who'd already graduated and students figuring out what came next.

[9] Computer Science Grader at Rutgers University (September 2024 - December 2025)
That's a different kind of understanding than passing a course.

[10] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[11] Computer Science Grader at Rutgers University (September 2024 - December 2025)
Graded assignments covering graph search, probabilistic inference, constraint satisfaction, and deep learning, which meant I had to understand every concept well enough to spot where someone's thinking went wrong, not just whether their output was right.
```
</details>

## thanks

**Visitor:** Later!

**Cogsworth:** Thanks for stopping by Puja's portfolio. Goodbye!

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: FinSight
A first adapter is trained. The comparison against base Mistral, base Mistral with retrieved examples, and a large hosted model, on accuracy, cost per release and latency, is the next result, and its numbers go here once it has run. The repo also has vLLM serving behind a FastAPI endpoint, a CI eval gate, and a live watcher that answers new releases as they are filed and scores itself weeks later against the 10-Q. The labels come free from the SEC. I pull each release (8-K Exhibit 99.1) from EDGAR, label it with the figures the company later filed in XBRL, and keep it only when those exact figures appear in the text the model reads. Train, validation and test are split by company, so the test set is made of companies the model never saw. Training runs in 4-bit on a free 16 GB T4.
```
</details>

## project-how

**Visitor:** Walk me through how local lens works

**Cogsworth:** A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing a neighborhood snapshot.

<details><summary>Context the model was given</summary>

```
[1] Project: LocalLens
LocalLens is what happens when you stop treating search as keyword matching and start treating it as intent. A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing you a neighborhood snapshot.

[2] Project: LocalLens (facts)
LocalLens. Date: February 2026. Featured project. Tech: FastAPI · React · Groq · Google Places API · Foursquare · WalkScore. GitHub: https://github.com/PujaSridhar/LocalLens. Live demo: https://local-lens-six.vercel.app/.

[3] Project: LocalLens
LocalLens is built with FastAPI · React · Groq · Google Places API · Foursquare · WalkScore.

[4] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[5] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[6] Project: LocalLens
No static data. No pre-curated lists. Just a pipeline that understands the difference between coffee shop and that kind of coffee shop. "Cafe" returns every coffee shop within two miles. That's not what you asked. You asked for the cozy one with good wifi that isn't too loud on a Tuesday afternoon.
```
</details>

## project-overview

**Visitor:** Tell me about LexAI

**Cogsworth:** LexAI is a contract analysis tool that runs five agents on your contract, because most people sign contracts they don't fully understand. One agent figures out what kind of document it is, one summarizes your obligations, two run in parallel (one grading every clause on fairness and clarity, one hunting for predatory terms), and the fifth writes counter-proposals with actual suggested wording.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: LexAI (facts)
LexAI. Date: January 2026. Featured project. Tech: Gemini 2.5 Flash · Vercel Serverless · React 18 (CDN) · Node.js. GitHub: https://github.com/PujaSridhar/Lexai. Live demo: https://lexai-gem.vercel.app/.

[3] Project: LexAI
LexAI is built with Gemini 2.5 Flash · Vercel Serverless · React 18 (CDN) · Node.js. Most people sign contracts they don't fully understand. Not because they're careless. Because contract review is genuinely hard, slow, and expensive if you want it done right. LexAI runs five agents on your contract. One figures out what kind of document it is. One summarizes your obligations. Two run in parallel: one grading every clause on fairness and clarity, one hunting for predatory terms. The fifth writes you counter-proposals with actual suggested wording. Full analysis in 15–25 seconds. The parallelism isn't a flex: it's what makes the wait time feel respectful of your time.
```
</details>

## unknown-tech

**Visitor:** Can Puja code in Hadoop?

**Cogsworth:** Hadoop isn't mentioned in Puja's portfolio, so I can't say. For anything not covered here, you can reach Puja at pujasridhar28@gmail.com.

<details><summary>Context the model was given</summary>

```
[1] Overview: all skills
Puja's skills are grouped into 7 areas. Languages: Python, C, SQL, JavaScript, Bash. AI & ML: LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search, Prompt Engineering. Data Engineering: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture. Systems: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI. Web & API: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs. Cloud & Infra: AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions, CI/CD. Tools: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[2] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[3] About Puja
I care about the decisions underneath the code. The ones that don't show up in the README.

[4] Contact
Contact email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.
```
</details>

## project-how

**Visitor:** What is interesting about the sys namespace technically?

**Cogsworth:** Happy to explain. The demos are a free-list memory allocator with coalescing, a mini shell with pipes, redirection, and a virtual filesystem, and a round-robin thread scheduler that shows you deadlocks as they happen.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Systems Sandbox (sys namespace) (facts)
Systems Sandbox (sys namespace). Date: May 2026. Tech: C, WebAssembly, Emscripten, React. GitHub: https://github.com/PujaSridhar/PujaSridhar.github.io. No live demo listed.

[3] Overview: all projects
Puja's portfolio lists 14 projects: FinSight (November 2026, featured); Silhouette (November 2026, featured); PostHog Engineering Impact Dashboard (March 2026, featured); LocalLens (February 2026, featured); LexAI (January 2026, featured); AI Neighborhood Watch (December 2025, featured); Smart Doc Finder (August 2025, featured); Systems Sandbox (sys namespace) (May 2026); AI Bot Rescue Mission (March 2024); Algorithmic Transformation (Independent Set to Clique) (May 2024); Multilingual Health Misinformation Detection (April 2025); Emotion Detection from Facial Expressions (March 2023); Sentiment Analysis of Movie Reviews (December 2022); Credit Card Fraud Detection (October 2022).

[4] Project: Systems Sandbox (sys namespace)
Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React. Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself. The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath? So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.
```
</details>

## project-tech

**Visitor:** What tools went into Neighborhood Watch?

**Cogsworth:** AI Neighborhood Watch is built with Flask, PostgreSQL, Gemini, ElevenLabs, Leaflet.js, Tailwind and pydub. For the daily briefing, two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: AI Neighborhood Watch (facts)
AI Neighborhood Watch. Date: December 2025. Featured project. Tech: Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. GitHub: https://github.com/PujaSridhar/ai-neighborhood-watch. Live demo: https://ai-neighborhood-watch.vercel.app/.

[3] Project: AI Neighborhood Watch
AI Neighborhood Watch is built with Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby. I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3. A neighborhood safety podcast, generated overnight, every night, automatically.
```
</details>

## skills

**Visitor:** Does Puja do low-level systems work?

**Cogsworth:** Puja's Systems skills are WebAssembly, Emscripten, Memory Allocators, C Systems Programming and WASM ABI.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[3] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[4] Project: Systems Sandbox (sys namespace)
Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React. So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.

[5] About Puja
That's the question that keeps showing up in my work. Not just: does it work. But: why isn't it smarter. The PostHog dashboard taught me what a real data pipeline feels like under pressure: Airflow, dbt, FastAPI, Redis, all of it talking to each other in production. LocalLens taught me that agentic systems need choreography, not just capability. LexAI taught me that parallelism isn't a nice-to-have when the user is waiting. And a free-list allocator compiled to WebAssembly taught me that the lowest layer of the stack is just as interesting as the highest.

[6] Project: Systems Sandbox (sys namespace)
Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself.
```
</details>

## topic

**Visitor:** Has Puja worked on C programming?

**Cogsworth:** Yes. Puja's Systems skills include WebAssembly, Emscripten, Memory Allocators, C Systems Programming and WASM ABI. The Systems Sandbox is three systems demos written in C and compiled to WebAssembly: a free-list memory allocator with coalescing, a mini shell with pipes and redirection, and a round-robin thread scheduler.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[3] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[4] Project: Systems Sandbox (sys namespace)
The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath? Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself. So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen. Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React.
```
</details>

## project-tech

**Visitor:** what is neighborhood watch built with

**Cogsworth:** AI Neighborhood Watch is built with Flask, PostgreSQL, Gemini, ElevenLabs, Leaflet.js, Tailwind and pydub. For the daily briefing, two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: AI Neighborhood Watch (facts)
AI Neighborhood Watch. Date: December 2025. Featured project. Tech: Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. GitHub: https://github.com/PujaSridhar/ai-neighborhood-watch. Live demo: https://ai-neighborhood-watch.vercel.app/.

[3] Project: AI Neighborhood Watch
AI Neighborhood Watch is built with Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3. Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby. A neighborhood safety podcast, generated overnight, every night, automatically.
```
</details>

## tech-usage

**Visitor:** Can she work with Tableau?

**Cogsworth:** Yes. Tableau is in Puja's Tools skills.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[3] Skills: Tools
Tools skills: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.
```
</details>

## project-overview

**Visitor:** Explain AI Neighborhood Watch like I'm a recruiter

**Cogsworth:** AI Neighborhood Watch is a real-time incident map: residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. For the daily briefing, two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: AI Neighborhood Watch (facts)
AI Neighborhood Watch. Date: December 2025. Featured project. Tech: Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. GitHub: https://github.com/PujaSridhar/ai-neighborhood-watch. Live demo: https://ai-neighborhood-watch.vercel.app/.

[3] Project: AI Neighborhood Watch
I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3. AI Neighborhood Watch is built with Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby. A neighborhood safety podcast, generated overnight, every night, automatically.
```
</details>

## project-overview

**Visitor:** Explain the PostHog dashboard like I'm a recruiter

**Cogsworth:** Happy to explain. The PostHog Engineering Impact Dashboard is a full data pipeline Puja built around one question: what does a fair, comparable measure of engineering output actually look like? Airflow pulls daily from GitHub, dbt shapes it across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders leaderboards, trend charts and a custom impact score Puja designed.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: PostHog Engineering Impact Dashboard (facts)
PostHog Engineering Impact Dashboard. Date: March 2026. Featured project. Tech: Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. GitHub: https://github.com/PujaSridhar/posthog-impact-dashboard. Live demo: https://posthog-impact-dashboard-pujasridhar2001.vercel.app/.

[3] Project: PostHog Engineering Impact Dashboard
Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like? PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure). The interesting part wasn't the stack. It was deciding what to measure and why.
```
</details>

## tech-usage

**Visitor:** Any experience with Redis?

**Cogsworth:** Yes. Redis is in Puja's Data Engineering skills, and Puja used it in PostHog Engineering Impact Dashboard and Smart Doc Finder.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: PostHog Engineering Impact Dashboard (facts)
PostHog Engineering Impact Dashboard. Date: March 2026. Featured project. Tech: Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. GitHub: https://github.com/PujaSridhar/posthog-impact-dashboard. Live demo: https://posthog-impact-dashboard-pujasridhar2001.vercel.app/.

[3] Skills: Data Engineering
Data Engineering skills: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture.

[4] Project: Smart Doc Finder (facts)
Smart Doc Finder. Date: August 2025. Featured project. Tech: Python · Redis (Streams + Vector DB + Semantic Cache) · MongoDB · React · Docker. GitHub: https://github.com/krshsl/smart-doc-finder. Live demo: https://smart-doc-finder.vercel.app/login.

[5] Project: PostHog Engineering Impact Dashboard
The interesting part wasn't the stack. It was deciding what to measure and why.

[6] Project: Smart Doc Finder
Keyword search has one fatal flaw: you have to remember exactly how something was worded to find it. That's not how memory works, and it's not how understanding works either.

[7] Project: PostHog Engineering Impact Dashboard
Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like?

[8] Project: Smart Doc Finder
Smart Doc Finder watches your document directory in real time via Redis Streams, chunks anything large into contextual blocks, embeds every chunk into Redis Vector Search, and checks a semantic cache before it even runs a query, so if someone asked something similar recently, it returns instantly. Smart Doc Finder is built with Python · Redis (Streams + Vector DB + Semantic Cache) · MongoDB · React · Docker. One Redis instance. Three jobs: event streaming, vector database, semantic cache. The architecture was the puzzle. Natural language search that actually works was the point.

[9] Project: PostHog Engineering Impact Dashboard
So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure). PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel.
```
</details>

## project-status

**Visitor:** What's the current status of Silhouette

**Cogsworth:** The rule weights were set by hand, so Puja built an eval harness to fit them, with a fitter that only writes new weights when they beat the hand-set ones on held-out outfits. Next are real expert labels (none yet) and garment segmentation with a Mask2Former model on Fashionpedia that is written but not yet trained.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Silhouette (facts)
Silhouette. Date: November 2026. Featured project. Tech: Python · OR-Tools CP-SAT · YAML rules engine · CIEDE2000 colour · JavaScript · Mask2Former (W1). Tagline: A styling reasoning engine built on a solver that picks the outfit and explicit rules that explain why it works. GitHub: https://github.com/PujaSridhar/silhouette. No live demo listed.

[3] Project: Silhouette
Silhouette is built with Python · OR-Tools CP-SAT · YAML rules engine · CIEDE2000 colour · JavaScript · Mask2Former (W1). A styling reasoning engine built on a solver that picks the outfit and explicit rules that explain why it works. Most wardrobe apps match garments by how they look. Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit. The core measurement is lift: how much longer the leg line reads than it really is, based on where the outfit puts the visual break. Eighteen rules, written as YAML, score proportion, volume balance and CIEDE2000 colour contrast at the break. An exact solver checks every candidate outfit (158 µs each), a CP-SAT planner picks a week of outfits from one shared wardrobe, and every line of explanation comes from a rule that fired, not from generated text. The rule weights were set by hand, so I built an eval harness to fit them: a sampler that aims for rule coverage, Spearman and weighted kappa, and a fitter that only writes new weights when they beat the hand-set ones on held-out outfits. Against a synthetic rater it moved both planted weights the right way. Next are real expert labels (none yet) and garment segmentation, a Mask2Former model on Fashionpedia that is written but not yet trained.
```
</details>

## skills

**Visitor:** AI skills?

**Cogsworth:** Puja's AI & ML skills are LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search and Prompt Engineering.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all skills
Puja's skills are grouped into 7 areas. Languages: Python, C, SQL, JavaScript, Bash. AI & ML: LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search, Prompt Engineering. Data Engineering: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture. Systems: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI. Web & API: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs. Cloud & Infra: AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions, CI/CD. Tools: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[3] Skills: AI & ML
AI & ML skills: LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search, Prompt Engineering.

[4] Skills: Tools
Tools skills: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[5] Skills: Languages
Languages skills: Python, C, SQL, JavaScript, Bash.

[6] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[7] Skills: Web & API
Web & API skills: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs.
```
</details>

## project-overview

**Visitor:** What is the sys naemspace about?

**Cogsworth:** The Systems Sandbox is three systems demos, written in C and compiled to WebAssembly, running live in your browser on this portfolio. The demos are a free-list memory allocator with coalescing, a mini shell with pipes, redirection, and a virtual filesystem, and a round-robin thread scheduler that shows you deadlocks as they happen.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Systems Sandbox (sys namespace)
Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself. Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React. The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath?

[3] Project: Systems Sandbox (sys namespace) (facts)
Systems Sandbox (sys namespace). Date: May 2026. Tech: C, WebAssembly, Emscripten, React. GitHub: https://github.com/PujaSridhar/PujaSridhar.github.io. No live demo listed.

[4] Project: Systems Sandbox (sys namespace)
So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.
```
</details>

## project-overview

**Visitor:** Can you explain the health misinformation project?

**Cogsworth:** Multilingual Health Misinformation Detection is a Transformer model Puja trained to flag false health claims across multiple languages, including culturally specific ones that monolingual models quietly miss. The idea is that health misinformation doesn't stay in one language, and neither should the tools that catch it.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all projects
Puja's portfolio lists 14 projects: FinSight (November 2026, featured); Silhouette (November 2026, featured); PostHog Engineering Impact Dashboard (March 2026, featured); LocalLens (February 2026, featured); LexAI (January 2026, featured); AI Neighborhood Watch (December 2025, featured); Smart Doc Finder (August 2025, featured); Systems Sandbox (sys namespace) (May 2026); AI Bot Rescue Mission (March 2024); Algorithmic Transformation (Independent Set to Clique) (May 2024); Multilingual Health Misinformation Detection (April 2025); Emotion Detection from Facial Expressions (March 2023); Sentiment Analysis of Movie Reviews (December 2022); Credit Card Fraud Detection (October 2022).

[3] Project: Multilingual Health Misinformation Detection
Multilingual Health Misinformation Detection is built with Python, NLP, Transformers. Transformer model that flags false health claims across languages, including ones monolingual models quietly miss. Health misinformation doesn't stay in one language, and neither should the tools that catch it. Trained a Transformer model to flag false claims across multiple languages, including culturally specific ones that monolingual models quietly miss.

[4] Hackathon: RWJ Health Hackathon (October 2025, Team of 10 (4 medical students, 6 engineers))
Ten people in a room, four medical students, six engineers, with one question: can we make care coordination faster without making it worse?

[5] Project: Multilingual Health Misinformation Detection (facts)
Multilingual Health Misinformation Detection. Date: April 2025. Tech: Python, NLP, Transformers. Tagline: Transformer model that flags false health claims across languages, including ones monolingual models quietly miss. GitHub: https://github.com/PujaSridhar/Multilingual-Health-Misinformation-Detection. No live demo listed.

[6] AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023)
Filomena was built for people navigating their medications, treatment processes, and health questions, the kind of questions people usually wait hours to get answered by a human.
```
</details>

## project-overview

**Visitor:** The rescue bot project?

**Cogsworth:** AI Bot Rescue Mission is a Python project with four bots, one trapped captain, and a ship full of moving aliens, built on the A-Star Algorithm and heuristics. The fun wasn't building the pathfinder: it was watching how quickly a "smart" bot falls apart the moment the aliens start moving, and designing the next one to handle it. I can also share the tech stack or the GitHub link.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all projects
Puja's portfolio lists 14 projects: FinSight (November 2026, featured); Silhouette (November 2026, featured); PostHog Engineering Impact Dashboard (March 2026, featured); LocalLens (February 2026, featured); LexAI (January 2026, featured); AI Neighborhood Watch (December 2025, featured); Smart Doc Finder (August 2025, featured); Systems Sandbox (sys namespace) (May 2026); AI Bot Rescue Mission (March 2024); Algorithmic Transformation (Independent Set to Clique) (May 2024); Multilingual Health Misinformation Detection (April 2025); Emotion Detection from Facial Expressions (March 2023); Sentiment Analysis of Movie Reviews (December 2022); Credit Card Fraud Detection (October 2022).

[3] Project: AI Bot Rescue Mission
AI Bot Rescue Mission is built with Python, A-Star Algorithm, Heuristics. Four bots, one captain, a ship full of moving aliens: a study in how quickly pathfinders break.

[4] Project: AI Bot Rescue Mission (facts)
AI Bot Rescue Mission. Date: March 2024. Tech: Python, A-Star Algorithm, Heuristics. Tagline: Four bots, one captain, a ship full of moving aliens: a study in how quickly pathfinders break. GitHub: https://github.com/PujaSridhar/AI-Project1. No live demo listed.

[5] Project: AI Bot Rescue Mission
Four bots, one trapped captain, a ship full of moving aliens. The fun wasn't building the pathfinder: it was watching how quickly a "smart" bot falls apart the moment the aliens start moving, and designing the next one to handle it.

[6] Project: Algorithmic Transformation (Independent Set to Clique)
One of those problems that sounds abstract until you're staring at a graph and realizing the complement is doing all the work. Built the reduction in Python, then made it visible: because math you can see is math you actually understand.

[7] Project: Silhouette
Most wardrobe apps match garments by how they look. Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit.
```
</details>

## skills

**Visitor:** skills

**Cogsworth:** Puja's skills are grouped into 7 areas: Languages, AI & ML, Data Engineering, Systems, Web & API, Cloud & Infra and Tools. A few highlights: Python and C; LLMs and Agentic Pipelines; Apache Airflow and dbt; WebAssembly and Emscripten; FastAPI and Flask; AWS (Lambda, EC2, S3, DynamoDB) and Docker; Git and UiPath.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all skills
Puja's skills are grouped into 7 areas. Languages: Python, C, SQL, JavaScript, Bash. AI & ML: LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search, Prompt Engineering. Data Engineering: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture. Systems: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI. Web & API: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs. Cloud & Infra: AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions, CI/CD. Tools: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[3] Skills: Tools
Tools skills: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[4] Skills: Languages
Languages skills: Python, C, SQL, JavaScript, Bash.

[5] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[6] Skills: Web & API
Web & API skills: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs.

[7] Skills: Cloud & Infra
Cloud & Infra skills: AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions, CI/CD.
```
</details>

## followup (multi-turn)

> **user:** Tell me about Silhouette
>
> **assistant:** Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit. The core measurement is lift: how much longer the leg line reads than it really is, based on where the outfit puts the visual break.
>
**Visitor:** When did she build it?

**Cogsworth:** Puja's portfolio dates it to November 2026.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Silhouette (facts)
Silhouette. Date: November 2026. Featured project. Tech: Python · OR-Tools CP-SAT · YAML rules engine · CIEDE2000 colour · JavaScript · Mask2Former (W1). Tagline: A styling reasoning engine built on a solver that picks the outfit and explicit rules that explain why it works. GitHub: https://github.com/PujaSridhar/silhouette. No live demo listed.

[3] Project: Silhouette
Silhouette is built with Python · OR-Tools CP-SAT · YAML rules engine · CIEDE2000 colour · JavaScript · Mask2Former (W1). A styling reasoning engine built on a solver that picks the outfit and explicit rules that explain why it works. Most wardrobe apps match garments by how they look. Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit. The rule weights were set by hand, so I built an eval harness to fit them: a sampler that aims for rule coverage, Spearman and weighted kappa, and a fitter that only writes new weights when they beat the hand-set ones on held-out outfits. Against a synthetic rater it moved both planted weights the right way. Next are real expert labels (none yet) and garment segmentation, a Mask2Former model on Fashionpedia that is written but not yet trained. The core measurement is lift: how much longer the leg line reads than it really is, based on where the outfit puts the visual break. Eighteen rules, written as YAML, score proportion, volume balance and CIEDE2000 colour contrast at the break. An exact solver checks every candidate outfit (158 µs each), a CP-SAT planner picks a week of outfits from one shared wardrobe, and every line of explanation comes from a rule that fired, not from generated text.
```
</details>

## project-list

**Visitor:** Are any prjoects deployed?

**Cogsworth:** 5 projects have live demos: PostHog Engineering Impact Dashboard, LocalLens, LexAI, AI Neighborhood Watch and Smart Doc Finder. The Systems Sandbox also runs right in this portfolio: type sys --alloc, sys --shell, or sys --threads.

<details><summary>Context the model was given</summary>

```
[1] Project: Systems Sandbox (sys namespace) (facts)
Systems Sandbox (sys namespace). Date: May 2026. Tech: C, WebAssembly, Emscripten, React. GitHub: https://github.com/PujaSridhar/PujaSridhar.github.io. No live demo listed.

[2] Project: LexAI
Most people sign contracts they don't fully understand. Not because they're careless. Because contract review is genuinely hard, slow, and expensive if you want it done right.

[3] Project: Systems Sandbox (sys namespace)
Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React.

[4] Project: LexAI
LexAI is built with Gemini 2.5 Flash · Vercel Serverless · React 18 (CDN) · Node.js.

[5] Project: Systems Sandbox (sys namespace)
Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself.

[6] Project: Smart Doc Finder
One Redis instance. Three jobs: event streaming, vector database, semantic cache. The architecture was the puzzle. Natural language search that actually works was the point.

[7] Project: PostHog Engineering Impact Dashboard
Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like?

[8] Project: Systems Sandbox (sys namespace)
So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.

[9] Project: PostHog Engineering Impact Dashboard
So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure).

[10] Project: LocalLens
LocalLens is what happens when you stop treating search as keyword matching and start treating it as intent. A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing you a neighborhood snapshot.

[11] Project: Systems Sandbox (sys namespace)
The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath?

[12] Project: PostHog Engineering Impact Dashboard
PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. The interesting part wasn't the stack. It was deciding what to measure and why.

[13] Project: LocalLens
"Cafe" returns every coffee shop within two miles. That's not what you asked. You asked for the cozy one with good wifi that isn't too loud on a Tuesday afternoon.

[14] Project: LexAI
LexAI runs five agents on your contract. One figures out what kind of document it is. One summarizes your obligations. Two run in parallel: one grading every clause on fairness and clarity, one hunting for predatory terms. The fifth writes you counter-proposals with actual suggested wording.

[15] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[16] Project: AI Neighborhood Watch
AI Neighborhood Watch is built with Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub.

[17] Project: Smart Doc Finder
Smart Doc Finder is built with Python · Redis (Streams + Vector DB + Semantic Cache) · MongoDB · React · Docker.

[18] Project: AI Neighborhood Watch
Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby. I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.

[19] Project: LexAI
Full analysis in 15–25 seconds. The parallelism isn't a flex: it's what makes the wait time feel respectful of your time.

[20] Project: LocalLens
No static data. No pre-curated lists. Just a pipeline that understands the difference between coffee shop and that kind of coffee shop.

[21] Project: Smart Doc Finder
Smart Doc Finder watches your document directory in real time via Redis Streams, chunks anything large into contextual blocks, embeds every chunk into Redis Vector Search, and checks a semantic cache before it even runs a query, so if someone asked something similar recently, it returns instantly.

[22] Project: AI Neighborhood Watch
A neighborhood safety podcast, generated overnight, every night, automatically.

[23] Overview: project links (GitHub and live demos)
5 projects have live demos. FinSight: GitHub https://github.com/PujaSridhar/finsight; Silhouette: GitHub https://github.com/PujaSridhar/silhouette; PostHog Engineering Impact Dashboard: GitHub https://github.com/PujaSridhar/posthog-impact-dashboard, live demo https://posthog-impact-dashboard-pujasridhar2001.vercel.app/; LocalLens: GitHub https://github.com/PujaSridhar/LocalLens, live demo https://local-lens-six.vercel.app/; LexAI: GitHub https://github.com/PujaSridhar/Lexai, live demo https://lexai-gem.vercel.app/; AI Neighborhood Watch: GitHub https://github.com/PujaSridhar/ai-neighborhood-watch, live demo https://ai-neighborhood-watch.vercel.app/; Smart Doc Finder: GitHub https://github.com/krshsl/smart-doc-finder, live demo https://smart-doc-finder.vercel.app/login; Systems Sandbox (sys namespace): GitHub https://github.com/PujaSridhar/PujaSridhar.github.io; AI Bot Rescue Mission: GitHub https://github.com/PujaSridhar/AI-Project1; Algorithmic Transformation (Independent Set to Clique): GitHub https://github.com/PujaSridhar/Algorithmic-Transformation; Multilingual Health Misinformation Detection: GitHub https://github.com/PujaSridhar/Multilingual-Health-Misinformation-Detection; Emotion Detection from Facial Expressions: GitHub https://github.com/PujaSridhar/Emotion-Recognition-using-Facial-Expressions; Sentiment Analysis of Movie Reviews: GitHub https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews; Credit Card Fraud Detection: GitHub https://github.com/PujaSridhar/Credit_Card_Fraud_Detection.

[24] Project: Smart Doc Finder
Keyword search has one fatal flaw: you have to remember exactly how something was worded to find it. That's not how memory works, and it's not how understanding works either.

[25] Project: LocalLens
LocalLens is built with FastAPI · React · Groq · Google Places API · Foursquare · WalkScore.
```
</details>

## goals

**Visitor:** Is she open to remote roles?

**Cogsworth:** Puja is based in San Jose. I don't have anything in Puja's portfolio about relocation or remote work, so it's best to ask Puja directly at pujasridhar28@gmail.com.

<details><summary>Context the model was given</summary>

```
[1] About Puja
I care about the decisions underneath the code. The ones that don't show up in the README.

[2] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[3] About Puja
That's the question that keeps showing up in my work. Not just: does it work. But: why isn't it smarter. The PostHog dashboard taught me what a real data pipeline feels like under pressure: Airflow, dbt, FastAPI, Redis, all of it talking to each other in production. LocalLens taught me that agentic systems need choreography, not just capability. LexAI taught me that parallelism isn't a nice-to-have when the user is waiting. And a free-list allocator compiled to WebAssembly taught me that the lowest layer of the stack is just as interesting as the highest.

[4] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[5] Contact
Contact email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[6] About Puja
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. I build things that don't fit a clean job description.
```
</details>

## tech-usage

**Visitor:** Is Puja familiar with dbt?

**Cogsworth:** Yes. dbt is in Puja's Data Engineering skills, and Puja used it in PostHog Engineering Impact Dashboard.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Skills: Data Engineering
Data Engineering skills: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture.

[3] Project: PostHog Engineering Impact Dashboard
PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. The interesting part wasn't the stack. It was deciding what to measure and why. So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure). Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like?

[4] Project: PostHog Engineering Impact Dashboard (facts)
PostHog Engineering Impact Dashboard. Date: March 2026. Featured project. Tech: Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. GitHub: https://github.com/PujaSridhar/posthog-impact-dashboard. Live demo: https://posthog-impact-dashboard-pujasridhar2001.vercel.app/.
```
</details>

## followup (multi-turn)

> **user:** What is the fraud detection project about?
>
> **assistant:** Credit Card Fraud Detection compares Isolation Forest, LOF, and SVM for anomaly detection, and Isolation Forest won. Puja built it independently because the problem was genuinely interesting: how do you find the needle when the haystack has millions of legitimate transactions?
>
**Visitor:** Is there a link?

**Cogsworth:** The code is on GitHub at https://github.com/PujaSridhar/Credit_Card_Fraud_Detection. The portfolio doesn't list a live demo for it.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Credit Card Fraud Detection (facts)
Credit Card Fraud Detection. Date: October 2022. Tech: Python, Scikit-learn, Isolation Forest. Tagline: Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education. GitHub: https://github.com/PujaSridhar/Credit_Card_Fraud_Detection. No live demo listed.

[3] Project: Credit Card Fraud Detection
Credit Card Fraud Detection is built with Python, Scikit-learn, Isolation Forest. Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education. Built this on my own because the problem genuinely interested me: how do you find the needle when the haystack has millions of legitimate transactions? Compared Isolation Forest, LOF, and SVM. Isolation Forest won, and the gap between them taught me more about anomaly detection than I expected going in.
```
</details>

## topic

**Visitor:** Any fine-tuning experience?

**Cogsworth:** Yes. Training runs in 4-bit on a free 16 GB T4, and the repo has vLLM serving behind a FastAPI endpoint. FinSight fine-tunes Mistral-7B-Instruct with QLoRA (PEFT, bitsandbytes) to return an earnings release's key figures as JSON.

<details><summary>Context the model was given</summary>

```
[1] Project: FinSight
FinSight is built with Python · Mistral-7B · QLoRA (PEFT, bitsandbytes) · Transformers · vLLM · FastAPI · SEC EDGAR + XBRL. A Mistral-7B model trained to read an earnings press release and return its key figures as JSON.

[2] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[3] Project: FinSight
A first adapter is trained. The comparison against base Mistral, base Mistral with retrieved examples, and a large hosted model, on accuracy, cost per release and latency, is the next result, and its numbers go here once it has run. The repo also has vLLM serving behind a FastAPI endpoint, a CI eval gate, and a live watcher that answers new releases as they are filed and scores itself weeks later against the 10-Q.

[4] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[5] Project: FinSight
When a company reports a quarter, the four numbers a trading desk wants first (revenue, net income, diluted EPS and the period end) sit in a press release next to year-ago and year-to-date figures that look almost the same. FinSight fine-tunes Mistral-7B-Instruct with QLoRA to read an earnings release and return those four fields as JSON. The labels come free from the SEC. I pull each release (8-K Exhibit 99.1) from EDGAR, label it with the figures the company later filed in XBRL, and keep it only when those exact figures appear in the text the model reads. Train, validation and test are split by company, so the test set is made of companies the model never saw. Training runs in 4-bit on a free 16 GB T4.

[6] Talks
Talk "How to Prepare for an AI Developer role through Campus Placements" at BMS Institute of Technology and Management.
```
</details>

## tech-usage

**Visitor:** Is she familiar with WASM ABI?

**Cogsworth:** Yes. WASM ABI is in Puja's Systems skills.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all skills
Puja's skills are grouped into 7 areas. Languages: Python, C, SQL, JavaScript, Bash. AI & ML: LLMs, Agentic Pipelines, NLP, Computer Vision, Deep Learning, Transformers, RAG, Vector Search, Prompt Engineering. Data Engineering: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture. Systems: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI. Web & API: FastAPI, Flask, React, Vite, Vercel Serverless, REST APIs. Cloud & Infra: AWS (Lambda, EC2, S3, DynamoDB), Docker, GitHub Actions, CI/CD. Tools: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[3] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[4] Project: Systems Sandbox (sys namespace)
Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React. So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen.

[5] About Puja
That's the question that keeps showing up in my work. Not just: does it work. But: why isn't it smarter. The PostHog dashboard taught me what a real data pipeline feels like under pressure: Airflow, dbt, FastAPI, Redis, all of it talking to each other in production. LocalLens taught me that agentic systems need choreography, not just capability. LexAI taught me that parallelism isn't a nice-to-have when the user is waiting. And a free-list allocator compiled to WebAssembly taught me that the lowest layer of the stack is just as interesting as the highest.

[6] Project: Systems Sandbox (sys namespace)
Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself.
```
</details>

## followup (multi-turn)

> **user:** Tell me about her time at Exposys Data Labs
>
> **assistant:** As a Data Science Intern at Exposys Data Labs (September 2022 - October 2022), Puja built and compared four regression models to predict startup profitability. Random Forest won at 96% accuracy.
>
**Visitor:** What was her title there?

**Cogsworth:** Puja's title was Data Science Intern.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Data Science Intern at Exposys Data Labs (facts)
Role: Data Science Intern. Company: Exposys Data Labs. Period: September 2022 - October 2022.

[3] Data Science Intern at Exposys Data Labs (September 2022 - October 2022)
Built and compared four regression models to predict startup profitability. Random Forest won at 96% accuracy. Good reminder that the model selection process matters as much as the model itself.

[4] Skills: Data Engineering
Data Engineering skills: Apache Airflow, dbt, PostgreSQL, Redis, MongoDB, Pinecone, ETL/ELT, Data Modeling, Medallion Architecture.
```
</details>

## thanks

**Visitor:** Goodbye

**Cogsworth:** Bye! Thanks for checking out Puja's work.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.
```
</details>

## tech-usage

**Visitor:** Vercel experience

**Cogsworth:** Yes. Puja used it in PostHog Engineering Impact Dashboard.

<details><summary>Context the model was given</summary>

```
[1] Project: PostHog Engineering Impact Dashboard (facts)
PostHog Engineering Impact Dashboard. Date: March 2026. Featured project. Tech: Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. GitHub: https://github.com/PujaSridhar/posthog-impact-dashboard. Live demo: https://posthog-impact-dashboard-pujasridhar2001.vercel.app/.

[2] Project: PostHog Engineering Impact Dashboard
The interesting part wasn't the stack. It was deciding what to measure and why.

[3] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[4] Project: PostHog Engineering Impact Dashboard
Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like?

[5] Overview: all experience (roles, jobs, internships)
Puja's portfolio lists 6 roles: AI Engineering Intern at Pennant Education (July 2025 - September 2025); Graduate Teaching Assistant at Rutgers University - School of Communication and Information (September 2024 - December 2025); Computer Science Grader at Rutgers University (September 2024 - December 2025); AI Co-pilot Developer at HumanFractal.ai (Resolute) (February 2023 - May 2023); Data Science Intern at Exposys Data Labs (September 2022 - October 2022); Alumni Relations Intern at Vaave (November 2020 - December 2021).

[6] Project: PostHog Engineering Impact Dashboard
PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure).
```
</details>

## personal

**Visitor:** Where exactly does Puja live?

**Cogsworth:** I don't have that information in Puja's portfolio. For questions like that, it's best to ask Puja directly at pujasridhar28@gmail.com.

<details><summary>Context the model was given</summary>

```
[1] Contact
Contact email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[3] Overview: project links (GitHub and live demos)
5 projects have live demos. FinSight: GitHub https://github.com/PujaSridhar/finsight; Silhouette: GitHub https://github.com/PujaSridhar/silhouette; PostHog Engineering Impact Dashboard: GitHub https://github.com/PujaSridhar/posthog-impact-dashboard, live demo https://posthog-impact-dashboard-pujasridhar2001.vercel.app/; LocalLens: GitHub https://github.com/PujaSridhar/LocalLens, live demo https://local-lens-six.vercel.app/; LexAI: GitHub https://github.com/PujaSridhar/Lexai, live demo https://lexai-gem.vercel.app/; AI Neighborhood Watch: GitHub https://github.com/PujaSridhar/ai-neighborhood-watch, live demo https://ai-neighborhood-watch.vercel.app/; Smart Doc Finder: GitHub https://github.com/krshsl/smart-doc-finder, live demo https://smart-doc-finder.vercel.app/login; Systems Sandbox (sys namespace): GitHub https://github.com/PujaSridhar/PujaSridhar.github.io; AI Bot Rescue Mission: GitHub https://github.com/PujaSridhar/AI-Project1; Algorithmic Transformation (Independent Set to Clique): GitHub https://github.com/PujaSridhar/Algorithmic-Transformation; Multilingual Health Misinformation Detection: GitHub https://github.com/PujaSridhar/Multilingual-Health-Misinformation-Detection; Emotion Detection from Facial Expressions: GitHub https://github.com/PujaSridhar/Emotion-Recognition-using-Facial-Expressions; Sentiment Analysis of Movie Reviews: GitHub https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews; Credit Card Fraud Detection: GitHub https://github.com/PujaSridhar/Credit_Card_Fraud_Detection.

[4] About Puja
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other.

[5] Project: Smart Doc Finder
Keyword search has one fatal flaw: you have to remember exactly how something was worded to find it. That's not how memory works, and it's not how understanding works either.

[6] Hackathon: HackRU (September 2025, Solo)
I built AI Neighborhood Watch from scratch, real-time incident reporting, Gemini-powered categorization, a live Leaflet map, and an ElevenLabs audio briefing pipeline, in a single hackathon. Every architectural decision was mine to own, which meant every wrong one was mine to fix at 2am. It shipped. It worked. It's still live.

[7] Project: Silhouette
The core measurement is lift: how much longer the leg line reads than it really is, based on where the outfit puts the visual break. Eighteen rules, written as YAML, score proportion, volume balance and CIEDE2000 colour contrast at the break. An exact solver checks every candidate outfit (158 µs each), a CP-SAT planner picks a week of outfits from one shared wardrobe, and every line of explanation comes from a rule that fired, not from generated text.
```
</details>

## project-overview (multi-turn)

> **user:** What is the health misinformation project?
>
> **assistant:** Multilingual Health Misinformation Detection is a Transformer model Puja trained to flag false health claims across multiple languages, including culturally specific ones that monolingual models quietly miss. The idea is that health misinformation doesn't stay in one language, and neither should the tools that catch it.
>
**Visitor:** Now tell me about the emotion detection project

**Cogsworth:** Emotion Detection from Facial Expressions is a CNN Puja trained on FER-2013 and wired into OpenCV for real-time video, reaching 96% accuracy.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Emotion Detection from Facial Expressions (facts)
Emotion Detection from Facial Expressions. Date: March 2023. Tech: Python, TensorFlow, Keras, OpenCV. Tagline: CNN trained on FER-2013, wired into OpenCV for real-time video. 96% accuracy. GitHub: https://github.com/PujaSridhar/Emotion-Recognition-using-Facial-Expressions. No live demo listed.

[3] Project: Emotion Detection from Facial Expressions
Emotion Detection from Facial Expressions is built with Python, TensorFlow, Keras, OpenCV. CNN trained on FER-2013, wired into OpenCV for real-time video. 96% accuracy. Wanted to know how well a CNN could read a face in real time. Trained on FER-2013, wired it into OpenCV, and got to 96% accuracy, and a new appreciation for how much information lives in a half-second expression.
```
</details>

## project-overview

**Visitor:** What is the PostHog Engineering Impact Dashboard?

**Cogsworth:** The PostHog Engineering Impact Dashboard is a full data pipeline Puja built around one question: what does a fair, comparable measure of engineering output actually look like? Airflow pulls daily from GitHub, dbt shapes it across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders leaderboards, trend charts and a custom impact score Puja designed.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: PostHog Engineering Impact Dashboard (facts)
PostHog Engineering Impact Dashboard. Date: March 2026. Featured project. Tech: Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. GitHub: https://github.com/PujaSridhar/posthog-impact-dashboard. Live demo: https://posthog-impact-dashboard-pujasridhar2001.vercel.app/.

[3] Project: PostHog Engineering Impact Dashboard
PostHog Engineering Impact Dashboard is built with Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel. Engineering teams generate a lot of data and almost no insight. Commits, PRs, reviews, issues: all happening, none of it connected. I wanted to know: what does a fair, comparable measure of engineering output actually look like? So I built the whole pipeline. Airflow pulls daily from GitHub, dbt shapes it into something meaningful across six models, FastAPI serves it, Redis caches it with hit/miss transparency, and a React dashboard renders it: leaderboards, trend charts, a custom impact score I designed myself (because the formula matters as much as the infrastructure). The interesting part wasn't the stack. It was deciding what to measure and why.
```
</details>

## project-problem

**Visitor:** Why does Neighborhood Watch exist?

**Cogsworth:** Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory, with no map and no categories. For the daily briefing, two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: AI Neighborhood Watch (facts)
AI Neighborhood Watch. Date: December 2025. Featured project. Tech: Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. GitHub: https://github.com/PujaSridhar/ai-neighborhood-watch. Live demo: https://ai-neighborhood-watch.vercel.app/.

[3] Project: AI Neighborhood Watch
AI Neighborhood Watch is built with Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub. Safety information in most neighborhoods lives in three different Facebook groups, a NextDoor thread, and someone's memory. There's no map. No categories. No way to just know what's been happening nearby. I built the map. Residents drop incidents on a Leaflet layer, Gemini auto-categorizes them, and everything renders as color-coded markers in real time. But the part I'm most proud of is the daily briefing: two AI voices, Ava and Mateo, get a script generated each morning, ElevenLabs synthesizes them separately, and pydub stitches them into a broadcast-ready MP3. A neighborhood safety podcast, generated overnight, every night, automatically.
```
</details>

## topic

**Visitor:** Is she good at low-level programming?

**Cogsworth:** I can point to what the portfolio shows: The Systems Sandbox is three systems demos written in C and compiled to WebAssembly: a free-list memory allocator with coalescing, a mini shell with pipes and redirection, and a round-robin thread scheduler. Puja's Systems skills include WebAssembly, Emscripten, Memory Allocators, C Systems Programming and WASM ABI.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Certifications
Certification "Programming for Everybody" from University of Michigan.

[3] Project: Systems Sandbox (sys namespace)
So I answered it directly. Three systems demos, written in C, compiled to WebAssembly, running live in your browser right now. A free-list memory allocator with coalescing. A mini shell with pipes, redirection, and a virtual filesystem. A round-robin thread scheduler that shows you deadlocks as they happen. Systems Sandbox (sys namespace) is built with C, WebAssembly, Emscripten, React.

[4] Skills: Systems
Systems skills: WebAssembly, Emscripten, Memory Allocators, C Systems Programming, WASM ABI.

[5] Project: Systems Sandbox (sys namespace)
The question I kept getting, implicitly, in every ML and AI role, was: do you actually understand what's happening underneath? Not simulated. Not faked. Type sys --alloc, sys --shell, or sys --threads and run them yourself.
```
</details>

## languages

**Visitor:** Does she speak Hindi?

**Cogsworth:** Yes. Puja speaks English (Native / Bilingual), Hindi (Native / Bilingual), Tamil (Native / Bilingual), Kannada (Professional Working Proficiency) and Telugu (Conversational).

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Languages
Spoken languages: English (Native / Bilingual), Hindi (Native / Bilingual), Tamil (Native / Bilingual), Kannada (Professional Working Proficiency), Telugu (Conversational).

[3] Skills: Languages
Languages skills: Python, C, SQL, JavaScript, Bash.

[4] Project: Multilingual Health Misinformation Detection
Health misinformation doesn't stay in one language, and neither should the tools that catch it. Trained a Transformer model to flag false claims across multiple languages, including culturally specific ones that monolingual models quietly miss.

[5] Project: Smart Doc Finder
One Redis instance. Three jobs: event streaming, vector database, semantic cache. The architecture was the puzzle. Natural language search that actually works was the point.

[6] Project: Silhouette
Most wardrobe apps match garments by how they look. Silhouette is a styling reasoning engine: a solver assembles outfits against explicit styling rules and explains, with numbers, why each one works on a given frame. A language model never picks the outfit.
```
</details>

## project-overview

**Visitor:** Can you explain Credit Card Fraud Detection?

**Cogsworth:** Credit Card Fraud Detection compares Isolation Forest, LOF, and SVM for anomaly detection, and Isolation Forest won. Puja built it independently because the problem was genuinely interesting: how do you find the needle when the haystack has millions of legitimate transactions? I can also share the tech stack or the GitHub link.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Credit Card Fraud Detection (facts)
Credit Card Fraud Detection. Date: October 2022. Tech: Python, Scikit-learn, Isolation Forest. Tagline: Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education. GitHub: https://github.com/PujaSridhar/Credit_Card_Fraud_Detection. No live demo listed.

[3] Project: Credit Card Fraud Detection
Credit Card Fraud Detection is built with Python, Scikit-learn, Isolation Forest. Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education. Built this on my own because the problem genuinely interested me: how do you find the needle when the haystack has millions of legitimate transactions? Compared Isolation Forest, LOF, and SVM. Isolation Forest won, and the gap between them taught me more about anomaly detection than I expected going in.
```
</details>

## tech-usage

**Visitor:** what has puja built with walkscore

**Cogsworth:** One project in Puja's portfolio use WalkScore: LocalLens.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Overview: all projects
Puja's portfolio lists 14 projects: FinSight (November 2026, featured); Silhouette (November 2026, featured); PostHog Engineering Impact Dashboard (March 2026, featured); LocalLens (February 2026, featured); LexAI (January 2026, featured); AI Neighborhood Watch (December 2025, featured); Smart Doc Finder (August 2025, featured); Systems Sandbox (sys namespace) (May 2026); AI Bot Rescue Mission (March 2024); Algorithmic Transformation (Independent Set to Clique) (May 2024); Multilingual Health Misinformation Detection (April 2025); Emotion Detection from Facial Expressions (March 2023); Sentiment Analysis of Movie Reviews (December 2022); Credit Card Fraud Detection (October 2022).

[3] Project: LocalLens (facts)
LocalLens. Date: February 2026. Featured project. Tech: FastAPI · React · Groq · Google Places API · Foursquare · WalkScore. GitHub: https://github.com/PujaSridhar/LocalLens. Live demo: https://local-lens-six.vercel.app/.

[4] Project: LocalLens
"Cafe" returns every coffee shop within two miles. That's not what you asked. You asked for the cozy one with good wifi that isn't too loud on a Tuesday afternoon. LocalLens is built with FastAPI · React · Groq · Google Places API · Foursquare · WalkScore. LocalLens is what happens when you stop treating search as keyword matching and start treating it as intent. A Groq agent parses what you actually mean, live APIs pull real venues, and a second agent scores each one against your vibe (not just your category) before writing you a neighborhood snapshot. No static data. No pre-curated lists. Just a pipeline that understands the difference between coffee shop and that kind of coffee shop.
```
</details>

## followup (multi-turn)

> **user:** What is the sentiment analysis project?
>
> **assistant:** Sentiment Analysis of Movie Reviews uses Naive Bayes on 1,000+ reviews and reaches 95% accuracy. It was Puja's first real look at how probabilistic models handle language, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier.
>
**Visitor:** How does it work?

**Cogsworth:** It was Puja's first real look at how probabilistic models handle language, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier.

<details><summary>Context the model was given</summary>

```
[1] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[2] Project: Sentiment Analysis of Movie Reviews (facts)
Sentiment Analysis of Movie Reviews. Date: December 2022. Tech: Python, NLP, Scikit-learn, Naive Bayes. Tagline: Naive Bayes on 1,000+ reviews, 95% accuracy. Simple models, done well. GitHub: https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews. No live demo listed.

[3] Project: Sentiment Analysis of Movie Reviews
Sentiment Analysis of Movie Reviews is built with Python, NLP, Scikit-learn, Naive Bayes. Naive Bayes on 1,000+ reviews, 95% accuracy. Simple models, done well. My first real look at how probabilistic models handle language. Naive Bayes on 1,000+ reviews, 95% accuracy, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier.
```
</details>

## tech-usage

**Visitor:** Can Puja work with Scikit-learn?

**Cogsworth:** Yes. Scikit-learn is in Puja's Tools skills, and Puja used it in Sentiment Analysis of Movie Reviews and Credit Card Fraud Detection.

<details><summary>Context the model was given</summary>

```
[1] Project: Credit Card Fraud Detection (facts)
Credit Card Fraud Detection. Date: October 2022. Tech: Python, Scikit-learn, Isolation Forest. Tagline: Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education. GitHub: https://github.com/PujaSridhar/Credit_Card_Fraud_Detection. No live demo listed.

[2] Profile: Puja Sridhar
Based in San Jose. Looking for roles in AI Engineering, Data Engineering, ML Engineering, or SWE, anywhere intelligence and infrastructure actually have to talk to each other. Education: Masters of Science in Computer Science, Rutgers University, The State University of New Jersey (Graduated Jan 2026 | GPA: 3.8/4.0); Bachelor of Engineering in Artificial Intelligence and Machine Learning, BMS Institute of Technology and Management, India (Graduated May 2023 | GPA: 8.64/10.0). Contact: email pujasridhar28@gmail.com, LinkedIn https://www.linkedin.com/in/pujasridhar/, GitHub https://github.com/pujasridhar.

[3] Project: Sentiment Analysis of Movie Reviews
My first real look at how probabilistic models handle language. Naive Bayes on 1,000+ reviews, 95% accuracy, and a reminder that simple models, done well, are still worth understanding before you reach for something heavier.

[4] Skills: Tools
Tools skills: Git, UiPath, Tableau, TensorFlow, Keras, Scikit-learn.

[5] Project: Credit Card Fraud Detection
Credit Card Fraud Detection is built with Python, Scikit-learn, Isolation Forest. Isolation Forest beats LOF and SVM on anomaly detection. The gap between them was the education.

[6] Project: Sentiment Analysis of Movie Reviews
Sentiment Analysis of Movie Reviews is built with Python, NLP, Scikit-learn, Naive Bayes. Naive Bayes on 1,000+ reviews, 95% accuracy. Simple models, done well.

[7] Project: Credit Card Fraud Detection
Built this on my own because the problem genuinely interested me: how do you find the needle when the haystack has millions of legitimate transactions? Compared Isolation Forest, LOF, and SVM. Isolation Forest won, and the gap between them taught me more about anomaly detection than I expected going in.

[8] Project: Sentiment Analysis of Movie Reviews (facts)
Sentiment Analysis of Movie Reviews. Date: December 2022. Tech: Python, NLP, Scikit-learn, Naive Bayes. Tagline: Naive Bayes on 1,000+ reviews, 95% accuracy. Simple models, done well. GitHub: https://github.com/PujaSridhar/Sentiment-analysis-of-movie-reviews. No live demo listed.
```
</details>
