export function formatBreaks(text) {
  return text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHtml(text) {
  return escapeHtml(text);
}

export function parseMarkdown(text) {
  return sanitizeHtml(text)
    // List items ("* item", "- item", "+ item") become terminal-style bullets,
    // before the italic rule can mistake a leading "*" for emphasis.
    .replace(/^([ \t]*)[*+-][ \t]+/gm, (_, indent) => `${'&nbsp;'.repeat(indent.length)}• `)
    .replace(/\*\*(.*?)\*\*/g, '<span class="command">$1</span>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

export function makeOutputEntry(html) {
  return { id: crypto.randomUUID(), type: 'output', html };
}

export function makeCommandEntry(text) {
  return { id: crypto.randomUUID(), type: 'command', text };
}

export function makeComponentEntry(componentName, props = {}) {
  return { id: crypto.randomUUID(), type: 'component', componentName, props };
}
