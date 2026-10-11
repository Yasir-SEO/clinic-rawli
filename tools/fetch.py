#!/usr/bin/env python3
"""
Downloads the pages/images listed in tools/fetch-list.txt into tools/fetched/.
Runs on GitHub Actions (see .github/workflows/fetch-web.yml), which has normal
internet access. Each line of the list is:  name | url
Lines starting with # are ignored.
"""
import json, os, re, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "fetched")
os.makedirs(OUT, exist_ok=True)
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.5 Safari/605.1.15")
EXT = {"text/html": "html", "application/json": "json", "image/jpeg": "jpg", "image/png": "png",
       "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "text/plain": "txt"}
MAX_BYTES = 8 * 1024 * 1024

def safe(name):
    return re.sub(r"[^a-zA-Z0-9_.-]+", "-", name).strip("-")[:80] or "item"

results = []
with open(os.path.join(ROOT, "fetch-list.txt"), encoding="utf-8") as f:
    lines = [l.strip() for l in f if l.strip() and not l.lstrip().startswith("#")]

for line in lines:
    if "|" not in line:
        continue
    name, url = [x.strip() for x in line.split("|", 1)]
    entry = {"name": name, "url": url}
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/json,image/webp,image/*,*/*;q=0.8"})
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read(MAX_BYTES + 1)
            ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            entry.update(status=r.status, final_url=r.geturl(), content_type=ctype, bytes=len(body))
            ext = EXT.get(ctype, "bin")
            path = os.path.join(OUT, f"{safe(name)}.{ext}")
            with open(path, "wb") as out:
                out.write(body[:MAX_BYTES])
            entry["file"] = os.path.relpath(path, ROOT)
    except urllib.error.HTTPError as e:
        entry.update(status=e.code, error=str(e))
    except Exception as e:  # network errors, timeouts
        entry.update(status=None, error=f"{type(e).__name__}: {e}")
    results.append(entry)
    print(json.dumps(entry))
    time.sleep(1.5)  # be polite to the sites we fetch from

with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
