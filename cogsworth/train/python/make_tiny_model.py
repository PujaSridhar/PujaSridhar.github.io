"""Builds a tiny random Qwen2-architecture model with its own small tokenizer, for smoke tests.

It is the same architecture and chat template as Qwen2.5, so the full pipeline (train, generate,
export, load in transformers.js) can be checked on a CPU in a few minutes without downloading
anything. Its answers are gibberish; only the plumbing is being tested.

    python make_tiny_model.py --data ../data --out /tmp/tiny-qwen
"""
import argparse
import json
from pathlib import Path

from tokenizers import Tokenizer, decoders, models, pre_tokenizers, trainers
from transformers import PreTrainedTokenizerFast, Qwen2Config, Qwen2ForCausalLM

from common import read_jsonl

CHATML = (
    "{% for message in messages %}{{ '<|im_start|>' + message['role'] + '\\n' + message['content'] + '<|im_end|>' + '\\n' }}"
    "{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\\n' }}{% endif %}"
)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", default="../data")
    p.add_argument("--out", required=True)
    args = p.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    texts = [m["content"] for row in read_jsonl(Path(args.data) / "train.jsonl")[:400] for m in row["messages"]]
    specials = ["<|endoftext|>", "<|im_start|>", "<|im_end|>"]
    tok = Tokenizer(models.BPE())
    tok.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    tok.decoder = decoders.ByteLevel()
    tok.train_from_iterator(texts, trainers.BpeTrainer(vocab_size=2000, special_tokens=specials,
                                                       initial_alphabet=pre_tokenizers.ByteLevel.alphabet()))
    hf_tok = PreTrainedTokenizerFast(tokenizer_object=tok, eos_token="<|im_end|>", pad_token="<|endoftext|>",
                                     bos_token=None, unk_token=None)
    hf_tok.chat_template = CHATML
    hf_tok.save_pretrained(out)

    config = Qwen2Config(vocab_size=len(hf_tok), hidden_size=64, intermediate_size=128, num_hidden_layers=2,
                         num_attention_heads=4, num_key_value_heads=2, max_position_embeddings=4096,
                         tie_word_embeddings=True, eos_token_id=hf_tok.convert_tokens_to_ids("<|im_end|>"),
                         pad_token_id=hf_tok.pad_token_id, bos_token_id=None)
    Qwen2ForCausalLM(config).save_pretrained(out)
    (out / "generation_config.json").write_text(json.dumps({"eos_token_id": config.eos_token_id,
                                                            "pad_token_id": config.pad_token_id}))
    print(f"Tiny model written to {out} ({sum(p.numel() for p in Qwen2ForCausalLM(config).parameters()):,} params)")


if __name__ == "__main__":
    main()
