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
