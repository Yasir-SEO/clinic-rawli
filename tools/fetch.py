#!/usr/bin/env python3
"""
Downloads the pages/images listed in tools/fetch-list.txt into tools/fetched/.
Runs on GitHub Actions (see .github/workflows/fetch-web.yml), which has normal
internet access. Each line of the list is:  name | url
Lines starting with # are ignored.

A name starting with "photo_" means "this is a product page": the page is read,
its main product photo is found (og:image, JSON-LD Product image or
twitter:image) and saved as img_<rest of name>.<ext>. The page itself is not
kept; index.json lists the photo address and other candidate images.

A name starting with "api_" is a request to an open-data API (e.g. OpenStreetMap);
it is sent with a user agent that names this project, as those APIs ask.
"""
import html, json, os, re, time, urllib.parse, urllib.request, urllib.error

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


# Map/open-data APIs (OpenStreetMap) ask callers to identify themselves.
API_UA = "clinic-rawli-site-builder/1.0 (+https://github.com/Yasir-SEO/clinic-rawli)"


def get(url, accept, ua=UA):
    url = urllib.parse.quote(url, safe=":/?&=%#+,;@!$'()*~")
    req = urllib.request.Request(url, headers={
        "User-Agent": ua, "Accept-Language": "en-US,en;q=0.9", "Accept": accept})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read(MAX_BYTES + 1)
        ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        return r.status, r.geturl(), ctype, body[:MAX_BYTES]


def meta(page, prop):
    for pat in (r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]*content=["\']([^"\']+)' % prop,
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']%s["\']' % prop):
        m = re.search(pat, page, re.I)
        if m:
            return html.unescape(m.group(1)).strip()
    return None


def jsonld_images(page):
    found = []
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        stack = [data]
        while stack:
            d = stack.pop()
            if isinstance(d, list):
                stack.extend(d)
            elif isinstance(d, dict):
                types = d.get("@type")
                types = types if isinstance(types, list) else [types]
                if "Product" in types and d.get("image"):
                    img = d["image"]
                    for i in (img if isinstance(img, list) else [img]):
                        found.append(i.get("url") if isinstance(i, dict) else i)
                stack.extend(v for v in d.values() if isinstance(v, (dict, list)))
    return [f for f in found if isinstance(f, str)]


def photo_candidates(page, base):
    cands = jsonld_images(page) + [meta(page, "og:image"), meta(page, "twitter:image")]
    for m in re.finditer(r'<img[^>]+(?:data-src|src)=["\']([^"\']+\.(?:jpe?g|png|webp)[^"\']*)', page, re.I):
        cands.append(html.unescape(m.group(1)))
    out = []
    for c in cands:
        if c and not c.startswith("data:"):
            c = urllib.parse.urljoin(base, c)
            if c not in out:
                out.append(c)
    return out[:20]


results = []
with open(os.path.join(ROOT, "fetch-list.txt"), encoding="utf-8") as f:
    lines = [l.strip() for l in f if l.strip() and not l.lstrip().startswith("#")]

for line in lines:
    if "|" not in line:
        continue
    name, url = [x.strip() for x in line.split("|", 1)]
    entry = {"name": name, "url": url}
    try:
        if name.startswith("photo_"):
            status, final, ctype, body = get(url, "text/html,application/xhtml+xml,*/*;q=0.8")
            page = body.decode("utf-8", "replace")
            cands = photo_candidates(page, final)
            entry.update(status=status, final_url=final, title=(meta(page, "og:title") or ""), candidates=cands)
            if cands:
                time.sleep(1)
                status, _, ctype, body = get(cands[0], "image/webp,image/*,*/*;q=0.8")
                if ctype.startswith("image/"):
                    path = os.path.join(OUT, f"img_{safe(name[len('photo_'):])}.{EXT.get(ctype, 'img')}")
                    with open(path, "wb") as out:
                        out.write(body)
                    entry.update(image=cands[0], image_type=ctype, bytes=len(body), file=os.path.relpath(path, ROOT))
                else:
                    entry.update(image_error=f"not an image: {ctype}")
        else:
            status, final, ctype, body = get(url, "text/html,application/xhtml+xml,application/json,image/webp,image/*,*/*;q=0.8",
                                             API_UA if name.startswith("api_") else UA)
            entry.update(status=status, final_url=final, content_type=ctype, bytes=len(body))
            path = os.path.join(OUT, f"{safe(name)}.{EXT.get(ctype, 'bin')}")
            with open(path, "wb") as out:
                out.write(body)
            entry["file"] = os.path.relpath(path, ROOT)
    except urllib.error.HTTPError as e:
        entry.update(status=e.code, error=str(e))
    except Exception as e:  # network errors, timeouts
        entry.update(status=None, error=f"{type(e).__name__}: {e}")
    results.append(entry)
    print(json.dumps(entry)[:400])
    time.sleep(1.5)  # be polite to the sites we fetch from

with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
