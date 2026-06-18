#!/bin/bash
set -e

# Always resolve paths relative to the repo root, not the calling directory
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building WASM modules..."
mkdir -p "$REPO_ROOT/public/wasm"

echo "Building allocator..."
cd "$REPO_ROOT/systems/allocator"
make clean
make

echo "Building shell..."
cd "$REPO_ROOT/systems/shell"
make clean
make

echo "Building scheduler..."
cd "$REPO_ROOT/systems/scheduler"
make clean
make

echo "WASM build complete."
echo "  - $REPO_ROOT/public/wasm/alloc.wasm"
echo "  - $REPO_ROOT/public/wasm/shell.wasm"
echo "  - $REPO_ROOT/public/wasm/scheduler.wasm"
