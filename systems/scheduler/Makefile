EMCC ?= emcc
CFLAGS := -O2 -s WASM=1 -s STANDALONE_WASM=1 --no-entry
EXPORTED_FUNCTIONS := '["_init_scheduler","_create_thread","_step","_introduce_deadlock","_get_thread_count","_get_ticks","_get_quantum_ms","_is_deadlock","_get_pcb_snapshot","_get_timeline","_get_timeline_len"]'
OUTPUT_DIR := ../../public/wasm

all: $(OUTPUT_DIR)/scheduler.wasm

$(OUTPUT_DIR)/scheduler.wasm: scheduler.c
	mkdir -p $(OUTPUT_DIR)
	$(EMCC) $(CFLAGS) scheduler.c -o $(OUTPUT_DIR)/scheduler.wasm \
	-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS)

clean:
	rm -f $(OUTPUT_DIR)/scheduler.wasm
