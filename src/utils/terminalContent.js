import { portfolioData } from '../../portfolio-data.js';
import { CALENDLY_URL, COMMAND_GROUPS, COMMAND_MANUALS, COMMAND_NAMES, EMAIL_HREF, RESUME_URL, THEMES } from '../constants/terminal.js';
import { formatBreaks, makeOutputEntry } from './terminalHelpers.js';

export function getBootEntry() {
  return makeOutputEntry(
    `Initializing Cogsworth v25.0.0...<br>` +
    `Channeling legacy of Babbage, Lovelace, Turing... OK.<br>` +
    `Parsing lineage of data... OK.<br>` +
    `Protocol established. Welcome.<br><br>` +
    `I am Cogsworth, an AI built to present the work of Puja Sridhar.<br>` +
    `Type <span class="command">'help'</span> for a list of commands, or ask me a question in plain English.<br>` +
    `Prefer a standard layout? Click the screen icon in the top-right corner to switch to Standard View.`
  );
}

export function buildHelpHtml() {
  const groups = COMMAND_GROUPS.map(
    ({ title, commands }) =>
      `<div class="skills-category-title">${title}</div>` +
      `${commands.map((command) => `<span class="command">${command}</span>`).join(', ')}`
  ).join('<br><br>');

  return (
    `${groups}` +
    `<br><br>Type <span class="command">man [command]</span> for details on any command, or <span class="command">all</span> to dump everything at once.` +
    `<br><br>You can also ask me a question, like: <i>"What are Puja's most recent projects?"</i>`
  );
}

export function buildManPageHtml(command) {
  const manual = COMMAND_MANUALS[command];

  if (!manual) {
    return (
      `<div class="skills-category-title">MANUAL NOT FOUND</div>` +
      `No manual entry for <span class="command">${command}</span>.<br>` +
      `Try <span class="command">help</span> to see the supported commands.`
    );
  }

  return (
    `<div class="skills-category-title">NAME</div>` +
    `<span class="command">${command}</span> - ${manual.summary}<br><br>` +
    `<div class="skills-category-title">SYNOPSIS</div>` +
    `<span class="command">${manual.usage}</span><br><br>` +
    `<div class="skills-category-title">DESCRIPTION</div>` +
    `${manual.description}`
  );
}

function buildAboutHtml() {
  return `<div class="skills-category-title">About Me</div>${formatBreaks(portfolioData.about)}`;
}

export function buildThemeListHtml() {
  const rows = Object.entries(THEMES)
    .map(([key, theme]) => `<span class="command">${key}</span>${'&nbsp;'.repeat(Math.max(1, 14 - key.length))}- ${theme.name}`)
    .join('<br>');

  return (
    `<div class="skills-category-title">Available Themes</div>` +
    `${rows}<br><br>` +
    `Type <span class="command">theme [name]</span> to apply. Your choice is saved across visits.`
  );
}

export function buildThemeAppliedHtml(themeKey) {
  const theme = THEMES[themeKey];
  return (
    `Theme set to <span class="command">${theme.name}</span>.<br>` +
    `Type <span class="command">theme --list</span> to see all options.`
  );
}

function buildSysHelpHtml(unknownSubcommand = '') {
  const unknownNotice = unknownSubcommand
    ? `<span class="error">Unknown sys subcommand:</span> <span class="command">${unknownSubcommand}</span><br><br>`
    : '';

  return (
    `<div class="skills-category-title">sys namespace</div>` +
    `${unknownNotice}` +
    `<span class="command">sys --alloc</span> - allocator benchmark preview<br>` +
    `<span class="command">sys --threads</span> - threading and concurrency preview<br>` +
    `<span class="command">sys --shell</span> - mini shell demo preview<br>` +
    `<span class="command">sys --status</span> - live terminal diagnostics<br><br>` +
    `Use <span class="command">man sys --alloc</span>, <span class="command">man sys --threads</span>, <span class="command">man sys --shell</span>, or <span class="command">man sys --status</span> for details.`
  );
}

