#include <stdint.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

/* ── Constants ───────────────────────────────────────────────── */
#define MAX_THREADS   8
#define MAX_RESOURCES 4
#define MAX_TIMELINE  128
#define PCB_FIELDS    6   /* fields per PCB in the snapshot array */

/* Thread states */
#define STATE_READY   0
#define STATE_RUNNING 1
#define STATE_BLOCKED 2
#define STATE_DONE    3

/* Timeline sentinel values */
#define TIMELINE_IDLE     -1
#define TIMELINE_DEADLOCK -2

/* ── PCB ─────────────────────────────────────────────────────── */
typedef struct {
  int id;
  int state;
  int burst_total;
  int burst_remaining;
  int resource_held;  /* -1 = none */
  int waiting_for;    /* -1 = not waiting */
} PCB;

/* ── Scheduler state ─────────────────────────────────────────── */
static PCB    threads[MAX_THREADS];
static int    thread_count   = 0;
static int    resource_owner[MAX_RESOURCES]; /* -1 = free */
static int    quantum_ms     = 5;
static int    ticks          = 0;
static int    rr_index       = 0;
static int    is_deadlocked  = 0;

static int32_t timeline[MAX_TIMELINE];
static int     timeline_len = 0;

/* JS reads PCB data through this flat snapshot array */
static int32_t pcb_snapshot[MAX_THREADS * PCB_FIELDS];

/* ── Internal helpers ────────────────────────────────────────── */
static void fill_snapshot(void) {
  for (int i = 0; i < thread_count; i++) {
    pcb_snapshot[i * PCB_FIELDS + 0] = threads[i].id;
    pcb_snapshot[i * PCB_FIELDS + 1] = threads[i].state;
    pcb_snapshot[i * PCB_FIELDS + 2] = threads[i].burst_total;
    pcb_snapshot[i * PCB_FIELDS + 3] = threads[i].burst_remaining;
    pcb_snapshot[i * PCB_FIELDS + 4] = threads[i].resource_held;
    pcb_snapshot[i * PCB_FIELDS + 5] = threads[i].waiting_for;
  }
}

static void push_timeline(int value) {
  if (timeline_len < MAX_TIMELINE) {
    timeline[timeline_len++] = value;
  } else {
    /* Shift left to keep the last MAX_TIMELINE entries */
    memmove(timeline, timeline + 1, (MAX_TIMELINE - 1) * sizeof(int32_t));
    timeline[MAX_TIMELINE - 1] = value;
  }
}

/* Detect a cycle in the wait-for graph (all non-done threads blocked) */
static int check_deadlock(void) {
  int any_ready = 0;
  int any_blocked = 0;
  for (int i = 0; i < thread_count; i++) {
    if (threads[i].state == STATE_READY || threads[i].state == STATE_RUNNING) {
      any_ready = 1;
    }
    if (threads[i].state == STATE_BLOCKED) {
      any_blocked = 1;
    }
  }
  return (!any_ready && any_blocked) ? 1 : 0;
}

/* ── Public API ──────────────────────────────────────────────── */

EMSCRIPTEN_KEEPALIVE
void init_scheduler(int q_ms) {
  memset(threads, 0, sizeof(threads));
  for (int i = 0; i < MAX_RESOURCES; i++) resource_owner[i] = -1;
  thread_count  = 0;
  quantum_ms    = (q_ms > 0) ? q_ms : 5;
  ticks         = 0;
  rr_index      = 0;
  is_deadlocked = 0;
  timeline_len  = 0;
  memset(timeline, 0, sizeof(timeline));
  memset(pcb_snapshot, 0, sizeof(pcb_snapshot));
}

EMSCRIPTEN_KEEPALIVE
int create_thread(int burst_ms) {
  if (thread_count >= MAX_THREADS || burst_ms <= 0) return -1;
  int id = thread_count;
  threads[id].id              = id;
  threads[id].state           = STATE_READY;
  threads[id].burst_total     = burst_ms;
  threads[id].burst_remaining = burst_ms;
  threads[id].resource_held   = -1;
  threads[id].waiting_for     = -1;
  thread_count++;
  fill_snapshot();
  return id;
}

/*
 * step() — advance one quantum of round-robin scheduling.
 *
 * Returns:
 *   >= 0  thread id that ran
 *   -1    idle (no ready threads but not deadlocked)
 *   -2    deadlock detected
 */
EMSCRIPTEN_KEEPALIVE
int step(void) {
  if (is_deadlocked) return TIMELINE_DEADLOCK;

  /* Find next READY thread (round-robin) */
  int found = -1;
  for (int i = 0; i < thread_count; i++) {
    int idx = (rr_index + i) % thread_count;
    if (threads[idx].state == STATE_READY) {
      found = idx;
      rr_index = (idx + 1) % thread_count;
      break;
    }
  }

  if (found == -1) {
    if (check_deadlock()) {
      is_deadlocked = 1;
      push_timeline(TIMELINE_DEADLOCK);
      fill_snapshot();
      return TIMELINE_DEADLOCK;
    }
    push_timeline(TIMELINE_IDLE);
    return TIMELINE_IDLE;
  }

  /* Run the thread for one quantum */
  threads[found].state = STATE_RUNNING;
  threads[found].burst_remaining -= quantum_ms;
  ticks++;

  push_timeline(threads[found].id);

  if (threads[found].burst_remaining <= 0) {
    threads[found].burst_remaining = 0;
    threads[found].state           = STATE_DONE;
    /* Release any resource this thread was holding */
    if (threads[found].resource_held >= 0) {
      resource_owner[threads[found].resource_held] = -1;
      threads[found].resource_held = -1;
    }
  } else {
    threads[found].state = STATE_READY;
  }

  fill_snapshot();
  return threads[found].id;
}

/*
 * introduce_deadlock() — creates a resource cycle between two READY threads.
 *
 * Thread A holds R0, waits for R1.
 * Thread B holds R1, waits for R0.
 * Both become BLOCKED. Deadlock on next step().
 *
 * Returns 1 if deadlock was set up, 0 if not enough ready threads.
 */
EMSCRIPTEN_KEEPALIVE
int introduce_deadlock(void) {
  int a = -1, b = -1;
  for (int i = 0; i < thread_count; i++) {
    if (threads[i].state == STATE_READY) {
      if (a == -1) { a = i; }
      else         { b = i; break; }
    }
  }
  if (a == -1 || b == -1) return 0;

  /* Assign resources */
  resource_owner[0] = threads[a].id;
  resource_owner[1] = threads[b].id;

  threads[a].resource_held = 0;
  threads[a].waiting_for   = 1;
  threads[a].state         = STATE_BLOCKED;

  threads[b].resource_held = 1;
  threads[b].waiting_for   = 0;
  threads[b].state         = STATE_BLOCKED;

  fill_snapshot();
  return 1;
}

EMSCRIPTEN_KEEPALIVE
int get_thread_count(void) { return thread_count; }

EMSCRIPTEN_KEEPALIVE
int get_ticks(void)        { return ticks; }

EMSCRIPTEN_KEEPALIVE
int get_quantum_ms(void)   { return quantum_ms; }

EMSCRIPTEN_KEEPALIVE
int is_deadlock(void)      { return is_deadlocked; }

EMSCRIPTEN_KEEPALIVE
int32_t* get_pcb_snapshot(void) { fill_snapshot(); return pcb_snapshot; }

EMSCRIPTEN_KEEPALIVE
int32_t* get_timeline(void)     { return timeline; }

EMSCRIPTEN_KEEPALIVE
int get_timeline_len(void)      { return timeline_len; }
