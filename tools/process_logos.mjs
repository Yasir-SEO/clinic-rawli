/*
  Turns downloaded manufacturer logos into round-badge images for the brand slider.

  Every file in tools/fetched/ named  img_logo_<manufacturer-id>.<ext>  (png, jpg, webp,
  svg or ico; fetched via tools/fetch-list.txt) becomes assets/brands/<manufacturer-id>.png:
  a 320x320 transparent square with the logo trimmed and scaled to the largest rectangle
  that fits inside the circle, so wide wordmarks and square symbols both read well.

    node tools/process_logos.mjs

  Uses the Chromium browser from Playwright to read every image format (including SVG).
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "tools", "fetched");
const OUT = path.join(ROOT, "assets", "brands");
const SIZE = 320;
const FILL = 0.92; // share of the circle's diameter the logo may span

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs"));
}

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", ico: "image/x-icon", gif: "image/gif" };
const files = fs.readdirSync(SRC).filter((f) => /^img_logo_[a-z0-9-]+\.(png|jpe?g|webp|svg|ico|gif)$/i.test(f)).sort();
if (!files.length) {
  console.log("No img_logo_* files in tools/fetched/");
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<!doctype html><html><body></body></html>");
let done = 0;
for (const file of files) {
  const [, id, ext] = file.match(/^img_logo_([a-z0-9-]+)\.(\w+)$/i);
  const data = `data:${MIME[ext.toLowerCase()]};base64,${fs.readFileSync(path.join(SRC, file)).toString("base64")}`;
  const png = await page.evaluate(async ({ data, SIZE, FILL }) => {
    const img = new Image();
    img.src = data;
    await img.decode();
    // Draw large (SVGs and small icons render crisply), then find the logo's bounding box,
    // ignoring transparent and near-white pixels.
    let w = img.naturalWidth || 600, h = img.naturalHeight || 600;
    const scale = Math.max(1, 1200 / Math.max(w, h));
    w = Math.round(w * scale); h = Math.round(h * scale);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = px[i + 3], white = px[i] > 238 && px[i + 1] > 238 && px[i + 2] > 238;
        if (a > 24 && !white) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, r = bw / bh;
    // Largest rectangle of this shape inside a circle of diameter D: D*r/sqrt(1+r²) by D/sqrt(1+r²).
    const D = SIZE * FILL, k = Math.sqrt(1 + r * r);
    const tw = (D * r) / k, th = D / k;
    const out = document.createElement("canvas");
    out.width = SIZE; out.height = SIZE;
    const o = out.getContext("2d");
    o.imageSmoothingQuality = "high";
    o.drawImage(c, x0, y0, bw, bh, (SIZE - tw) / 2, (SIZE - th) / 2, tw, th);
    return out.toDataURL("image/png");
  }, { data, SIZE, FILL });
  if (!png) { console.log(`skip ${file}: no visible logo (white or empty?)`); continue; }
  const dest = path.join(OUT, `${id}.png`);
  fs.writeFileSync(dest, Buffer.from(png.split(",")[1], "base64"));
  console.log(`${file} -> assets/brands/${id}.png (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
  done++;
}
await browser.close();
console.log(`${done} logo(s) processed`);
