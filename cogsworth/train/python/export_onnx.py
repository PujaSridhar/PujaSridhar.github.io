"""Merges the LoRA adapter into the base model and exports browser-ready ONNX weights.

    python export_onnx.py --adapter out/adapter --out out/cogsworth-web

Output layout is what transformers.js expects for a local or Hugging Face model id:

    out/cogsworth-web/
      config.json, generation_config.json, tokenizer.json, tokenizer_config.json, ...
      onnx/model_quantized.onnx   int8 weights        -> dtype: 'q8'
      onnx/model_q4.onnx          4-bit MatMul weights -> dtype: 'q4'
    <work>/merged/                the merged PyTorch model (for generate.py --model)

<work> is --work, by default the folder that holds --out. The fp32 ONNX export is an intermediate in
<work>/onnx-fp32 and is deleted unless --keep-fp32 is passed. Both are about 4 bytes per parameter (6 GB each
for a 1.5B model), and the ONNX exporter briefly writes the fp32 weights twice, so point --work at a disk with
room (on Kaggle, /tmp rather than the 20 GB /kaggle/working).
"""
import argparse
import json
import shutil
import time
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from common import DEFAULT_BASE


def log(*args):
    """Timestamped and flushed, so a slow stage shows up in a notebook or Slurm log while it runs."""
    print(time.strftime("[%H:%M:%S]"), *args, flush=True)

TOKENIZER_FILES = ["tokenizer.json", "tokenizer_config.json", "special_tokens_map.json", "vocab.json", "merges.txt",
                   "added_tokens.json", "chat_template.jinja"]


def merge(base, adapter, merged_dir):
    from peft import PeftModel

    log(f"Merging {adapter} into {base} ...")
    model = AutoModelForCausalLM.from_pretrained(base, dtype=torch.float32)
    model = PeftModel.from_pretrained(model, adapter).merge_and_unload()
    model.save_pretrained(merged_dir, safe_serialization=True)
    AutoTokenizer.from_pretrained(adapter).save_pretrained(merged_dir)
    return merged_dir


def export_fp32(merged_dir, onnx_dir):
    from optimum.exporters.onnx import main_export

    log("Exporting to ONNX (text-generation-with-past) ...")
    main_export(str(merged_dir), output=str(onnx_dir), task="text-generation-with-past", device="cpu",
                do_validation=False)
    return Path(onnx_dir) / "model.onnx"


def mb(path):
    files = [path] + list(path.parent.glob(path.name + "_data")) + list(path.parent.glob(path.name + ".data"))
    return sum(f.stat().st_size for f in files if f.exists()) / 1e6


def save_model(model, path):
    import onnx

    size = model.ByteSize() if hasattr(model, "ByteSize") else 0
    # Protobuf files max out at 2 GB; bigger models keep weights in a side file, which
    # transformers.js loads when the config's use_external_data_format is set.
    external = size > 1.9e9
    onnx.save_model(model, str(path), save_as_external_data=external, all_tensors_to_one_file=True,
                    location=path.name + "_data")
    return external


def quantize_q8(fp32_path, out_path):
    from onnxruntime.quantization import QuantType, quantize_dynamic

    log("Quantizing to int8 (q8) ...")
    quantize_dynamic(str(fp32_path), str(out_path), weight_type=QuantType.QInt8, per_channel=True,
                     reduce_range=False, use_external_data_format=False,
                     extra_options={"MatMulConstBOnly": True})


def quantize_q4(fp32_path, out_path, block_size):
    import onnx
    from onnxruntime.quantization.matmul_nbits_quantizer import MatMulNBitsQuantizer

    log("Quantizing MatMul weights to 4-bit (q4) ...")
    model = onnx.load(str(fp32_path))
    quant = MatMulNBitsQuantizer(model, bits=4, block_size=block_size, is_symmetric=True)
    quant.process()
    return save_model(quant.model.model, out_path)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--base", default=DEFAULT_BASE)
    p.add_argument("--adapter", default=None, help="LoRA adapter; omit with --merged to export an already merged model")
    p.add_argument("--merged", default=None, help="already merged model folder")
    p.add_argument("--out", default="out/cogsworth-web")
    p.add_argument("--formats", default="q8", help="q8 (ship this), q4 (MatMulNBits; very slow on CPU and larger for Qwen)")
    p.add_argument("--block-size", type=int, default=32)
    p.add_argument("--keep-fp32", action="store_true")
    p.add_argument("--work", default=None, help="scratch folder for the merged model and fp32 ONNX (default: next to --out)")
    args = p.parse_args()

    out = Path(args.out)
    work = Path(args.work) if args.work else out.parent
    work.mkdir(parents=True, exist_ok=True)
    merged_dir = Path(args.merged) if args.merged else merge(args.base, args.adapter, work / "merged")
    tmp = work / "onnx-fp32"
    log("Merged model ready:", merged_dir)
    fp32 = export_fp32(merged_dir, tmp)
    log(f"fp32 ONNX written ({mb(fp32):,.0f} MB)")

    onnx_out = out / "onnx"
    onnx_out.mkdir(parents=True, exist_ok=True)
    for name in ["config.json", "generation_config.json", *TOKENIZER_FILES]:
        src = tmp / name if (tmp / name).exists() else merged_dir / name
        if src.exists():
            shutil.copy(src, out / name)

    formats = [f.strip() for f in args.formats.split(",") if f.strip()]
    external = False
    if "q8" in formats:
        quantize_q8(fp32, onnx_out / "model_quantized.onnx")
    if "q4" in formats:
        external = quantize_q4(fp32, onnx_out / "model_q4.onnx", args.block_size) or external
    if args.keep_fp32:
        for f in tmp.glob("model.onnx*"):
            shutil.copy(f, onnx_out / f.name)

    # Newer transformers saves the chat template as chat_template.jinja; transformers.js reads it
    # from tokenizer_config.json, so make sure it is there too.
    tok_config_path = out / "tokenizer_config.json"
    tok_config = json.loads(tok_config_path.read_text())
    if not tok_config.get("chat_template") and (out / "chat_template.jinja").exists():
        tok_config["chat_template"] = (out / "chat_template.jinja").read_text()
        tok_config_path.write_text(json.dumps(tok_config, indent=2, ensure_ascii=False))

    config = json.loads((out / "config.json").read_text())
    config.setdefault("transformers.js_config", {})
    if external:
        config["transformers.js_config"]["use_external_data_format"] = True
    (out / "config.json").write_text(json.dumps(config, indent=2))
    shutil.rmtree(tmp, ignore_errors=True)

    print("\nBrowser-ready files:")
    for f in sorted(onnx_out.iterdir()):
        print(f"  {f.relative_to(out)}  {f.stat().st_size / 1e6:,.0f} MB")
    print(f"\nDone: {out}. Load it with transformers.js: pipeline('text-generation', '<id or path>', {{ dtype: 'q8' }})")


if __name__ == "__main__":
    main()
