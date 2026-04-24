import { useEffect, useRef, useState } from 'react';
import { portfolioData } from '../portfolio-data.js';

const PROMPT_TEXT = 'Cogsworth@linux ~ % ';
const RESUME_URL = 'https://drive.google.com/file/d/1XrZ5vb9nad2WnyswQOYPBe3D7speSn6T/view?usp=sharing';
const EMAIL_HREF = 'mailto:pujasridhar28@gmail.com?subject=Connecting%20with%20you%20via%20portfolio&body=Hi%20Puja,%0A%0AI%20came%20across%20your%20portfolio%20and%20wished%20to%20reach%20out.%0A%0APlease%20let%20me%20know%20a%20convenient%20time%20to%20connect.%0A%20Sincerely,%0A%20[Your%20Name]';
const COMMAND_NAMES = [
  'help',
  'man',
  'about',
  'education',
  'experience',
  'projects',
  'skills',
  'languages',
  'certifications',
  'talks',
  'leadership',
  'resume',
  'contact',
  'creator',
  'all',
  'clear',
];

const COMMAND_MANUALS = {
  help: {
    summary: 'Show available commands and usage guidance.',
    usage: 'help',
    description:
      'Lists the built-in terminal commands and reminds visitors that they can also ask natural-language questions.',
  },
  man: {
    summary: 'Display a manual page for a built-in command.',
    usage: 'man [command]',
    description:
      'Opens a Unix-style manual page with the command summary, usage, and behavior. Example: man projects',
  },
  about: {
    summary: 'Print the personal background section.',
    usage: 'about',
    description: 'Shows Puja Sridhar’s story, interests, and current academic direction.',
  },
  education: {
    summary: 'Show academic history.',
    usage: 'education',
    description: 'Prints degree, school, graduation, and GPA details.',
  },
  experience: {
    summary: 'Show professional experience.',
    usage: 'experience',
    description: 'Lists internships, teaching roles, and day-to-day impact across positions.',
  },
  projects: {
    summary: 'Show featured projects.',
    usage: 'projects',
    description: 'Prints selected projects, tech stacks, and links to source material.',
  },
  skills: {
    summary: 'Show technical skill categories.',
    usage: 'skills',
    description: 'Displays grouped skills across languages, frameworks, tools, and domains.',
  },
  languages: {
    summary: 'Show spoken languages.',
    usage: 'languages',
    description: 'Prints language fluency information.',
  },
  certifications: {
    summary: 'Show certifications and credentials.',
    usage: 'certifications',
    description: 'Lists certifications with issuers and links where available.',
  },
  talks: {
    summary: 'Show talks and presentations.',
    usage: 'talks',
    description: 'Prints speaking engagements, lecture topics, and venues.',
  },
  leadership: {
    summary: 'Show leadership roles.',
    usage: 'leadership',
    description: 'Lists organizations, roles, and measurable leadership contributions.',
  },
  resume: {
    summary: 'Open the latest resume.',
    usage: 'resume',
    description: 'Shows a direct link to the current hosted PDF resume.',
  },
  contact: {
    summary: 'Show contact links.',
    usage: 'contact',
    description: 'Prints email, LinkedIn, and GitHub contact paths.',
  },
  creator: {
    summary: 'Show the signature ASCII creator card.',
    usage: 'creator',
    description: 'Renders the portfolio’s ASCII art easter egg.',
  },
  all: {
    summary: 'Print all portfolio sections in sequence.',
    usage: 'all',
    description: 'Outputs the full portfolio content as one long terminal session.',
  },
  clear: {
    summary: 'Clear the terminal output and reboot the shell.',
    usage: 'clear',
    description: 'Resets terminal history and restarts the boot message.',
  },
};

