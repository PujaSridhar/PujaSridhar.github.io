#!/usr/bin/env bash
# Cogsworth fine-tune on a Slurm cluster (the second option; Kaggle is simpler).
# Edit the partition (and account, if your cluster needs one), then from cogsworth/train:
#   sbatch slurm/train.sbatch
# Optional: BASE=Qwen/Qwen2.5-1.5B-Instruct sbatch slurm/train.sbatch
#SBATCH --job-name=cogsworth-lora
#SBATCH --partition=gpu            # e.g. "gpu" on Rutgers Amarel; check `sinfo`
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=4
#SBATCH --mem=32G
#SBATCH --time=03:00:00
#SBATCH --output=slurm/cogsworth-%j.log

set -euo pipefail
cd "${SLURM_SUBMIT_DIR:-$(dirname "$0")/..}"
BASE="${BASE:-Qwen/Qwen2.5-0.5B-Instruct}"
OUT="${OUT:-$PWD/python/out}"

# module load python/3.11 cuda/12.1    # uncomment / adjust for your cluster's module names
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -q --upgrade pip
  .venv/bin/pip install -q torch          # the CUDA build matching the cluster driver; see pytorch.org if this picks the wrong one
  .venv/bin/pip install -q -r python/requirements.txt
fi
source .venv/bin/activate
export HF_HOME="${HF_HOME:-$PWD/.hf-cache}"
nvidia-smi --query-gpu=name,memory.total --format=csv

cd python
# precision auto: bf16 on A100/H100, fp16 on V100/T4
python train_lora.py --base "$BASE" --data ../data --out "$OUT"
python generate.py --base "$BASE" --adapter "$OUT/adapter" --out "$OUT/trained-answers.jsonl" --label "trained model"
python generate.py --base "$BASE" --out "$OUT/base-answers.jsonl" --label "base model"
python export_onnx.py --base "$BASE" --adapter "$OUT/adapter" --out "$OUT/cogsworth-web"
rm -rf "$OUT/checkpoints"
echo "Done. Adapter: $OUT/adapter  Browser model: $OUT/cogsworth-web  Answers: $OUT/*-answers.jsonl"
