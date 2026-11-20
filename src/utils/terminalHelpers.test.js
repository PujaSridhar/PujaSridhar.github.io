import { describe, expect, it } from 'vitest';
import { formatBreaks, getFollowScrollTop, makeCommandEntry, makeComponentEntry, makeOutputEntry, parseMarkdown, sanitizeHtml } from './terminalHelpers.js';

describe('formatBreaks', () => {
  it('converts double newlines to paragraph breaks', () => {
    expect(formatBreaks('a\n\nb')).toBe('a<br><br>b');
  });

  it('converts single newlines to line breaks', () => {
    expect(formatBreaks('a\nb')).toBe('a<br>b');
  });
});

describe('sanitizeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });

  it("escapes ampersands and apostrophes", () => {
    expect(sanitizeHtml("a & b's")).toBe('a &amp; b&#39;s');
  });
});

describe('parseMarkdown', () => {
  it('converts **bold** to command spans', () => {
    expect(parseMarkdown('**hello**')).toBe('<span class="command">hello</span>');
  });

  it('converts *italic* to <i> tags', () => {
    expect(parseMarkdown('*hello*')).toBe('<i>hello</i>');
  });

  it('escapes HTML before applying markdown', () => {
    expect(parseMarkdown('<b>**hi**</b>')).toBe('&lt;b&gt;<span class="command">hi</span>&lt;/b&gt;');
  });

  it('converts newlines to <br>', () => {
    expect(parseMarkdown('a\nb')).toBe('a<br>b');
  });

  it('turns "* " list items into bullets instead of leaving raw asterisks', () => {
    expect(parseMarkdown('Built:\n* LocalLens\n* LexAI')).toBe('Built:<br>• LocalLens<br>• LexAI');
  });

  it('handles "- " list items and keeps bold inside them', () => {
    expect(parseMarkdown('- **LexAI**: contracts')).toBe('• <span class="command">LexAI</span>: contracts');
  });

  it('keeps indentation for nested list items', () => {
    expect(parseMarkdown('  * nested')).toBe('&nbsp;&nbsp;• nested');
  });

  it('does not treat a hyphen inside a sentence as a bullet', () => {
    expect(parseMarkdown('real-time map')).toBe('real-time map');
  });
});

describe('entry factories', () => {
  it('makeOutputEntry creates an output entry with html and unique id', () => {
    const entry = makeOutputEntry('<p>hi</p>');
    expect(entry.type).toBe('output');
    expect(entry.html).toBe('<p>hi</p>');
    expect(entry.id).toBeTruthy();
  });

  it('makeCommandEntry creates a command entry with text', () => {
    const entry = makeCommandEntry('help');
    expect(entry.type).toBe('command');
    expect(entry.text).toBe('help');
  });

  it('makeComponentEntry defaults props to an empty object', () => {
    const entry = makeComponentEntry('alloc');
    expect(entry.type).toBe('component');
    expect(entry.componentName).toBe('alloc');
    expect(entry.props).toEqual({});
  });

  it('makeComponentEntry preserves provided props', () => {
    const entry = makeComponentEntry('shell', { foo: 'bar' });
    expect(entry.props).toEqual({ foo: 'bar' });
  });
});

describe('getFollowScrollTop', () => {
  it('scrolls to the bottom when there is no command yet', () => {
    expect(getFollowScrollTop({ scrollHeight: 1000, clientHeight: 400 })).toBe(600);
  });

  it('scrolls to the bottom when the new output fits on screen', () => {
    expect(getFollowScrollTop({ scrollHeight: 1000, clientHeight: 400, commandTop: 800 })).toBe(600);
  });

  it('keeps the command at the top when its output is taller than the screen', () => {
    expect(getFollowScrollTop({ scrollHeight: 2000, clientHeight: 400, commandTop: 500 })).toBe(492);
  });

  it('never scrolls above the top', () => {
    expect(getFollowScrollTop({ scrollHeight: 300, clientHeight: 400, commandTop: 0 })).toBe(0);
  });
});
