#!/bin/bash
set -e

echo "Building WASM modules..."

# Create output directory
mkdir -p public/wasm

# Build allocator
echo "Building allocator..."
cd systems/allocator
make clean
make
cd ../..

# Build shell
echo "Building shell..."
cd systems/shell
make clean
make
cd ../..

echo "WASM build complete. Files available at:"
echo "  - public/wasm/alloc.wasm"
echo "  - public/wasm/shell.wasm"
