EMCC ?= emcc
CFLAGS := -O2 -s WASM=1 -s STANDALONE_WASM=1 --no-entry
EXPORTED_FUNCTIONS := '["_init_shell","_process_command","_get_input_buf","_get_output_buf","_get_output_buf_size"]'
OUTPUT_DIR := ../../public/wasm

all: $(OUTPUT_DIR)/shell.wasm

$(OUTPUT_DIR)/shell.wasm: shell.c
	mkdir -p $(OUTPUT_DIR)
	$(EMCC) $(CFLAGS) shell.c -o $(OUTPUT_DIR)/shell.wasm \
	-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS)

clean:
	rm -f $(OUTPUT_DIR)/shell.wasm


