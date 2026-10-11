#!/usr/bin/env python3
"""
Turns downloaded product photos into site-ready images.

Every file in tools/fetched/ named  img_<product-id>.<ext>  (fetched via
tools/fetch-list.txt) becomes assets/products/<product-id>.jpg:
white background, trimmed borders, centred on an 800x800 square, ~100 KB.

    python3 tools/process_images.py
"""
import glob
import os
import sys

from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "fetched")
OUT = os.path.join(ROOT, "assets", "products")
SIZE = 800
MARGIN = 0.08


def flatten(img):
    """Composite transparent images onto white."""
    img = img.convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    return Image.alpha_composite(bg, img).convert("RGB")


def trim(img):
    """Crop away the plain background: white, or the light studio backdrop seen in the corners."""
    w, h = img.size
    corners = [img.getpixel((x, y)) for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    light = [c for c in corners if min(c) > 200]
    bg_color = tuple(sorted(light)[len(light) // 2]) if len(light) >= 3 else (255, 255, 255)
    box = None
    for color, cut in ((bg_color, 26), ((255, 255, 255), 18)):
        bg = Image.new("RGB", img.size, color)
        diff = ImageChops.difference(img, bg).convert("L").point(lambda v, c=cut: 255 if v > c else 0)
        b = diff.getbbox()
        if b and (box is None or (b[2] - b[0]) * (b[3] - b[1]) < (box[2] - box[0]) * (box[3] - box[1])):
            box = b
    return img.crop(box) if box else img


def square(img):
    # Never enlarge small photos (that makes them blurry); shrink big ones.
    inner = min(int(SIZE * (1 - 2 * MARGIN)), max(img.size))
    side = min(SIZE, max(400, round(inner / (1 - 2 * MARGIN))))
    img.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas


def main():
    os.makedirs(OUT, exist_ok=True)
    done = 0
    for path in sorted(glob.glob(os.path.join(SRC, "img_*"))):
        base = os.path.basename(path)
        pid, ext = os.path.splitext(base[4:])
        if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            print(f"skip {base}: not an image ({ext})")
            continue
        try:
            img = square(trim(flatten(Image.open(path))))
        except Exception as e:  # corrupt download
            print(f"skip {base}: {e}")
            continue
        dest = os.path.join(OUT, f"{pid}.jpg")
        img.save(dest, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"{base} -> assets/products/{pid}.jpg ({os.path.getsize(dest) // 1024} KB)")
        done += 1
    print(f"{done} image(s) processed")
    return 0 if done else 1


if __name__ == "__main__":
    sys.exit(main())
