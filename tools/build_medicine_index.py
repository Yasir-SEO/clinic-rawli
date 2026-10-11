#!/usr/bin/env python3
"""
Builds data/all-medicines.json, the "request any medicine" search list,
from tools/fetched/dawaai-list.json (fetched by the GitHub "Fetch web pages" job).

Only facts are kept: medicine name, manufacturer and pack size. No photos or
prices. Controlled medicines (narcotics, sleeping pills, etc.) are removed,
because they must not be ordered online; the pharmacist still checks every
request and asks for a prescription where needed.

    python3 tools/build_medicine_index.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "fetched", "dawaai-list.json")
OUT = os.path.join(ROOT, "data", "all-medicines.json")

# Controlled substances (generic names and well-known brands). Matched as whole
# words in the medicine name, case-insensitive.
CONTROLLED = [
    # opioids
    "tramadol", "tramal", "tramacet", "codeine", "morphine", "pethidine", "meperidine", "nalbuphine",
    "nubain", "pentazocine", "sosegon", "buprenorphine", "temgesic", "methadone", "fentanyl",
    "oxycodone", "hydrocodone", "tapentadol", "dextropropoxyphene", "diphenoxylate", "lomotil",
    # benzodiazepines / hypnotics / sedatives
    "alprazolam", "xanax", "bromazepam", "lexotanil", "clonazepam", "rivotril", "diazepam", "valium",
    "lorazepam", "ativan", "midazolam", "dormicum", "nitrazepam", "flurazepam", "temazepam",
    "chlordiazepoxide", "librium", "oxazepam", "clobazam", "frisium", "zolpidem", "zopiclone",
    "phenobarbital", "phenobarbitone", "barbiturate",
    # anaesthetic / stimulants
    "ketamine", "methylphenidate", "ritalin", "amphetamine", "modafinil",
]
CONTROLLED_RE = re.compile(r"\b(" + "|".join(CONTROLLED) + r")\b", re.I)


def tidy(s):
    return re.sub(r"\s+", " ", (s or "")).strip()


def main():
    data = json.load(open(SRC, encoding="utf-8"))
    seen = set()
    makers = []
    maker_idx = {}
    rows = []
    removed = []
    for letter in sorted(data):
        for item in data[letter]:
            name, maker, pack = tidy(item.get("name")), tidy(item.get("maker")), tidy(item.get("pack"))
            if not name:
                continue
            if CONTROLLED_RE.search(name):
                removed.append(name)
                continue
            key = (name.lower(), maker.lower(), pack.lower())
            if key in seen:
                continue
            seen.add(key)
            if maker not in maker_idx:
                maker_idx[maker] = len(makers)
                makers.append(maker)
            rows.append([name, maker_idx[maker], pack])
    rows.sort(key=lambda r: r[0].lower())
    out = {"source": "Medicine names, makers and pack sizes for request search",
           "makers": makers, "items": rows}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(rows)} medicines from {len(makers)} makers -> {os.path.relpath(OUT, ROOT)} "
          f"({os.path.getsize(OUT) // 1024} KB); {len(removed)} controlled items removed")


if __name__ == "__main__":
    main()
