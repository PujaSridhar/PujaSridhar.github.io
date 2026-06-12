import { useEffect, useMemo, useRef, useState } from 'react';

const PROMPT = 'puja@portfolio:~$';

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
  return Object.entries(SEEDED_FILES).reduce((filesystem, [name, content]) => {
    filesystem[name] = content;
    return filesystem;
  }, {});
}

function normalizeOutput(text) {
  if (!text) {
    return '';
  }

  return text.replace(/\0/g, '').trimEnd();
}

function createShellRuntime() {
  const state = {
    cwd: '/',
    history: [],
    files: cloneSeededFiles(),
    closed: false,
  };

  function listFiles() {
    return Object.keys(state.files).sort();
  }

  function runSingle(command, pipedInput = '') {
    const trimmed = command.trim();
    if (!trimmed) {
      return '';
    }

    const [name, ...rest] = trimmed.split(/\s+/);
    const argumentString = rest.join(' ');

    switch (name) {
      case 'echo':
        return argumentString || pipedInput;
      case 'pwd':
        return state.cwd;
      case 'cd':
        if (!argumentString || argumentString === '~' || argumentString === '/') {
          state.cwd = '/';
          return '';
        }
        return `cd: ${argumentString}: No such directory`;
      case 'ls':
        return listFiles().join('\n');
      case 'cat': {
        const target = argumentString || pipedInput.trim();
        if (!target) {
          return 'cat: missing file operand';
        }
        return state.files[target] ?? `cat: ${target}: No such file`;
      }
      case 'history':
        return state.history.map((entry, index) => `${index + 1}  ${entry}`).join('\n');
      case 'help':
        return [
          'Built-ins:',
          'echo, pwd, cd, ls, cat, history, help, exit',
          '',
          'Supports:',
          'cmd1 | cmd2',
          'cmd > file',
          'cmd < file',
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
    if (!trimmed) {
      return { output: '', shouldExit: false };
    }

    state.history.push(trimmed);

    if (trimmed.includes('>')) {
      const [left, right] = trimmed.split('>');
      const target = right.trim();
      if (!target) {
        return { output: 'redirection: missing target file', shouldExit: false };
      }
      const output = runSingle(left);
      state.files[target] = output;
      return { output: '', shouldExit: state.closed };
    }

    if (trimmed.includes('<')) {
      const [left, right] = trimmed.split('<');
      const source = right.trim();
      if (!source) {
        return { output: 'redirection: missing source file', shouldExit: false };
      }
      if (!state.files[source]) {
        return { output: `${source}: No such file`, shouldExit: false };
      }
      const commandWithInput = `${left.trim()} ${source}`.trim();
      return { output: runSingle(commandWithInput, state.files[source]), shouldExit: state.closed };
    }

    if (trimmed.includes('|')) {
      const [left, right] = trimmed.split('|');
      const leftOutput = runSingle(left);
      const piped = runSingle(right, leftOutput);
      return { output: piped, shouldExit: state.closed };
    }

    return { output: runSingle(trimmed), shouldExit: state.closed };
  }

  return {
    execute,
    getClosed: () => state.closed,
  };
}

export function ShellDemo({ onExit }) {
  const [entries, setEntries] = useState(() => [
    { id: crypto.randomUUID(), type: 'output', text: 'Nested shell ready. Type help to explore the virtual filesystem.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [status, setStatus] = useState('Loading shell.wasm...');
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const wasmRef = useRef(null);
  const runtimeRef = useRef(null);

  const closeMessage = useMemo(() => '[outer terminal] control restored.', []);

  useEffect(() => {
    inputRef.current?.focus();
    runtimeRef.current = createShellRuntime();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    let cancelled = false;

    async function loadShellModule() {
      try {
        const response = await fetch('/wasm/shell.wasm');
        if (!response.ok) {
          throw new Error(`Missing shell.wasm (${response.status})`);
        }

        const importObject = { env: {} };

        let instance;
        try {
          ({ instance } = await WebAssembly.instantiateStreaming(response, importObject));
        } catch {
          const responseForBytes = await fetch('/wasm/shell.wasm');
          const bytes = await responseForBytes.arrayBuffer();
          ({ instance } = await WebAssembly.instantiate(bytes, importObject));
        }

        if (!cancelled) {
          wasmRef.current = instance.exports;
          wasmRef.current.init_shell?.();
          setStatus('shell.wasm loaded. Inner terminal is using the systems demo runtime.');
        }
      } catch {
        if (!cancelled) {
          wasmRef.current = null;
          setStatus('shell.wasm is not built locally yet. Using the JavaScript mirror so the demo stays interactive.');
        }
      }
    }

    loadShellModule();

    return () => {
      cancelled = true;
    };
  }, []);

  function appendOutput(text) {
    if (!text) {
      return;
    }

    setEntries((previous) => [...previous, { id: crypto.randomUUID(), type: 'output', text }]);
  }

  function appendCommand(text) {
    setEntries((previous) => [...previous, { id: crypto.randomUUID(), type: 'command', text }]);
  }

  function exitShell() {
    appendOutput(closeMessage);
    onExit?.();
  }

  function executeViaWasm(command) {
    const exportsObject = wasmRef.current;
    if (!exportsObject || typeof exportsObject.process_command !== 'function' || !exportsObject.memory) {
      return null;
    }

    if (typeof exportsObject.get_input_buf !== 'function' ||
        typeof exportsObject.get_output_buf !== 'function' ||
        typeof exportsObject.get_output_buf_size !== 'function') {
      return null;
    }

    const inputPtr = exportsObject.get_input_buf();
    const outputPtr = exportsObject.get_output_buf();
    const outputSize = exportsObject.get_output_buf_size();

    if (inputPtr === 0 || outputPtr === 0 || outputSize === 0) {
      return null;
    }

    const encoder = new TextEncoder();
    const memory = new Uint8Array(exportsObject.memory.buffer);
    const inputBytes = encoder.encode(`${command}\0`);

    if (inputPtr + inputBytes.length >= exportsObject.memory.buffer.byteLength ||
        outputPtr + outputSize >= exportsObject.memory.buffer.byteLength) {
      return null;
    }

    memory.set(inputBytes, inputPtr);
    memory.fill(0, outputPtr, outputPtr + outputSize);
    exportsObject.process_command(inputPtr, outputPtr, outputSize);

    let end = outputPtr;
    while (end < outputPtr + outputSize && memory[end] !== 0) {
      end += 1;
    }

    const decoder = new TextDecoder();
    const output = decoder.decode(memory.slice(outputPtr, end));
    return { output, shouldExit: output.includes('__EXIT__') };
  }

  function handleSubmit() {
    const command = inputValue.trim();
    if (!command) {
      return;
    }

    appendCommand(command);
    setHistory((previous) => [command, ...previous]);
    setHistoryIndex(-1);
    setInputValue('');

    const wasmResult = executeViaWasm(command);
    const result = wasmResult ?? runtimeRef.current.execute(command);
    const cleanedOutput = result.output.replace('__EXIT__', '');
    const output = normalizeOutput(cleanedOutput);

    if (output) {
      appendOutput(output);
    }

    if (result.shouldExit || runtimeRef.current.getClosed()) {
      exitShell();
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      exitShell();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHistoryIndex((currentIndex) => {
        if (currentIndex < history.length - 1) {
          const nextIndex = currentIndex + 1;
          setInputValue(history[nextIndex]);
          return nextIndex;
        }
        return currentIndex;
      });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHistoryIndex((currentIndex) => {
        if (currentIndex > 0) {
          const nextIndex = currentIndex - 1;
          setInputValue(history[nextIndex]);
          return nextIndex;
        }
        setInputValue('');
        return -1;
      });
    }
  }

  return (
    <div className="shell-demo" onClick={() => inputRef.current?.focus()}>
      <div className="skills-category-title">sys --shell</div>
      <div className="shell-demo-status">{status}</div>

      <div className="shell-demo-output" ref={outputRef}>
        {entries.map((entry) =>
          entry.type === 'command' ? (
            <div key={entry.id} className="shell-demo-line">
              <span className="shell-demo-prompt">{PROMPT}</span>
              <span className="command">{entry.text}</span>
            </div>
          ) : (
            <pre key={entry.id} className="shell-demo-pre">
              {entry.text}
            </pre>
          )
        )}
      </div>

      <div className="shell-demo-line">
        <span className="shell-demo-prompt">{PROMPT}</span>
        <input
          ref={inputRef}
          className="shell-demo-input"
          type="text"
          spellCheck="false"
          autoComplete="off"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
