#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

/* ── Static backing heap (replaces mmap) ─────────────────────── */
#define HEAP_SIZE (1024 * 1024)   /* 1 MB */
static char heap_memory[HEAP_SIZE];
static size_t heap_used = 0;

/* ── Free-list block header ──────────────────────────────────── */
typedef struct block {
  size_t        size;
  int           free;
  struct block* next;
} block_t;

static block_t* free_list_head = NULL;
static unsigned long alloc_counter = 0UL;

/* ── Internal helpers ────────────────────────────────────────── */
static size_t align8(size_t size) {
  return (size + 7U) & ~(size_t)7U;
}

static block_t* find_free_block(size_t size) {
  block_t* current = free_list_head;
  while (current != NULL) {
    if (current->free && current->size >= size) {
      return current;
    }
    current = current->next;
  }
  return NULL;
}

static void split_block(block_t* block, size_t requested_size) {
  if (block == NULL || block->size <= requested_size + sizeof(block_t) + 8U) {
    return;
  }
  block_t* split = (block_t*)((char*)block + sizeof(block_t) + requested_size);
  split->size  = block->size - requested_size - sizeof(block_t);
  split->free  = 1;
  split->next  = block->next;
  block->size  = requested_size;
  block->next  = split;
}

static block_t* request_from_heap(size_t size) {
  const size_t required = sizeof(block_t) + size;
  if (heap_used + required > HEAP_SIZE) {
    return NULL;   /* out of backing memory */
  }

  block_t* block = (block_t*)(heap_memory + heap_used);
  heap_used += required;
  block->size = required - sizeof(block_t);
  block->free = 1;
  block->next = NULL;

  if (free_list_head == NULL) {
    free_list_head = block;
  } else {
    block_t* tail = free_list_head;
    while (tail->next != NULL) tail = tail->next;
    tail->next = block;
  }
  return block;
}

static void coalesce_free_blocks(void) {
  block_t* current = free_list_head;
  while (current != NULL && current->next != NULL) {
    char* current_end = (char*)current + sizeof(block_t) + current->size;
    if (current->free && current->next->free &&
        current_end == (char*)current->next) {
      current->size += sizeof(block_t) + current->next->size;
      current->next  = current->next->next;
      continue;
    }
    current = current->next;
  }
}

/* ── Public API ──────────────────────────────────────────────── */
EMSCRIPTEN_KEEPALIVE
void* my_malloc(size_t size) {
  const size_t aligned_size = align8(size);
  if (aligned_size == 0) return NULL;

  block_t* block = find_free_block(aligned_size);
  if (block == NULL) {
    block = request_from_heap(aligned_size);
    if (block == NULL) return NULL;
  }
  split_block(block, aligned_size);
  block->free = 0;
  alloc_counter += 1UL;
  return (char*)block + sizeof(block_t);
}

EMSCRIPTEN_KEEPALIVE
void my_free(void* ptr) {
  if (ptr == NULL) return;
  block_t* block = (block_t*)((char*)ptr - sizeof(block_t));
  block->free = 1;
  alloc_counter += 1UL;
  coalesce_free_blocks();
}

EMSCRIPTEN_KEEPALIVE
void* my_realloc(void* ptr, size_t size) {
  if (ptr == NULL)  return my_malloc(size);
  if (size == 0)  { my_free(ptr); return NULL; }

  block_t* block = (block_t*)((char*)ptr - sizeof(block_t));
  if (block->size >= size) return ptr;

  void* replacement = my_malloc(size);
  if (replacement == NULL) return NULL;
  memcpy(replacement, ptr, block->size);
  my_free(ptr);
  return replacement;
}

/*
 * run_benchmark — returns number of completed ops.
 * Timing happens on the JS side with performance.now(),
 * which is higher-resolution than clock_gettime in WASM anyway.
 */
EMSCRIPTEN_KEEPALIVE
double run_benchmark(int iterations) {
  if (iterations <= 0) return 0.0;

  /* Start each run from a clean heap so repeated runs don't drift. */
  heap_used = 0;
  free_list_head = NULL;

  const size_t sizes[]    = { 8U, 256U, 4096U };
  const size_t size_count = 3U;
  int ops = 0;

  for (int i = 0; i < iterations; i++) {
    const size_t size = sizes[(size_t)i % size_count];
    void* ptr = my_malloc(size);
    if (ptr == NULL) continue;
    memset(ptr, i & 255, size < 64U ? size : 64U);
    my_free(ptr);
    ops++;
  }
  return (double)ops;
}

EMSCRIPTEN_KEEPALIVE
unsigned long get_alloc_counter(void) {
  return alloc_counter;
}

EMSCRIPTEN_KEEPALIVE
void reset_alloc_counter(void) {
  alloc_counter = 0UL;
}

EMSCRIPTEN_KEEPALIVE
void reset_heap(void) {
  heap_used = 0;
  free_list_head = NULL;
  alloc_counter = 0UL;
}

/* ── Heap introspection ──────────────────────────────────────── */
#define MAX_HEAP_BLOCKS 64
static uint32_t heap_block_info[MAX_HEAP_BLOCKS * 2];

EMSCRIPTEN_KEEPALIVE
uint32_t* get_heap_block_info(void) {
  return heap_block_info;
}

/* Walks the live free list, filling heap_block_info with (size, free)
 * pairs for each block, and returns how many blocks were written. */
EMSCRIPTEN_KEEPALIVE
int get_heap_block_count(void) {
  int count = 0;
  block_t* current = free_list_head;
  while (current != NULL && count < MAX_HEAP_BLOCKS) {
    heap_block_info[count * 2]     = (uint32_t)current->size;
    heap_block_info[count * 2 + 1] = (uint32_t)current->free;
    current = current->next;
    count += 1;
  }
  return count;
}
