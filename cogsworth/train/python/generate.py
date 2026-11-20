"""Answers every eval question with a model, for score.js to grade.

    python generate.py --prompts ../data/eval-prompts.jsonl --adapter out/adapter --out out/trained-answers.jsonl
    python generate.py --prompts ../data/eval-prompts.jsonl --out out/base-answers.jsonl      # base model, no fine-tune
    python generate.py --prompts ../data/eval-prompts.jsonl --model out/merged --out ...       # a merged model

Greedy decoding, so runs are repeatable.
"""
import argparse
import time

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from common import DEFAULT_BASE, end_token, read_jsonl, write_jsonl


def load(args):
    path = args.model or args.base
    tokenizer = AutoTokenizer.from_pretrained(args.adapter or path)
    tokenizer.padding_side = "left"
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    model = AutoModelForCausalLM.from_pretrained(path, dtype=dtype).to(device)
    if args.adapter:
        from peft import PeftModel
        model = PeftModel.from_pretrained(model, args.adapter).merge_and_unload()
    model.eval()
    return tokenizer, model, device


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--prompts", default="../data/eval-prompts.jsonl")
    p.add_argument("--out", required=True)
    p.add_argument("--base", default=DEFAULT_BASE)
    p.add_argument("--adapter", default=None, help="LoRA adapter folder from train_lora.py")
    p.add_argument("--model", default=None, help="a full (merged) model folder instead of base + adapter")
    p.add_argument("--max-new-tokens", type=int, default=220)
    p.add_argument("--batch", type=int, default=8)
    p.add_argument("--label", default=None, help="name shown in the score table")
    args = p.parse_args()

    tokenizer, model, device = load(args)
    stop_ids = sorted({i for i in (tokenizer.convert_tokens_to_ids(end_token(tokenizer)), tokenizer.eos_token_id) if i is not None})
    rows = read_jsonl(args.prompts)
    label = args.label or ("trained" if args.adapter or args.model else "base")
    out = []
    started = time.time()
    for i in range(0, len(rows), args.batch):
        batch = rows[i:i + args.batch]
        texts = [tokenizer.apply_chat_template(r["messages"], tokenize=False, add_generation_prompt=True) for r in batch]
        enc = tokenizer(texts, return_tensors="pt", padding=True, add_special_tokens=False,
                        return_token_type_ids=False).to(device)
        with torch.no_grad():
            gen = model.generate(**enc, max_new_tokens=args.max_new_tokens, do_sample=False,
                                 repetition_penalty=1.05, eos_token_id=stop_ids, pad_token_id=tokenizer.pad_token_id)
        for r, ids in zip(batch, gen[:, enc["input_ids"].shape[1]:]):
            answer = tokenizer.decode(ids, skip_special_tokens=True).strip()
            out.append({"suite": r["suite"], "index": r["index"], "q": r["q"], "answer": answer, "system": label})
        print(f"{min(i + args.batch, len(rows))}/{len(rows)}", flush=True)
    write_jsonl(args.out, out)
    print(f"Wrote {len(out)} answers to {args.out} in {time.time() - started:.0f}s")


if __name__ == "__main__":
    main()
