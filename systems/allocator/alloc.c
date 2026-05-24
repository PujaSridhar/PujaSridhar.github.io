#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <time.h>
#include <unistd.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

typedef struct block {
  size_t size;
  int free;
  struct block* next;
} block_t;

static block_t* free_list_head = NULL;
double last_js_baseline_ns_export = 0.0;

static size_t align8(size_t size) {
  return (size + 7U) & ~(size_t) 7U;
}

static size_t page_size(void) {
  static size_t cached_page_size = 0;

  if (cached_page_size == 0) {
    cached_page_size = (size_t) getpagesize();
  }

  return cached_page_size;
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

  block_t* split = (block_t*) ((char*) block + sizeof(block_t) + requested_size);
  split->size = block->size - requested_size - sizeof(block_t);
  split->free = 1;
  split->next = block->next;

  block->size = requested_size;
  block->next = split;
}

static block_t* request_from_mmap(size_t size) {
  const size_t required = sizeof(block_t) + size;
  const size_t pages = (required + page_size() - 1U) / page_size();
  const size_t mapping_size = pages * page_size();

  void* mapping = mmap(NULL, mapping_size, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANON, -1, 0);
  if (mapping == MAP_FAILED) {
    return NULL;
  }

  block_t* block = (block_t*) mapping;
  block->size = mapping_size - sizeof(block_t);
  block->free = 1;
  block->next = NULL;

  if (free_list_head == NULL) {
    free_list_head = block;
  } else {
    block_t* tail = free_list_head;
    while (tail->next != NULL) {
      tail = tail->next;
    }
    tail->next = block;
  }

  return block;
}

static void coalesce_free_blocks(void) {
  block_t* current = free_list_head;

  while (current != NULL && current->next != NULL) {
    char* current_end = (char*) current + sizeof(block_t) + current->size;

    if (current->free && current->next->free && current_end == (char*) current->next) {
      current->size += sizeof(block_t) + current->next->size;
      current->next = current->next->next;
      continue;
    }

    current = current->next;
  }
}

EMSCRIPTEN_KEEPALIVE
void* my_malloc(size_t size) {
  const size_t aligned_size = align8(size);
  if (aligned_size == 0) {
    return NULL;
  }

  block_t* block = find_free_block(aligned_size);
  if (block == NULL) {
    block = request_from_mmap(aligned_size);
    if (block == NULL) {
      return NULL;
    }
  }

  split_block(block, aligned_size);
  block->free = 0;
  return (char*) block + sizeof(block_t);
}

EMSCRIPTEN_KEEPALIVE
void my_free(void* ptr) {
  if (ptr == NULL) {
    return;
  }

  block_t* block = (block_t*) ((char*) ptr - sizeof(block_t));
  block->free = 1;
  coalesce_free_blocks();
}

EMSCRIPTEN_KEEPALIVE
void* my_realloc(void* ptr, size_t size) {
  if (ptr == NULL) {
    return my_malloc(size);
  }

  if (size == 0) {
    my_free(ptr);
    return NULL;
  }

  block_t* block = (block_t*) ((char*) ptr - sizeof(block_t));
  if (block->size >= size) {
    return ptr;
  }

  void* replacement = my_malloc(size);
  if (replacement == NULL) {
    return NULL;
  }

  memcpy(replacement, ptr, block->size);
  my_free(ptr);
  return replacement;
}

EMSCRIPTEN_KEEPALIVE
void set_js_baseline(double ns) {
  last_js_baseline_ns_export = ns;
}

static double elapsed_ns(const struct timespec* start, const struct timespec* end) {
  const double seconds = (double) (end->tv_sec - start->tv_sec) * 1000000000.0;
  const double nanoseconds = (double) (end->tv_nsec - start->tv_nsec);
  return seconds + nanoseconds;
}

EMSCRIPTEN_KEEPALIVE
double run_benchmark(int iterations) {
  if (iterations <= 0) {
    return 0.0;
  }

  struct timespec start;
  struct timespec end;
  const size_t sizes[] = { 8U, 256U, 4096U };
  const size_t size_count = sizeof(sizes) / sizeof(sizes[0]);

  clock_gettime(CLOCK_MONOTONIC, &start);

  for (int index = 0; index < iterations; index += 1) {
    const size_t size = sizes[(size_t) index % size_count];
    void* allocation = my_malloc(size);
    if (allocation == NULL) {
      continue;
    }
    memset(allocation, index & 255, size < 64U ? size : 64U);
    my_free(allocation);
  }

  clock_gettime(CLOCK_MONOTONIC, &end);
  return elapsed_ns(&start, &end) / (double) iterations;
}
