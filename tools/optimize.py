"""Сжимает картинки от Codex: _raw/**/*.png -> assets/**/*.webp (og-cover -> assets/og-cover.jpg)."""
import sys
from pathlib import Path
from PIL import Image, ImageOps

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "_raw", ROOT / "assets"
MAX = {"bg": 2048, "characters": 1400, "objects": 1200, "textures": 1400}

done = 0
for src in sorted(RAW.rglob("*.png")):
    rel = src.relative_to(RAW)
    if rel.parts[0] == "sheets":
        continue
    im = Image.open(src)
    if rel.stem == "og-cover":
        im = ImageOps.fit(im.convert("RGB"), (1200, 630), Image.LANCZOS)
        dst = OUT / "og-cover.jpg"
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "JPEG", quality=86, optimize=True)
    else:
        limit = MAX.get(rel.parts[0], 1600)
        if max(im.size) > limit:
            im.thumbnail((limit, limit), Image.LANCZOS)
        im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
        dst = OUT / rel.with_suffix(".webp")
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=82, method=6)
    done += 1
    print(f"{rel} -> {dst.relative_to(ROOT)} ({dst.stat().st_size // 1024} KB)")
print(f"Done: {done} files")
