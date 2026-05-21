import { PROMPT_TEXT } from '../constants/terminal.js';

export function TerminalEntry({ entry }) {
  if (entry.type === 'command') {
    return (
      <div className="output-entry">
        <div className="prompt-line-wrapper">
          <span className="prompt-live text-lg">{PROMPT_TEXT}</span>
          <span className="command text-lg" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {entry.text}
          </span>
        </div>
      </div>
    );
  }

  return <div className="output-entry" dangerouslySetInnerHTML={{ __html: entry.html }} />;
}
