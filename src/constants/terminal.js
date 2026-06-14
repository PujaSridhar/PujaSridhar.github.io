import { portfolioData } from '../../portfolio-data.js';

export const PROMPT_TEXT = 'Cogsworth@linux ~ % ';
export const RESUME_URL = 'https://drive.google.com/file/d/1XrZ5vb9nad2WnyswQOYPBe3D7speSn6T/view?usp=sharing';
export const CALENDLY_URL = 'https://calendly.com/pujasridhar';
export const EMAIL_HREF =
  'mailto:pujasridhar28@gmail.com?subject=Connecting%20with%20you%20via%20portfolio&body=Hi%20Puja,%0A%0AI%20came%20across%20your%20portfolio%20and%20wished%20to%20reach%20out.%0A%0APlease%20let%20me%20know%20a%20convenient%20time%20to%20connect.%0A%20Sincerely,%0A%20[Your%20Name]';

export const THEMES = {
  ivory: {
    name: 'Ivory & Olive',
    light: {
      '--color-bg': '#F6F4F0',
      '--color-bg-secondary': '#EDEAE4',
      '--color-text': '#2A2820',
      '--color-text-secondary': '#6A6860',
      '--color-accent': '#5A6050',
      '--color-prompt': '#8A8878',
      '--color-border': '#D0CEC8',
      '--color-error': '#A05040',
      '--network-rgb': '90, 96, 80',
    },
    dark: {
      '--color-bg': '#3A3C35',
      '--color-bg-secondary': '#2E3028',
      '--color-text': '#E8E4DC',
      '--color-text-secondary': '#A0A090',
      '--color-accent': '#C8C8A0',
      '--color-prompt': '#787870',
      '--color-border': '#505048',
      '--color-error': '#C07060',
      '--network-rgb': '200, 200, 160',
    },
  },
  ocean: {
    name: 'Ocean & Lime',
    light: {
      '--color-bg': '#F0F4DC',
      '--color-bg-secondary': '#E4EAC8',
      '--color-text': '#0D2A38',
      '--color-text-secondary': '#4A6858',
      '--color-accent': '#19485F',
      '--color-prompt': '#5A7A60',
      '--color-border': '#C8D088',
      '--color-error': '#A05040',
      '--network-rgb': '25, 72, 95',
    },
    dark: {
      '--color-bg': '#0D2030',
      '--color-bg-secondary': '#19485F',
      '--color-text': '#D9E0A4',
      '--color-text-secondary': '#7A9880',
      '--color-accent': '#A8C840',
      '--color-prompt': '#4A7A60',
      '--color-border': '#2A4858',
      '--color-error': '#E87060',
      '--network-rgb': '168, 200, 64',
    },
  },
  crema: {
    name: 'Crema & Umber',
    light: {
      '--color-bg': '#FFF7EB',
      '--color-bg-secondary': '#F5EFE0',
      '--color-text': '#2A1E18',
      '--color-text-secondary': '#7A6858',
      '--color-accent': '#6A4A3A',
      '--color-prompt': '#9A8878',
      '--color-border': '#E0D0C0',
      '--color-error': '#A05040',
      '--network-rgb': '106, 74, 58',
    },
    dark: {
      '--color-bg': '#2A1E1C',
      '--color-bg-secondary': '#3A2820',
      '--color-text': '#F0E8DC',
      '--color-text-secondary': '#9A8878',
      '--color-accent': '#D4B898',
      '--color-prompt': '#7A6058',
      '--color-border': '#4A3830',
      '--color-error': '#C07060',
      '--network-rgb': '212, 184, 152',
    },
  },
  sunflower: {
    name: 'Sunflower',
    light: {
      '--color-bg': '#FEFCE8',
      '--color-bg-secondary': '#FEF9C3',
      '--color-text': '#1A1A00',
      '--color-text-secondary': '#6A6A30',
      '--color-accent': '#8B7000',
      '--color-prompt': '#8A8A40',
      '--color-border': '#E8E060',
      '--color-error': '#A05040',
      '--network-rgb': '139, 112, 0',
    },
    dark: {
      '--color-bg': '#1A1A00',
      '--color-bg-secondary': '#2A2A00',
      '--color-text': '#F5F0A0',
      '--color-text-secondary': '#909040',
      '--color-accent': '#D4B800',
      '--color-prompt': '#606040',
      '--color-border': '#3A3A00',
      '--color-error': '#E87060',
      '--network-rgb': '212, 184, 0',
    },
  },
  mulberry: {
    name: 'Honey & Mulberry',
    light: {
      '--color-bg': '#FFF8E7',
      '--color-bg-secondary': '#FFE4A1',
      '--color-text': '#1A0A20',
      '--color-text-secondary': '#7A6070',
      '--color-accent': '#604C39',
      '--color-prompt': '#907060',
      '--color-border': '#E8D0A0',
      '--color-error': '#A05040',
      '--network-rgb': '96, 76, 57',
    },
    dark: {
      '--color-bg': '#1E0A28',
      '--color-bg-secondary': '#2E1A38',
      '--color-text': '#F0D8C0',
      '--color-text-secondary': '#907080',
      '--color-accent': '#FFD060',
      '--color-prompt': '#806070',
      '--color-border': '#3E2048',
      '--color-error': '#E87060',
      '--network-rgb': '255, 208, 96',
    },
  },
  sepia: {
    name: 'Classic Sepia',
    light: {
      '--color-bg': '#F5EFE0',
      '--color-bg-secondary': '#EDE5D0',
      '--color-text': '#2C2416',
      '--color-text-secondary': '#7A6A58',
      '--color-accent': '#C17B2A',
      '--color-prompt': '#8A7060',
      '--color-border': '#D8C8B0',
      '--color-error': '#A05040',
      '--network-rgb': '74, 63, 54',
    },
    dark: {
      '--color-bg': '#1C1917',
      '--color-bg-secondary': '#2A2420',
      '--color-text': '#EDE0CC',
      '--color-text-secondary': '#9A8878',
      '--color-accent': '#C17B2A',
      '--color-prompt': '#6A5A48',
      '--color-border': '#3A3028',
      '--color-error': '#C07060',
      '--network-rgb': '235, 219, 178',
    },
  },
};