function formatBreaks(text) {
  return text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<span class="command">$1</span>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

function makeOutputEntry(html) {
  return { id: crypto.randomUUID(), type: 'output', html };
}

function makeCommandEntry(text) {
  return { id: crypto.randomUUID(), type: 'command', text };
}

function getBootEntry() {
  return makeOutputEntry(
    `Initializing Cogsworth v1.0...<br>` +
      `Channeling legacy of Babbage, Lovelace, Turing... OK.<br>` +
      `Parsing lineage of data... OK.<br>` +
      `Protocol established. Welcome.<br><br>` +
      `I am Cogsworth, an AI built to present the work of Puja Sridhar.<br>` +
      `Type <span class="command">'help'</span> for a list of commands, or ask me a question in plain English.`
  );
}

function buildHelpHtml() {
  return (
    `Available commands:<br>${COMMAND_NAMES.map((command) => `<span class="command">${command}</span>`).join(', ')}` +
    `<br><br>You can also ask me a question, like: <i>"What are her most recent projects?"</i>`
  );
}

function buildManPageHtml(command) {
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

function buildProjectsHtml() {
  const items = portfolioData.projects
    .map(
      (project) =>
        `<span class="command">${project.name}</span><br>` +
        `Tech: ${project.tech}<br>` +
        project.desc.map((point) => `- ${point}`).join('<br>') +
        `<br><a href="${project.url}" target="_blank" rel="noreferrer" class="link">View on GitHub -></a>`
    )
    .join('<br><br>');

  return `<div class="skills-category-title">Projects</div>${items}`;
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
    `GitHub: <a href="${portfolioData.contact.github}" class="link">${portfolioData.contact.github}</a>`
  );
}

function buildAllHtml() {
  return [
    buildAboutHtml(),
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

function getCommandEntries(command) {
  switch (command) {
    case 'help':
      return [makeOutputEntry(buildHelpHtml())];
    case 'about':
      return [makeOutputEntry(buildAboutHtml())];
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
    case 'talks':
      return [makeOutputEntry(buildTalksHtml())];
    case 'leadership':
      return [makeOutputEntry(buildLeadershipHtml())];
    case 'resume':
      return [makeOutputEntry(buildResumeHtml())];
    case 'contact':
      return [makeOutputEntry(buildContactHtml())];
    case 'creator':
      return [makeOutputEntry(`<div class="ascii-art">${portfolioData.creatorArt}</div>`)];
    case 'all':
      return [makeOutputEntry(buildAllHtml())];
    case 'clear':
      return [getBootEntry()];
    default:
      return null;
  }
}

function TerminalEntry({ entry }) {
  if (entry.type === 'command') {
    return (
      <div className="output-entry">
        <div className="prompt-line-wrapper">
          <span className="prompt-live text-lg">{PROMPT_TEXT}</span>
          <span className="command text-lg" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {entry.text}
          </span>
        </div>
      </div>
    );
  }

  return <div className="output-entry" dangerouslySetInnerHTML={{ __html: entry.html }} />;
}

function SocialIcons({ darkMode, onToggleTheme, onToggleView, terminalMode }) {
  return (
    <div id="contact-icons">
      <button type="button" id="theme-toggle-button" className="icon-button" title="Toggle Theme" onClick={onToggleTheme}>
        <svg
          id="sun-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: darkMode ? 'none' : 'block' }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          id="moon-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: darkMode ? 'block' : 'none' }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <a href={EMAIL_HREF} title="Email">
        <svg viewBox="0 0 24 24">
          <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z" />
        </svg>
      </a>

      <a href="https://www.linkedin.com/in/pujasridhar/" title="LinkedIn">
        <svg viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75 .79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>

      <a href="https://github.com/pujasridhar" title="GitHub">
        <svg viewBox="0 0 25 25">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.72c0 .27.18.58.69.48A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z" />
        </svg>
      </a>

      <a href={RESUME_URL} title="Resume">
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        </svg>
      </a>

      <button
        type="button"
        id="gui-toggle-button"
        className="icon-button"
        title={terminalMode ? 'Switch to Standard View' : 'Switch to Terminal View'}
        onClick={onToggleView}
      >
        <svg
          id="gui-icon-standard"
          className="icon-button -ml-1.5"
          style={{ display: terminalMode ? 'block' : 'none' }}
          viewBox="0 0 240 330"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g stroke="currentColor" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="12" y="12" width="216" height="306" rx="20" ry="20" />
            <circle cx="120" cy="125" r="72" />
            <circle cx="120" cy="105" r="22" />
            <clipPath id="clip-upper" clipPathUnits="userSpaceOnUse">
              <rect x="0" y="0" width="240" height="175" />
            </clipPath>
            <g clipPath="url(#clip-upper)">
              <circle cx="120" cy="182" r="49" />
            </g>
            <line x1="50" y1="235" x2="106" y2="235" />
            <line x1="134" y1="235" x2="190" y2="235" />
            <line x1="96" y1="270" x2="184" y2="270" />
          </g>
        </svg>

        <svg
          id="gui-icon-terminal"
          style={{ display: terminalMode ? 'none' : 'block' }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </button>
    </div>
  );
}

function GuiView({ activeTab, onTabChange, footerHtml }) {
  const tabs = ['About', 'Experience', 'Projects', 'Skills', 'Education', 'Leadership', 'Certifications'];

  return (
    <div id="gui-mode" className="w-full rounded-lg shadow-2xl shadow-stone-500/20 p-8 overflow-y-auto" style={{ display: 'block' }}>
      <div className="gui-tabs-nav">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="gui-tabs-content">
        {activeTab === 'About' && (
          <div className="tab-content active">
            <p dangerouslySetInnerHTML={{ __html: formatBreaks(portfolioData.about) }} />
          </div>
        )}

        {activeTab === 'Experience' && (
          <div className="tab-content active">
            {portfolioData.experience.map((experience) => (
              <div key={`${experience.role}-${experience.company}`} className="gui-item">
                <div className="gui-item-title">
                  {experience.role} @ {experience.company} ({experience.period})
                </div>
                <ul>
                  {experience.desc.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Projects' && (
          <div className="tab-content active">
            {portfolioData.projects.map((project) => (
              <div key={project.name} className="gui-item">
                <div className="gui-item-title">
                  {project.name} <span className="text-sm">({project.tech})</span>
                </div>
                <ul>
                  {project.desc.map((point, index) => (
                    <li key={`${project.name}-${index}`} dangerouslySetInnerHTML={{ __html: point }} />
                  ))}
                </ul>
                <a href={project.url} target="_blank" rel="noreferrer" className="link">
                  View on GitHub -&gt;
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Skills' && (
          <div className="tab-content active">
            {Object.entries(portfolioData.skills).map(([category, skills]) => (
              <div key={category}>
                <div className="skills-subcategory-title">{category}</div>
                <div className="skills-grid">
                  {skills.map((skill) => (
                    <div key={skill} className="skill-box">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Education' && (
          <div className="tab-content active">
            {portfolioData.education.map((education) => (
              <div key={education.school} className="gui-item">
                <div className="gui-item-title">{education.school}</div>
                <div>{education.degree}</div>
                <i>{education.details}</i>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Leadership' && (
          <div className="tab-content active">
            {portfolioData.leadership.map((role) => (
              <div key={`${role.role}-${role.org}`} className="gui-item">
                <div className="gui-item-title">
                  {role.role} | {role.org} ({role.period})
                </div>
                <ul>
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Certifications' && (
          <div className="tab-content active">
            {portfolioData.certifications.map((certification) => (
              <div key={certification.name} className="gui-item">
                {certification.url ? (
                  <a href={certification.url} className="link">
                    <span className="gui-item-title">{certification.name}</span>
                  </a>
                ) : (
                  <span className="gui-item-title">{certification.name}</span>
                )}
                <span> - {certification.issuer}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="gui-footer" dangerouslySetInnerHTML={{ __html: footerHtml }} />
    </div>
  );
}

export default function App() {
  const [terminalHistory, setTerminalHistory] = useState(() => [getBootEntry()]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());
  const [weatherText, setWeatherText] = useState('--°F');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [terminalMode, setTerminalMode] = useState(true);
  const [activeTab, setActiveTab] = useState('About');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef({ context: null, ready: false });
  const conversationHistoryRef = useRef([]);
  const activeRequestRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const footerHtml = `&copy; ${currentYear} Puja Sridhar. All rights reserved. | <a href="${RESUME_URL}" class="link">View Resume</a>`;
  const guiFooterHtml = `&copy; ${currentYear} Puja Sridhar. All rights reserved. | <a href="${RESUME_URL}" class="link">View Full Resume</a>`;

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadWeather = async () => {
      const apis = ['https://ipapi.co/json/', 'https://ip-api.com/json/?fields=lat,lon', 'https://ipwho.is/'];

      let latitude = null;
      let longitude = null;

      for (const api of apis) {
        try {
          const res = await fetch(api);
          if (!res.ok) {
            continue;
          }

          const data = await res.json();
          const lat = Number(data.latitude ?? data.lat);
          const lon = Number(data.longitude ?? data.lon);

          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            latitude = lat;
            longitude = lon;
            break;
          }
        } catch {
          continue;
        }
      }

      if (latitude === null || longitude === null) {
        if (!cancelled) {
          setWeatherText('N/A');
        }
        return;
      }

      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`
        );

        if (!weatherRes.ok) {
          throw new Error('Weather fetch failed');
        }

        const weatherData = await weatherRes.json();
        const temperature = weatherData?.current?.temperature_2m;

        if (typeof temperature !== 'number') {
          throw new Error('No temperature');
        }

        if (!cancelled) {
          setWeatherText(`${Math.round(temperature)}°F`);
        }
      } catch {
        if (!cancelled) {
          setWeatherText('N/A');
        }
      }
    };

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (terminalMode) {
      inputRef.current?.focus();
    }
  }, [terminalMode]);

  useEffect(() => {
    if (terminalMode && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory, terminalMode]);

  useEffect(() => {
    const handleWindowKeyDown = (event) => {
      if (event.metaKey || event.altKey || !terminalMode) {
        return;
      }

      if (event.ctrlKey) {
        return;
      }

      if (document.activeElement === inputRef.current) {
        return;
      }

      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [terminalMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    const mouse = { x: undefined, y: undefined };
    let animationFrameId = 0;
    let nodes = [];
    const networkColor = darkMode ? '235, 219, 178' : '74, 63, 54';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000);

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1,
      }));
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const interactionRadius = 150;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
        }

        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
        }

        const mouseDistance =
          mouse.x === undefined ? Number.POSITIVE_INFINITY : Math.hypot(node.x - mouse.x, node.y - mouse.y);
        const opacity = Math.max(0, 1 - mouseDistance / interactionRadius);

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${networkColor}, ${0.5 + opacity * 0.5})`;
        context.fill();
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 120) {
            const midpointX = (nodes[i].x + nodes[j].x) / 2;
            const midpointY = (nodes[i].y + nodes[j].y) / 2;
            const mouseDistance =
              mouse.x === undefined ? Number.POSITIVE_INFINITY : Math.hypot(midpointX - mouse.x, midpointY - mouse.y);
            const opacity = Math.max(0.1, 1 - mouseDistance / interactionRadius);

            context.beginPath();
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.strokeStyle = `rgba(${networkColor}, ${(1 - dist / 120) * 0.5 * opacity})`;
            context.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [darkMode]);

  function initAudio() {
    if (audioRef.current.ready) {
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioRef.current.context = new AudioContext();
      audioRef.current.ready = true;
    } catch (error) {
      console.error('Web Audio API could not be started:', error);
    }
  }

  function playSound(frequency, type, duration = 0.08, volume = 0.2) {
    if (!audioRef.current.ready || !audioRef.current.context) {
      return;
    }

    const oscillator = audioRef.current.context.createOscillator();
    const gainNode = audioRef.current.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioRef.current.context.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioRef.current.context.currentTime);
    gainNode.gain.setValueAtTime(volume, audioRef.current.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioRef.current.context.currentTime + duration);
    oscillator.start(audioRef.current.context.currentTime);
    oscillator.stop(audioRef.current.context.currentTime + duration);
  }

  function playTypingSound() {
    if (!audioRef.current.ready || !audioRef.current.context) {
      return;
    }

    const oscillator = audioRef.current.context.createOscillator();
    const gainNode = audioRef.current.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioRef.current.context.destination);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1900, audioRef.current.context.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioRef.current.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioRef.current.context.currentTime + 0.05);
    oscillator.start(audioRef.current.context.currentTime);
    oscillator.stop(audioRef.current.context.currentTime + 0.05);
  }

  async function requestAssistant(userInput) {
    const requestId = crypto.randomUUID();
    const abortController = new AbortController();
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBaseUrl = isDevelopment ? '' : 'https://puja-sridhar-github-io.vercel.app';

    activeRequestRef.current = { id: requestId, controller: abortController };

    setTerminalHistory((previous) => [...previous, { id: requestId, type: 'output', html: 'Cogsworth is thinking...' }]);

    const nextConversationHistory = [...conversationHistoryRef.current, { role: 'user', text: userInput }];
    conversationHistoryRef.current = nextConversationHistory;

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          prompt: userInput,
          conversationHistory: nextConversationHistory.slice(0, -1),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updateAssistantEntry = (content) => {
        setTerminalHistory((previous) =>
          previous.map((entry) => (entry.id === requestId ? { ...entry, html: content } : entry))
        );
      };

      updateAssistantEntry('');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullResponseText += chunk;
        updateAssistantEntry(parseMarkdown(fullResponseText));

        if (chunk.trim() !== '') {
          playTypingSound();
        }
      }

      conversationHistoryRef.current = [...nextConversationHistory, { role: 'assistant', text: fullResponseText }];
    } catch (error) {
      if (error.name === 'AbortError') {
        setTerminalHistory((previous) =>
          previous.map((entry) =>
            entry.id === requestId ? { ...entry, html: "<span class='command'>^C</span> Request cancelled." } : entry
          )
        );
        return;
      }

      console.error('AI Fetch Error:', error);
      setTerminalHistory((previous) =>
        previous.map((entry) =>
          entry.id === requestId
            ? { ...entry, html: "<span class='error'>Error: Could not connect to the AI assistant.</span>" }
            : entry
        )
      );
    } finally {
      if (activeRequestRef.current?.id === requestId) {
        activeRequestRef.current = null;
      }
    }
  }

  function handleSubmit(rawInput = inputValue) {
    const userInput = rawInput.trim();
    if (!userInput) {
      return;
    }

    initAudio();
    playSound(440, 'square', 0.08, 0.2);

    const [commandToken, ...args] = userInput.split(/\s+/);
    const normalizedInput = commandToken.toLowerCase();
    let commandEntries;

    if (normalizedInput === 'man') {
      const subject = args[0]?.toLowerCase();
      commandEntries = [makeOutputEntry(buildManPageHtml(subject || 'man'))];
    } else {
      commandEntries = getCommandEntries(normalizedInput);
    }

    setCommandHistory((previous) => [userInput, ...previous]);
    setHistoryIndex(-1);
    setInputValue('');

    if (normalizedInput === 'clear') {
      conversationHistoryRef.current = [];
      setTerminalHistory([getBootEntry()]);
      return;
    }

    setTerminalHistory((previous) => [...previous, makeCommandEntry(userInput), ...(commandEntries ?? [])]);

    if (!commandEntries) {
      void requestAssistant(userInput);
    }
  }

  function handleKeyDown(event) {
    if (!audioRef.current.ready) {
      initAudio();
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();

      if (activeRequestRef.current) {
        activeRequestRef.current.controller.abort();
        setInputValue('');
        setHistoryIndex(-1);
        return;
      }

      if (inputValue) {
        setTerminalHistory((previous) => [
          ...previous,
          makeCommandEntry(inputValue),
          makeOutputEntry('<span class="command">^C</span>'),
        ]);
        setCommandHistory((previous) => [inputValue, ...previous]);
      } else {
        setTerminalHistory((previous) => [...previous, makeOutputEntry('<span class="command">^C</span>')]);
      }

      setInputValue('');
      setHistoryIndex(-1);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const trimmedInput = inputValue.trim().toLowerCase();
      const [commandToken, ...args] = trimmedInput.split(/\s+/);

      if (commandToken === 'man') {
        const subjectInput = args.join(' ').trim();

        if (!subjectInput) {
          setInputValue('man ');
          return;
        }

        const subjectMatches = COMMAND_NAMES.filter((command) => command.startsWith(subjectInput));

        if (subjectMatches.length === 1) {
          setInputValue(`man ${subjectMatches[0]}`);
        } else if (subjectMatches.length > 1) {
          const sharedPrefix = subjectMatches.reduce((prefix, command) => {
            let nextPrefix = prefix;
            while (!command.startsWith(nextPrefix) && nextPrefix) {
              nextPrefix = nextPrefix.slice(0, -1);
            }
            return nextPrefix;
          }, subjectMatches[0]);

          setInputValue(`man ${sharedPrefix}`);
          setTerminalHistory((previous) => [
            ...previous,
            makeOutputEntry(subjectMatches.map((command) => `<span class="command">${command}</span>`).join('&nbsp;&nbsp;')),
          ]);
        }
        return;
      }

      const matches = COMMAND_NAMES.filter((command) => command.startsWith(commandToken));

      if (matches.length === 1) {
        setInputValue(matches[0]);
      } else if (matches.length > 1) {
        const sharedPrefix = matches.reduce((prefix, command) => {
          let nextPrefix = prefix;
          while (!command.startsWith(nextPrefix) && nextPrefix) {
            nextPrefix = nextPrefix.slice(0, -1);
          }
          return nextPrefix;
        }, matches[0]);

        setInputValue(sharedPrefix);
        setTerminalHistory((previous) => [
          ...previous,
          makeOutputEntry(matches.map((command) => `<span class="command">${command}</span>`).join('&nbsp;&nbsp;')),
        ]);
      }
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHistoryIndex((currentIndex) => {
        if (currentIndex < commandHistory.length - 1) {
          const nextIndex = currentIndex + 1;
          setInputValue(commandHistory[nextIndex]);
          return nextIndex;
        }

        return currentIndex;
      });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHistoryIndex((currentIndex) => {
        if (currentIndex > 0) {
          const nextIndex = currentIndex - 1;
          setInputValue(commandHistory[nextIndex]);
          return nextIndex;
        }

        setInputValue('');
        return -1;
      });
      return;
    }

    playSound(880, 'sine', 0.08, 0.2);
  }

  return (
    <>
      <canvas id="network-canvas" ref={canvasRef}></canvas>
      <div id="scanlines"></div>

      <div className="terminal-container w-full max-w-4xl mx-auto">
        <div id="contact-icons-wrapper">
          <div id="contact-icons-container">
            <div id="status-bar" className="flex items-center gap-4 ml-4">
              <div id="clock">{clock}</div>
              <div id="weather-display" className="flex items-center gap-2" title="Your Local Weather">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17a4 4 0 1 1 0-8 5 5 0 0 1 10 0 4 4 0 1 1 0 8H7z" />
                </svg>
                <span id="weather-text">{weatherText}</span>
              </div>
            </div>

            <SocialIcons
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode((current) => !current)}
              onToggleView={() => setTerminalMode((current) => !current)}
              terminalMode={terminalMode}
            />
          </div>
        </div>

        {terminalMode ? (
          <div
            id="terminal"
            ref={terminalRef}
            className="w-full rounded-lg shadow-2xl shadow-stone-500/20 p-4 flex flex-col"
            onClick={(event) => {
              initAudio();
              if (event.target.tagName.toLowerCase() !== 'a') {
                inputRef.current?.focus();
              }
            }}
          >
            <div id="output" className="flex-grow">
              {terminalHistory.map((entry) => (
                <TerminalEntry key={entry.id} entry={entry} />
              ))}
            </div>

            <div id="input-line" className="prompt-line-wrapper mt-4 flex-shrink-0">
              <span className="prompt-live text-lg">{PROMPT_TEXT}</span>
              <input
                id="terminal-input"
                ref={inputRef}
                className="text-lg"
                type="text"
                spellCheck="false"
                autoComplete="off"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div id="footer" dangerouslySetInnerHTML={{ __html: footerHtml }} />
          </div>
        ) : (
          <GuiView activeTab={activeTab} onTabChange={setActiveTab} footerHtml={guiFooterHtml} />
        )}
      </div>
    </>
  );
}
