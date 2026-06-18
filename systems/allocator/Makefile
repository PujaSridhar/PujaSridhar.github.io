EMCC ?= emcc
CFLAGS := -O2 -s WASM=1 -s STANDALONE_WASM=1 --no-entry
EXPORTED_FUNCTIONS := '["_my_malloc","_my_free","_my_realloc","_run_benchmark","_get_alloc_counter","_reset_alloc_counter","_reset_heap","_get_heap_block_info","_get_heap_block_count"]'
OUTPUT_DIR := ../../public/wasm

all: $(OUTPUT_DIR)/alloc.wasm

$(OUTPUT_DIR)/alloc.wasm: alloc.c
	mkdir -p $(OUTPUT_DIR)
	$(EMCC) $(CFLAGS) alloc.c -o $(OUTPUT_DIR)/alloc.wasm \
	-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS)

clean:
	rm -f $(OUTPUT_DIR)/alloc.wasm

