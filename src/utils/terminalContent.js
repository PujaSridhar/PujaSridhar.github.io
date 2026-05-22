import { portfolioData } from '../../portfolio-data.js';
import { CALENDLY_URL, COMMAND_MANUALS, COMMAND_NAMES, EMAIL_HREF, RESUME_URL, THEMES } from '../constants/terminal.js';
import { formatBreaks, makeOutputEntry } from './terminalHelpers.js';

export function getBootEntry() {
  const today = new Date();
  const isBirthday = today.getFullYear() === 2026 && today.getMonth() === 5 && today.getDate() === 28;

  if (isBirthday) {
    return makeOutputEntry(
      `<span style="color:var(--color-accent);">Initializing Cogsworth v25.0.0...</span><br>` +
        `<span style="color:var(--color-accent);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>` +
        `DEPLOYMENT SUCCESSFUL.<br>` +
        `Version 25.0.0 is now live.<br>` +
        `Operator uptime: 25 years. Systems nominal.<br><br>` +
        `<span style="color:var(--color-accent);">◉ Channeling legacy of Babbage, Lovelace, Turing... OK.</span><br>` +
        `<span style="color:var(--color-accent);">◉ Loading Quarter Century Deploy... OK.</span><br>` +
        `<span style="color:var(--color-accent);">◉ Deprecated: imposter_syndrome.exe... REMOVED.</span><br>` +
        `<span style="color:var(--color-accent);">◉ Initializing san_jose.env... ACTIVE.</span><br><br>` +
        `Protocol established. Welcome to v25.<br><br>` +
        `I am Cogsworth. Type <span class="command">'patch notes'</span> to see what changed,` +
        ` or <span class="command">'help'</span> for all commands.`
    );
  }

  return makeOutputEntry(
    `Initializing Cogsworth v1.0...<br>` +
      `Channeling legacy of Babbage, Lovelace, Turing... OK.<br>` +
      `Parsing lineage of data... OK.<br>` +
      `Protocol established. Welcome.<br><br>` +
      `I am Cogsworth, an AI built to present the work of Puja Sridhar.<br>` +
      `Type <span class="command">'help'</span> for a list of commands, or ask me a question in plain English.`
  );
}

