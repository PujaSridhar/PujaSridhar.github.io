import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../portfolio-data.js';
import { getBootEntry, getCommandEntries, runnableCommand } from './terminalContent.js';
import { COMMAND_GROUPS } from '../constants/terminal.js';

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

  it('gives every featured project a full deep-dive and lists it under Featured', () => {
    const [list] = getCommandEntries('projects');
    const featuredSection = list.html.split('Other Work')[0];
    portfolioData.projects
      .filter((project) => project.featured)
      .forEach((project) => {
        const [entry] = getCommandEntries(`projects ${project.slug}`);
        expect(entry.html).toContain(project.name);
        expect(entry.html).toContain('Pipeline');
        expect(featuredSection).toContain(`projects ${project.slug}`);
      });
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

describe('clickable commands', () => {
  it('marks every command in help as runnable', () => {
    const [entry] = getCommandEntries('help');
    COMMAND_GROUPS.flatMap(({ commands }) => commands).forEach((command) => {
      expect(entry.html).toContain(`data-cmd="${command}"`);
    });
    expect(entry.html).toContain('data-cmd="clear"');
    expect(entry.html).toContain('data-cmd="all"');
  });

  it('makes "help" in the boot text runnable', () => {
    expect(getBootEntry().html).toContain('data-cmd="help"');
  });

  it('tells visitors they can tap "help" in the boot text', () => {
    expect(getBootEntry().html).toContain('Type or tap <span');
  });

  it('keeps placeholders like "man [command]" as plain text', () => {
    const [entry] = getCommandEntries('help');
    expect(entry.html).not.toContain('data-cmd="man [command]"');
  });

  it('escapes quotes in the command attribute', () => {
    expect(runnableCommand('say "hi"')).toContain('data-cmd="say &quot;hi&quot;"');
  });
});
