"""LoRA fine-tune of a small instruct model on Cogsworth's training data.

    python train_lora.py --data ../data --out ./out
    python train_lora.py --data ../data --out ./out --base Qwen/Qwen2.5-1.5B-Instruct

Loss is computed on Cogsworth's reply only (the system prompt, context and question are
masked), so the model learns to answer from the context it is given, not to memorize it.
Precision: fp16 mixed precision on a T4 (Kaggle, Colab), bf16 on A100/H100, fp32 on CPU.
"""
import argparse
import json
import math
import os
import time
from pathlib import Path

import torch
from torch.utils.data import Dataset
from transformers import (AutoModelForCausalLM, AutoTokenizer, Trainer,
                          TrainingArguments)

from common import DEFAULT_BASE, end_token, pick_precision, read_jsonl


class ChatDataset(Dataset):
    def __init__(self, rows, tokenizer, max_len):
        self.items = []
        self.skipped = 0
        stop = end_token(tokenizer)
        for row in rows:
            messages = row["messages"]
            prompt = tokenizer.apply_chat_template(messages[:-1], tokenize=False, add_generation_prompt=True)
            prompt_ids = tokenizer(prompt, add_special_tokens=False)["input_ids"]
            answer_ids = tokenizer(messages[-1]["content"] + stop, add_special_tokens=False)["input_ids"]
            if len(prompt_ids) + len(answer_ids) > max_len:
                self.skipped += 1
                continue
            self.items.append({
                "input_ids": prompt_ids + answer_ids,
                "labels": [-100] * len(prompt_ids) + answer_ids,
            })

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        return self.items[i]


class Collator:
    def __init__(self, pad_id):
        self.pad_id = pad_id

    def __call__(self, batch):
        width = max(len(b["input_ids"]) for b in batch)
        ids, labels, mask = [], [], []
        for b in batch:
            pad = width - len(b["input_ids"])
            ids.append(b["input_ids"] + [self.pad_id] * pad)
            labels.append(b["labels"] + [-100] * pad)
            mask.append([1] * len(b["input_ids"]) + [0] * pad)
        return {"input_ids": torch.tensor(ids), "labels": torch.tensor(labels), "attention_mask": torch.tensor(mask)}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", default="../data", help="folder with train.jsonl and val.jsonl")
    p.add_argument("--out", default="./out")
    p.add_argument("--base", default=DEFAULT_BASE)
    p.add_argument("--epochs", type=float, default=3)
    p.add_argument("--lr", type=float, default=2e-4)
    p.add_argument("--rank", type=int, default=16)
    p.add_argument("--alpha", type=int, default=32)
    p.add_argument("--dropout", type=float, default=0.05)
    p.add_argument("--batch", type=int, default=4)
    p.add_argument("--grad-accum", type=int, default=4)
    p.add_argument("--max-len", type=int, default=2048)
    p.add_argument("--precision", default="auto", choices=["auto", "fp16", "bf16", "fp32"])
    p.add_argument("--no-gradient-checkpointing", action="store_true")
    p.add_argument("--max-steps", type=int, default=-1, help="for smoke tests")
    p.add_argument("--limit", type=int, default=0, help="use only the first N examples (smoke tests)")
    args = p.parse_args()

    from peft import LoraConfig, get_peft_model

    precision = pick_precision(args.precision)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    print(f"base={args.base} precision={precision} cuda={torch.cuda.is_available()}")

    tokenizer = AutoTokenizer.from_pretrained(args.base)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    train_rows = read_jsonl(Path(args.data) / "train.jsonl")
    val_rows = read_jsonl(Path(args.data) / "val.jsonl")
    if args.limit:
        train_rows, val_rows = train_rows[: args.limit], val_rows[: max(2, args.limit // 10)]
    train_ds = ChatDataset(train_rows, tokenizer, args.max_len)
    val_ds = ChatDataset(val_rows, tokenizer, args.max_len)
    lengths = [len(x["input_ids"]) for x in train_ds.items]
    print(f"train={len(train_ds)} val={len(val_ds)} skipped_too_long={train_ds.skipped + val_ds.skipped} "
          f"tokens/example avg={sum(lengths) / max(1, len(lengths)):.0f} max={max(lengths, default=0)}")

    # Mixed precision keeps the master weights in fp32, which is the safe choice on a T4:
    # a 0.5B model is 2 GB in fp32 and a 1.5B model 6 GB, both fit in 16 GB with checkpointing.
    dtype = torch.bfloat16 if precision == "bf16" else torch.float32
    model = AutoModelForCausalLM.from_pretrained(args.base, dtype=dtype)
    model.config.use_cache = False
    if not args.no_gradient_checkpointing:
        model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={"use_reentrant": False})
        model.enable_input_require_grads()

    lora = LoraConfig(
        r=args.rank, lora_alpha=args.alpha, lora_dropout=args.dropout, bias="none", task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    model = get_peft_model(model, lora)
    model.print_trainable_parameters()

    steps_per_epoch = math.ceil(len(train_ds) / (args.batch * args.grad_accum))
    training_args = TrainingArguments(
        output_dir=str(out / "checkpoints"),
        num_train_epochs=args.epochs,
        max_steps=args.max_steps,
        per_device_train_batch_size=args.batch,
        per_device_eval_batch_size=args.batch,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        weight_decay=0.0,
        logging_steps=max(1, steps_per_epoch // 10),
        eval_strategy="epoch" if args.max_steps < 0 else "no",
        save_strategy="epoch" if args.max_steps < 0 else "no",
        save_total_limit=1,
        load_best_model_at_end=args.max_steps < 0,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=precision == "fp16",
        bf16=precision == "bf16",
        group_by_length=True,
        report_to="none",
        dataloader_num_workers=2 if torch.cuda.is_available() else 0,
        remove_unused_columns=False,
        use_cpu=not torch.cuda.is_available(),
    )
    trainer = Trainer(model=model, args=training_args, train_dataset=train_ds, eval_dataset=val_ds,
                      data_collator=Collator(tokenizer.pad_token_id))
    started = time.time()
    trainer.train()
    minutes = (time.time() - started) / 60
    metrics = trainer.evaluate() if len(val_ds) else {}

    adapter_dir = out / "adapter"
    trainer.model.save_pretrained(adapter_dir)
    tokenizer.save_pretrained(adapter_dir)
    summary = {
        "base": args.base, "precision": precision, "train_examples": len(train_ds), "val_examples": len(val_ds),
        "epochs": args.epochs, "lr": args.lr, "rank": args.rank, "alpha": args.alpha,
        "minutes": round(minutes, 1), "eval_loss": metrics.get("eval_loss"),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }
    (out / "training-summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    print(f"Saved LoRA adapter to {adapter_dir}")


if __name__ == "__main__":
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    main()
