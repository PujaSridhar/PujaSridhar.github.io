#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#define INPUT_MAX 512
#define OUTPUT_MAX 4096
#define HISTORY_MAX 64
#define TABLE_SIZE 32

static char input_buf[INPUT_MAX];
static char output_buf[OUTPUT_MAX];

typedef struct file_entry {
  char* name;
  char* content;
  struct file_entry* next;
} file_entry_t;

static file_entry_t* filesystem[TABLE_SIZE];
static char history[HISTORY_MAX][256];
static size_t history_count = 0;
static char cwd[64] = "/";

static unsigned long hash_name(const char* text) {
  unsigned long hash = 5381UL;
  int ch = 0;

  while ((ch = *text++) != 0) {
    hash = ((hash << 5U) + hash) + (unsigned long) ch;
  }

  return hash % TABLE_SIZE;
}

static char* copy_string(const char* text) {
  size_t length = strlen(text) + 1U;
  char* copy = (char*) malloc(length);
  if (copy != NULL) {
    memcpy(copy, text, length);
  }
  return copy;
}

static file_entry_t* get_file(const char* name) {
  file_entry_t* entry = filesystem[hash_name(name)];
  while (entry != NULL) {
    if (strcmp(entry->name, name) == 0) {
      return entry;
    }
    entry = entry->next;
  }
  return NULL;
}

static void set_file(const char* name, const char* content) {
  unsigned long bucket = hash_name(name);
  file_entry_t* entry = get_file(name);

  if (entry != NULL) {
    free(entry->content);
    entry->content = copy_string(content);
    return;
  }

  entry = (file_entry_t*) calloc(1, sizeof(file_entry_t));
  if (entry == NULL) {
    return;
  }

  entry->name = copy_string(name);
  entry->content = copy_string(content);
  entry->next = filesystem[bucket];
  filesystem[bucket] = entry;
}

static void append_line(char* buffer, size_t buf_size, const char* text) {
  size_t used = strlen(buffer);
  if (used >= buf_size - 1U) {
    return;
  }

  snprintf(buffer + used, buf_size - used, "%s", text);
}

static void append_line_break(char* buffer, size_t buf_size, const char* text) {
  append_line(buffer, buf_size, text);
  append_line(buffer, buf_size, "\n");
}

static void trim(char* text) {
  size_t length = strlen(text);
  while (length > 0U && isspace((unsigned char) text[length - 1U])) {
    text[length - 1U] = '\0';
    length -= 1U;
  }

  char* start = text;
  while (*start != '\0' && isspace((unsigned char) *start)) {
    start += 1;
  }

  if (start != text) {
    memmove(text, start, strlen(start) + 1U);
  }
}

static void remember_history(const char* command) {
  if (command == NULL || *command == '\0') {
    return;
  }

  if (history_count < HISTORY_MAX) {
    snprintf(history[history_count], sizeof(history[history_count]), "%s", command);
    history_count += 1U;
    return;
  }

  for (size_t index = 1U; index < HISTORY_MAX; index += 1U) {
    snprintf(history[index - 1U], sizeof(history[index - 1U]), "%s", history[index]);
  }

  snprintf(history[HISTORY_MAX - 1U], sizeof(history[HISTORY_MAX - 1U]), "%s", command);
}

