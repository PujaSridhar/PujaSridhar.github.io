import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function measureJsBaseline(iterations) {
  const started = performance.now();

  for (let index = 0; index < iterations; index += 1) {
    const buffer = new Uint8Array(256);
    buffer[0] = index & 255;
  }

  const elapsedMs = performance.now() - started;
  return Math.max(1, Math.round((elapsedMs * 1_000_000) / iterations));
}

function getChartPalette() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--color-accent').trim() || '#5A6050',
    free: styles.getPropertyValue('--color-bg-secondary').trim() || '#EDEAE4',
    border: styles.getPropertyValue('--color-border').trim() || '#D0CEC8',
    text: styles.getPropertyValue('--color-text').trim() || '#2A2820',
    muted: styles.getPropertyValue('--color-text-secondary').trim() || '#6A6860',
  };
}

export function AllocDemo() {
  const [status, setStatus] = useState('Loading alloc.wasm...');
  const [benchmarkData, setBenchmarkData] = useState([
    { label: 'myalloc', ns: 1 },
    { label: 'js baseline', ns: 1 },
  ]);
  const [heapBlocks, setHeapBlocks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [palette, setPalette] = useState(() => getChartPalette());
  const [allocOps, setAllocOps] = useState(null);
  const wasmExportsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAllocatorModule() {
      try {
        const response = await fetch('/wasm/alloc.wasm');
        if (!response.ok) {
          throw new Error(`Missing alloc.wasm (${response.status})`);
        }

        const importObject = { env: {} };

        let instance;
        try {
          ({ instance } = await WebAssembly.instantiateStreaming(response, importObject));
        } catch {
          const responseForBytes = await fetch('/wasm/alloc.wasm');
          const bytes = await responseForBytes.arrayBuffer();
          ({ instance } = await WebAssembly.instantiate(bytes, importObject));
        }

        if (!cancelled) {
          wasmExportsRef.current = instance.exports;
          // Reset the counter on load so it only reflects this session's benchmark
          wasmExportsRef.current.reset_alloc_counter?.();
          setStatus('alloc.wasm loaded. Benchmark ready.');
        }
      } catch {
        if (!cancelled) {
          wasmExportsRef.current = null;
          setStatus('alloc.wasm is not built locally yet. Using a simulated preview until the Emscripten build runs.');
        }
      }
    }

    loadAllocatorModule();

    const observer = new MutationObserver(() => {
      setPalette(getChartPalette());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  function readHeapBlocks() {
    const wasmExports = wasmExportsRef.current;
    if (!wasmExports?.get_heap_block_count || !wasmExports?.get_heap_block_info || !wasmExports?.memory) {
      return [];
    }

    const count = wasmExports.get_heap_block_count();
    const infoPtr = wasmExports.get_heap_block_info();
    const info = new Uint32Array(wasmExports.memory.buffer, infoPtr, count * 2);

    return Array.from({ length: count }, (_, index) => ({
      id: `block-${index}`,
      size: info[index * 2],
      state: info[index * 2 + 1] ? 'free' : 'allocated',
    }));
  }

  function runAllocatorBenchmark(iterations) {
    const wasmExports = wasmExportsRef.current;
    const wasmRunner = wasmExports?.run_benchmark || wasmExports?._run_benchmark;

    if (typeof wasmRunner !== 'function') return null;

    const jsBaseline = measureJsBaseline(iterations);
    const start = performance.now();
    const opsCompleted = wasmRunner(iterations);
    const elapsedMs = performance.now() - start;

    if (!opsCompleted || opsCompleted <= 0) return { allocatorNs: null, jsBaselineNs: jsBaseline };

    const nsPerOp = Math.round((elapsedMs * 1_000_000) / opsCompleted);

    // Read the counter from the same WASM instance that just ran the benchmark
    const rawCounter = wasmExports.get_alloc_counter?.();
    const totalOps = rawCounter !== undefined ? Number(rawCounter) : null;

    return { allocatorNs: nsPerOp, jsBaselineNs: jsBaseline, totalOps };
  }

  function handleRunBenchmark() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setAllocOps(null);

    window.setTimeout(() => {
      const iterations = 1000000;
      const benchmarkResult = runAllocatorBenchmark(iterations);
      const jsBaseline = benchmarkResult?.jsBaselineNs ?? measureJsBaseline(iterations);
      const allocatorTime = benchmarkResult?.allocatorNs ?? Math.max(1, Math.round(jsBaseline * 0.76));

      setBenchmarkData([
        { label: 'myalloc', ns: allocatorTime },
        { label: 'js baseline', ns: jsBaseline },
      ]);

      if (benchmarkResult?.totalOps !== null && benchmarkResult?.totalOps !== undefined) {
        setAllocOps(benchmarkResult.totalOps);
      }

      setHeapBlocks(readHeapBlocks());

      setStatus(
        benchmarkResult?.allocatorNs
          ? `Benchmark complete. alloc.wasm responded with ${allocatorTime}ns/op.`
          : 'Benchmark complete. Showing simulated allocator timings until alloc.wasm is built.'
      );
      setIsRunning(false);
    }, 1400);
  }

  return (
    <div className="alloc-demo">
      <div className="skills-category-title">sys --alloc</div>
      <p className="alloc-demo-copy">
        Built a free-list allocator in C: block splitting, coalescing, 8-byte alignment, backed by a static heap.
        Compiled to WASM with Emscripten. Run the benchmark to measure current timings against a JS Uint8Array baseline.
      </p>
      <div className="alloc-demo-status">{status}</div>
      {allocOps !== null && (
        <div className="alloc-demo-status">
          <span className="command">{allocOps.toLocaleString()}</span> malloc/free ops tracked in WASM linear memory this session.
        </div>
      )}

      <div className="alloc-demo-toolbar">
        <button className="alloc-demo-button" type="button" onClick={handleRunBenchmark} disabled={isRunning}>
          {isRunning ? 'Benchmarking...' : 'Run Benchmark'}
        </button>
        <span className="alloc-demo-caption">1M-ish tiny allocations, normalized to ns/op.</span>
      </div>

      <div className="alloc-demo-grid">
        <section className="alloc-demo-panel">
          <div className="alloc-demo-panel-title">Benchmark</div>
          <div className="alloc-demo-chart" style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={benchmarkData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: palette.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fill: palette.muted, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(value) => `${value}ns`}
                />
                <Tooltip
                  cursor={{ fill: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: '6px',
                  }}
                  formatter={(value) => [`${value}ns/op`, 'time']}
                />
                <Bar dataKey="ns" radius={[6, 6, 0, 0]}>
                  {benchmarkData.map((entry) => (
                    <Cell key={entry.label} fill={entry.label === 'myalloc' ? palette.accent : palette.free} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="alloc-demo-panel">
          <div className="alloc-demo-panel-title">Heap View</div>
          {heapBlocks.length > 0 ? (
            <>
              <div className="alloc-demo-heap">
                {heapBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`alloc-demo-block alloc-demo-block-${block.state}`}
                    style={{ flexGrow: block.size }}
                    title={`${block.state} · ${block.size} bytes`}
                  >
                    <span>{block.state === 'allocated' ? 'used' : 'free'}</span>
                  </div>
                ))}
              </div>
              <div className="alloc-demo-legend">
                <span><i className="alloc-demo-swatch alloc-demo-swatch-allocated" />allocated</span>
                <span><i className="alloc-demo-swatch alloc-demo-swatch-free" />free</span>
              </div>
            </>
          ) : (
            <p className="alloc-demo-caption">
              Run the benchmark to inspect the live free-list state from alloc.wasm.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}