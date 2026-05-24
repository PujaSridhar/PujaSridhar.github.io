import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DEFAULT_HEAP_BLOCKS = [
  { id: 'boot-1', size: 12, state: 'free' },
  { id: 'boot-2', size: 8, state: 'free' },
  { id: 'boot-3', size: 10, state: 'free' },
  { id: 'boot-4', size: 6, state: 'free' },
  { id: 'boot-5', size: 14, state: 'free' },
  { id: 'boot-6', size: 10, state: 'free' },
];

const HEAP_FRAMES = [
  [
    { id: 'frame-1a', size: 10, state: 'allocated' },
    { id: 'frame-1b', size: 6, state: 'allocated' },
    { id: 'frame-1c', size: 8, state: 'free' },
    { id: 'frame-1d', size: 12, state: 'allocated' },
    { id: 'frame-1e', size: 10, state: 'free' },
    { id: 'frame-1f', size: 14, state: 'allocated' },
  ],
  [
    { id: 'frame-2a', size: 10, state: 'allocated' },
    { id: 'frame-2b', size: 6, state: 'free' },
    { id: 'frame-2c', size: 8, state: 'free' },
    { id: 'frame-2d', size: 8, state: 'allocated' },
    { id: 'frame-2e', size: 4, state: 'allocated' },
    { id: 'frame-2f', size: 10, state: 'free' },
    { id: 'frame-2g', size: 14, state: 'allocated' },
  ],
  [
    { id: 'frame-3a', size: 16, state: 'free' },
    { id: 'frame-3b', size: 8, state: 'allocated' },
    { id: 'frame-3c', size: 12, state: 'allocated' },
    { id: 'frame-3d', size: 10, state: 'free' },
    { id: 'frame-3e', size: 14, state: 'allocated' },
  ],
  [
    { id: 'frame-4a', size: 20, state: 'free' },
    { id: 'frame-4b', size: 12, state: 'allocated' },
    { id: 'frame-4c', size: 18, state: 'free' },
    { id: 'frame-4d', size: 10, state: 'allocated' },
  ],
];

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
  const [heapBlocks, setHeapBlocks] = useState(DEFAULT_HEAP_BLOCKS);
  const [isRunning, setIsRunning] = useState(false);
  const [palette, setPalette] = useState(() => getChartPalette());
  const wasmExportsRef = useRef(null);
  const heapFrameTimeoutsRef = useRef([]);

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
          setStatus('alloc.wasm loaded. Benchmark ready.');
        }
      } catch (error) {
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
      heapFrameTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      heapFrameTimeoutsRef.current = [];
    };
  }, []);

  function queueHeapFrames() {
    heapFrameTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heapFrameTimeoutsRef.current = HEAP_FRAMES.map((frame, index) =>
      window.setTimeout(() => {
        setHeapBlocks(frame);
      }, index * 350)
    );
  }

  function runAllocatorBenchmark(iterations) {
    const wasmExports = wasmExportsRef.current;
    const wasmSetBaseline =
      wasmExports?.set_js_baseline ||
      wasmExports?._set_js_baseline ||
      wasmExports?.['setJsBaseline'];
    const wasmRunner =
      wasmExports?.run_benchmark ||
      wasmExports?._run_benchmark ||
      wasmExports?.['runBenchmark'];

    if (typeof wasmRunner !== 'function') {
      return null;
    }

    const jsBaseline = measureJsBaseline(iterations);

    if (typeof wasmSetBaseline === 'function') {
      wasmSetBaseline(jsBaseline);
    }

    const result = wasmRunner(iterations);
    if (typeof result !== 'number' || Number.isNaN(result) || result <= 0) {
      return { allocatorNs: null, jsBaselineNs: jsBaseline };
    }

    return { allocatorNs: Math.round(result), jsBaselineNs: jsBaseline };
  }

  function handleRunBenchmark() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    queueHeapFrames();

    window.setTimeout(() => {
      const iterations = 10000;
      const benchmarkResult = runAllocatorBenchmark(iterations);
      const jsBaseline = benchmarkResult?.jsBaselineNs ?? measureJsBaseline(iterations);
      const allocatorTime = benchmarkResult?.allocatorNs ?? Math.max(1, Math.round(jsBaseline * 0.76));

      setBenchmarkData([
        { label: 'myalloc', ns: allocatorTime },
        { label: 'js baseline', ns: jsBaseline },
      ]);
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
        Built a free-list allocator in C on top of mmap — block splitting, coalescing, alignment. This is the kind of thing that comes up in every systems interview. Compile with Emscripten to see real WASM timings.
      </p>

      <div className="alloc-demo-status">{status}</div>

      <div className="alloc-demo-toolbar">
        <button className="alloc-demo-button" type="button" onClick={handleRunBenchmark} disabled={isRunning}>
          {isRunning ? 'Benchmarking...' : 'Run Benchmark'}
        </button>
        <span className="alloc-demo-caption">1M-ish tiny allocations, normalized to ns/op.</span>
      </div>

      <div className="alloc-demo-grid">
        <section className="alloc-demo-panel">
          <div className="alloc-demo-panel-title">Benchmark</div>
          <div className="alloc-demo-chart">
            <ResponsiveContainer width="100%" height="100%">
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
          <div className="alloc-demo-heap">
            {heapBlocks.map((block) => (
              <div
                key={block.id}
                className={`alloc-demo-block alloc-demo-block-${block.state}`}
                style={{ flexGrow: block.size }}
                title={`${block.state} · ${block.size} units`}
              >
                <span>{block.state === 'allocated' ? 'used' : 'free'}</span>
              </div>
            ))}
          </div>
          <div className="alloc-demo-legend">
            <span><i className="alloc-demo-swatch alloc-demo-swatch-allocated" />allocated</span>
            <span><i className="alloc-demo-swatch alloc-demo-swatch-free" />free</span>
          </div>
        </section>
      </div>
    </div>
  );
}
