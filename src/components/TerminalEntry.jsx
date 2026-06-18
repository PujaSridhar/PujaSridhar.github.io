import { lazy, Suspense } from 'react';
import { PROMPT_TEXT } from '../constants/terminal.js';
import { ShellDemo } from './ShellDemo.jsx';
import { ThreadDemo } from './ThreadDemo.jsx';

const AllocDemo = lazy(() => import('./AllocDemo.jsx').then((module) => ({ default: module.AllocDemo })));

export function TerminalEntry({ entry, onShellExit }) {
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

  if (entry.type === 'component') {
    if (entry.componentName === 'alloc') {
      return (
        <div className="output-entry">
          <Suspense fallback={<div className="alloc-demo-caption">Loading allocator demo...</div>}>
            <AllocDemo onExit={onShellExit} />
          </Suspense>
        </div>
      );
    }

    if (entry.componentName === 'shell') {
      return (
        <div className="output-entry">
          <ShellDemo onExit={onShellExit} {...entry.props} />
        </div>
      );
    }

    if (entry.componentName === 'threads') {
      return (
        <div className="output-entry">
          <ThreadDemo onExit={onShellExit} {...entry.props} />
        </div>
      );
    }

    return null;
  }

  return <div className="output-entry" dangerouslySetInnerHTML={{ __html: entry.html }} />;
}
