import { describe, expect, it } from 'vitest';
import { formatBreaks, makeCommandEntry, makeComponentEntry, makeOutputEntry, parseMarkdown, sanitizeHtml } from './terminalHelpers.js';

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