export const DEFAULT_THEME = 'ivory';

export const COMMAND_NAMES = [
  'cogsworth --version',
  'availability',
  'download resume',
  'diff',
  'patch notes',
  'sys --alloc',
  'sys --threads',
  'sys --shell',
  'sys --status',
  'sys --help',
  'diagnostics',
  'theme --list',
  'help',
  'man',
  'about',
  'log',
  'education',
  'experience',
  'projects',
  ...portfolioData.projects.map((project) => `projects ${project.slug}`),
  'skills',
  'languages',
  'certifications',
  'talks',
  'leadership',
  'resume',
  'contact',
  'contact --schedule',
  'creator',
  'sudo hire',
  'decisions',
  'all',
  'clear',
];

export const COMMAND_GROUPS = [
  {
    title: 'About this site',
    commands: ['cogsworth --version', 'diff', 'patch notes', 'decisions', 'diagnostics', 'theme --list', 'creator'],
  },
  {
    title: 'Portfolio',
    commands: ['about', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications', 'talks', 'leadership'],
  },
  {
    title: 'Systems demos',
    commands: ['sys --alloc', 'sys --threads', 'sys --shell', 'sys --status'],
  },
  {
    title: 'Contact & hiring',
    commands: ['contact', 'contact --schedule', 'availability', 'resume', 'download resume', 'sudo hire'],
  },
  {
    title: 'Terminal',
    commands: ['help', 'man', 'log', 'all', 'clear'],
  },
];

export const COMMAND_MANUALS = {
  'cogsworth --version': {
    summary: 'Show the current Cogsworth release metadata.',
    usage: 'cogsworth --version',
    description: 'Prints the v25 release number, launch date, and current runtime status.',
  },
  availability: {
    summary: 'Show current job search availability.',
    usage: 'availability',
    description: 'Shows open role types, preferred location setup, and immediate start status.',
  },
  'download resume': {
    summary: 'Download the resume PDF without leaving the terminal.',
    usage: 'download resume',
    description: 'Triggers a browser download for the latest resume and prints the direct file link.',
  },
  diff: {
    summary: 'Show what changed between the last two release markers.',
    usage: 'diff',
    description: 'Summarizes the visible changes between v24 and v25 in plain English.',
  },
  'patch notes': {
    summary: 'Show the v25 release notes.',
    usage: 'patch notes',
    description: 'Lists the v25.0.0 release notes, including the main upgrades and the known footguns.',
  },
  sys: {
    summary: 'List available sys namespace commands.',
    usage: 'sys --help',
    description: 'Shows the supported systems-portfolio subcommands and what each one demonstrates. Equivalent to sys --help.',
  },
  'sys --alloc': {
    summary: 'Preview allocator benchmark work.',
    usage: 'sys --alloc',
    description: 'Reserved sys namespace entry for the custom allocator benchmark view.',
  },
  'sys --threads': {
    summary: 'Preview threading and concurrency work.',
    usage: 'sys --threads',
    description: 'Reserved sys namespace entry for the threads and synchronization demo view.',
  },
  'sys --shell': {
    summary: 'Preview the shell demo workspace.',
    usage: 'sys --shell',
    description: 'Reserved sys namespace entry for the mini shell demo linked against the allocator project.',
  },
  'sys --status': {
    summary: 'Print live terminal diagnostics.',
    usage: 'sys --status',
    description: 'Prints the same one-shot diagnostics block as diagnostics, using live browser and session stats.',
  },
  'sys --help': {
    summary: 'List available sys namespace commands.',
    usage: 'sys --help',
    description: 'Shows the supported systems-portfolio subcommands and what each one demonstrates.',
  },
  diagnostics: {
    summary: 'Print live terminal diagnostics.',
    usage: 'diagnostics',
    description: 'Prints a one-shot health block with actual runtime stats from the current browser session.',
  },
  'theme --list': {
    summary: 'Show all available colour themes.',
    usage: 'theme --list',
    description: 'Lists every built-in theme by name. Use theme [name] to apply one. Your choice is remembered.',
  },
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
  log: {
    summary: 'View career and life system log.',
    usage: 'log',
    description: 'Prints a chronological deployment log of career events, milestones, and active background processes.',
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
    summary: 'List all projects with descriptions and links.',
    usage: 'projects [name]',
    description:
      'Without an argument, shows Featured Projects and Other Work with one-line descriptions and links. ' +
      'With a name, shows the full deep-dive: stack, pipeline, GitHub, and live demo where available. ' +
      `Names: ${portfolioData.projects.map((project) => project.slug).join(', ')}`,
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
  'contact --schedule': {
    summary: 'Open the scheduling link directly.',
    usage: 'contact --schedule',
    description: 'Shows the Calendly link so recruiters can book time without hunting for it.',
  },
  creator: {
    summary: 'Show the signature ASCII creator card.',
    usage: 'creator',
    description: 'Renders the portfolio’s ASCII art easter egg.',
  },
  'sudo hire': {
    summary: 'Print the strongest quick case for hiring Puja.',
    usage: 'sudo hire',
    description: 'Outputs a concise hiring pitch with resume and scheduling links.',
  },
  decisions: {
    summary: 'Show real engineering tradeoffs behind the work.',
    usage: 'decisions',
    description:
      'Six concrete implementation decisions with alternatives considered and tradeoffs made — WASM constraints, Airflow task design, parallel agent execution, caching strategy.',
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
