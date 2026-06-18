import { useEffect, useRef, useState } from 'react';

const ALLOC_SIZES = { Small: 64, Medium: 128, Large: 256 };
const BLOCK_LABELS = 'ABCDEFGHIJKLMNOP'.split('');

let cachedWasm = null;
let cachedStatus = 'Loading alloc.wasm...';

export function AllocDemo() {
  const [status, setStatus] = useState(cachedStatus);
  const [heapBlocks, setHeapBlocks] = useState([]);
  const [liveAllocs, setLiveAllocs] = useState([]);
  const [logLines, setLogLines] = useState(['Heap ready. Allocate some blocks to see what happens.']);
  const [wasmReady, setWasmReady] = useState(!!cachedWasm);
  const wasmRef = useRef(cachedWasm);
  const labelCounterRef = useRef(0);
  const logEndRef = useRef(null);

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
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

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
        addLog(`✗  malloc(${size}B) failed — fragmentation. ${totalFree}B free total but split across ${freeBlockCount} blocks. Free adjacent blocks to coalesce.`);
      } else {
        addLog(`✗  malloc(${size}B) failed — heap exhausted. Reset to start fresh.`);
      }
      return;
    }

    const label = BLOCK_LABELS[labelCounterRef.current % BLOCK_LABELS.length];
    labelCounterRef.current += 1;

    const countBefore = blocksBefore.length;
    const countAfter = blocksAfter.length;

    if (countAfter > countBefore) {
      const remainder = blocksAfter.find((b) => b.free);
      addLog(`malloc(${size}B) → Block ${label} allocated. Oversized free block split — ${size}B used, ${remainder?.size ?? '?'}B remainder back in free list.`);
    } else if (blocksBefore.length === 0) {
      addLog(`malloc(${size}B) → Block ${label} allocated from fresh heap.`);
    } else {
      addLog(`malloc(${size}B) → Block ${label} allocated. Reused a free block of exact fit.`);
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

    const countBefore = blocksBefore.length;
    const countAfter = blocksAfter.length;

    if (countAfter < countBefore) {
      const merged = countBefore - countAfter + 1;
      addLog(`free(Block ${alloc.label}) → Freed. Coalesced with ${merged - 1} adjacent free block${merged - 1 !== 1 ? 's' : ''} → merged into one larger free region.`);
    } else {
      addLog(`free(Block ${alloc.label}) → Marked free. No adjacent free blocks to coalesce yet.`);
    }

    setLiveAllocs((prev) => prev.filter((a) => a.id !== alloc.id));
    setHeapBlocks(blocksAfter);
  }

  function handleReset() {
    const wasm = wasmRef.current;
    if (!wasm?.reset_heap) return;
    wasm.reset_heap();
    setLiveAllocs([]);
    setHeapBlocks([]);
    labelCounterRef.current = 0;
    setLogLines(['Heap reset. All blocks cleared. Start fresh.']);
  }

  const totalHeapSize = heapBlocks.reduce((sum, b) => sum + b.size, 0) || 1;

  return (
    <div className="alloc-demo">
      <div className="skills-category-title">sys --alloc</div>
      <p className="alloc-demo-copy">
        A free-list memory allocator written in C, compiled to WebAssembly. Allocate and free blocks below — watch the heap change, see blocks split when oversized, and see adjacent free blocks coalesce back together.
      </p>
      <div className="alloc-demo-status">{status}</div>

      {/* Heap visualisation */}
      <div className="alloc-demo-section-title">Heap</div>
      {heapBlocks.length > 0 ? (
        <>
          <div className="alloc-demo-heap">
            {heapBlocks.map((block) => (
              <div
                key={block.id}
                className={`alloc-demo-block alloc-demo-block-${block.free ? 'free' : 'allocated'}`}
                style={{ flexGrow: block.size }}
                title={`${block.free ? 'free' : 'allocated'} · ${block.size} bytes`}
              >
                <span>{block.free ? 'free' : 'used'}</span>
              </div>
            ))}
          </div>
          <div className="alloc-demo-legend">
            <span><i className="alloc-demo-swatch alloc-demo-swatch-allocated" />allocated</span>
            <span><i className="alloc-demo-swatch alloc-demo-swatch-free" />free</span>
            <span className="alloc-demo-heap-stats">
              {heapBlocks.filter((b) => !b.free).length} allocated · {heapBlocks.filter((b) => b.free).length} free · {heapBlocks.reduce((s, b) => s + b.size, 0)}B tracked
            </span>
          </div>
        </>
      ) : (
        <div className="alloc-demo-heap alloc-demo-heap-empty">
          <span className="alloc-demo-caption">heap is empty — allocate a block to start</span>
        </div>
      )}

      {/* Controls */}
      <div className="alloc-demo-section-title">Allocate</div>
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

      {/* Live allocations */}
      {liveAllocs.length > 0 && (
        <>
          <div className="alloc-demo-section-title">Live blocks — click to free</div>
          <div className="alloc-demo-live-allocs">
            {liveAllocs.map((alloc) => (
              <button
                key={alloc.id}
                className="alloc-demo-alloc-chip"
                type="button"
                onClick={() => handleFree(alloc)}
                title={`free(Block ${alloc.label})`}
              >
                Block {alloc.label} · {alloc.size}B · free →
              </button>
            ))}
          </div>
        </>
      )}

      {/* Action log */}
      <div className="alloc-demo-section-title">What just happened</div>
      <div className="alloc-demo-log">
        {logLines.map((line, i) => (
          <div key={i} className="alloc-demo-log-line">{line}</div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
