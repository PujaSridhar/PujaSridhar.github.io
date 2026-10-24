// cogsworth/chunks.js
// Turns portfolio-data.js into searchable chunks and a list of named entities.

const stripHtml = text => (text || '').replace(/<[^>]*>/g, '');

export function buildChunks(data) {
  const chunks = [];
  const push = (section, entity, title, text, extra = {}) => {
    for (const paragraph of stripHtml(text).split(/\n\s*\n/)) {
      if (paragraph.trim()) chunks.push({ section, entity, title, text: paragraph.trim(), ...extra });
    }
  };

  push('about', null, 'About Puja', data.about);
  data.education.forEach(edu => push('education', edu.school, `Education: ${edu.school}`,
    `${edu.degree} at ${edu.school}. ${edu.details}.`));
  data.experience.forEach(exp => exp.desc.forEach(paragraph =>
    push('experience', exp.company, `${exp.role} at ${exp.company} (${exp.period})`, paragraph)));
  data.projects.forEach(proj => {
    push('projects', proj.name, `Project: ${proj.name}`, `${proj.name} is built with ${proj.tech}.${proj.tagline ? ` ${proj.tagline}.` : ''}`);
    proj.desc.forEach(paragraph => push('projects', proj.name, `Project: ${proj.name}`, paragraph));
  });
  data.hackathons.forEach(h =>
    push('hackathons', h.name, `Hackathon: ${h.name} (${h.date}, ${h.team})`, h.desc, { team: h.team })
  );
  data.leadership.forEach(lead => push('leadership', lead.role, `Leadership: ${lead.role} at ${lead.org}`, lead.points.join(' ')));
  data.talks.forEach(talk => push('talks', talk.title, 'Talks', `Talk "${talk.title}" at ${talk.venue}.`));
  data.certifications.forEach(cert => push('certifications', cert.name, 'Certifications', `Certification "${cert.name}" from ${cert.issuer}.`));
  Object.entries(data.skills).forEach(([category, list]) =>
    push('skills', category, `Skills: ${category}`, `${category} skills: ${list.join(', ')}.`));
  push('languages', null, 'Languages', `Spoken languages: ${data.languages.map(l => `${l.lang} (${l.proficiency})`).join(', ')}.`);
  push('contact', null, 'Contact', `Contact email ${data.contact.email}, LinkedIn ${data.contact.linkedin}, GitHub ${data.contact.github}.`);

  return chunks;
}

// Names a visitor might use to refer to a specific item, longest first so
// "Smart Doc Finder" wins over a shorter overlapping alias.
export function buildEntities(data) {
  const entities = [];
  const add = (name, aliases) => entities.push({ name, aliases: [...new Set(aliases.map(a => a.toLowerCase()))] });

  data.projects.forEach(p => add(p.name, [
    p.name,
    p.slug,
    p.slug.replace(/-/g, ' '),
    p.name.replace(/\s*\(.*\)/, ''),
    p.name.replace(/^Multilingual\s+/i, ''),
  ]));

  const roleWordCounts = new Map();
  for (const e of data.experience) {
    for (const w of e.role.toLowerCase().split(/\s+/)) {
      roleWordCounts.set(w, (roleWordCounts.get(w) || 0) + 1);
    }
  }

  // Roles also match on their last two words ("teaching assistant", "engineering intern")
  // and unique role words ("grader").
  data.experience.forEach(e => {
    const baseCompany = e.company.replace(/\s*\(.*\)/, '').trim();
    const parenMatch = e.company.match(/\(([^)]+)\)/);
    const domainPrefix = baseCompany.split('.')[0];
    const extra = e.company.includes('HumanFractal') ? ['filomena'] : [];
    const uniqueRoleWords = e.role
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length >= 6 && roleWordCounts.get(w) === 1 && !['graduate', 'computer', 'science', 'relations'].includes(w));
    add(e.company, [
      e.company,
      baseCompany,
      domainPrefix,
      ...(parenMatch ? [parenMatch[1]] : []),
      e.company.split(/[\s(-]/)[0],
      e.role,
      e.role.split(' ').slice(-2).join(' '),
      ...uniqueRoleWords,
      ...extra,
    ]);
  });
  data.hackathons.forEach(h => add(h.name, [h.name, h.name.replace(/\s*\(.*\)/, '')]));
  data.education.forEach(e => add(e.school, [e.school, e.school.split(',')[0]]));
  data.leadership.forEach(l => add(l.role, [l.role]));

  // A short alias that is a common word ("resolute", "bms") still helps, but
  // skip anything under 3 characters to avoid accidental matches.
  for (const entity of entities) entity.aliases = entity.aliases.filter(a => a.length >= 3);
  return entities;
}
