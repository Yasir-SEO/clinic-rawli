#!/usr/bin/env python3
"""
Suggests Dawaai list entries for each product in data/products.js, to fill in
pack sizes and retail (MRP) prices. Prints the best candidates per product for
a human to check; it does not change any files.

    python3 tools/match_dawaai.py > /tmp/matches.txt
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORM_WORDS = {
    "tablet": {"tablet", "tablets", "tab", "tabs"}, "capsule": {"capsule", "capsules", "cap", "caps"},
    "syrup": {"syrup", "syp"}, "suspension": {"suspension", "susp", "syrup"}, "drops": {"drop", "drops"},
    "cream": {"cream"}, "ointment": {"ointment", "oint"}, "gel": {"gel"}, "inhaler": {"inhaler", "evohaler"},
    "nebule": {"nebules", "nebule", "respules"}, "sachet": {"sachet", "sachets", "granules"},
    "lozenge": {"lozenges", "lozenge"}, "effervescent": {"effervescent"}, "vial": {"suspension", "vials"},
}


def norm(s):
    s = (s or "").lower().replace("&", " and ")
    s = re.sub(r"(\d)\s*(mg|mcg|g|ml|%)\b", r"\1\2", s)
    return re.sub(r"[^a-z0-9.%/+ ]+", " ", s).split()


def numbers(s):
    return set(re.findall(r"\d+(?:\.\d+)?", s or ""))


def main():
    products = json.loads(subprocess.check_output(
        ["node", "-e", "console.log(JSON.stringify(require('./data/products.js').products))"], cwd=ROOT))
    dawaai = json.load(open(os.path.join(ROOT, "tools", "fetched", "dawaai-list.json"), encoding="utf-8"))
    items = [it for letter in dawaai.values() for it in letter]
    for it in items:
        it["_tok"] = norm(it["name"])

    for p in products:
        brand = norm(p["brand"])
        if not brand:
            continue
        first = brand[0]
        want_nums = numbers(p.get("strength", "")) | numbers(p["name"])
        forms = FORM_WORDS.get(p["form"], set())
        cands = []
        for it in items:
            tok = it["_tok"]
            if not tok or tok[0] != first:
                continue
            score = 3
            score += sum(1 for b in brand[1:] if b in tok)
            nums = numbers(it["name"]) | numbers(it.get("pack", ""))
            score += 2 * len(want_nums & nums)
            score -= len(numbers(it["name"]) - want_nums)  # different strength mentioned
            if forms and forms & set(tok):
                score += 1
            cands.append((score, it))
        cands.sort(key=lambda c: -c[0])
        print(f"\n## {p['id']}  [{p['name']}]")
        for score, it in cands[:4]:
            print(f"   {score:>2}  {it['name']} | {it['maker']} | {it['pack']} | MRP {it['mrp']}")
        if not cands:
            print("   (no candidates)")


if __name__ == "__main__":
    main()
