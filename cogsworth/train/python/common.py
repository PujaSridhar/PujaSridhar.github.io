"""Shared helpers for the Cogsworth fine-tuning kit."""
import json
from pathlib import Path

DEFAULT_BASE = "Qwen/Qwen2.5-0.5B-Instruct"


def read_jsonl(path):
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def write_jsonl(path, rows):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def end_token(tokenizer):
    """The token that ends an assistant turn (<|im_end|> for Qwen)."""
    for candidate in ("<|im_end|>", "<|eot_id|>", "<end_of_turn>"):
        if candidate in tokenizer.get_vocab():
            return candidate
    return tokenizer.eos_token


def pick_precision(requested="auto"):
    """fp16 on T4 / V100 (no bf16), bf16 on A100 / H100, fp32 on CPU."""
    import torch

    if requested != "auto":
        return requested
    if not torch.cuda.is_available():
        return "fp32"
    return "bf16" if torch.cuda.is_bf16_supported() else "fp16"
