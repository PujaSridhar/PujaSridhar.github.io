import { useEffect, useMemo, useRef, useState } from 'react';

const SHELL_COMMANDS = ['cat', 'cd', 'echo', 'exit', 'help', 'history', 'ls', 'pwd', 'rm', 'touch'];

const SEEDED_FILES = {
  'README.md': `Puja's systems sandbox
- sys --alloc: free-list allocator on a static heap
- sys --shell: virtual shell inside the portfolio
- sys --threads: concurrency demo loading next`,
  'allocator.txt': `Allocator notes
* block header: size, free flag, next pointer
* split oversized blocks
* coalesce adjacent frees`,
  'projects.txt': `Featured projects
1. Cogsworth portfolio terminal
2. Smart Document Finder
3. AI features at Pennant Education`,
};

function cloneSeededFiles() {
  return Object.entries(SEEDED_FILES).reduce((fs, [name, content]) => {
    fs[name] = content;
    return fs;
  }, {});
}

function normalizeOutput(text) {
  if (!text) return '';
  return text.replace(/\0/g, '').trimEnd();
}

function createShellRuntime() {
  const state = {
    cwd: '/',
    history: [],
    files: cloneSeededFiles(),
    closed: false,
  };

  function resolveCd(arg) {
    if (!arg || arg === '~') return '/';
    if (arg === '/') return '/';
    if (arg === '..') {
      const parts = state.cwd.split('/').filter(Boolean);
      parts.pop();
      return parts.length ? '/' + parts.join('/') : '/';
    }
    if (arg.startsWith('/')) return arg.replace(/\/+$/, '') || '/';
    const base = state.cwd === '/' ? '' : state.cwd;
    return `${base}/${arg}`;
  }

  function runSingle(command, pipedInput = '') {
    const trimmed = command.trim();
    if (!trimmed) return '';

    const [name, ...rest] = trimmed.split(/\s+/);
    const argStr = rest.join(' ');

    switch (name) {
      case 'echo':
        return argStr || pipedInput;
      case 'pwd':
        return state.cwd;
      case 'cd':
        state.cwd = resolveCd(argStr || null);
        return '';
      case 'ls':
        return Object.keys(state.files).sort().join('\n');
      case 'cat': {
        if (argStr) return state.files[argStr] ?? `cat: ${argStr}: No such file`;
        if (pipedInput) return pipedInput;
        return 'cat: no input (try: cat README.md or echo hi | cat)';
      }
      case 'touch':
        if (!argStr) return 'touch: missing file operand';
        if (!(argStr in state.files)) state.files[argStr] = '';
        return `created ${argStr}`;
      case 'rm':
        if (!argStr) return 'rm: missing operand';
        if (!(argStr in state.files)) return `rm: cannot remove '${argStr}': No such file`;
        delete state.files[argStr];
        return `removed ${argStr}`;
      case 'history':
        return state.history.map((e, i) => `${i + 1}  ${e}`).join('\n');
      case 'help':
        return [
          'Built-ins: cat, cd, echo, exit, help, history, ls, pwd, rm, touch',
          '',
          'Operators:',
          '  cmd1 | cmd2    pipe output',
          '  cmd > file     redirect output to file',
          '  cmd < file     read input from file',
        ].join('\n');
      case 'exit':
        state.closed = true;
        return '[shell] handing control back to Cogsworth...';
      default:
        return `${name}: command not found`;
    }
  }

  function execute(command) {
    const trimmed = command.trim();
    if (!trimmed) return { output: '', shouldExit: false };

    state.history.push(trimmed);

    if (trimmed.includes('>')) {
      const [left, right] = trimmed.split('>');
      const target = right.trim();
      if (!target) return { output: 'redirection: missing target file', shouldExit: false };
      const content = runSingle(left);
      state.files[target] = content;
      const bytes = new TextEncoder().encode(content).length;
      return { output: `wrote ${bytes} byte${bytes !== 1 ? 's' : ''} to ${target}`, shouldExit: state.closed };
    }

    if (trimmed.includes('<')) {
      const [left, right] = trimmed.split('<');
      const source = right.trim();
      if (!source) return { output: 'redirection: missing source file', shouldExit: false };
      if (!(source in state.files)) return { output: `${source}: No such file`, shouldExit: false };
      return { output: runSingle(left.trim(), state.files[source]), shouldExit: state.closed };
    }

    if (trimmed.includes('|')) {
      const stages = trimmed.split('|');
      let pipedOutput = '';
      for (let i = 0; i < stages.length; i++) {
        pipedOutput = runSingle(stages[i], i === 0 ? '' : pipedOutput);
      }
      return { output: pipedOutput, shouldExit: state.closed };
    }

    return { output: runSingle(trimmed), shouldExit: state.closed };
  }

  return {
    execute,
    getClosed: () => state.closed,
    getCwd: () => state.cwd,
    getFiles: () => Object.keys(state.files).sort(),
  };
}

