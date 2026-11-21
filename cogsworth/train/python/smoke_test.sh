#!/usr/bin/env bash
# End-to-end check of the kit on a CPU with a tiny random model (no downloads, a few minutes):
# train -> generate -> merge + ONNX export + quantize. Then score.js --onnx loads the export
# in transformers.js. Run from cogsworth/train/python:   bash smoke_test.sh
set -euo pipefail
cd "$(dirname "$0")"
WORK="${WORK:-$(mktemp -d)}"
python make_tiny_model.py --data ../data --out "$WORK/tiny"
python train_lora.py --data ../data --base "$WORK/tiny" --out "$WORK/run" --max-steps 4 --limit 16 --batch 2 --grad-accum 1
python generate.py --prompts ../data/eval-prompts.jsonl --base "$WORK/tiny" --adapter "$WORK/run/adapter" \
  --out "$WORK/run/trained-answers.jsonl" --max-new-tokens 8 --batch 16
python export_onnx.py --base "$WORK/tiny" --adapter "$WORK/run/adapter" --out "$WORK/run/cogsworth-web" --formats q8,q4
echo "Smoke test passed. Outputs in $WORK"
