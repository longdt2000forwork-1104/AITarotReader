"""Download the RWS 1909 (Roses & Lilies) scans from Wikimedia Commons into the ED-01 deck folder.

Source: https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)
Output: assets/decks/rider-waite-1909/cards/<seed filename>.webp (uniform size) + ATTRIBUTION.json
Usage:  python scripts/download_rws1909.py
"""
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "docs" / "SRS" / "seed" / "tarot_78_cards_and_decks_seed.json"
OUT = ROOT / "assets" / "decks" / "rider-waite-1909" / "cards"
API = "https://commons.wikimedia.org/w/api.php"
CATEGORY = "Category:Rider-Waite_tarot_deck_(Roses_&_Lilies)"
UA = {"User-Agent": "AITarotReader/1.0 (local dev project; Wikimedia Commons downloader)"}
TARGET_SIZE = (600, 1050)  # uniform size for every card
SUITS = {"Wands": 22, "Cups": 36, "Swords": 50, "Pentacles": 64}


def get(url: str) -> bytes:
    for attempt in range(6):  # slow/flaky links: generous timeout; back off politely on HTTP 429
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if attempt == 5:
                raise
            wait = int(e.headers.get("Retry-After", 0) or 0) if e.code == 429 else 0
            time.sleep(max(wait, 10 * (attempt + 1)))
        except Exception:
            if attempt == 5:
                raise
            time.sleep(3 * (attempt + 1))


def api(**params) -> dict:
    return json.loads(get(API + "?" + urllib.parse.urlencode({**params, "format": "json"})))


def seed_names() -> dict[int, str]:
    text = SEED.read_text(encoding="utf-8", errors="ignore")
    codes = list(dict.fromkeys(re.findall(r"rider-waite-1909/cards/([^\"]+)\.webp", text)))
    return {int(c[:2]): c for c in codes}


def index_of(title: str):
    m = re.match(r"File:RWS1909 - (\d\d) ", title)
    if m:
        return int(m.group(1))
    m = re.match(r"File:RWS1909 - (Wands|Cups|Swords|Pentacles) (\d\d)\.", title)
    if m:
        return SUITS[m.group(1)] + int(m.group(2)) - 1
    return None


def main() -> None:
    names = seed_names()
    assert len(names) == 78, len(names)
    OUT.mkdir(parents=True, exist_ok=True)
    members = api(action="query", list="categorymembers", cmtitle=CATEGORY, cmlimit=200)["query"]["categorymembers"]
    files = {index_of(m["title"]): m["title"] for m in members if index_of(m["title"]) is not None}
    assert sorted(files) == list(range(78)), sorted(set(range(78)) - set(files))
    def work(i: int):
        title = files[i]
        page = next(iter(api(action="query", titles=title, prop="imageinfo", iiprop="url|extmetadata|size",
                              iiextmetadatafilter="LicenseShortName|Artist|DateTimeOriginal")["query"]["pages"].values()))
        info = page["imageinfo"][0]
        meta = info.get("extmetadata", {})
        entry = {
            "commons_file": title,
            "source_url": info["descriptionurl"],
            "original_size": [info["width"], info["height"]],
            "license": meta.get("LicenseShortName", {}).get("value"),
        }
        dest = OUT / f"{names[i]}.webp"
        if dest.exists():  # resumable
            return i, entry
        img = Image.open(io.BytesIO(get(info["url"]))).convert("RGB")
        # centre-crop to the target ratio, then resize -> identical size for all cards
        tw, th = TARGET_SIZE
        w, h = img.size
        if w / h > tw / th:
            nw = round(h * tw / th); img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w * th / tw); img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        img.resize(TARGET_SIZE, Image.LANCZOS).save(dest, quality=92, method=6)
        return i, entry

    attribution, failed = {}, []
    with ThreadPoolExecutor(max_workers=1) as ex:
        futs = {ex.submit(work, i): i for i in range(78)}
        for fut in as_completed(futs):
            i = futs[fut]
            try:
                _, entry = fut.result()
                attribution[names[i]] = entry
                print(f"{i:02d} ok {names[i]} ({len(attribution)}/78)", flush=True)
            except Exception as e:
                failed.append(i)
                print(f"{i:02d} FAILED {names[i]}: {e}", flush=True)
    attribution = dict(sorted(attribution.items()))
    (OUT.parent / "ATTRIBUTION.json").write_text(json.dumps(attribution, indent=1, ensure_ascii=False), encoding="utf-8")
    print("done", len(attribution), "failed", failed, "(re-run to retry failures)")

if __name__ == "__main__":
    main()
