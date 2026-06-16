import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../portfolio-data.js';
import { getBootEntry, getCommandEntries } from './terminalContent.js';

describe('getCommandEntries', () => {
  it('returns help output for "help"', () => {
    const [entry] = getCommandEntries('help');
    expect(entry.html).toContain('command');
  });

  it('returns the boot entry for "clear"', () => {
    const [entry] = getCommandEntries('clear');
    expect(entry.html).toBe(getBootEntry().html);
  });

  it('returns null for an unrecognized command', () => {
    expect(getCommandEntries('not-a-real-command')).toBeNull();
  });

  it('returns a deep-dive for a known project slug', () => {
    const featured = portfolioData.projects.find((project) => project.featured);
    const [entry] = getCommandEntries(`projects ${featured.slug}`);
    expect(entry.html).toContain(featured.name);
    expect(entry.html).toContain('Stack');
  });

  it('returns a not-found message for an unknown project slug', () => {
    const [entry] = getCommandEntries('projects nonexistent-slug');
    expect(entry.html).toContain('Project not found');
  });

  it('falls back to sys help for unknown sys subcommands', () => {
    const [entry] = getCommandEntries('sys --bogus');
    expect(entry.html).toContain('sys');
  });
});
