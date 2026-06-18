import { useEffect, useRef, useState } from 'react';

const ALLOC_SIZES = { Small: 64, Medium: 128, Large: 256 };
const BLOCK_LABELS = 'ABCDEFGHIJKLMNOP'.split('');

const ALLOC_COLORS = [
  'hsl(120, 42%, 48%)',
  'hsl(200, 62%, 52%)',
  'hsl(280, 50%, 57%)',
  'hsl(35, 72%, 52%)',
  'hsl(340, 60%, 55%)',
  'hsl(180, 52%, 46%)',
  'hsl(60, 62%, 44%)',
  'hsl(15, 68%, 50%)',
];

function getLabelColor(label) {
  const idx = BLOCK_LABELS.indexOf(label);
  return ALLOC_COLORS[idx < 0 ? 0 : idx % ALLOC_COLORS.length];
}

let cachedWasm = null;
let cachedStatus = 'Loading alloc.wasm...';

export function AllocDemo({ onExit }) {
  const [status, setStatus] = useState(cachedStatus);
  const [heapBlocks, setHeapBlocks] = useState([]);
  const [liveAllocs, setLiveAllocs] = useState([]);
  const [logLines, setLogLines] = useState([
    'Heap ready. Allocate blocks below — watch them split, free them and see adjacent ones coalesce.',
  ]);
  const [wasmReady, setWasmReady] = useState(!!cachedWasm);
  const [hasFreeOccurred, setHasFreeOccurred] = useState(false);
  const wasmRef = useRef(cachedWasm);
  const labelCounterRef = useRef(0);
  const logRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cachedWasm) {
        wasmRef.current = cachedWasm;
        return;
      }
      try {
        const response = await fetch('/wasm/alloc.wasm');
        if (!response.ok) throw new Error(`${response.status}`);
        const importObject = { env: {} };
        let instance;
        try {
          ({ instance } = await WebAssembly.instantiateStreaming(response, importObject));
        } catch {
          const bytes = await (await fetch('/wasm/alloc.wasm')).arrayBuffer();
          ({ instance } = await WebAssembly.instantiate(bytes, importObject));
        }
        if (!cancelled) {
          wasmRef.current = instance.exports;
          cachedWasm = instance.exports;
          const msg = 'alloc.wasm loaded — running live in your browser.';
          cachedStatus = msg;
          setStatus(msg);
          setWasmReady(true);
        }
      } catch {
        if (!cancelled) {
          const msg = 'alloc.wasm unavailable — build with npm run build:wasm.';
          cachedStatus = msg;
          setStatus(msg);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onExit?.(); }
  }

  function readHeapBlocks() {
    const wasm = wasmRef.current;
    if (!wasm?.get_heap_block_count || !wasm?.get_heap_block_info || !wasm?.memory) return [];
    const count = wasm.get_heap_block_count();
    if (count === 0) return [];
    const infoPtr = wasm.get_heap_block_info();
    const info = new Uint32Array(wasm.memory.buffer, infoPtr, count * 2);
    return Array.from({ length: count }, (_, i) => ({
      id: `block-${i}`,
      size: info[i * 2],
      free: !!info[i * 2 + 1],
    }));
  }

  function addLog(msg) {
    setLogLines((prev) => [...prev, msg]);
  }

  function handleAllocate(sizeName) {
    const wasm = wasmRef.current;
    if (!wasm?.my_malloc) return;

    const size = ALLOC_SIZES[sizeName];
    const blocksBefore = readHeapBlocks();
    const ptr = wasm.my_malloc(size);
    const blocksAfter = readHeapBlocks();

    if (ptr === 0) {
      const totalFree = blocksBefore.filter((b) => b.free).reduce((sum, b) => sum + b.size, 0);
      const freeBlockCount = blocksBefore.filter((b) => b.free).length;
      if (totalFree >= size && freeBlockCount > 1) {
        addLog(`✗  malloc(${size}B) failed — fragmentation. ${totalFree}B free total but split across ${freeBlockCount} non-adjacent blocks. Free adjacent blocks to coalesce.`);
      } else {
        addLog(`✗  malloc(${size}B) failed — heap exhausted. Reset to start fresh.`);
      }
      return;
    }

    const label = BLOCK_LABELS[labelCounterRef.current % BLOCK_LABELS.length];
    labelCounterRef.current += 1;

    if (blocksAfter.length > blocksBefore.length) {
      const remainder = blocksAfter.find((b) => b.free);
      if (remainder) {
        addLog(`malloc(${size}B) → Block ${label} allocated. Free block was oversized — split: ${size}B used, ${remainder.size}B returned to free list.`);
      } else {
        addLog(`malloc(${size}B) → Block ${label} allocated from heap.`);
      }
    } else if (blocksBefore.length === 0) {
      addLog(`malloc(${size}B) → Block ${label} allocated from fresh heap.`);
    } else {
      addLog(`malloc(${size}B) → Block ${label} allocated. Exact fit reused from free list.`);
    }

    setLiveAllocs((prev) => [...prev, { id: crypto.randomUUID(), label, ptr, size, sizeName }]);
    setHeapBlocks(blocksAfter);
  }

  function handleFree(alloc) {
    const wasm = wasmRef.current;
    if (!wasm?.my_free) return;

    const blocksBefore = readHeapBlocks();
    wasm.my_free(alloc.ptr);
    const blocksAfter = readHeapBlocks();

    if (blocksAfter.length < blocksBefore.length) {
      const merged = blocksBefore.length - blocksAfter.length + 1;
      addLog(`free(Block ${alloc.label}) → Freed and coalesced with ${merged - 1} adjacent free block${merged - 1 !== 1 ? 's' : ''} — merged into one larger region.`);
    } else {
      addLog(`free(Block ${alloc.label}) → Marked free. No adjacent free blocks to merge yet.`);
    }

    setLiveAllocs((prev) => prev.filter((a) => a.id !== alloc.id));
    setHeapBlocks(blocksAfter);
    setHasFreeOccurred(true);
  }

  function handleReset() {
    const wasm = wasmRef.current;
    if (!wasm?.reset_heap) return;
    wasm.reset_heap();
    setLiveAllocs([]);
    setHeapBlocks([]);
    setHasFreeOccurred(false);
    labelCounterRef.current = 0;
    setLogLines(['Heap reset. Try: allocate A, B, C — free B — then allocate a Large to see fragmentation.']);
  }

  const allocatedBytes = heapBlocks.filter((b) => !b.free).reduce((s, b) => s + b.size, 0);
  const trackedBytes = heapBlocks.reduce((s, b) => s + b.size, 0);

  /* Match heap bars to live allocs by address order — sort allocs by ptr
   * since first-fit walks the free list in ascending address order. */
  const sortedByAddr = [...liveAllocs].sort((a, b) => a.ptr - b.ptr);
  let usedIdx = 0;
  const annotatedBlocks = heapBlocks.map((block) => ({
    ...block,
    alloc: block.free ? null : (sortedByAddr[usedIdx++] ?? null),
  }));

  return (
    <div className="alloc-demo" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="skills-category-title">sys --alloc</div>
      <p className="alloc-demo-copy">
        A free-list memory allocator written in C, compiled to WebAssembly. This is how <code>malloc</code> and <code>free</code> work under the hood — the same mechanism behind every C program, every game engine, every OS kernel.
        Allocate blocks and free them to see the heap split and coalesce in real time.
      </p>
      <div className="alloc-demo-status">{status}</div>

      <div className="alloc-demo-section-title">What just happened</div>
      <div className="alloc-demo-log" ref={logRef}>
        {logLines.map((line, i) => (
          <div key={i} className="alloc-demo-log-line">{line}</div>
        ))}
      </div>

      <div className="alloc-demo-section-title" style={{ marginTop: '1rem' }}>
        Heap
        {trackedBytes > 0 && (
          <span style={{ fontWeight: 400, marginLeft: '0.5rem', opacity: 0.6 }}>
            — {allocatedBytes}B allocated · {trackedBytes - allocatedBytes}B free
          </span>
        )}
      </div>
      {heapBlocks.length > 0 ? (
        <>
          <div className="alloc-demo-heap">
            {annotatedBlocks.map((block) => {
              const color = block.alloc ? getLabelColor(block.alloc.label) : undefined;
              return (
                <div
                  key={block.id}
                  className={`alloc-demo-block alloc-demo-block-${block.free ? 'free' : 'allocated'}`}
                  style={{
                    flexGrow: block.size,
                    ...(color ? { background: color, borderColor: color, color: '#111' } : {}),
                  }}
                  title={block.free ? `free · ${block.size}B` : `Block ${block.alloc?.label ?? '?'} · ${block.size}B`}
                >
                  <span>{block.free ? 'free' : (block.alloc?.label ?? 'used')}</span>
                </div>
              );
            })}
          </div>
          <div className="alloc-demo-legend">
            <span><i className="alloc-demo-swatch alloc-demo-swatch-allocated" />allocated</span>
            <span><i className="alloc-demo-swatch alloc-demo-swatch-free" />free</span>
          </div>
        </>
      ) : (
        <div className="alloc-demo-heap alloc-demo-heap-empty">
          <span className="alloc-demo-caption">heap is empty — allocate a block to start</span>
        </div>
      )}

      <div className="alloc-demo-section-title" style={{ marginTop: '1rem' }}>Allocate</div>
      <div className="alloc-demo-toolbar">
        {Object.entries(ALLOC_SIZES).map(([name, size]) => (
          <button
            key={name}
            className="alloc-demo-button"
            type="button"
            disabled={!wasmReady}
            onClick={() => handleAllocate(name)}
          >
            + {name} ({size}B)
          </button>
        ))}
        <button
          className="alloc-demo-button alloc-demo-button-reset"
          type="button"
          disabled={!wasmReady || (liveAllocs.length === 0 && heapBlocks.length === 0)}
          onClick={handleReset}
        >
          Reset heap
        </button>
      </div>

      {liveAllocs.length > 0 && (
        <>
          <div className="alloc-demo-section-title" style={{ marginTop: '1rem' }}>
            Live blocks — click a block to free it
          </div>
          <div className="alloc-demo-live-allocs">
            {liveAllocs.map((alloc) => (
              <button
                key={alloc.id}
                className="alloc-demo-alloc-chip"
                type="button"
                onClick={() => handleFree(alloc)}
                title={`Call free() on Block ${alloc.label}`}
                style={{ '--chip-color': getLabelColor(alloc.label) }}
              >
                Block {alloc.label} · {alloc.size}B · click to free
              </button>
            ))}
          </div>
        </>
      )}

      {liveAllocs.length >= 2 && hasFreeOccurred && (
        <p style={{ fontSize: '0.78rem', opacity: 0.55, marginTop: '0.75rem' }}>
          Tip: free a middle block, then try allocating a Large. If the freed gap is too small, malloc fails — that's fragmentation.
        </p>
      )}

      <div className="shell-demo-hint" style={{ marginTop: '0.75rem' }}>Esc to exit</div>
    </div>
  );
}