export function buildHelpHtml() {
  return (
    `Available commands:<br>${COMMAND_NAMES.map((command) => `<span class="command">${command}</span>`).join(', ')}` +
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

function buildLogHtml() {
  return (
    `<div class="skills-category-title">[SYSTEM LOG] Puja Sridhar - Career &amp; Life Events</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<span class="command">[2001-06-28]</span> BOOT        Initialized. Location: Pondicherry, India.
                         Tiny city. Big personality from day one.

<span class="command">[2003]</span>       MIGRATED    Bangalore. Age 2. Didn't choose it.
                         Grew up on gojju avalaki, pineapple gojju,
                         mudde saru, and the kind of Bangalore sweet
                         sambar that ruins all other sambar forever.

<span class="command">[2019-09-01]</span> ENROLLED    B.E. in Computer Science. Bangalore.
                         First line of code. First all-nighter.
                         First "why does this work, I changed nothing."

<span class="command">[2023-02-01]</span> DEPLOYED    AI Co-pilot Developer @ HumanFractal.ai, Resolute

<span class="command">[2023-05-31]</span> SUCCESS     Built AI co-pilot systems that actually worked.
                         Shipped to production. Then shipped myself out.

<span class="command">[2024-01-01]</span> MIGRATED    New Brunswick, NJ, USA. Masters in CS @ Rutgers.
                         Left behind the weather I liked.
                         Brought the work ethic.

<span class="command">[2024-09-01]</span> TEACHING    Graduate Teaching Assistant @ Rutgers
                         OOP — 60 students
                         Data Management &amp; Curation — 30 students
                         Intro to AI — 60 students
                         150 people. Real questions. No script.
                         Turns out I actually like explaining things.

<span class="command">[2025-01-15]</span> MILESTONE   MS in Computer Science. Conferred. Done.
                         First in my family to do a master's abroad.
                         Didn't make a big deal of it. Making it now.

<span class="command">[2025-07-01]</span> DEPLOYED    AI Engineering Intern @ Pennant Education

<span class="command">[2025-09-30]</span> COMPLETE    Built things. Broke things. Fixed them better.
                         Shipped AI features that went into real hands.

<span class="command">[2025-12-01]</span> CLOSED      TA role complete. 150 students, done.

<span class="command">[2026-06-01]</span> MIGRATED    San Jose, CA. Already here.
                         New city. First full-time role loading.
                         Gardening plans: in progress.

<span class="command">[2026-06-28]</span> UPGRADING   v25.0.0 live today.
                         System status: ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>` +
    `<div class="skills-category-title">[ACTIVE PROCESSES]</div>` +
    `<pre class="log-entry">◉ Biking           — wind in hair, zero traffic excuses
◉ Chess            — I will out-think you and be nice about it
◉ Baking           — the only pipeline I tune by smell
◉ Cooking          — Karnataka base. pineapple gojju on a Tuesday. no rules.
◉ Ultimate Frisbee — I take it seriously. you've been warned.
◉ Basketball       — chaos on the court, structured off it
◉ Painting         — the original no-code project
◉ Embroidery       — precision work. patience loaded.
◉ Gardening        — I grow things. plants and codebases.</pre>`
  );
}

function buildVersionHtml() {
  const launch = new Date('2026-06-28');
  const now = new Date();
  const days = Math.max(0, Math.floor((now - launch) / (1000 * 60 * 60 * 24)));
  const uptime = days === 0 ? '25 years, 0 days' : `25 years, ${days} days`;

  return (
    `<div class="skills-category-title">COGSWORTH PROTOCOL - System Version</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Version:        25.0.0
  Release date:   June 28, 2026
  Codename:       Quarter Century Deploy
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

  Stats:
    Cities lived in:         4
    Students taught:         150
    Coffees today:           0  ← permanent
    Browser tabs open:       too many to count
    Projects said no to:     almost none (see known bugs)

  Uptime:         ${uptime}
  Crashes:        several. recovered every time.
  Current mood:   building.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Type <span style="color:var(--color-accent);">'run interview'</span> to hear it from me directly.
  Type <span style="color:var(--color-accent);">'sudo hire'</span> if you've already decided.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildDiffHtml() {
  return (
    `<div class="skills-category-title">$ diff puja_v24.log puja_v25.log</div>` +
    `<pre class="log-entry">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMIT: v25.0.0 — June 28, 2026
AUTHOR: Puja Sridhar &lt;pujasridhar28@gmail.com&gt;
MESSAGE: it's been a year. here's what actually changed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<span style="color:var(--color-error);">- shrinking in rooms where I should have been loud</span>
<span style="color:var(--color-accent);">+ still figuring out the volume. showing up anyway.</span>

<span style="color:var(--color-error);">- measuring my worth by my job title (or lack of one)</span>
<span style="color:var(--color-accent);">+ the work is real whether or not the title exists yet</span>

<span style="color:var(--color-error);">- letting disrespect slide because confrontation is awkward</span>
<span style="color:var(--color-accent);">+ awkward conversation &gt; silent resentment. every time.</span>

<span style="color:var(--color-error);">- comparing my chapter 3 to everyone else's chapter 20</span>
<span style="color:var(--color-accent);">+ deleted the comparison. focused on the draft.</span>

<span style="color:var(--color-error);">- coffee. all of it. every day.</span>
<span style="color:var(--color-accent);">+ quit. functioning. baffled by this myself.</span>

<span style="color:var(--color-accent);">+ graduated with MS in CS at 24</span>
  first in my family to do a master's abroad
  didn't celebrate enough at the time. noting it here.

<span style="color:var(--color-accent);">+ moved three cities across two countries</span>
  Pondicherry → Bangalore → New Brunswick, NJ → San Jose
  each one taught me something the last one couldn't

<span style="color:var(--color-accent);">+ got stronger. physically. pushups are real now.</span>
  started from zero. didn't expect to care this much.
  turns out the body keeping score goes both ways.

<span style="color:var(--color-accent);">+ built v25 of this portfolio. you're in it right now.</span>
  type 'run interview' if you want to hear the rest.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
net change: quieter ego, louder output.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</pre>`
  );
}

function buildPatchNotesHtml() {
  return (
    `<div class="skills-category-title">RELEASE NOTES - Puja Sridhar v25.0.0</div>` +
    `<pre class="log-entry">Released: June 28, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPRECATED:
  <span style="color:var(--color-error);">✕ imposter_syndrome.exe</span>
    Ran silently in the background for years.
    Resource hog. Produced nothing useful.
    Uninstalled. Not missed.

  <span style="color:var(--color-error);">✕ compare_timelines.js</span>
    Kept crashing whenever I opened LinkedIn.
    Incompatible with actual progress.
    Removed.

  <span style="color:var(--color-error);">✕ absorb_disrespect_quietly.config</span>
    Was set as default for too long.
    Hard reset applied.
    New default: say something or walk away.

  <span style="color:var(--color-error);">✕ coffee (all of it)</span>
    Deprecated cold turkey, January 2026.
    No withdrawal patch. Just vibes.
    Still not sure how I did it.

ADDED:
  <span style="color:var(--color-accent);">✓ pushups_and_planks.daily</span>
    Didn't think I could. Now I do.
    Loads every morning before anything else.
    Side effects: annoyingly good mood.

  <span style="color:var(--color-accent);">✓ me_time.scheduler</span>
    Previously always overridden by everyone else.
    Now blocked out and non-negotiable.
    Boundary enforcement: active.

  <span style="color:var(--color-accent);">✓ self_respect.threshold = non-zero</span>
    Finally shipping with a minimum requirement.
    Applies to work, friendships, everything.

  <span style="color:var(--color-accent);">✓ san_jose.env</span>
    New city. Already here.
    Warmer. Calmer. Good light for the plants.

KNOWN BUGS:
  <span style="color:var(--color-prompt);">⚠ says_yes_before_checking_capacity.loop</span>
    Ongoing. Probably permanent.
    I keep shipping features before the sprint ends.

  <span style="color:var(--color-prompt);">⚠ browser_tabs &gt; available_memory</span>
    Reproducible 100% of the time.
    No fix in scope.

  <span style="color:var(--color-prompt);">⚠ confidence.fluctuates_under_load</span>
    Known issue. Being patched in real time.
    ETA: unknown. Progress: real.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
v25 is not the version that has everything figured out.
it's the version that stopped pretending to.
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

function buildSudoHireHtml() {
  return (
    `<div class="skills-category-title">sudo hire</div>` +
    `<i>not the loudest in the room. just the one who already shipped it.</i><br><br>` +
    `Resume: <a href="${RESUME_URL}" target="_blank" rel="noreferrer" class="link">PujaSridhar_Resume.pdf</a><br>` +
    `Calendly: <a href="${CALENDLY_URL}" target="_blank" rel="noreferrer" class="link">Book time with me</a>`
  );
}

function buildAllHtml() {
  return [
    buildAboutHtml(),
    buildLogHtml(),
    buildDiffHtml(),
    buildPatchNotesHtml(),
    buildVersionHtml(),
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
  switch (command) {
    case 'cogsworth --version':
      return [makeOutputEntry(buildVersionHtml())];
    case 'availability':
      return [makeOutputEntry(buildAvailabilityHtml())];
    case 'diff':
      return [makeOutputEntry(buildDiffHtml())];
    case 'patch notes':
      return [makeOutputEntry(buildPatchNotesHtml())];
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
    case 'sudo hire':
      return [makeOutputEntry(buildSudoHireHtml())];
    case 'all':
      return [makeOutputEntry(buildAllHtml())];
    case 'clear':
      return [getBootEntry()];
    default:
      return null;
  }
}
