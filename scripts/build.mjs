#!/usr/bin/env node
/*
  Builds the static site from src/, data/products.js and site.config.json.

    node scripts/build.mjs

  Output (committed so GitHub Pages can serve it):
    index.html, shop.html, cart.html, checkout.html,
    categories/*.html, brands/*.html, medicines/*.html,
    js/config.js, sitemap.xml, robots.txt
*/
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, content) => {
  const full = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

const config = JSON.parse(read("site.config.json"));
const DATA = require(path.join(ROOT, "data/products.js"));
const C = require(path.join(ROOT, "js/catalog.js"));
const IDX = C.indexData(DATA);
const esc = C.esc;
const SITE = config.siteUrl.endsWith("/") ? config.siteUrl : config.siteUrl + "/";
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- Product photos ---------- */
// Drop a photo named after the product id into assets/products/, e.g.
// assets/products/panadol-500mg-tablets.jpg, and it replaces the drawn pack.
const IMAGE_DIR = "assets/products";
const IMAGES = {};
if (fs.existsSync(path.join(ROOT, IMAGE_DIR))) {
  for (const file of fs.readdirSync(path.join(ROOT, IMAGE_DIR)).sort()) {
    const m = file.match(/^([a-z0-9-]+)\.(jpe?g|png|webp)$/i);
    if (!m) continue;
    if (!IDX.prod[m[1]]) { console.warn(`Photo ${file} does not match any product id (skipped).`); continue; }
    IMAGES[m[1]] = `${IMAGE_DIR}/${file}`;
  }
}
C.setImages(IMAGES);

// Manufacturer logos: assets/brands/<manufacturer-id>.png (or .jpg/.webp/.svg).
const LOGO_DIR = "assets/brands";
const LOGOS = {};
if (fs.existsSync(path.join(ROOT, LOGO_DIR))) {
  for (const file of fs.readdirSync(path.join(ROOT, LOGO_DIR)).sort()) {
    const m = file.match(/^([a-z0-9-]+)\.(png|jpe?g|webp|svg)$/i);
    if (m && IDX.mfr[m[1]]) LOGOS[m[1]] = `${LOGO_DIR}/${file}`;
  }
}

/* ---------- Validate data ---------- */
const seen = new Set();
for (const p of DATA.products) {
  if (seen.has(p.id)) throw new Error(`Duplicate product id: ${p.id}`);
  seen.add(p.id);
  if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error(`Invalid product id (use a-z, 0-9, -): ${p.id}`);
  if (!IDX.cat[p.cat] || IDX.cat[p.cat].virtual) throw new Error(`Unknown category "${p.cat}" for ${p.id}`);
  if (p.all && !p.kids) throw new Error(`${p.id}: "all: true" is only for products that also have "kids: true"`);
  if (!IDX.mfr[p.mfr]) throw new Error(`Unknown manufacturer "${p.mfr}" for ${p.id}`);
  if (p.price != null && !(typeof p.price === "number" && p.price >= 0)) throw new Error(`Invalid price for ${p.id}`);
  if (p.image && !/^https:\/\/[^\s"'<>]+$/.test(p.image)) throw new Error(`Image link for ${p.id} must start with https:// and contain no spaces`);
}

/* ---------- Opening hours ---------- */
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_NUM = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function time12(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  h = h % 24;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
const hours = config.hours || {};
const hoursText = (h) => (h ? `${time12(h[0])} – ${time12(h[1])}` : "Closed");
const uniqueHours = [...new Set(DAYS.map((d) => JSON.stringify(hours[d] || null)))];
const allSame = uniqueHours.length === 1 && hours.monday;
const hoursSummary = allSame ? `Open daily ${hoursText(hours.monday)}` : "See our opening hours";
const hoursSentence = allSame
  ? `The pharmacy is open every day from ${time12(hours.monday[0])} to ${time12(hours.monday[1])}.`
  : "Please see the opening hours on our website.";
const doctorDays = (config.doctorDays || []).filter((d) => DAYS.includes(d));
const listText = (a, and) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} ${and} ${a[a.length - 1]}` : a.join(""));
const doctorDaysText = listText(doctorDays.map(cap), "&");
const doctorDaysSentence = doctorDays.length
  ? `Our child specialist, ${config.doctorName || "the doctor"}, sees patients every ${listText(doctorDays.map(cap), "and")}.`
  : "";
const hoursRows = DAYS.map((d) => {
  const h = hours[d];
  const attrs = h ? `data-open="${h[0]}" data-close="${h[1]}"` : `data-closed="true"`;
  const doc = doctorDays.includes(d) ? ' <span class="hours__doc">Doctor available</span>' : "";
  return `                  <tr data-day="${DAY_NUM[d]}" ${attrs}><th scope="row">${cap(d)}</th><td>${hoursText(h)}${doc}</td></tr>`;
}).join("\n");
const openingHoursJson = JSON.stringify(
  uniqueHours.filter((u) => u !== "null").map((u) => {
    const h = JSON.parse(u);
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS.filter((d) => JSON.stringify(hours[d] || null) === u).map(cap),
      opens: h[0],
      closes: h[1],
    };
  })
);

/* ---------- Shared values ---------- */
const addr = config.address || {};
// With exact coordinates (config.geo) the map pin, directions and Google data use the
// precise spot; otherwise Google searches for the address text.
const geo = config.geo && Number.isFinite(config.geo.lat) && Number.isFinite(config.geo.lng) ? config.geo : null;
const geoText = geo ? `${geo.lat},${geo.lng}` : "";
const mapsQuery = geo ? geoText : encodeURIComponent(config.mapsQuery || `${addr.town}, ${addr.district}, Pakistan`);
const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
const mapsDirectionsUrl = geo ? `https://www.google.com/maps/dir/?api=1&destination=${geoText}` : mapsSearchUrl;
const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&z=${geo ? 17 : 15}&output=embed`;
const geoJsonLd = geo ? `"geo": { "@type": "GeoCoordinates", "latitude": ${geo.lat}, "longitude": ${geo.lng} },` : "";
const waDigits = String(config.whatsapp || "").replace(/\D/g, "");
const waLink = /^\d{10,15}$/.test(waDigits) ? `https://wa.me/${waDigits}` : "https://wa.me/";
const fee = config.deliveryFee;
const deliveryFeeText = fee == null ? "charges confirmed on WhatsApp" : fee === 0 ? "Free" : C.formatPrice(fee, config.currency);

const realCategories = DATA.categories.filter((c) => !c.virtual);
const catCount = (id) => DATA.products.filter((p) => C.inCategory(p, id)).length;
const mfrCount = (id) => DATA.products.filter((p) => p.mfr === id).length;
const brandsShown = DATA.manufacturers.filter((m) => !m.hidden && mfrCount(m.id) > 0);

/* Main menu. Menus list the categories of one group; "all" is the group's overview page. */
const MENU_GROUPS = [
  { group: "kids", label: "Kids' Medicines", all: "kids", note: "Medicines for babies and children, sorted by need." },
  { group: "kids-care", label: "Baby & Kids Care", all: "baby-kids", note: "Diapers, bath, skin and feeding." },
  { group: "adult", label: "Adult Medicines", all: "adult", note: "Medicines for adults and the whole family." },
  { group: "care", label: "Personal Care & Health", all: "care-health", note: "Oral care, hygiene, first aid and devices." },
];
const groupCats = (group) => DATA.categories.filter((c) => c.group === group && c.id !== MENU_GROUPS.find((g) => g.group === group).all);
const catShort = (c) => c.short || c.name;
const catHref = (c) => `categories/${c.id}.html`;
const groupOf = (c) => MENU_GROUPS.find((g) => g.group === c.group);
const NAV = [
  { href: "index.html", label: "Home" },
  { href: "index.html#clinic", label: "Clinic" },
  ...MENU_GROUPS.map((g) => ({ menu: g })),
  { href: "shop.html", label: "All Products" },
  { href: "index.html#visit", label: "Contact" },
];

function navLinks(root, current) {
  const items = NAV.map((item, i) => {
    if (!item.menu) {
      const active = item.href === current ? ' aria-current="page"' : "";
      return `        <li class="nav-item"><a class="nav-link" href="${root}${item.href}"${active}>${esc(item.label)}</a></li>`;
    }
    const g = item.menu;
    const allCat = IDX.cat[g.all];
    const list = groupCats(g.group);
    const inMenu = [allCat, ...list].some((c) => current === catHref(c));
    const id = `menu-${g.group}`;
    const links = list.map((c) => {
      const active = current === catHref(c) ? ' aria-current="page"' : "";
      return `              <li><a href="${root}${catHref(c)}"${active}><svg class="icon" aria-hidden="true"><use href="#i-${c.icon}"/></svg> ${esc(catShort(c))} <span>${catCount(c.id)}</span></a></li>`;
    }).join("\n");
    return `        <li class="nav-item nav-item--menu${inMenu ? " is-active" : ""}">
          <button class="nav-link" type="button" aria-expanded="false" aria-controls="${id}">${esc(g.label)} <svg class="icon nav-caret" aria-hidden="true"><use href="#i-chevron"/></svg></button>
          <div class="nav-menu${list.length > 6 ? " nav-menu--wide" : ""}" id="${id}">
            <p class="nav-menu__note">${esc(g.note)}</p>
            <ul class="nav-menu__list" role="list">
${links}
            </ul>
            <a class="nav-menu__all" href="${root}${catHref(allCat)}"${current === catHref(allCat) ? ' aria-current="page"' : ""}>${esc(allCat.short || allCat.name)} (${catCount(allCat.id)}) <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </li>`;
  });
  return `      <button class="navbar__toggle" type="button" aria-expanded="false" aria-controls="nav-list"><svg class="icon" aria-hidden="true"><use href="#i-menu"/></svg> Menu</button>
      <ul class="nav-list" id="nav-list" role="list">
${items.join("\n")}
      </ul>`;
}

function footerCategories(root) {
  return ["kids", "kids-fever-pain", "baby-kids", "diapers", "baby-feeding", "adult", "personal-care", "care-health"]
    .map((id) => `          <li><a href="${root}categories/${id}.html">${esc(IDX.cat[id].name)}</a></li>`)
    .join("\n");
}

/* ---------- Templating ---------- */
const partials = {};
function partial(name) {
  if (!(name in partials)) partials[name] = read(`src/partials/${name}.html`);
  return partials[name];
}

function render(tpl, vars) {
  const expanded = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => render(partial(n), vars));
  return expanded.replace(/\{\{\s*([\w]+)\s*\}\}/g, (m, key) => {
    if (!(key in vars)) throw new Error(`Missing template value: ${key}`);
    return String(vars[key]);
  });
}

/* ---------- Runtime files (written first so their version tags are right) ---------- */
write("data/images.js", `/* Generated by scripts/build.mjs from the files in ${IMAGE_DIR}/. Do not edit by hand. */
window.PRODUCT_IMAGES = ${JSON.stringify(IMAGES, null, 2)};
`);

write("js/config.js", `/* Generated from site.config.json by scripts/build.mjs. Do not edit by hand. */
window.SITE = ${JSON.stringify({
  businessName: config.businessName,
  siteUrl: SITE,
  phoneDisplay: config.phoneDisplay,
  phoneTel: config.phoneTel,
  whatsapp: config.whatsapp,
  hours: config.hours,
  currency: config.currency,
  deliveryFee: config.deliveryFee,
  deliveryArea: config.deliveryArea,
  paymentMethods: config.paymentMethods,
}, null, 2)};
`);

/* Version tag for CSS/JS links, so browsers load a changed file instead of an old cached copy. */
const assetVersions = {};
const assetVersion = (file) =>
  (assetVersions[file] ??= crypto.createHash("md5").update(read(file)).digest("hex").slice(0, 8));
const versionAssets = (html) =>
  html.replace(/(href|src)="((?:\.\.\/)*)((?:css|js|data)\/[\w.-]+\.(?:css|js))"/g,
    (m, attr, up, file) => `${attr}="${up}${file}?v=${assetVersion(file)}"`);

const LAYOUT = read("src/layout.html");
const builtPages = [];

function page({ path: outPath, title, description, content, jsonLd = "", robots = "index, follow", bodyClass = "", scripts = [], ogType = "website", ogImage = "", current = "", vars = {}, sitemap = true, priority = "0.6" }) {
  const depth = outPath.split("/").length - 1;
  const root = depth ? "../".repeat(depth) : "";
  const base = {
    root,
    siteUrl: SITE,
    businessName: esc(config.businessName),
    businessNameRaw: config.businessName,
    storeName: esc(config.storeName || ""),
    clinicName: esc(config.clinicName || ""),
    addrStreet: esc(addr.street || ""),
    addrTown: esc(addr.town || "Rohillanwali"),
    addrDistrict: esc(addr.district || ""),
    addrRegion: esc(addr.region || "Punjab"),
    addrPostal: esc(addr.postalCode || ""),
    addrUrdu: esc(addr.urdu || ""),
    addrShort: esc([addr.street, addr.town].filter(Boolean).join(", ")),
    addrStreetRaw: addr.street || "",
    addrPostalRaw: addr.postalCode || "",
    storeNameRaw: config.storeName || "",
    clinicNameRaw: config.clinicName || "",
    mapsSearchUrl: esc(mapsSearchUrl),
    mapsSearchUrlRaw: mapsSearchUrl,
    mapsEmbedUrl: esc(mapsEmbedUrl),
    mapsDirectionsUrl: esc(mapsDirectionsUrl),
    landmark: esc(config.landmark || ""),
    landmarkRaw: config.landmark || "",
    landmarkUrdu: esc(config.landmarkUrdu || ""),
    geoJsonLd,
    facebookUrl: esc(config.facebook || "https://www.facebook.com/Adilmedicalstore"),
    instagramUrl: esc(config.instagram || "https://www.instagram.com/adilmedicalstore/"),
    phoneDisplay: esc(config.phoneDisplay),
    phoneTel: esc(config.phoneTel),
    whatsapp: esc(config.whatsapp),
    waLink,
    year: new Date().getFullYear(),
    hoursSummary,
    hoursSentence,
    hoursNote: esc(config.hoursNote || ""),
    doctorName: esc(config.doctorName || ""),
    doctorDaysText: esc(doctorDaysText),
    doctorDaysSentence: esc(doctorDaysSentence),
    doctorDaysRaw: listText(doctorDays.map(cap), "and"),
    doctorDaysNums: doctorDays.map((d) => DAY_NUM[d]).join(","),
    waBookUrl: esc(C.waUrl(config.whatsapp, "Assalam-o-Alaikum! I'd like to book a visit with the child specialist. (from your website)")),
    email: esc(config.email || ""),
    emailRaw: config.email || "",
    hoursRows,
    openingHoursJson,
    deliveryArea: esc(config.deliveryArea || "Rohillanwali"),
    deliveryFeeText,
    navLinks: navLinks(root, current),
    footerCategories: footerCategories(root),
    ...vars,
  };
  // Page content may itself contain {{tokens}} (e.g. home page JSON-LD).
  const body = render(content, base);
  const ld = jsonLd ? render(jsonLd, base) : "";
  const canonical = outPath === "index.html" ? SITE : SITE + outPath;
  const html = render(LAYOUT, {
    ...base,
    title: esc(title),
    description: esc(description),
    canonical,
    robots,
    ogType,
    bodyClass,
    ogImageTags: ogImage
      ? `  <meta property="og:image" content="${esc(/^https?:/.test(ogImage) ? ogImage : SITE + ogImage)}">`
      : `  <meta property="og:image" content="${SITE}assets/og-image.png">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">`,
    jsonLd: ld,
    content: body,
    pageScripts: scripts.map((s) => `  <script src="${root}${s}" defer></script>`).join("\n"),
  });
  write(outPath, versionAssets(html));
  if (sitemap && robots.startsWith("index")) builtPages.push({ loc: canonical, priority });
}

function ldScript(obj) {
  return `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`;
}

function breadcrumbs(root, items) {
  const html = "<ol>" + items.map((it, i) =>
    i === items.length - 1
      ? `<li aria-current="page">${esc(it.name)}</li>`
      : `<li><a href="${root}${it.href}">${esc(it.name)}</a></li>`
  ).join("") + "</ol>";
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(i === items.length - 1 ? {} : { item: SITE + (it.href === "index.html" ? "" : it.href) }),
    })),
  };
  return { html, ld };
}

