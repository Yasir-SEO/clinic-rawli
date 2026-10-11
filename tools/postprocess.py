#!/usr/bin/env python3
"""
Runs on GitHub Actions after tools/fetch.py. Shrinks big downloaded pages into
small data files so the repository doesn't fill up with raw HTML.

- dawaai_*.html (Dawaai A-Z medicine lists) -> fetched/dawaai-list.json with
  name, maker, pack size, price and listed (MRP) price per medicine; the raw
  HTML is then deleted.
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "fetched")


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def money(s):
    m = re.search(r"Rs\.?\s*([\d,]+(?:\.\d+)?)", s or "")
    return float(m.group(1).replace(",", "")) if m else None


def parse_dawaai(path):
    page = open(path, encoding="utf-8", errors="replace").read()
    items = []
    for card in page.split('<div class="card">')[1:]:
        link = re.search(r'<h2><a href="(https://dawaai\.pk/medicine/[^"]+)">(.*?)</a></h2>', card, re.S)
        if not link:
            continue
        body = card.split('<div class="card-body">', 1)[-1]
        paras = [clean(p) for p in re.findall(r"<p>(.*?)</p>", body, re.S)]
        maker = next((p for p in paras if not p.lower().startswith("pack size")), "")
        pack = next((p.split(":", 1)[1].strip() for p in paras if p.lower().startswith("pack size")), "")
        h4 = re.search(r"<h4>(.*?)</h4>", body, re.S)
        price = mrp = None
        if h4:
            span = re.search(r"<span>(.*?)</span>", h4.group(1), re.S)
            mrp = money(span.group(1)) if span else None
            price = money(re.sub(r"<span>.*?</span>", "", h4.group(1), flags=re.S))
            if mrp is None:
                mrp = price
        mid = re.search(r"-(\d+)\.html$", link.group(1))
        items.append({"id": int(mid.group(1)) if mid else None, "name": clean(link.group(2)),
                      "maker": maker, "pack": pack, "price": price, "mrp": mrp})
    return items


files = sorted(glob.glob(os.path.join(OUT, "dawaai_*.html")))
if files:
    target = os.path.join(OUT, "dawaai-list.json")
    data = json.load(open(target)) if os.path.exists(target) else {}
    for f in files:
        letter = os.path.basename(f)[len("dawaai_"):-len(".html")]
        data[letter] = parse_dawaai(f)
        print(f"{letter}: {len(data[letter])} medicines")
        os.remove(f)
    json.dump(data, open(target, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