static void run_simple_command(const char* input, const char* stdin_text, char* output, size_t buf_size) {
  char command[512];
  snprintf(command, sizeof(command), "%s", input);
  trim(command);

  char* name = strtok(command, " ");
  char* args = strtok(NULL, "");

  if (name == NULL) {
    return;
  }

  if (strcmp(name, "echo") == 0) {
    append_line(output, buf_size, args != NULL ? args : stdin_text);
    return;
  }

  if (strcmp(name, "pwd") == 0) {
    append_line(output, buf_size, cwd);
    return;
  }

  if (strcmp(name, "cd") == 0) {
    if (args == NULL || strcmp(args, "~") == 0 || strcmp(args, "/") == 0) {
      snprintf(cwd, sizeof(cwd), "/");
      return;
    }

    append_line(output, buf_size, "cd: directory not found");
    return;
  }

  if (strcmp(name, "ls") == 0) {
    int printed = 0;
    for (size_t bucket = 0U; bucket < TABLE_SIZE; bucket += 1U) {
      file_entry_t* entry = filesystem[bucket];
      while (entry != NULL) {
        if (printed != 0) {
          append_line(output, buf_size, "\n");
        }
        append_line(output, buf_size, entry->name);
        printed = 1;
        entry = entry->next;
      }
    }
    return;
  }

  if (strcmp(name, "cat") == 0) {
    const char* target = args != NULL ? args : stdin_text;
    if (target == NULL || *target == '\0') {
      append_line(output, buf_size, "cat: missing file operand");
      return;
    }

    file_entry_t* entry = get_file(target);
    if (entry == NULL) {
      append_line(output, buf_size, "cat: file not found");
      return;
    }

    append_line(output, buf_size, entry->content);
    return;
  }

  if (strcmp(name, "history") == 0) {
    for (size_t index = 0U; index < history_count; index += 1U) {
      char line[320];
      snprintf(line, sizeof(line), "%zu  %s", index + 1U, history[index]);
      append_line_break(output, buf_size, line);
    }
    return;
  }

  if (strcmp(name, "help") == 0) {
    append_line_break(output, buf_size, "Built-ins:");
    append_line_break(output, buf_size, "echo, pwd, cd, ls, cat, history, help, exit");
    append_line_break(output, buf_size, "");
    append_line_break(output, buf_size, "Supports:");
    append_line_break(output, buf_size, "cmd1 | cmd2");
    append_line_break(output, buf_size, "cmd > file");
    append_line(output, buf_size, "cmd < file");
    return;
  }

  if (strcmp(name, "exit") == 0) {
    append_line(output, buf_size, "__EXIT__");
    return;
  }

  append_line(output, buf_size, "command not found");
}

EMSCRIPTEN_KEEPALIVE
char* get_input_buf(void) {
  return input_buf;
}

EMSCRIPTEN_KEEPALIVE
char* get_output_buf(void) {
  return output_buf;
}

EMSCRIPTEN_KEEPALIVE
size_t get_output_buf_size(void) {
  return OUTPUT_MAX;
}

EMSCRIPTEN_KEEPALIVE
void init_shell(void) {
  memset(filesystem, 0, sizeof(filesystem));
  history_count = 0U;
  snprintf(cwd, sizeof(cwd), "/");

  set_file("README.md", "Puja's systems sandbox\n- sys --alloc\n- sys --shell\n- sys --threads");
  set_file("allocator.txt", "Allocator notes\n* static heap backing (1MB)\n* split and coalesce\n* 8-byte alignment\n* ~10ns/op in WASM");
  set_file("projects.txt", "Projects\n1. Cogsworth\n2. Smart Document Finder\n3. Pennant AI features");
}

EMSCRIPTEN_KEEPALIVE
void process_command(char* input, char* output_buf, size_t buf_size) {
  char command[512];
  char left[256];
  char right[256];
  char intermediate[OUTPUT_MAX];
  char file_target[128];

  if (output_buf == NULL || buf_size == 0U) {
    return;
  }

  output_buf[0] = '\0';
  if (input == NULL) {
    return;
  }

  snprintf(command, sizeof(command), "%s", input);
  trim(command);
  remember_history(command);

  if (strchr(command, '>') != NULL) {
    snprintf(left, sizeof(left), "%s", strtok(command, ">"));
    snprintf(file_target, sizeof(file_target), "%s", strtok(NULL, ""));
    trim(left);
    trim(file_target);
    intermediate[0] = '\0';
    run_simple_command(left, "", intermediate, sizeof(intermediate));
    set_file(file_target, intermediate);
    return;
  }

  if (strchr(command, '<') != NULL) {
    snprintf(left, sizeof(left), "%s", strtok(command, "<"));
    snprintf(file_target, sizeof(file_target), "%s", strtok(NULL, ""));
    trim(left);
    trim(file_target);
    file_entry_t* source = get_file(file_target);
    if (source == NULL) {
      append_line(output_buf, buf_size, "input file not found");
      return;
    }
    run_simple_command(left, source->content, output_buf, buf_size);
    return;
  }

  if (strchr(command, '|') != NULL) {
    snprintf(left, sizeof(left), "%s", strtok(command, "|"));
    snprintf(right, sizeof(right), "%s", strtok(NULL, ""));
    trim(left);
    trim(right);
    intermediate[0] = '\0';
    run_simple_command(left, "", intermediate, sizeof(intermediate));
    run_simple_command(right, intermediate, output_buf, buf_size);
    return;
  }

  run_simple_command(command, "", output_buf, buf_size);
}
