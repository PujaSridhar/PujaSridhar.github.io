import { useCallback, useEffect, useRef, useState } from 'react';

function initializeThreads() {
  return [
    { id: 'A', name: 'Writer', burstTime: 15, remainingTime: 15, state: 'READY', blockedBy: null },
    { id: 'B', name: 'Reader', burstTime: 12, remainingTime: 12, state: 'READY', blockedBy: null },
    { id: 'C', name: 'Counter', burstTime: 10, remainingTime: 10, state: 'READY', blockedBy: null },
  ];
}

function getStateColor(state) {
  switch (state) {
    case 'READY':
      return 'hsl(120, 40%, 60%)';
    case 'RUNNING':
      return 'hsl(60, 100%, 50%)';
    case 'BLOCKED':
      return 'hsl(0, 70%, 60%)';
    case 'DONE':
      return 'hsl(0, 0%, 75%)';
    default:
      return 'hsl(0, 0%, 50%)';
  }
}

export function ThreadDemo({ onExit }) {
  const [threads, setThreads] = useState(initializeThreads());
  const [timeline, setTimeline] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [quantumMs, setQuantumMs] = useState(5);
  const [tickCount, setTickCount] = useState(0);
  const tickIntervalRef = useRef(null);
  // Tracks the index of the last thread that was scheduled so the next
  // pick always starts from the following position — true round-robin.
  const lastScheduledIndexRef = useRef(-1);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onExit?.();
    }
  }

  const executeTick = useCallback(() => {
    setThreads((prevThreads) => {
      // Step 1 — unblock any thread whose blocker is now DONE
      const unblocked = prevThreads.map((thread) => {
        if (thread.state === 'BLOCKED' && thread.blockedBy) {
          const blocker = prevThreads.find((t) => t.id === thread.blockedBy);
          if (blocker && blocker.state === 'DONE') {
            return { ...thread, blockedBy: null, state: 'READY' };
          }
        }
        return thread;
      });

      const runningIndex = unblocked.findIndex((t) => t.state === 'RUNNING');

      if (runningIndex !== -1) {
        // Step 2a — decrement the running thread and yield it.
        // Record its index so the next pick starts after it.
        const runningThread = unblocked[runningIndex];
        const decremented = runningThread.remainingTime - 1;
        const newState = decremented <= 0 ? 'DONE' : 'READY';

        lastScheduledIndexRef.current = runningIndex;

        setTimeline((prev) => {
          const label = `${runningThread.name}(${decremented > 0 ? decremented : '✓'})`;
          return [...prev.slice(-19), label];
        });

        return unblocked.map((t) =>
          t.id === runningThread.id
            ? { ...t, remainingTime: Math.max(0, decremented), state: newState }
            : t
        );
      }

      // Step 2b — no thread is running: pick the next READY thread
      // starting from the position AFTER the last scheduled one.
      const count = unblocked.length;
      const start = lastScheduledIndexRef.current;

      for (let offset = 1; offset <= count; offset += 1) {
        const idx = (start + offset) % count;
        if (unblocked[idx].state === 'READY') {
          lastScheduledIndexRef.current = idx;
          return unblocked.map((t, i) =>
            i === idx ? { ...t, state: 'RUNNING' } : t
          );
        }
      }

      // All threads are DONE or BLOCKED
      return unblocked;
    });

    setTickCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    tickIntervalRef.current = window.setInterval(executeTick, quantumMs);

    return () => {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [isRunning, quantumMs, executeTick]);

  function handlePlayPause() {
    setIsRunning((prev) => !prev);
  }

  function handleStep() {
    setIsRunning(false);
    executeTick();
  }

  function handleReset() {
    setIsRunning(false);
    setThreads(initializeThreads());
    setTimeline([]);
    setTickCount(0);
    lastScheduledIndexRef.current = -1;
  }

  function handleIntroduceDeadlock() {
    setIsRunning(false);
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === 'A') return { ...t, blockedBy: 'B', state: 'BLOCKED' };
        if (t.id === 'B') return { ...t, blockedBy: 'A', state: 'BLOCKED' };
        return t;
      })
    );
  }

  const allDone = threads.every((t) => t.state === 'DONE' || t.state === 'BLOCKED');

  return (
    <div className="thread-demo" onKeyDown={handleKeyDown}>
      <div className="skills-category-title">sys --threads</div>

      <div className="thread-demo-status">
        Round-robin scheduler · Quantum: {quantumMs}ms · Ticks: {tickCount}
        {allDone && threads.some((t) => t.state === 'BLOCKED') && (
          <span className="thread-demo-warning"> → Deadlock detected!</span>
        )}
        {allDone && threads.every((t) => t.state === 'DONE') && (
          <span className="thread-demo-success"> → All threads completed</span>
        )}
      </div>

      <div className="thread-demo-grid">
        {threads.map((thread) => (
          <div key={thread.id} className="thread-demo-card" style={{ borderColor: getStateColor(thread.state) }}>
            <div className="thread-demo-card-header">
              <div className="thread-demo-state-indicator" style={{ backgroundColor: getStateColor(thread.state) }} />
              <span className="thread-demo-card-name">{thread.name}</span>
              <span className="thread-demo-card-id">[{thread.id}]</span>
            </div>

            <div className="thread-demo-card-body">
              <div className="thread-demo-stat">
                <span className="thread-demo-stat-label">State:</span>
                <span className="thread-demo-stat-value">{thread.state}</span>
              </div>
              <div className="thread-demo-stat">
                <span className="thread-demo-stat-label">Remaining:</span>
                <span className="thread-demo-stat-value">{thread.remainingTime}ms</span>
              </div>
              <div style={{
                height: '4px',
                background: 'var(--color-border)',
                borderRadius: '2px',
                marginTop: '0.4rem',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(thread.remainingTime / thread.burstTime) * 100}%`,
                  background: getStateColor(thread.state),
                  borderRadius: '2px',
                  transition: 'width 0.15s ease, background-color 0.3s ease',
                }} />
              </div>
              {thread.blockedBy && (
                <div className="thread-demo-stat thread-demo-stat-blocked">
                  <span className="thread-demo-stat-label">Blocked by:</span>
                  <span className="thread-demo-stat-value">[{thread.blockedBy}]</span>
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
                {entry}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="thread-demo-toolbar">
        <div className="thread-demo-controls">
          <button className="thread-demo-button" onClick={handlePlayPause} disabled={allDone}>
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button className="thread-demo-button" onClick={handleStep} disabled={isRunning || allDone}>
            Step
          </button>
          <button className="thread-demo-button" onClick={handleReset}>
            Reset
          </button>
          <button
            className="thread-demo-button thread-demo-button-danger"
            onClick={handleIntroduceDeadlock}
            disabled={isRunning || tickCount > 0}
          >
            Introduce Deadlock
          </button>
        </div>

        <div className="thread-demo-slider">
          <label htmlFor="quantum-slider">Quantum (ms):</label>
          <input
            id="quantum-slider"
            type="range"
            min="1"
            max="10"
            value={quantumMs}
            onChange={(e) => setQuantumMs(parseInt(e.target.value, 10))}
            disabled={isRunning}
          />
          <span>{quantumMs}</span>
        </div>
      </div>
    </div>
  );
}