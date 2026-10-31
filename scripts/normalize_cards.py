"""Normalize generated ED-02 card images to one uniform size and export as WebP.

Usage: python scripts/normalize_cards.py <source_dir> [<source_dir> ...]
Picks the newest image per card code (e.g. "01_the_magician"), center-crops to the
deck aspect ratio, resizes to TARGET_SIZE and writes <code>.webp into OUT_DIR.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "docs" / "SRS" / "seed" / "tarot_78_cards_and_decks_seed.json"
OUT_DIR = ROOT / "assets" / "decks" / "sunlit-botanical-herbarium" / "cards"
TARGET_SIZE = (768, 1376)  # uniform size for every card (approved pilot size)


def card_codes() -> list[str]:
    text = SEED.read_text(encoding="utf-8", errors="ignore")
    return list(dict.fromkeys(re.findall(r"sunlit-botanical-herbarium/cards/([^\"]+)\.webp", text)))


def fit(img: Image.Image) -> Image.Image:
    tw, th = TARGET_SIZE
    w, h = img.size
    target_ratio, ratio = tw / th, w / h
    if abs(ratio - target_ratio) > 0.005:
        if ratio > target_ratio:  # too wide -> crop sides
            nw = round(h * target_ratio)
            img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:  # too tall -> crop top/bottom
            nh = round(w / target_ratio)
            img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return img.convert("RGB").resize(TARGET_SIZE, Image.LANCZOS)


def main(sources: list[str]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = [p for s in sources for p in Path(s).glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    report = {"written": [], "missing": [], "resized": []}
    for code in card_codes():
        cands = [p for p in files if p.name.startswith(code)]
        if not cands:
            if not (OUT_DIR / f"{code}.webp").exists():
                report["missing"].append(code)
            continue
        src = max(cands, key=lambda p: p.stat().st_mtime)
        img = Image.open(src)
        if img.size != TARGET_SIZE:
            report["resized"].append(f"{code} {img.size}")
        fit(img).save(OUT_DIR / f"{code}.webp", quality=90, method=6)
        report["written"].append(code)
    for p in OUT_DIR.glob("*.webp"):  # also enforce size on previously exported cards
        with Image.open(p) as im:
            if im.size != TARGET_SIZE:
                fit(im).save(p, quality=90, method=6)
    print(json.dumps({k: (v if k != "written" else len(v)) for k, v in report.items()}, indent=1))


if __name__ == "__main__":
    main(sys.argv[1:])