/* ---------- Reusable blocks ---------- */
const MARK_COLORS = ["#0f766e", "#e2574c", "#2563eb", "#7c4dce", "#e08a12", "#c2418a", "#0891b2", "#16a34a"];
function monogram(name) {
  if (name.length <= 3) return name;
  const words = name.replace(/[^A-Za-z&' ]/g, " ").split(/\s+/).filter(Boolean);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name[0].toUpperCase();
}

function brandStrip(root, { compact = false } = {}) {
  const chips = (hidden) => brandsShown.map((m, i) => {
    const n = mfrCount(m.id);
    const attrs = hidden ? ' tabindex="-1"' : "";
    const logo = LOGOS[m.id]
      ? `<span class="brand-chip__logo"><img src="${root}${LOGOS[m.id]}" alt="" width="88" height="88" loading="lazy" decoding="async"></span>`
      : `<span class="brand-chip__logo brand-chip__logo--text" style="--c:${MARK_COLORS[i % MARK_COLORS.length]}">${esc(monogram(m.name))}</span>`;
    return `<a class="brand-chip" href="${root}brands/${m.id}.html"${attrs} title="${esc(m.full)}">` + logo +
      `<span class="brand-chip__name">${esc(m.name)}<small>${n} ${n === 1 ? "product" : "products"}</small></span></a>`;
  }).join("");
  // About 4 seconds per logo, so the strip moves slowly whatever the number of brands.
  return `    <section class="brands${compact ? " brands--compact" : ""}" id="brands" aria-labelledby="brands-title">
      <div class="container brands__head">
        <h2 id="brands-title">${compact ? "Shop by manufacturer" : "Trusted manufacturers we stock"}</h2>
        <p>${brandsShown.length} leading pharmaceutical and healthcare companies</p>
      </div>
      <div class="marquee" style="--marquee-time:${brandsShown.length * 4}s">
        <div class="marquee__track">
          <div class="marquee__group">${chips(false)}</div>
          <div class="marquee__group" aria-hidden="true">${chips(true)}</div>
        </div>
      </div>
    </section>`;
}

function cards(products, root) {
  return products.map((p) => "          " + C.renderCard(p, DATA, { root, currency: config.currency })).join("\n");
}

/* ---------- Home ---------- */
function parsePage(file) {
  let src = read(file);
  const metaMatch = src.match(/^<!--page (\{.*?\}) -->\n/);
  if (!metaMatch) throw new Error(`Missing <!--page {...} --> header in ${file}`);
  const meta = JSON.parse(metaMatch[1]);
  src = src.slice(metaMatch[0].length);
  let jsonLd = "";
  const ldMatch = src.match(/^<!--jsonld\n([\s\S]*?)\n-->\n/);
  if (ldMatch) { jsonLd = ldMatch[1]; src = src.slice(ldMatch[0].length); }
  return { meta, jsonLd, content: src };
}

{
  const root = "";
  const { meta, jsonLd, content } = parsePage("src/pages/index.html");
  const catCard = (c) => {
    const color = C.colorFor(c.id);
    return `          <a class="cat-card" href="categories/${c.id}.html" style="--c:${color[0]};--cs:${color[1]}">
            <span class="cat-card__icon"><svg class="icon" aria-hidden="true"><use href="#i-${c.icon}"/></svg></span>
            <span class="cat-card__name">${esc(catShort(c))}</span>
            <span class="cat-card__urdu urdu" lang="ur" dir="rtl">${esc(c.urdu)}</span>
            <span class="cat-card__count">${catCount(c.id)} products</span>
          </a>`;
  };
  const kidsCategoryGrid = [...groupCats("kids"), ...groupCats("kids-care")].map(catCard).join("\n");
  const adultCategoryGrid = [...groupCats("adult"), ...groupCats("care")].map(catCard).join("\n");
  const featured = DATA.products.filter((p) => p.featured).slice(0, 12);
  page({
    path: "index.html",
    title: meta.title,
    description: meta.description,
    bodyClass: meta.bodyClass,
    content,
    jsonLd,
    current: "index.html",
    priority: "1.0",
    vars: {
      brandStrip: brandStrip(root),
      kidsCategoryGrid,
      adultCategoryGrid,
      kidsCount: catCount("kids") + catCount("baby-kids"),
      adultCount: catCount("adult") + catCount("care-health"),
      featuredGrid: cards(featured, root),
      productCount: DATA.products.length,
    },
  });
}

/* ---------- Listings: shop, categories, brands ---------- */
const LISTING = read("src/templates/listing.html");
const PAGE_SIZE = 24;

function listing({ outPath, products, title, h1, urdu = "", intro, note = "", short, crumbs, presetCat = "", presetMfr = "", activeCat = "", showMfr = true, brandStripCompact = false, current = "" }) {
  const depth = outPath.split("/").length - 1;
  const root = depth ? "../" : "";
  const sorted = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const bc = breadcrumbs(root, crumbs);

  const catLink = (c, label) =>
    `            <li><a href="${root}categories/${c.id}.html"${activeCat === c.id ? ' aria-current="page"' : ""}>${esc(label)} <span>${catCount(c.id)}</span></a></li>`;
  const categoryLinks = [
    `            <li><a href="${root}shop.html"${!activeCat && !presetMfr ? ' aria-current="page"' : ""}>All products <span>${DATA.products.length}</span></a></li>`,
    ...MENU_GROUPS.flatMap((g) => [
      `            <li class="cat-links__group">${esc(g.label)}</li>`,
      catLink(IDX.cat[g.all], IDX.cat[g.all].short || IDX.cat[g.all].name),
      ...groupCats(g.group).map((c) => catLink(c, catShort(c))),
    ]),
  ].join("\n");

  let mfrFilterBlock = "";
  if (showMfr) {
    const counts = {};
    products.forEach((p) => { counts[p.mfr] = (counts[p.mfr] || 0) + 1; });
    const list = DATA.manufacturers.filter((m) => !m.hidden && counts[m.id]);
    if (list.length > 1) {
      mfrFilterBlock = `        <div class="filter-block">
          <h2 class="filter-block__title">Manufacturer</h2>
          <div class="mfr-list">
${list.map((m) => `            <label class="check"><input type="checkbox" value="${m.id}" data-mfr-filter> ${esc(m.name)} <span class="check__count">${counts[m.id]}</span></label>`).join("\n")}
          </div>
        </div>`;
    }
  }

  const azSorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const azList = azSorted.map((p) => `          <li><a href="${root}medicines/${p.id}.html">${esc(p.name)}</a></li>`).join("\n");

  const ldList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    url: SITE + outPath,
    isPartOf: { "@id": SITE + "#website" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: azSorted.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}medicines/${p.id}.html`, name: p.name })),
    },
  };

  page({
    path: outPath,
    title,
    description: intro.length > 158 ? intro.slice(0, 155).replace(/\s+\S*$/, "") + "…" : intro,
    bodyClass: "page-shop",
    scripts: ["js/shop.js"],
    current,
    content: LISTING,
    jsonLd: ldScript(ldList) + "\n" + ldScript(bc.ld),
    priority: outPath === "shop.html" ? "0.9" : "0.7",
    vars: {
      breadcrumbs: bc.html,
      listingTitle: esc(h1),
      listingUrdu: urdu ? `<p class="page-head__urdu urdu" lang="ur" dir="rtl">${esc(urdu)}</p>` : "",
      listingIntro: esc(intro),
      listingNote: note ? `<p class="page-head__note">${note}</p>` : "",
      listingShort: esc(short),
      listingBrandStrip: brandStripCompact ? brandStrip(root, { compact: true }) : "",
      presetCat,
      presetMfr,
      categoryLinks,
      mfrFilterBlock,
      initialCount: `Showing ${Math.min(PAGE_SIZE, products.length)} of ${products.length} products`,
      initialGrid: cards(sorted.slice(0, PAGE_SIZE), root),
      moreHidden: products.length > PAGE_SIZE ? "" : " hidden",
      azTitle: `${esc(h1)} A–Z`,
      azList,
    },
  });
}

function topBrands(products, n) {
  const names = [];
  for (const p of products) {
    const b = p.brand.split(" ")[0];
    if (!names.includes(b)) names.push(b);
    if (names.length >= n) break;
  }
  return names;
}

listing({
  outPath: "shop.html",
  products: DATA.products,
  title: "Buy Medicines Online in Rohillanwali | Adil Pharmacy Shop",
  h1: "All medicines & health products",
  intro: `Browse ${DATA.products.length} medicines and health products from ${brandsShown.length} trusted manufacturers. Add to cart and order on WhatsApp for pickup in Rohillanwali or home delivery.`,
  short: "all medicines",
  crumbs: [{ name: "Home", href: "index.html" }, { name: "Shop", href: "shop.html" }],
  brandStripCompact: true,
  current: "shop.html",
});

const categoryLabel = (c) =>
  /medicines|devices|care|supplies|nutrition|remedies|antibiotics|hygiene|wipes|treatments|formula|supplements/i.test(c.name) ? c.name : `${c.name} Medicines`;

// Kids' page for an adult medicine category, and the reverse.
const kidsCounterpart = (c) => DATA.categories.find((k) => k.group === "kids" && k.base && k.base.includes(c.id));
function categoryNote(c, root) {
  const link = (k, text) => `${esc(text)} <a href="${root}categories/${k.id}.html">${esc(k.name)}</a>`;
  if (c.group === "adult" && !c.virtual) {
    const k = kidsCounterpart(c);
    return k && catCount(k.id) ? link(k, "Medicines for children are on") : "";
  }
  if (c.group === "kids" && c.base) {
    const adults = c.base.map((id) => IDX.cat[id]).filter((a) => catCount(a.id));
    return adults.length ? "Medicines for adults: " + adults.map((a) => `<a href="${root}categories/${a.id}.html">${esc(a.name)}</a>`).join(", ") : "";
  }
  if (c.id === "kids") return `Looking for diapers, baby bath or feeding products? See <a href="${root}categories/baby-kids.html">Baby &amp; Kids Care</a>.`;
  if (c.id === "baby-kids") return `Looking for children's medicines? See <a href="${root}categories/kids.html">Kids' Medicines</a>.`;
  return "";
}
function categoryCrumbs(c) {
  const g = groupOf(c);
  if (!g || g.all === c.id) return [{ name: "Home", href: "index.html" }, { name: "Shop", href: "shop.html" }, { name: c.name, href: catHref(c) }];
  return [{ name: "Home", href: "index.html" }, { name: g.label, href: catHref(IDX.cat[g.all]) }, { name: catShort(c), href: catHref(c) }];
}

for (const c of DATA.categories) {
  const products = DATA.products.filter((p) => C.inCategory(p, c.id));
  if (!products.length) continue;
  const label = categoryLabel(c);
  const featuredFirst = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const brands = topBrands(featuredFirst, 4);
  const makers = [...new Set(featuredFirst.map((p) => IDX.mfr[p.mfr]).filter((m) => !m.hidden).map((m) => m.name))].slice(0, 3);
  listing({
    outPath: `categories/${c.id}.html`,
    products,
    title: `${label} in Rohillanwali | Adil Pharmacy`,
    h1: label,
    urdu: c.urdu,
    intro: `Shop ${label.replace(/^Kids'/, "kids'").replace(/^(?!Kids)\S/, (ch) => ch.toLowerCase())} at Adil Pharmacy, Rohillanwali: ${brands.join(", ")} and more${makers.length ? ` from ${makers.join(", ")}` : ""}. Order online for pickup or ask about home delivery.`,
    note: categoryNote(c, "../"),
    short: c.name.toLowerCase(),
    crumbs: categoryCrumbs(c),
    presetCat: c.id,
    activeCat: c.id,
    current: `categories/${c.id}.html`,
  });
}

for (const m of brandsShown) {
  const products = DATA.products.filter((p) => p.mfr === m.id);
  listing({
    outPath: `brands/${m.id}.html`,
    products,
    title: `${m.name} Products in Rohillanwali | Adil Pharmacy`,
    h1: `${m.name} products`,
    intro: `${products.length} ${products.length === 1 ? "product" : "products"} by ${m.full} available at Adil Child Care Clinic & Pharmacy, Rohillanwali, including ${topBrands(products, 4).join(", ")}. Order online and confirm on WhatsApp.`,
    short: `${m.name} products`,
    crumbs: [{ name: "Home", href: "index.html" }, { name: "Brands", href: "index.html#brands" }, { name: m.name, href: `brands/${m.id}.html` }],
    presetMfr: m.id,
    showMfr: false,
  });
}

/* ---------- Product pages ---------- */
const PRODUCT = read("src/templates/product.html");
for (const p of DATA.products) {
  const root = "../";
  const cat = C.homeCategory(p);
  const mfr = IDX.mfr[p.mfr];
  const bc = breadcrumbs(root, [...categoryCrumbs(cat), { name: p.name, href: `medicines/${p.id}.html` }]);

  const spec = [
    ["Active ingredient", p.generic],
    p.strength ? ["Strength / variant", p.strength] : null,
    ["Form", C.FORM_NAME[p.form] || p.form],
    ["Sold as", `Per ${p.unit.toLowerCase()}${p.pack ? ` (${p.pack})` : ""}`],
    ["Manufacturer", mfr.hidden ? "Various (available brands may vary)" : mfr.full],
    ["Category", cat.name],
    ["Prescription", p.rx ? "Required" : "Not required"],
    p.kids ? ["Suitable for children", "Yes – ask us about the right dose"] : null,
  ].filter(Boolean).map(([k, v]) => `              <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("\n");

  const aboutParas = [
    `${p.name}: ${p.generic}${p.strength && /\d/.test(p.strength) ? ` (${p.strength})` : ""}${mfr.hidden ? "" : `, made by ${mfr.full}`}. ${p.use}`,
    p.rx
      ? "This is a prescription medicine. Use it only as prescribed by your doctor. We will ask for a valid prescription before supplying it — you can send a photo on WhatsApp."
      : "Read the leaflet and follow the dose on the pack, or ask our pharmacist if you are unsure.",
    p.kids ? "A child's dose depends on age and weight. Please ask our doctor or pharmacist before giving it to your child." : "",
  ].filter(Boolean).map((t) => `          <p>${esc(t)}</p>`).join("\n");

  const related = DATA.products.filter((x) => x.id !== p.id && (x.cat === p.cat || C.inCategory(x, cat.id)) && C.kidsOnly(x) === C.kidsOnly(p));
  related.sort((a, b) => (b.brand === p.brand ? 1 : 0) - (a.brand === p.brand ? 1 : 0) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const askText = `Assalam-o-Alaikum! Is ${p.name} available? (from your website)`;
  const askUrl = C.waUrl(config.whatsapp, askText);

  const drug = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: p.name,
    url: `${SITE}medicines/${p.id}.html`,
    description: p.use,
    ...(IMAGES[p.id] ? { image: SITE + IMAGES[p.id] } : p.image ? { image: p.image } : {}),
    activeIngredient: p.generic,
    ...(p.strength && /\d/.test(p.strength) ? { strengthValue: p.strength } : {}),
    dosageForm: C.FORM_NAME[p.form] || p.form,
    prescriptionStatus: p.rx ? "https://schema.org/PrescriptionOnly" : "https://schema.org/OTC",
    ...(mfr.hidden ? {} : { manufacturer: { "@type": "Organization", name: mfr.full } }),
    ...(p.price != null ? {
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        seller: { "@id": SITE + "#business" },
      },
    } : {}),
  };

  const title = `${p.name} – ${p.generic}`;
  page({
    path: `medicines/${p.id}.html`,
    title: (title.length > 52 ? p.name : title) + " | Adil Pharmacy Rohillanwali",
    description: `${p.name} (${p.generic})${mfr.hidden ? "" : ` by ${mfr.name}`}. ${p.use} Order online at Adil Child Care Clinic & Pharmacy, Rohillanwali.`.slice(0, 300),
    bodyClass: "page-product",
    ogType: "product",
    ogImage: IMAGES[p.id] || p.image || "",
    content: PRODUCT,
    jsonLd: ldScript(drug) + "\n" + ldScript(bc.ld),
    priority: "0.6",
    vars: {
      breadcrumbs: bc.html,
      art: C.media(p, { root }),
      badges: C.badgesHtml(p),
      catUrl: `${root}categories/${cat.id}.html`,
      catName: esc(cat.name),
      name: esc(p.name),
      brand: esc(p.brand),
      id: esc(p.id),
      generic: esc(p.generic),
      mfrLine: mfr.hidden ? "" : `<p class="product__mfr">by <a href="${root}brands/${mfr.id}.html">${esc(mfr.full)}</a></p>`,
      priceHtml: C.priceHtml(p, config.currency) + (p.price == null
        ? '<span class="price__hint">We confirm the price on WhatsApp before you pay.</span>'
        : '<span class="price__hint">Retail price (MRP) printed on the pack. We confirm availability on WhatsApp before you pay.</span>'),
      rxNotice: p.rx
        ? '<p class="note note--rx"><svg class="icon" aria-hidden="true"><use href="#i-file"/></svg> Prescription required. You can add it to your cart and send the prescription photo on WhatsApp.</p>'
        : "",
      use: esc(p.use),
      askUrl: esc(askUrl),
      specRows: spec,
      about: aboutParas,
      related: cards(related.slice(0, 4), root),
    },
  });
}

/* ---------- Cart & checkout ---------- */
for (const file of ["cart", "checkout"]) {
  const { meta, content } = parsePage(`src/pages/${file}.html`);
  page({
    path: meta.path,
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    bodyClass: meta.bodyClass,
    scripts: meta.scripts,
    content,
    sitemap: false,
    vars: {
      paymentOptions: (config.paymentMethods || ["Cash"]).map((m, i) =>
        `              <label class="radio"><input type="radio" name="payment" value="${esc(m)}"${i === 0 ? " checked" : ""}> ${esc(m)}</label>`).join("\n"),
    },
  });
}

/* ---------- Runtime config, sitemap, robots ---------- */
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${builtPages.map((p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>
`);

write("robots.txt", `User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`);

console.log(`Built ${builtPages.length + 2} pages: ${DATA.products.length} products, ` +
  `${DATA.categories.length} categories, ${brandsShown.length} brands, ${Object.keys(IMAGES).length} product photos.`);
