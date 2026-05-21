export function formatBreaks(text) {
  return text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

export function parseMarkdown(text) {
  return text
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
