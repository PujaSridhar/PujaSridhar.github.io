import { useCallback, useEffect, useRef, useState } from 'react';

const PCB_FIELDS = 6;
const QUANTUM_MS = 5;

const STATE_NAMES = ['READY', 'RUNNING', 'BLOCKED', 'DONE'];
const THREAD_NAMES = ['Writer', 'Reader', 'Counter', 'Indexer', 'Logger'];

const BURST_TIMES = [25, 20, 15, 30, 10]; // burst_ms per thread

function getStateColor(state) {
  switch (state) {
    case 'READY':   return 'hsl(120, 40%, 60%)';
    case 'RUNNING': return 'hsl(60, 100%, 50%)';
    case 'BLOCKED': return 'hsl(0, 70%, 60%)';
    case 'DONE':    return 'hsl(0, 0%, 55%)';
    default:        return 'hsl(0, 0%, 40%)';
  }
}

/* Module-level WASM cache so the scheduler persists across re-mounts */
let cachedWasm = null;
let cachedStatus = 'Loading scheduler.wasm...';

export function ThreadDemo({ onExit }) {
  const [status, setStatus] = useState(cachedStatus);
  const [wasmReady, setWasmReady] = useState(!!cachedWasm);
  const [pcbs, setPcbs] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [ticks, setTicks] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [deadlocked, setDeadlocked] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const wasmRef = useRef(cachedWasm);
  const intervalRef = useRef(null);

  /* ── Load WASM ──────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cachedWasm) {
        wasmRef.current = cachedWasm;
        return;
      }
      try {
        const response = await fetch('/wasm/scheduler.wasm');
        if (!response.ok) throw new Error(`${response.status}`);
        const importObject = { env: {} };
        let instance;
        try {
          ({ instance } = await WebAssembly.instantiateStreaming(response, importObject));
        } catch {
          const bytes = await (await fetch('/wasm/scheduler.wasm')).arrayBuffer();
          ({ instance } = await WebAssembly.instantiate(bytes, importObject));
        }
        if (!cancelled) {
          wasmRef.current = instance.exports;
          cachedWasm = instance.exports;
          const msg = 'scheduler.wasm loaded — C scheduler running in your browser.';
          cachedStatus = msg;
          setStatus(msg);
          setWasmReady(true);
        }
      } catch {
        if (!cancelled) {
          const msg = 'scheduler.wasm unavailable — run npm run build:wasm.';
          cachedStatus = msg;
          setStatus(msg);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Read PCB snapshot from WASM memory ─────────────────────── */
  function readPCBs(wasm) {
    const count = wasm.get_thread_count();
    if (count === 0) return [];
    const ptr = wasm.get_pcb_snapshot();
    const arr = new Int32Array(wasm.memory.buffer, ptr, count * PCB_FIELDS);
    return Array.from({ length: count }, (_, i) => ({
      id:        arr[i * PCB_FIELDS + 0],
      state:     STATE_NAMES[arr[i * PCB_FIELDS + 1]] ?? 'UNKNOWN',
      burstTotal: arr[i * PCB_FIELDS + 2],
      remaining:  arr[i * PCB_FIELDS + 3],
      held:       arr[i * PCB_FIELDS + 4],
      waiting:    arr[i * PCB_FIELDS + 5],
    }));
  }

  function readTimeline(wasm) {
    const len = wasm.get_timeline_len();
    if (len === 0) return [];
    const ptr = wasm.get_timeline();
    return Array.from(new Int32Array(wasm.memory.buffer, ptr, len));
  }

  function syncState() {
    const wasm = wasmRef.current;
    if (!wasm) return;
    const pcbList = readPCBs(wasm);
    setPcbs(pcbList);
    const tl = readTimeline(wasm);
    setTimeline(tl.slice(-20));
    setTicks(wasm.get_ticks());
    setDeadlocked(!!wasm.is_deadlock());
    setAllDone(pcbList.length > 0 && pcbList.every(p => p.state === 'DONE' || p.state === 'BLOCKED'));
  }

  /* ── Init scheduler ─────────────────────────────────────────── */
  function handleInit() {
    const wasm = wasmRef.current;
    if (!wasm) return;
    wasm.init_scheduler(QUANTUM_MS);
    for (let i = 0; i < 3; i++) {
      wasm.create_thread(BURST_TIMES[i]);
    }
    setInitialized(true);
    setIsRunning(false);
    setDeadlocked(false);
    setAllDone(false);
    setTimeline([]);
    setTicks(0);
    syncState();
  }

  /* ── Step ───────────────────────────────────────────────────── */
  const executeTick = useCallback(() => {
    const wasm = wasmRef.current;
    if (!wasm) return;
    wasm.step();
    syncState();
  }, []);

  /* ── Play/Pause interval ────────────────────────────────────── */
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(executeTick, 200);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, executeTick]);

  /* Auto-stop when finished */
  useEffect(() => {
    if ((allDone || deadlocked) && isRunning) {
      setIsRunning(false);
    }
  }, [allDone, deadlocked, isRunning]);

  /* ── Keyboard ───────────────────────────────────────────────── */
  function handleKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onExit?.(); }
  }

  function handleIntroduceDeadlock() {
    const wasm = wasmRef.current;
    if (!wasm) return;
    setIsRunning(false);
    const ok = wasm.introduce_deadlock();
    if (ok) syncState();
  }

  function handleReset() {
    setIsRunning(false);
    setInitialized(false);
    setDeadlocked(false);
    setAllDone(false);
    setPcbs([]);
    setTimeline([]);
    setTicks(0);
    const wasm = wasmRef.current;
    if (wasm) wasm.init_scheduler(QUANTUM_MS);
  }

  /* ── Timeline label ─────────────────────────────────────────── */
  function timelineLabel(val) {
    if (val === -2) return '💀';
    if (val === -1) return '--';
    return THREAD_NAMES[val]?.[0] ?? `T${val}`;
  }

  return (
    <div className="thread-demo" onKeyDown={handleKeyDown}>
      <div className="skills-category-title">sys --threads</div>
      <div className="alloc-demo-status">{status}</div>

      {!initialized ? (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ opacity: 0.7, fontSize: '0.9em', marginBottom: '1rem' }}>
            A round-robin thread scheduler written in C, compiled to WebAssembly.
            Each thread has a burst time — the scheduler picks the next READY thread
            every {QUANTUM_MS}ms quantum. Introduce a deadlock to see two threads
            block each other permanently on shared resources.
          </p>
          <button className="alloc-demo-button" disabled={!wasmReady} onClick={handleInit}>
            Start Scheduler (3 threads)
          </button>
        </div>
      ) : (
        <>
          <div className="thread-demo-status" style={{ marginTop: '0.5rem' }}>
            Round-robin · Quantum: {QUANTUM_MS}ms · Ticks: {ticks}
            {deadlocked && <span className="thread-demo-warning"> → Deadlock detected</span>}
            {!deadlocked && allDone && <span className="thread-demo-success"> → All threads completed</span>}
          </div>

          <div className="thread-demo-grid">
            {pcbs.map((pcb) => (
              <div
                key={pcb.id}
                className="thread-demo-card"
                style={{ borderColor: getStateColor(pcb.state) }}
              >
                <div className="thread-demo-card-header">
                  <div className="thread-demo-state-indicator" style={{ backgroundColor: getStateColor(pcb.state) }} />
                  <span className="thread-demo-card-name">{THREAD_NAMES[pcb.id] ?? `T${pcb.id}`}</span>
                  <span className="thread-demo-card-id">[T{pcb.id}]</span>
                </div>
                <div className="thread-demo-card-body">
                  <div className="thread-demo-stat">
                    <span className="thread-demo-stat-label">State:</span>
                    <span className="thread-demo-stat-value">{pcb.state}</span>
                  </div>
                  <div className="thread-demo-stat">
                    <span className="thread-demo-stat-label">Remaining:</span>
                    <span className="thread-demo-stat-value">{Math.max(0, pcb.remaining)}ms</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pcb.burstTotal > 0 ? Math.max(0, pcb.remaining / pcb.burstTotal) * 100 : 0}%`,
                      background: getStateColor(pcb.state),
                      borderRadius: '2px',
                      transition: 'width 0.15s ease',
                    }} />
                  </div>
                  {pcb.state === 'BLOCKED' && pcb.held >= 0 && (
                    <div className="thread-demo-stat" style={{ marginTop: '0.3rem', opacity: 0.7, fontSize: '0.8em' }}>
                      holds R{pcb.held}, waiting R{pcb.waiting}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="thread-demo-timeline">
            <div className="thread-demo-timeline-label">Timeline (last 20 quanta):</div>
            <div className="thread-demo-timeline-strip">
              {timeline.length === 0 ? (
                <span className="thread-demo-timeline-empty">Waiting to start...</span>
              ) : (
                timeline.map((entry, idx) => (
                  <span key={idx} className="thread-demo-timeline-entry">
                    {timelineLabel(entry)}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="thread-demo-toolbar">
            <div className="thread-demo-controls">
              <button
                className="thread-demo-button"
                onClick={() => setIsRunning(p => !p)}
                disabled={allDone || deadlocked}
              >
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                className="thread-demo-button"
                onClick={executeTick}
                disabled={isRunning || allDone || deadlocked}
              >
                Step
              </button>
              <button className="thread-demo-button" onClick={handleReset}>
                Reset
              </button>
              <button
                className="thread-demo-button thread-demo-button-danger"
                onClick={handleIntroduceDeadlock}
                disabled={isRunning || deadlocked || allDone || pcbs.filter(p => p.state === 'READY').length < 2}
              >
                Introduce Deadlock
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