function formatBytes(value) {
  if (!Number.isFinite(value)) {
    return 'unavailable';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

function formatUptime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return 'unavailable';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatConnection(connection) {
  if (!connection) {
    return 'unavailable';
  }

  const parts = [];

  if (connection.effectiveType) {
    parts.push(connection.effectiveType);
  }

  if (Number.isFinite(connection.downlink)) {
    parts.push(`${connection.downlink} Mbps`);
  }

  if (Number.isFinite(connection.rtt)) {
    parts.push(`${connection.rtt} ms RTT`);
  }

  if (connection.saveData) {
    parts.push('save-data');
  }

  return parts.length ? parts.join(' | ') : 'available, no metrics exposed';
}

export function buildDiagnosticsHtml(stats) {
  const memory = stats.memory;
  const heapLine = memory
    ? `${formatBytes(memory.usedJSHeapSize)} used / ${formatBytes(memory.totalJSHeapSize)} allocated / ${formatBytes(memory.jsHeapSizeLimit)} limit`
    : 'unavailable in this browser';
  const viewport = stats.viewport
    ? `${stats.viewport.width}x${stats.viewport.height} @ ${stats.viewport.devicePixelRatio}x`
    : 'unavailable';
  const screen = stats.screen ? `${stats.screen.width}x${stats.screen.height}` : 'unavailable';
  const timestamp = stats.timestamp instanceof Date ? stats.timestamp.toLocaleString() : 'unavailable';

  return (
    `<div class="skills-category-title">[DIAGNOSTICS]</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[cogsworth] status check requested
[sys] generated:        ${timestamp}
[sys] session uptime:   ${formatUptime(stats.uptimeSeconds)}
[sys] mode:             ${stats.mode}
[sys] theme:            ${stats.theme} (${stats.colorScheme})
[sys] active request:   ${stats.activeRequest ? 'yes' : 'no'}

[env] host:             ${stats.location?.host || 'unavailable'}
[env] protocol:         ${stats.location?.protocol || 'unavailable'}
[env] viewport:         ${viewport}
[env] screen:           ${screen}
[env] network:          ${formatConnection(stats.connection)}

[runtime] js heap:      ${heapLine}
[runtime] output rows:  ${stats.historyEntries}
[runtime] commands:     ${stats.commandHistoryEntries}

[log] no background diagnostics loop is running.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildLogHtml() {
  return (
    `<div class="skills-category-title">[SYSTEM LOG] Puja Sridhar - Career &amp; Life Events</div><pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<span class="command">[2001-06-28]</span> BOOT        Initialized. Location: Pondicherry, India.

<span class="command">[2003]</span>       MIGRATED    Bangalore. Age 2. Didn't choose it.
                         Grew up on gojju avalaki, pineapple gojju,
                         mudde saru, and the kind of Bangalore sweet
                         sambar that ruins all other sambar forever.    

<span class="command">[2019-09-01]</span> ENROLLED    B.E. in Computer Science. Bangalore.
                         First line of code. First all-nighter.
                         First "why does this work, I changed nothing."

<span class="command">[2023-02-01]</span> DEPLOYED    AI Co-pilot Developer @ HumanFractal.ai, Resolute
                         Shipped to production.

<span class="command">[2023-05-31]</span> SUCCESS     Built AI co-pilot systems that actually worked.
                         Shipped to production. Then shipped myself out.

<span class="command">[2024-01-01]</span> MIGRATED    New Brunswick, NJ, USA. Masters in CS @ Rutgers.
                         Left behind the weather I liked.
                         Brought the work ethic.

<span class="command">[2024-09-01]</span> TEACHING    Graduate Teaching Assistant @ Rutgers
                         OOP — 60 students
                         Data Management &amp; Curation — 30 students
                         Intro to AI — 60 students

                         
<span class="command">[2025-07-01]</span> DEPLOYED    AI Engineering Intern @ Pennant Education
                         
<span class="command">[2025-09-30]</span> COMPLETE    Shipped AI features that went into real hands.
                         
<span class="command">[2025-12-01]</span> CLOSED      TA role complete. 150 students, done.

<span class="command">[2026-01-06]</span> MILESTONE   MS in Computer Science. Conferred. Done.

<span class="command">[2026-06-01]</span> MIGRATED    San Jose, CA. Already here.

<span class="command">[2026-06-13]</span> RELEASED    v25.0.0 live.
                         Status: actively seeking first full-time role.

<span class="command">[ACTIVE PROCESSES]</span>
◉ Biking           — wind in hair, zero traffic excuses
◉ Chess            — I will out-think you and be nice about it
◉ Baking           — the only pipeline I tune by smell
◉ Cooking          — Karnataka base. pineapple gojju on a Tuesday. no rules.
◉ Ultimate Frisbee — surprisingly aggressive for my height
◉ Basketball       — chaos on the court, structured off it
◉ Painting         — the original no-code project
◉ Embroidery       — precision work. patience loaded.
◉ Gardening        — I grow things. plants and codebases.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildVersionHtml() {
  return (
    `<div class="skills-category-title">COGSWORTH PROTOCOL - System Version</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Version:        25.0.0
  Status:         stable. took a minute. worth it.

  Operator:       Puja Sridhar
  Origin:         Pondicherry → Bangalore → New Brunswick, NJ
  Current node:   San Jose, CA

  Core modules:
    <span style="color:var(--color-accent);">◉ AI/ML Engineering      [ACTIVE]</span>
    <span style="color:var(--color-accent);">◉ Data Engineering       [LEARNING + SHIPPING]</span>
    <span style="color:var(--color-accent);">◉ Teaching &amp; Mentoring   [150 students. all survived.]</span>
    <span style="color:var(--color-accent);">◉ Distributed Systems    [IN PROGRESS - ask me in 6 months]</span>
    <span style="color:var(--color-accent);">◉ Pushups                [NEW. non-negotiable.]</span>
    <span style="color:var(--color-accent);">◉ Caffeine independence  [somehow achieved]</span>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Type <span style="color:var(--color-accent);">'decisions'</span> to see the engineering tradeoffs behind the work.
  Type <span style="color:var(--color-accent);">'diff'</span> to compare v24 and v25.
  Type <span style="color:var(--color-accent);">'patch notes'</span> for the release notes.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildAvailabilityHtml() {
  return (
    `<div class="skills-category-title">Availability</div>` +
    `Open to <span class="command">SWE</span>, <span class="command">AI</span>, and <span class="command">Data Engineering</span> roles.<br>` +
    `Location: <span class="command">San Jose, CA</span> - open to remote<br>` +
    `Start date: <span class="command">available immediately</span>`
  );
}

function buildEducationHtml() {
  const items = portfolioData.education
    .map(
      (education) =>
        `<span class="command">${education.school}</span><br>${education.degree}<br><i>${education.details}</i>`
    )
    .join('<br><br>');

  return `<div class="skills-category-title">Education</div>${items}`;
}

function buildExperienceHtml() {
  const items = portfolioData.experience
    .map(
      (experience) =>
        `<span class="command">${experience.role}</span> @ ${experience.company} (${experience.period})<br>` +
        experience.desc.map((point) => `- ${point}`).join('<br>')
    )
    .join('<br><br>');

  return `<div class="skills-category-title">Experience</div>${items}`;
}

const FEATURED_PROJECTS = {
  posthog: {
    name: 'PostHog Engineering Impact Dashboard',
    tagline: 'Production data pipeline: GitHub API → Airflow → dbt → FastAPI → Redis → React',
    tech: 'Python · Airflow · dbt · PostgreSQL · FastAPI · Redis · React · Vercel',
    github: 'https://github.com/PujaSridhar/posthog-impact-dashboard',
    live: 'https://posthog-impact-dashboard-pujasridhar2001.vercel.app/',
    pipeline: [
      'Airflow DAG extracts commits, PRs, reviews, issues from GitHub REST API daily at 2am UTC',
      'Raw data lands in PostgreSQL bronze layer (raw schema)',
      'dbt runs 6 models: 4 staging views (silver) + 2 mart tables (gold) — fct_engineer_impact and fct_engineer_weekly_trends',
      'FastAPI serves /api/leaderboard, /api/trends/:login, /api/team-summary, /api/pipeline-status',
      'Redis caches all endpoints with 5-min TTL, X-Cache HIT/MISS headers on every response',
      'React dashboard with recharts — leaderboard, trend charts, DNA score bars, badge logic',
    ],
    highlight: 'Impact score formula: PRs×8 + Changes Requested×4 + Reviews×3 + Issues×2 + Commits×1 + Approvals×1',
    screenshots: ['/projects/posthog/posthog.png', '/projects/posthog/posthog1.png', '/projects/posthog/posthog2.png'],
  },
  locallens: {
    name: 'LocalLens',
    tagline: 'Vibe-first city discovery — find places by atmosphere, not category',
    tech: 'FastAPI · React · Groq · Google Places API · Foursquare · WalkScore',
    github: 'https://github.com/PujaSridhar/LocalLens',
    live: 'https://local-lens-six.vercel.app/',
    pipeline: [
      'User submits a natural language query: "cozy indie cafe to work from near Alfama in Lisbon"',
      'Stage 1 — Groq LLM parses intent: extracts location, vibe keywords, venue category',
      'Stage 2 — Google Places API fetches real, live businesses at the parsed coordinates',
      'Stage 3 — Foursquare adds category depth; WalkScore adds walkability context',
      'Stage 4 — Groq agent scores each venue against the vibe, ranks them, generates a neighborhood snapshot',
      'React frontend renders curated shortlist + synthesized area summary',
    ],
    highlight: '4-stage agentic pipeline — no static data, all live API calls, real vibe matching',
    screenshots: ['/projects/locallens/localLens.png', '/projects/locallens/localLens1.png'],
  },
  lexai: {
    name: 'LexAI',
    tagline: 'Automated contract intelligence — 5-agent pipeline, 15–25 second full analysis',
    tech: 'Gemini 2.5 Flash · Vercel Serverless · React 18 (CDN) · Node.js',
    github: 'https://github.com/PujaSridhar/Lexai',
    live: 'https://lexai-gem.vercel.app/',
    pipeline: [
      'User uploads a PDF contract or pastes plain text',
      'Agent 1 (Triage) — classifies contract type: NDA, SaaS, Employment, etc.',
      'Agent 2 (Summary) — distills core obligations, parties, deadlines',
      'Agents 3 & 4 run in parallel — Clause Analyzer grades Fairness/Clarity/Completeness/Enforceability; Red Flag Detector hunts predatory terms',
      'Agent 5 (Negotiation) — generates counter-proposals and specific wording to use',
      'Report Engine compiles all agent outputs into a dashboard + downloadable HTML report',
    ],
    highlight:
      'Parallel agent execution (stages 3+4) cuts analysis time — full pipeline in 15–25s. Secure API key proxy via Vercel serverless.',
    screenshots: ['/projects/lexai/lexai.png', '/projects/lexai/lexai1.png'],
  },
  'neighborhood-watch': {
    name: 'AI Neighborhood Watch',
    tagline: 'Community safety platform with AI categorization and a two-voice podcast briefing',
    tech: 'Flask · PostgreSQL · Gemini · ElevenLabs · Leaflet.js · Tailwind · pydub',
    github: 'https://github.com/PujaSridhar/ai-neighborhood-watch',
    live: 'https://ai-neighborhood-watch.vercel.app/',
    pipeline: [
      'Neighbor submits an incident report via the Leaflet map interface',
      'Flask backend sends the text to Gemini, which auto-assigns a structured safety category',
      'Report stored in PostgreSQL with coordinates, timestamp, and AI-generated category tag',
      'Map renders color-coded markers by category for all users in real time',
      'Daily briefing endpoint: Gemini generates a two-character dialogue script (Ava + Mateo)',
      'ElevenLabs synthesizes separate voice segments; pydub stitches them into a broadcast-ready MP3',
    ],
    highlight:
      'Custom audio stitching pipeline with automatic single-voice fallback if a voice profile fails. X-Podcast-Hosts header drives avatar display on the frontend.',
    screenshots: ['/projects/neighborhood-watch/aineighborhood.png'],
  },
  'smart-doc-finder': {
    name: 'Smart Doc Finder',
    tagline: 'AI-powered semantic document search — find files by meaning, not keywords',
    tech: 'Python · Redis (Streams + Vector DB + Semantic Cache) · MongoDB · React · Docker',
    github: 'https://github.com/krshsl/smart-doc-finder',
    live: null,
    pipeline: [
      'Redis Streams monitors a document directory and catches new uploads the moment they arrive',
      'Python backend chunks files >4MB into contextual blocks to avoid API payload limits',
      'Each chunk is embedded via an AI model and stored in Redis Cloud Vector Search',
      'Document metadata (filename, timestamp, permissions) stored in MongoDB',
      'User types a natural language query in the React frontend',
      'Semantic cache checked first — if similar prompt was recent, returns instantly without recomputing',
      'Otherwise: query embedded → vector similarity match in Redis → results merged with MongoDB metadata → ranked list returned',
    ],
    highlight: 'Redis doing 3 jobs simultaneously: event streaming, vector database, and semantic cache — all in one service.',
    screenshots: ['/projects/smart-doc-finder/smartdoc.png', '/projects/smart-doc-finder/smartdoc1.png', '/projects/smart-doc-finder/smartdoc2.png', '/projects/smart-doc-finder/smartdoc3.png'],
  },
};

const OTHER_PROJECTS = {
  'systems-sandbox': {
    name: 'Systems Sandbox (sys namespace)',
    tagline: 'Low-level systems demos compiled to WASM and embedded live in the terminal',
    tech: 'C, WebAssembly, Emscripten, React',
    github: 'https://github.com/PujaSridhar/PujaSridhar.github.io',
    live: null,
    pipeline: [
      'Free-list malloc/free implementation backed by a static heap, with coalescing on free',
      'Mini shell supporting pipes, redirection, and a virtual filesystem',
      'Round-robin thread scheduler with deadlock visualization',
      'Each demo compiled with Emscripten (STANDALONE_WASM) and runs in-browser with a JS fallback',
    ],
    highlight: 'Type sys --alloc, sys --shell, or sys --threads to run these demos directly.',
  },
};

const ALL_PROJECTS = { ...FEATURED_PROJECTS, ...OTHER_PROJECTS };

function buildProjectsHtml() {
  const featured = Object.entries(FEATURED_PROJECTS)
    .map(([key, project]) => `<span class="command">projects ${key}</span><br>${project.tagline}`)
    .join('<br><br>');

  const other = portfolioData.projects
    .filter((project) => !project.featured)
    .map((project) => {
      const resultLine = project.desc.find((line) => line.startsWith('<strong>Result:</strong>')) || project.desc[0];
      const tagline = resultLine.replace(/<[^>]*>/g, '').trim();
      return `<span class="command">projects ${project.slug}</span><br>${tagline}`;
    })
    .join('<br><br>');

  return (
    `<div class="skills-category-title">Featured Projects</div>` +
    `${featured}<br><br>` +
    `<div class="skills-category-title">Other Work</div>` +
    `${other}<br><br>` +
    `Type <span class="command">projects [name]</span> for the full breakdown, stack, and live demo link.`
  );
}

function buildProjectDetailHtml(name) {
  const project = ALL_PROJECTS[name];
  if (project) {
    const pipelineSteps = project.pipeline
      .map((step, index) => `  <span class="command">[${index + 1}]</span> ${step}`)
      .join('<br>');

    const demoLine = project.live
      ? `Demo:   <a href="${project.live}" target="_blank" rel="noreferrer" class="link">${project.live}</a>`
      : 'Demo:   coming soon';

    const screenshotsHtml = project.screenshots?.length
      ? `<br><br><span class="command">Screenshots</span><br>` +
        `<div class="project-screenshots">${project.screenshots.map((src) => `<img src="${src}" alt="" class="project-screenshot" loading="lazy">`).join('')}</div>`
      : '';

    return (
      `<div class="skills-category-title">${project.name}</div>` +
      `<i>${project.tagline}</i><br><br>` +
      `<span class="command">Stack</span><br>${project.tech}<br><br>` +
      `<span class="command">Pipeline</span><br>${pipelineSteps}<br><br>` +
      `<span class="command">★</span> ${project.highlight}<br><br>` +
      `GitHub: <a href="${project.github}" target="_blank" rel="noreferrer" class="link">${project.github}</a><br>` +
      `${demoLine}` +
      screenshotsHtml
    );
  }

  const archived = portfolioData.projects.find((entry) => entry.slug === name && !entry.featured);
  if (archived) {
    return (
      `<div class="skills-category-title">${archived.name}</div>` +
      `<i>${archived.date}</i><br><br>` +
      `<span class="command">Stack</span><br>${archived.tech}<br><br>` +
      `${archived.desc.join('<br>')}<br><br>` +
      `GitHub: <a href="${archived.url}" target="_blank" rel="noreferrer" class="link">${archived.url}</a>`
    );
  }

  const available = [
    ...Object.keys(FEATURED_PROJECTS),
    ...portfolioData.projects.filter((entry) => !entry.featured).map((entry) => entry.slug),
  ].join(', ');
  return (
    `<span class="error">Project not found:</span> <span class="command">${name}</span><br>` +
    `Available: ${available}<br>` +
    `Type <span class="command">projects</span> for the full list.`
  );
}

function buildSkillsHtml() {
  let html = '<div class="skills-container"><div class="skills-category-title">Skills</div>';

  Object.entries(portfolioData.skills).forEach(([category, skills]) => {
    html += `<div class="skills-subcategory-title">${category}</div>`;
    html += '<div class="skills-grid">';
    skills.forEach((skill) => {
      html += `<div class="skill-box">${skill}</div>`;
    });
    html += '</div>';
  });

  html += '</div>';
  return html;
}

function buildLanguagesHtml() {
  const items = portfolioData.languages
    .map((language) => `<span class="command">${language.lang}:</span> ${language.proficiency}`)
    .join('<br>');

  return `<div class="skills-category-title">Languages</div>${items}`;
}

function buildCertificationsHtml() {
  const items = portfolioData.certifications
    .map((certification) => {
      const name = `<span class="command">${certification.name}</span>`;
      if (certification.url) {
        return `<a href="${certification.url}" class="link">${name}</a> - ${certification.issuer}`;
      }

      return `${name} - ${certification.issuer}`;
    })
    .join('<br><br>');

  return `<div class="skills-category-title">Certifications</div>${items}`;
}

function buildHackathonsHtml() {
  const items = portfolioData.hackathons
    .map(
      (h) =>
        `<span class="command">${h.name}</span> <span class="dim">${h.date} · ${h.team}</span><br>${h.desc}<br><a href="${h.url}" class="link" target="_blank" rel="noreferrer">GitHub →</a>`
    )
    .join('<br><br>');

  return `<div class="skills-category-title">Hackathons</div>${items}`;
}

function buildTalksHtml() {
  const items = portfolioData.talks
    .map((talk) => `<span class="command">"${talk.title}"</span><br><i>Presented at ${talk.venue}, ${talk.date}</i>`)
    .join('<br><br>');

  return `<div class="skills-category-title">Talks & Lectures</div>${items}`;
}

function buildLeadershipHtml() {
  const items = portfolioData.leadership
    .map(
      (role) =>
        `<span class="command">${role.role}</span> | ${role.org} (${role.period})<br>` +
        role.points.map((point) => `- ${point}`).join('<br>')
    )
    .join('<br><br>');

  return `<div class="skills-category-title">Leadership</div>${items}`;
}

function buildResumeHtml() {
  return (
    `<div class="skills-category-title">Resume</div>` +
    `Access my full resume here: <a href="${RESUME_URL}" class="link">PujaSridhar_Resume.pdf</a>`
  );
}

function buildContactHtml() {
  return (
    `<div class="skills-category-title">Contact</div>` +
    `Email: <a href="${EMAIL_HREF}" class="link">${portfolioData.contact.email}</a><br>` +
    `LinkedIn: <a href="${portfolioData.contact.linkedin}" class="link">${portfolioData.contact.linkedin}</a><br>` +
    `GitHub: <a href="${portfolioData.contact.github}" class="link">${portfolioData.contact.github}</a><br>` +
    `Schedule: <a href="${CALENDLY_URL}" target="_blank" rel="noreferrer" class="link">${CALENDLY_URL}</a>`
  );
}

function buildSudoHireHtml() {
  return (
    `<div class="skills-category-title">sudo hire</div>` +
    `MS in Computer Science, Rutgers (Jan 2026). Background in AI/ML engineering with production experience across data pipelines, agentic systems, and systems programming.<br><br>` +
    `Built: free-list allocator in C → WASM (Emscripten, STANDALONE_WASM, static heap). Production Airflow + dbt + FastAPI data pipeline. 4-stage agentic venue discovery system. 5-agent parallel contract analysis pipeline.<br><br>` +
    `Open to: SWE · AI Engineering · Data Engineering · ML Engineering<br>` +
    `Location: San Jose, CA — open to remote<br><br>` +
    `Resume: <a href="${RESUME_URL}" target="_blank" rel="noreferrer" class="link">PujaSridhar_Resume.pdf</a><br>` +
    `Calendly: <a href="${CALENDLY_URL}" target="_blank" rel="noreferrer" class="link">Book time with me</a>`
  );
}

function buildDiffHtml() {
  return (
    `<div class="skills-category-title">Diff: v24 → v25</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Academic A* / NLP coursework projects from 2022-2024
+ Production systems: PostHog dashboard, LocalLens, LexAI,
  AI Neighborhood Watch, Smart Doc Finder
+ Live WASM systems demos (allocator, shell, thread scheduler)
  compiled from C, embedded directly in the terminal
+ Migrated to React 19 + Vite, rebuilt the terminal UI from scratch
+ Added Cogsworth, a RAG-grounded assistant that answers questions
  about this portfolio instead of just rendering static text
+ Relocated from the East Coast to San Jose, CA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>` +
    `At 24, I was optimizing for proof. At 25, I’m optimizing for clarity. The work is still ambitious, but now I care more about what a stranger can trust in the first thirty seconds than what sounds impressive on a slide. That change made the portfolio feel quieter, more honest, and a lot more like me.`
  );
}

function buildPatchNotesHtml() {
  return (
    `<div class="skills-category-title">v25.0.0 Patch Notes</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
v25.0.0 — Quarter Century Deploy (June 2026)
  ADDED:   san_jose.env — relocated cross-country
  ADDED:   WASM systems demos — proof of low-level work
  ADDED:   RAG pipeline on Cogsworth — grounded AI, not hallucination
  REMOVED: imposter_syndrome.exe — deprecated after 25 years of evidence
  KNOWN BUGS: still makes chai too strong
              occasionally over-engineers the solution
              cannot stop adding features to this portfolio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildDecisionsHtml() {
  return (
    `<div class="skills-category-title">Engineering Decisions</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are real tradeoffs made during implementation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<span class="command">[1] WASM allocator: static heap instead of mmap</span>

    WASM has no virtual memory. mmap doesn't exist in a
    STANDALONE_WASM build without POSIX emulation.
    Options: use Emscripten's full JS glue (adds ~100KB, requires
    a loader), or back the free-list with a static char array.
    Chose static array — same free-list semantics, zero runtime
    dependencies, loads directly with WebAssembly.instantiateStreaming.
    Tradeoff: fixed 1MB ceiling. Acceptable for a demo allocator;
    a production allocator would need a growth strategy.

<span class="command">[2] WASM build: STANDALONE_WASM + --no-entry vs default Emscripten</span>

    Default Emscripten output is a .wasm + .js glue pair.
    The JS glue handles memory setup, imports, and exports but
    adds a loading dependency that breaks on GitHub Pages without
    extra Vite config. STANDALONE_WASM=1 + --no-entry produces a
    single .wasm file with no JS glue. The JS side handles
    WebAssembly.instantiateStreaming directly, with a fallback to
    ArrayBuffer instantiation for browsers that block streaming.
    Tradeoff: manual memory pointer arithmetic in JS, but full
    control and zero extra files in the build.

<span class="command">[3] WASM timing: performance.now() on JS side, not clock_gettime in C</span>

    clock_gettime is a POSIX syscall. In STANDALONE_WASM it's
    either unavailable or requires a WASI import that adds
    complexity. performance.now() in the browser has sub-ms
    resolution and is available without any WASM imports.
    The benchmark function returns op count, not elapsed time —
    JS divides elapsed ms by ops to get ns/op. This is actually
    more accurate than in-WASM timing because it measures the
    full round-trip including JS→WASM call overhead.

<span class="command">[4] Airflow DAG: trigger_rule="all_done" on log task</span>

    Default Airflow trigger rule is "all_success" — if any
    upstream task fails, downstream tasks are skipped. For the
    pipeline_run logging task, skipping on failure is the worst
    outcome: you lose the failure record entirely. trigger_rule=
    "all_done" fires regardless of upstream state, so every run
    (success or partial failure) gets logged with accurate status
    and error details. The log task itself reads XCom counts and
    task states to determine final status.

<span class="command">[5] PostHog API: SQL in FastAPI vs reading from dbt mart tables</span>

    Two options: run ad-hoc SQL in FastAPI endpoints (flexible,
    no dbt dependency at query time), or read from pre-computed
    mart tables (fast reads, complexity in dbt layer).
    Used both deliberately. /api/leaderboard reads from raw schema
    with its own CTEs because it needs time-window filtering
    (?days=) that dbt's static tables don't support. The dbt mart
    tables (fct_engineer_impact) exist for the base case and as
    the source of truth for the impact formula. Redis caches both
    paths with SHA-256 keyed cache entries so the time-window
    params are part of the cache key.

<span class="command">[6] LexAI: parallel agent execution for stages 3+4</span>

    Sequential 5-agent pipeline would serialize all API calls.
    Clause analysis and red flag detection are independent —
    neither needs the other's output. Running them in parallel
    against Gemini cuts wall-clock time by roughly the duration
    of one of those calls. The Negotiation agent (stage 5) needs
    both outputs, so it waits on the parallel pair. This is a
    fork-join pattern: fan out where dependencies allow, rejoin
    before the next dependent stage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildAllHtml() {
  return [
    buildAboutHtml(),
    buildLogHtml(),
    buildVersionHtml(),
    buildDecisionsHtml(),
    buildEducationHtml(),
    buildExperienceHtml(),
    buildProjectsHtml(),
    buildSkillsHtml(),
    buildLanguagesHtml(),
    buildCertificationsHtml(),
    buildTalksHtml(),
    buildLeadershipHtml(),
    buildResumeHtml(),
    buildContactHtml(),
  ].join('<br><br>');
}

export function getCommandEntries(command) {
  if (command.startsWith('projects ')) {
    return [makeOutputEntry(buildProjectDetailHtml(command.slice('projects '.length).trim()))];
  }

  switch (command) {
    case 'cogsworth --version':
      return [makeOutputEntry(buildVersionHtml())];
    case 'availability':
      return [makeOutputEntry(buildAvailabilityHtml())];
    case 'diff':
      return [makeOutputEntry(buildDiffHtml())];
    case 'patch notes':
      return [makeOutputEntry(buildPatchNotesHtml())];
    case 'sys --help':
      return [makeOutputEntry(buildSysHelpHtml())];
    case 'diagnostics':
      return [
        makeOutputEntry(
          `<div class="skills-category-title">[DIAGNOSTICS]</div>` +
            `Run <span class="command">diagnostics</span> or <span class="command">sys --status</span> in the terminal for live runtime stats.`
        ),
      ];
    case 'help':
      return [makeOutputEntry(buildHelpHtml())];
    case 'about':
      return [makeOutputEntry(buildAboutHtml())];
    case 'log':
      return [makeOutputEntry(buildLogHtml())];
    case 'education':
      return [makeOutputEntry(buildEducationHtml())];
    case 'experience':
      return [makeOutputEntry(buildExperienceHtml())];
    case 'projects':
      return [makeOutputEntry(buildProjectsHtml())];
    case 'skills':
      return [makeOutputEntry(buildSkillsHtml())];
    case 'languages':
      return [makeOutputEntry(buildLanguagesHtml())];
    case 'certifications':
      return [makeOutputEntry(buildCertificationsHtml())];
    case 'hackathons':
      return [makeOutputEntry(buildHackathonsHtml())];
    case 'talks':
      return [makeOutputEntry(buildTalksHtml())];
    case 'leadership':
      return [makeOutputEntry(buildLeadershipHtml())];
    case 'resume':
      return [makeOutputEntry(buildResumeHtml())];
    case 'contact':
      return [makeOutputEntry(buildContactHtml())];
    case 'contact --schedule':
      return [
        makeOutputEntry(
          `<div class="skills-category-title">Schedule</div>` +
            `Book time here: <a href="${CALENDLY_URL}" target="_blank" rel="noreferrer" class="link">${CALENDLY_URL}</a>`
        ),
      ];
    case 'creator':
      return [makeOutputEntry(
        `<div class="creator-portrait-wrapper">` +
          `<img src="/headshot.png" alt="Puja Sridhar" class="creator-portrait">` +
          `<div class="creator-caption">Puja Sridhar — Software &amp; AI Engineer</div>` +
        `</div>`
      )];
    case 'sudo hire':
      return [makeOutputEntry(buildSudoHireHtml())];
    case 'decisions':
      return [makeOutputEntry(buildDecisionsHtml())];
    case 'all':
      return [makeOutputEntry(buildAllHtml())];
    case 'clear':
      return [getBootEntry()];
    default:
      if (command.startsWith('sys')) {
        return [makeOutputEntry(buildSysHelpHtml(command.slice(4).trim() || 'sys'))];
      }
      if (command.startsWith('projects ')) {
        return [makeOutputEntry(buildProjectDetailHtml(command.slice(9).trim()))];
      }
      return null;
  }
}
