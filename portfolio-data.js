export const portfolioData = {
    about: `I’ve always been fascinated by puzzles, and to me, intelligence itself is the most interesting puzzle of all. That curiosity led me to pursue a Bachelor’s degree in Artificial Intelligence and Machine Learning in India, and later a Master’s in Computer Science at Rutgers University, where I deepened my foundation in AI systems, adaptive learning, and large-scale problem solving.\n\nSince then, I’ve focused on building practical systems that are useful in the real world, from AI product features and semantic search tools to teaching, mentoring, and translating complex ideas into something people can actually use. Now based in San Jose, I’m looking for roles where I can keep building at the intersection of AI, software engineering, and data. I’m a builder at heart, energized by hard problems, collaborative teams, and the chance to ship work that matters.`,
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
                "Developing and modularizing agentic RPA solutions using UiPath to create scalable tools for enterprise use.",
                "Contributing to an AI-powered assessment platform featuring adaptive testing and dynamic learning recommendations.",
                "Exploring the integration of AI and RPA to automate internal business workflows using platforms like Bitrix24 and Keap.",
                "Leveraging IBM AI toolkits, including Watson, to build and enhance intelligent systems."
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
            name: "Systems Sandbox (sys namespace)",
            tech: "C, WebAssembly, Emscripten, React",
            date: "May 2026",
            desc: [
                "<strong>Problem:</strong> Portfolio lacked proof of low-level systems knowledge beyond ML/AI projects.",
                "<strong>Action:</strong> Built three systems demos compiled to WASM and embedded live in the terminal: a free-list malloc/free on mmap with coalescing, a mini shell with pipes/redirection/virtual filesystem, and a round-robin thread scheduler with deadlock visualization.",
                "<strong>Result:</strong> Each demo runs in-browser with a JS fallback. Type sys --alloc, sys --shell, or sys --threads to run them."
            ],
            url: "https://github.com/PujaSridhar/PujaSridhar.github.io"
        },
        {
            name: "Smart Document Finder",
            tech: "Python, Vector Databases, LLMs",
            date: "August 2025",
            desc: [
                "<strong>Problem:</strong> Standard keyword search is often inefficient for finding specific information within large document sets.",
                "<strong>Action:</strong> Developed an intelligent system using vector databases and LLMs to understand natural language queries and retrieve the most relevant document sections.",
                "<strong>Result:</strong> Significantly improved search accuracy and user efficiency, allowing for contextual and semantic-based information retrieval rather than just keyword matching."
            ],
            url: "https://github.com/PujaSridhar/smart-doc-finder"
        },
        {
            name: "Multilingual Health Misinformation Detection",
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
            name: "AI Bot Rescue Mission",
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
            name: "Emotion Detection from Facial Expressions",
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
        "Languages": ["Python", "MATLAB", "SQL"],
        "AI & Machine Learning": ["Deep Learning", "NLP", "Computer Vision", "Data Science", "Business Intelligence", "Robotics Process Automation"],
        "Data & Cloud": ["AWS (Lambda, EC2, S3, DynamoDB)", "Digital Ocean", "Data Lakes", "Lakehouse", "Data Warehouse"],
        "Tools & Frameworks": ["TensorFlow", "Keras", "Flask", "Pygame", "Tableau", "UiPath", "Moodle", "SPSS", "Android Studio", "Mujoco Sim", "Git"],
        "Soft Skills": ["Leadership", "Communication", "Project Management", "Financial Planning", "Mentorship", "Problem-Solving"]
    },
    languages: [
        { lang: "English", proficiency: "Native / Bilingual" },
        { lang: "Hindi", proficiency: "Native / Bilingual" },
        { lang: "Tamil", proficiency: "Native / Bilingual" },
        { lang: "Kannada", proficiency: "Professional Working Proficiency" },
        { lang: "Telugu", proficiency: "Conversational" }
    ],
    creatorArt: `
<span class="ascii-art-bg">---===++===+=--==++++++++++===---=+*+===+++=+#%%%%%##*##%%%%####*++++===+*##**++*****####################*****+++++++**#
=--++=====++==--------==---===--=+*+=========+*#%%%%##***#%%%####**+*+++++++*+++**+**##%%%%%%%%%%%%%%%%######*+++++++**#
+====----=++=---------=+=--====+++=-------==++*##%%%%%##****#######**+=====++===++*##%%%%%%@@@%%%%%%%%%%%%###*++++++*###
+==------=++=---+=---=++======+*++-------=++*#%%##%%%%%%#***##%%###*+==++++++++**##%%%%%%@%%%%%%%%%%%%%%#***+==++++****
=+++==---====---=======-==+++=+*++========---=+++****=*######****######*+++*******#%@@@%%%##*##%%@@%%%%%%#***+++++++++**
=+++==---====---=======-==+++=+*++========---=+++****=*######****######*+++*******#%%%%%%##***#%@@@@@@@%%%##***+++++++*+
--===========--=+*+=-======++====----==-==----==+****+*###%%%###*****##**++**######%%%%%%%%%%%%@@@@@@@@@%%%%%##*******+++
-----=====+==-==+*+==++++======-----=++====---=+*####%%%@@@@@@%%%##**#***++*#%%%%%#%%%%%@@@@@@@@@@@@@@@@%%%%%##****####*
--------=====-=+====-=+*+=----------=+*+===--=*#%%%%%%@%%@@@@@@@%%%%%##*#*#%%%%%%%%%%%%%@@@@@@@@%%%%%%@@@@@@@@@%%%%%%%%%%
--------=====+++=------++=----------=+*++==+#%%%@@@@@@@%%%%%@@@@@%%%%%%#%###%%%%%%%%%%%@%*+*##%%%%@@@%%%%%%%%%%%%%%%%%#%
===---======+++++==---=++=-----------=++=+#@@@@@@%##******+**##%@@@@@@@@@%%##%%%%%%%%%%%@%*+*##%%%%@@@%%%%%%%%%%%%%%%%%#%
+++=====---++++**+=-=++++==-====------==+%@@@@@%*+===========++*#%@@@@@@@@@%%%####******#*+++++*%@@@@%%%%%%%%%%%%%%%%##%
++++++==-=++******+==+++++==========----*@@@@@%*+==============+**#%@@@@@@@@@%%%##*********++***%%%%%%#%################
=++++===+++*****+++++**++++++***+++=-==+#%@@@%#++============+=++*#%%@@@@-@@@@@%%%########*****#########%%%####%%%%%%%%%%
=++++++++++++++*****++++**+++++**+++=+*+*@@@@%*+===============++*##%%@@@@@@@@%######%%%##########%%%%%%@@@@%%%%%%%%%%%%
+++=+++=-=++===++++++++====++++++++++***#@@%%#*+================+*#%%%@@@@@@@@@#*#%%%%%###########%%%%%%@@@@@%%%%%%%%###
++=+=====++++++++++++++=====++++++=+****#@@@%#+==================++#%%@@@@@@@@%##*%@%%#######****##%%%%@@@@@@@@%%%%%####
+==++++++++++++++**++++++++++++++++++***#@@@#+=++**+++++++++****++++*#%@@@@@%%%%#####%%%%#*++**+*#%@@@@@@@%%#****######
+++++++++====++++++++=+++==*********+=+*##*+*%#++++*+******++*##**+******#*#@@@@@%##%%%%#*#%%%%##**+**%@@@@@@%##**+++**#####
--+++===+++++++++++++++******+++++=+*+=+##***####%###**++***########**+**%@@@%%%%%%##*#%%%%%#*##%%@@@@@@@%%#####%%%%%%
=---=-=++**+==+++++++++++++++++++=+***+*%*+++****####**++***########**+**%@@@%%%%%%##*#%%%%%#*##%%@@@@@@@%%#####%%%%%%
====-===+++++==++++*++=+++++++++++=+****+#*====++++++++===+++*******+++++*#@@%%%@%#%%%%%#*#%%%%%%%%%%@@@@@@@@%%%%%%%%%%%%
====+++++++++++==++++=++++***++++**+=++=*+=============--=++++=======+++*#@%%%%%%###%%%%#**%%@%%%%%@@@@@@@@@%%%%%%%%%%%%
+===++++++*++=====+++++++++***++*##*++**#+=======++===---==++*+======+++*%%%%%%%%####%%%%##*#%%%%%@@@@@@@@@@%%%%###%####
*==+++=======+====++++**++++***+**#######+====+***+========++*#**+++++++*%%##%%@%#####%%%%##**#%%%@@@@@@@@@@@%%%%%%##%%#*
**+++===---=======++++++++++*++==*##%%%#*++++*##*++++++++*****####******##**#%%%%%%%%%#%%%%%##*#%%@@@@@@@@@@@%%%%%%%@@%%
*+++=+++++====+++++===++++++==--=+*##%%#+=++*###***++**######**###%#******+#######%###%#%%%%%####%@@@@@@@@@@%#*+*%%%%@@@
++**+++++++++=+**++====++++===+*+++***#*+=+++****##==++*******%%%##********%##***########%%%%%%####%@@@@@%*+===+#%%##%%
=+***++*++**+++++==+++++++===++=---==**++*=+++++++++==-====++*#**********#*********#####%%%%%%%%####%@@@@@%*++*########%
=+*==+++++++++++++****+====+===--=+++++*#****++++==+++++++++**+*******####*******++*####%%%%%%%%%%####%@@@%*++**##%%@@%%
+++***#*+=====+*****+--===+*++**+++*+=+%%%%%@#+++====++++++*++********#########*++==+####%%%%%%%%%%%###%@@@%#***##%%@@@%
+++++***#**+=-=+***+==+++*+++*###*++==+%@%%@@@%*+=====++++++++++******#########***++*#####%%%%%%%%%%%%####%%***+++*++#%@
+*+=-=+++++**+=-=++*+++++++==*#%@%#****#%%##%@@*++=========++++**###**##**#############%###%%%%%%%%%%%%%#*#*====++===+#%
+=-==+*+====+++++++++=======+#%%%#*****==*##%@%++++++++++++++**####***#@#++##%%%#%%########%%%%#%%%%%%%%%#**+=+++++=++**
++==+****+=====+***+++-=+++***##*******==*%@@#=++++*******########*****@@*-+%%%%%%%%#####%%%%##%%%%%%%%%%##*+==+++*###
+++++++***+***********++++**+*###***+**+==+=-:+*===++***########******#%#==-=#%%#%%%%#######%%%##%%%%%%%%%%##*+==+++*###
****+++*#*******##**##**++***+++*==---::::::::**====++++**************##=-----+##%%%%##****###%###%%%%%%%%%%##**+++****%
*****++*#*******##***#*#%##+=--:::::::--:::::-**=++++++*************##%+--------=++*#%####**####%%%%%%%%%%%%#####**#**#@
*****++**+++***#####*###*=-:::-:::-=---:::--:-**+++++++*************#%*--------------=+*########%%%##%%%%%%%######%%%@@@
++++++++++++******##**=-:::-:::--==--:::--::-*#++++++*************##*=-----------------=+*##%####%%%%%%%%%%########%%%%
++++++++++==++++**#+-::::::------=+=-:-::-::--*#++++++*************#*=-----------:::-------=+*####%%%%%%%%%%########*###
+++++++++++++*****=-:--:::-------++=---:--::--+++++=+++**+++**+++=-------------=+----------------=*#%%%%%%%%%%##########
*++++++++********=--:-:----------+++---::--:---==:::-==+++++++==--:::------------=+-------------------*%%%%%%%%%%%%#######
**++++++**###**+=:--:----------+++---::--:---==:::-==+++++++==--:::------------=+-------------------*%%%%%%%%%%%%#######
*+++++++**#####*-:-=------:---+++=-----------=-::::::::::--:::::::-------------=+--------------------=*%@%%%%%%%%%%%####
+=-=+*+++*##%%%#--------=----=++=------------==::..:::::::::::::::---------==+**=----------------------=*%%%%%%%%%%%%%%%
+===+++++*##%%%+:------=-:--=++=-----:-------==:::::::::::::::::---------+++*++==-----:-------------------+**%%%%%%%%%%%
+=====++**###%#=----=--=-:-==++=----:--------=-::::::::---:::::------------===-------:-===-----------------=#%%%%%%%%%%%
++=++++****##%#-----=--=-:-=++=-----:--------=-:::::::-::::::-:::-----------==--------=+=----------------=--+%%%%%%%%%%%
**+++++**####%#-----==-----=++=-=--::---------=::::::::::::::-:::-------------===-----=+==---------------=----#@@@%%%%%%%
********######+------=--:-=++===--::---------=::::::::::::::::::-------------=+==----=+==------------=---=---*@@@@@%%%%%
***####*#####*------==----=++==-------------==::::::::::::::::::-------------=+==----++===-----=---====--==--+@@@@@@%%%%
***####*#####*-------==:--=++==-------------==::::::::::::::::::-------------=+==----=+===---==--=======--=-==%@@@@@@%%%
****#######**+:------==:-==++==---::--------=-:::::::::::::::::--------------+++=---=++=======--=======-----=+%@@@@@@@%%
******####***=:-----==-:-==++=-----------:--=-:::::::::::::::::-------------=+==----++==-----==--=====---===--=+@@@@@@@@@@
+******###**+-:-----=+---=+++=---------:::--=-:::::::::::::::::-------------*++=---=++=====--====----====---*@@@@@@@@@@
++++********+:-----===---=+++=-----:--:::--==-::::::::::::::::-------------+*++=----=*+=====-==----========--#@@@@@@@@%%
+++++++****+=:-----=+=:--=++====----::::---==-::::::::::::::::------------+*++==----+*+=====-----==========--*%@@@@%%%%%
+++++++****+-------=+-:-==++==-----:--::---==-::::::::::::::::-----------=**++==----+*+====-====---====--=====%@%%%%%%%%
+++++++****=-----====---==++==-------::----==-::::::::::::::::-----------=**+++==----+*+====-====---====--=======#%%%%%%%%#
++++++++***------====:--==+====-----::-----==--::::::::::::::------------**++++==----+*+=++====---====--=========#%%%######
+++++++++++------===-:--==+====-----------===--::::::::::::::-----------+**+++===----**+*+==--====---=========*%%%######
+++++++++*+-------==-:--=======-----------=+=---:::::::::::::----------=**+++==----**+*+=---===---===========*%%%%####%
+++++++++*-------==+----=======----=::----=+=---::::::::::::-----------+**+++==----**+*+=---===---===========*%%%%##%%%
++++++++*+------===+----===++==----=------=+=---::::::::::::----------=**++++==---==**+*====--================+%%%%%%##
++++++***=:-------==----===++=-----=-----=++==---:::::::::::----------**+++++==---==***+=--===================+#%%%%###
+++++***+-------==+=:---==+++=-----=-----=+++=----::::::::::---------+*++++++==---==**#+=------------========-=*##%%%###
++++****+-----====+=:---=+++==-----=-::-==++==----:::::::-----------=*++++++==---===*##+====----==========--==+#########
+++****#+---======+-:--=+++==-----=-:--======----:::::-------------+*++++++==---===#%*+=---==========--======+#########
=+++**#*=:----====+-:--=+++==-----=-:--===-------:::::--::--------=**+++++=+=---===#%*+=---==========--======+*###**###
=====+++---------==:---=++++==-----=---====-------:::::::::--------**+++++++=---====#%#+====----=====++==---=-+*********
=======----=-==++++:--==++++==-----=---==+=--:::::----------------=**+++++++=---====#%#+==------=----==++==---+*********
*++====------===++=:--==+++===-----==--==**=-:::::::::------------**+++++++==--=====#%#+=====---=========+++=-+#********
####**+---=======+=----=++==------==--=+*++=::::::::::::::------+**+++++++=---=====%%#+=======--======---=++=+##*******
+*####=:::----===+=---=++===------=--==++===-:::::::::::::-----=**+++=++++=---====+%@#+==---=============--===####*####
=++=+*---======++*=---=++===------=--==*++=---:::::::::::------+**++=++++==--=====*@%%*====---======-=====-===*########</span>
`};