let persistedEntries = null;
let persistedHistory = [];
let persistedRuntime = null;
let persistedWasm = null;
let persistedStatus = 'Loading shell.wasm...';
let persistedCwd = '/';

export function ShellDemo({ onExit }) {
  const [entries, setEntries] = useState(() => persistedEntries ?? []);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState(persistedHistory);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [status, setStatus] = useState(persistedStatus);
  const [cwd, setCwd] = useState(persistedCwd);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const wasmRef = useRef(persistedWasm);
  const runtimeRef = useRef(persistedRuntime);

  const closeMessage = useMemo(() => '[outer terminal] control restored.', []);

  useEffect(() => {
    inputRef.current?.focus();
    if (!runtimeRef.current) {
      runtimeRef.current = createShellRuntime();
      persistedRuntime = runtimeRef.current;
      const { output } = runtimeRef.current.execute('ls');
      if (output) {
        const lsEntry = { id: crypto.randomUUID(), type: 'output', text: output };
        setEntries([lsEntry]);
        persistedEntries = [lsEntry];
      }
    }
    const currentCwd = runtimeRef.current?.getCwd?.() ?? '/';
    setCwd(currentCwd);
    persistedCwd = currentCwd;
  }, []);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [entries]);

  useEffect(() => {
    let cancelled = false;

    async function loadShellModule() {
      if (persistedWasm !== null) {
        wasmRef.current = persistedWasm;
        return;
      }
      try {
        const response = await fetch('/wasm/shell.wasm');
        if (!response.ok) throw new Error(`Missing shell.wasm (${response.status})`);
        const importObject = { env: {} };
        let instance;
        try {
          ({ instance } = await WebAssembly.instantiateStreaming(response, importObject));
        } catch {
          const bytes = await (await fetch('/wasm/shell.wasm')).arrayBuffer();
          ({ instance } = await WebAssembly.instantiate(bytes, importObject));
        }
        if (!cancelled) {
          wasmRef.current = instance.exports;
          wasmRef.current.init_shell?.();
          persistedWasm = wasmRef.current;
          const newStatus = 'shell.wasm loaded — C runtime active.';
          persistedStatus = newStatus;
          setStatus(newStatus);
        }
      } catch {
        if (!cancelled) {
          wasmRef.current = null;
          persistedWasm = null;
          const newStatus = 'shell.wasm not built locally — using JS mirror. Demo stays fully interactive.';
          persistedStatus = newStatus;
          setStatus(newStatus);
        }
      }
    }

    loadShellModule();
    return () => { cancelled = true; };
  }, []);

  function appendOutput(text) {
    if (!text) return;
    setEntries((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), type: 'output', text }];
      persistedEntries = next;
      return next;
    });
  }

  function appendCommand(text) {
    setEntries((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), type: 'command', text }];
      persistedEntries = next;
      return next;
    });
  }

  function exitShell() {
    appendOutput(closeMessage);
    onExit?.();
  }

  function executeViaWasm(command) {
    const exp = wasmRef.current;
    if (!exp || typeof exp.process_command !== 'function' || !exp.memory) return null;
    if (!exp.get_input_buf || !exp.get_output_buf || !exp.get_output_buf_size) return null;

    const inputPtr = exp.get_input_buf();
    const outputPtr = exp.get_output_buf();
    const outputSize = exp.get_output_buf_size();
    if (!inputPtr || !outputPtr || !outputSize) return null;

    const memory = new Uint8Array(exp.memory.buffer);
    const inputBytes = new TextEncoder().encode(`${command}\0`);
    if (inputPtr + inputBytes.length >= exp.memory.buffer.byteLength) return null;
    if (outputPtr + outputSize >= exp.memory.buffer.byteLength) return null;

    memory.set(inputBytes, inputPtr);
    memory.fill(0, outputPtr, outputPtr + outputSize);
    exp.process_command(inputPtr, outputPtr, outputSize);

    let end = outputPtr;
    while (end < outputPtr + outputSize && memory[end] !== 0) end++;

    const output = new TextDecoder().decode(memory.slice(outputPtr, end));
    return { output, shouldExit: output.includes('__EXIT__') };
  }

  function handleSubmit() {
    const command = inputValue.trim();
    if (!command) return;

    appendCommand(command);
    setHistory((prev) => {
      const next = [command, ...prev];
      persistedHistory = next;
      return next;
    });
    setHistoryIndex(-1);
    setInputValue('');

    const wasmResult = executeViaWasm(command);
    const result = wasmResult ?? runtimeRef.current.execute(command);
    const cleanedOutput = result.output.replace('__EXIT__', '');
    const output = normalizeOutput(cleanedOutput);
    if (output) appendOutput(output);

    const newCwd = runtimeRef.current?.getCwd?.() ?? '/';
    setCwd(newCwd);
    persistedCwd = newCwd;

    if (result.shouldExit || runtimeRef.current.getClosed()) exitShell();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      exitShell();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const parts = inputValue.split(' ');
      const isCmd = parts.length === 1;
      const partial = parts[parts.length - 1];
      const candidates = isCmd
        ? SHELL_COMMANDS.filter((c) => partial.length > 0 && c.startsWith(partial))
        : (runtimeRef.current?.getFiles?.() ?? []).filter((f) => f.startsWith(partial));

      if (candidates.length === 1) {
        const prefix = isCmd ? '' : parts.slice(0, -1).join(' ') + ' ';
        setInputValue(prefix + candidates[0] + (isCmd ? ' ' : ''));
      } else if (candidates.length > 1) {
        appendOutput(candidates.join('  '));
      }
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHistoryIndex((idx) => {
        if (idx < history.length - 1) {
          const next = idx + 1;
          setInputValue(history[next]);
          return next;
        }
        return idx;
      });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHistoryIndex((idx) => {
        if (idx > 0) {
          const next = idx - 1;
          setInputValue(history[next]);
          return next;
        }
        setInputValue('');
        return -1;
      });
    }
  }

  const cwdDisplay = cwd === '/' ? '~' : cwd;
  const prompt = `puja@portfolio:${cwdDisplay}$`;

  return (
    <div className="shell-demo" onClick={() => inputRef.current?.focus()}>
      <div className="skills-category-title">sys --shell</div>
      <p className="alloc-demo-copy">
        A virtual shell backed by a C runtime compiled to WebAssembly. Commands route through the WASM parser for pipes, redirection, and history. Try <code>ls</code>, <code>cat README.md</code>, <code>echo hi | cat</code>, <code>echo text &gt; notes.txt</code>, or <code>Tab</code> to complete.
      </p>
      <div className="shell-demo-status">{status}</div>

      <div className="shell-demo-output" ref={outputRef}>
        {entries.map((entry) =>
          entry.type === 'command' ? (
            <div key={entry.id} className="shell-demo-line">
              <span className="shell-demo-prompt">{prompt}</span>
              <span className="command">{entry.text}</span>
            </div>
          ) : (
            <pre key={entry.id} className="shell-demo-pre">{entry.text}</pre>
          )
        )}
      </div>

      <div className="shell-demo-line">
        <span className="shell-demo-prompt">{prompt}</span>
        <input
          ref={inputRef}
          className="shell-demo-input"
          type="text"
          spellCheck="false"
          autoComplete="off"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="shell-demo-hint">Esc to exit · Tab to complete · Arrow keys for history</div>
    </div>
  );
}
