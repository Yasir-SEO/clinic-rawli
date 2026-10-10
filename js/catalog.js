/*
  Shared catalogue helpers, used both in the browser and by scripts/build.mjs:
  product pictures (SVG pack art), product cards, search and formatting.
*/
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Catalog = api;
})(this, function () {
  "use strict";

  var COLORS = {
    "fever-pain": ["#e2574c", "#fdecea", "#a3352c"],
    "cough-cold": ["#0e8fc7", "#e4f4fb", "#0a6690"],
    "allergy-asthma": ["#7c4dce", "#f0eafb", "#5631a0"],
    "stomach": ["#e08a12", "#fdf3e2", "#a86108"],
    "antibiotics": ["#0f766e", "#e3f6f3", "#0b524c"],
    "kids": ["#f59e0b", "#fef3c7", "#b45309"],
    "vitamins": ["#ea6c1a", "#fdeee3", "#b14c0c"],
    "diabetes": ["#2563eb", "#e7effd", "#1a46ad"],
    "heart-bp": ["#d1344b", "#fbe8eb", "#9c2134"],
    "skin": ["#c2418a", "#fae9f2", "#8f2b64"],
    "eye-ear-nose": ["#0891b2", "#e2f5f9", "#066b84"],
    "baby": ["#e0568f", "#fdeaf2", "#a63766"],
    "herbal": ["#4d8a1f", "#edf6e5", "#355f13"],
    "first-aid": ["#16a34a", "#e6f6ec", "#0f7535"],
    "devices": ["#475569", "#edf0f4", "#2f3a48"],
    "diapers": ["#6d5bd0", "#efecfb", "#4a3aa6"],
    "oral-care": ["#0d9bd8", "#e3f4fc", "#09709c"],
    "personal-care": ["#7c8b2e", "#f1f4e2", "#58631f"]
  };
  var DEFAULT_COLOR = ["#0f766e", "#e3f6f3", "#0b524c"];

  var FORM_BAND = {
    tablet: "TABLETS", capsule: "CAPSULES", lozenge: "LOZENGES", nebule: "NEBULES",
    effervescent: "EFFERVESCENT", vial: "ORAL VIALS", syrup: "SYRUP", suspension: "SUSPENSION",
    drops: "DROPS", spray: "SPRAY", cream: "CREAM", ointment: "OINTMENT", gel: "GEL",
    inhaler: "INHALER", sachet: "SACHET"
  };

  var FORM_NAME = {
    tablet: "Tablets", capsule: "Capsules", lozenge: "Lozenges", nebule: "Nebules",
    effervescent: "Effervescent tablets", vial: "Oral suspension vials", syrup: "Syrup",
    suspension: "Suspension", drops: "Drops", spray: "Spray", cream: "Cream", ointment: "Ointment",
    gel: "Gel", inhaler: "Inhaler", sachet: "Sachet", tin: "Powder (tin)", pack: "Pack",
    jar: "Jar", bottle: "Bottle", device: "Device", supply: "Medical supply",
    toothpaste: "Toothpaste", toothbrush: "Toothbrush", mouthwash: "Mouthwash", soap: "Soap bar",
    shampoo: "Shampoo", lotion: "Lotion", handwash: "Handwash", sanitizer: "Hand sanitizer",
    powder: "Powder", diaper: "Diapers", wipes: "Wet wipes", pads: "Sanitary pads", razor: "Razors"
  };

  var SHAPE = {
    tablet: "box", capsule: "box", lozenge: "box", nebule: "box", vial: "box", supply: "box",
    effervescent: "box", syrup: "bottle", suspension: "bottle", bottle: "bottle",
    drops: "dropper", spray: "dropper", cream: "tube", ointment: "tube", gel: "tube",
    tin: "tin", jar: "jar", pack: "pack", sachet: "sachet", inhaler: "inhaler", device: "device",
    toothpaste: "tube", toothbrush: "pack", mouthwash: "bottle", soap: "box", shampoo: "bottle",
    lotion: "bottle", handwash: "bottle", sanitizer: "bottle", powder: "bottle", diaper: "pack",
    wipes: "pack", pads: "pack", razor: "pack"
  };

  /* Categories that are not medicines (kept out of "Kids' Medicines"). */
  var NON_MEDICINE = { baby: true, diapers: true, "oral-care": true, "personal-care": true };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function colorFor(catId) { return COLORS[catId] || DEFAULT_COLOR; }

  function text(str, x, y, maxW, base, fill, weight) {
    var len = Math.max(String(str).length, 1);
    var fs = Math.min(base, maxW / (len * 0.62));
    var fit = "";
    if (fs < 10) { fs = 10; fit = ' textLength="' + maxW + '" lengthAdjust="spacingAndGlyphs"'; }
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Poppins,system-ui,sans-serif" font-weight="' +
      (weight || 700) + '" font-size="' + fs.toFixed(1) + '" fill="' + fill + '"' + fit + ">" + esc(str) + "</text>";
  }

  function sachetPath(x1, x2, top, bottom) {
    var d = "M" + x1 + " " + top, up = true, x;
    for (x = x1 + 10; x <= x2; x += 10) { d += " L" + x + " " + (up ? top - 6 : top); up = !up; }
    d += " L" + x2 + " " + bottom;
    up = true;
    for (x = x2 - 10; x >= x1; x -= 10) { d += " L" + x + " " + (up ? bottom + 6 : bottom); up = !up; }
    return d + " Z";
  }

  /* Draws a simple illustrated pack for a product. Returns an <svg> string. */
  function packArt(p, opts) {
    opts = opts || {};
    var c = colorFor(p.cat);
    var main = c[0], soft = c[1], dark = c[2];
    var brand = p.brand || p.name;
    var sub = p.strength || FORM_NAME[p.form] || "";
    var band = FORM_BAND[p.form] || "";
    var shape = SHAPE[p.form] || "box";
    var s = "";

    if (shape === "box") {
      s += '<path d="M52 74 72 56h132l-20 18z" fill="' + main + '" fill-opacity=".35"/>';
      s += '<path d="M184 74l20-18v104l-20 18z" fill="' + dark + '" fill-opacity=".85"/>';
      s += '<rect x="52" y="74" width="132" height="104" fill="#fff"/>';
      s += '<rect x="52" y="74" width="132" height="24" fill="' + main + '"/>';
      if (band) s += text(band, 118, 90, 110, 10, "#fff", 600);
      s += text(brand, 118, 132, 116, 20, dark);
      s += text(sub, 118, 154, 116, 12, "#4a6461", 500);
    } else if (shape === "bottle") {
      s += '<rect x="98" y="34" width="44" height="20" rx="4" fill="' + dark + '"/>';
      s += '<rect x="104" y="52" width="32" height="12" fill="' + main + '" fill-opacity=".55"/>';
      s += '<rect x="74" y="62" width="92" height="122" rx="20" fill="' + main + '"/>';
      s += '<rect x="80" y="94" width="80" height="66" rx="6" fill="#fff"/>';
      if (band) s += text(band, 120, 108, 70, 8, main, 600);
      s += text(brand, 120, 130, 72, 16, dark);
      s += text(sub, 120, 148, 72, 10, "#4a6461", 500);
    } else if (shape === "dropper") {
      s += '<path d="M112 30h16l-4 30h-8z" fill="#fff" stroke="' + dark + '" stroke-width="2"/>';
      s += '<rect x="102" y="56" width="36" height="18" rx="3" fill="' + dark + '"/>';
      s += '<rect x="86" y="72" width="68" height="112" rx="14" fill="' + main + '"/>';
      s += '<rect x="91" y="98" width="58" height="62" rx="5" fill="#fff"/>';
      if (band) s += text(band, 120, 112, 50, 8, main, 600);
      s += text(brand, 120, 132, 52, 14, dark);
      s += text(sub, 120, 149, 52, 9, "#4a6461", 500);
    } else if (shape === "tube") {
      s += '<rect x="30" y="86" width="14" height="58" rx="2" fill="' + dark + '"/>';
      s += '<path d="M44 80h124l14 16v38l-14 16H44z" fill="#fff" stroke="' + main + '" stroke-width="3"/>';
      s += '<path d="M44 80h22v70H44z" fill="' + main + '"/>';
      s += '<rect x="182" y="100" width="28" height="30" rx="4" fill="' + dark + '"/>';
      s += text(brand, 122, 116, 96, 18, dark);
      s += text(sub || band, 122, 135, 96, 11, "#4a6461", 500);
    } else if (shape === "tin") {
      s += '<rect x="66" y="58" width="108" height="122" fill="' + main + '"/>';
      s += '<ellipse cx="120" cy="180" rx="54" ry="12" fill="' + main + '"/>';
      s += '<ellipse cx="120" cy="58" rx="54" ry="12" fill="' + dark + '"/>';
      s += '<rect x="74" y="88" width="92" height="62" rx="6" fill="#fff"/>';
      s += text(brand, 120, 117, 84, 16, dark);
      s += text(sub, 120, 137, 84, 10, "#4a6461", 500);
    } else if (shape === "jar") {
      s += '<rect x="62" y="72" width="116" height="26" rx="6" fill="' + dark + '"/>';
      s += '<rect x="58" y="96" width="124" height="80" rx="14" fill="' + main + '"/>';
      s += '<rect x="58" y="112" width="124" height="46" fill="#fff"/>';
      s += text(brand, 120, 135, 112, 17, dark);
      s += text(sub, 120, 151, 112, 10, "#4a6461", 500);
    } else if (shape === "pack") {
      s += '<path d="M62 50q58-10 116 0l8 126q-66 10-132 0z" fill="' + main + '"/>';
      s += '<path d="M62 50q58-10 116 0l1 12q-59-10-118 0z" fill="' + dark + '"/>';
      s += '<rect x="72" y="92" width="96" height="58" rx="8" fill="#fff"/>';
      s += text(brand, 120, 119, 88, 16, dark);
      s += text(sub, 120, 138, 88, 10, "#4a6461", 500);
    } else if (shape === "sachet") {
      s += '<path d="' + sachetPath(70, 170, 46, 176) + '" fill="' + main + '"/>';
      s += '<rect x="80" y="88" width="80" height="58" rx="6" fill="#fff"/>';
      if (band) s += text(band, 120, 76, 80, 9, "#fff", 600);
      s += text(brand, 120, 116, 72, 16, dark);
      s += text(sub, 120, 135, 72, 10, "#4a6461", 500);
    } else if (shape === "inhaler") {
      s += '<rect x="106" y="22" width="32" height="22" rx="6" fill="#cbd5e1"/>';
      s += '<rect x="96" y="38" width="52" height="96" rx="12" fill="' + main + '"/>';
      s += '<rect x="70" y="112" width="60" height="30" rx="8" fill="' + dark + '"/>';
      s += '<rect x="36" y="152" width="168" height="36" rx="8" fill="#fff"/>';
      s += text(brand + (sub ? " · " + sub : ""), 120, 176, 152, 15, dark);
    } else {
      s += '<rect x="66" y="26" width="108" height="114" rx="16" fill="#fff" stroke="' + main + '" stroke-width="4"/>';
      s += '<rect x="80" y="40" width="80" height="46" rx="6" fill="' + dark + '"/>';
      s += '<path d="M86 64h14l6-12 8 22 6-10h34" fill="none" stroke="#7ee0c8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<circle cx="120" cy="112" r="11" fill="' + main + '"/>';
      s += '<rect x="36" y="152" width="168" height="36" rx="8" fill="#fff"/>';
      s += text(brand + (sub ? " · " + sub : ""), 120, 176, 152, 15, dark);
    }

    var label = opts.decorative ? ' aria-hidden="true" focusable="false"' : ' role="img" aria-label="' + esc(p.name) + '"';
    return '<svg class="pack-art" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg"' + label + ">" +
      '<rect width="240" height="200" fill="' + soft + '"/>' +
      '<circle cx="204" cy="34" r="48" fill="#fff" fill-opacity=".55"/>' +
      '<circle cx="24" cy="186" r="34" fill="#fff" fill-opacity=".4"/>' + s + "</svg>";
  }

  /* Real product photos (assets/products/<id>.jpg|png|webp), found by the build. */
  var IMAGES = {};
  function setImages(map) { IMAGES = map || {}; }
  function imageFor(p) {
    var runtime = typeof window !== "undefined" && window.PRODUCT_IMAGES;
    return (runtime && runtime[p.id]) || IMAGES[p.id] || p.image || null;
  }

  function isRemote(src) { return /^https?:\/\//i.test(src); }

  /* Product photo if one exists, otherwise the drawn pack. A linked (remote) photo
     sits on top of the drawn pack and removes itself if it fails to load. */
  function media(p, opts) {
    opts = opts || {};
    var src = imageFor(p);
    if (!src) return packArt(p, opts);
    var alt = opts.decorative ? "" : esc(p.name);
    if (isRemote(src)) {
      return '<span class="media-wrap">' + packArt(p, { decorative: true }) +
        '<img class="pack-photo pack-photo--remote" src="' + esc(src) + '" alt="' + alt +
        '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"></span>';
    }
    return '<img class="pack-photo" src="' + esc((opts.root || "") + src) + '" alt="' + alt +
      '" loading="lazy" decoding="async">';
  }

  function indexData(data) {
    if (data.__idx) return data.__idx;
    var cat = {}, mfr = {}, prod = {};
    data.categories.forEach(function (c) { cat[c.id] = c; });
    data.manufacturers.forEach(function (m) { mfr[m.id] = m; });
    data.products.forEach(function (p) { prod[p.id] = p; });
    var idx = { cat: cat, mfr: mfr, prod: prod };
    try { Object.defineProperty(data, "__idx", { value: idx, enumerable: false }); } catch (e) { /* frozen */ }
    return idx;
  }

  function inCategory(p, catId) {
    if (!catId) return true;
    if (catId === "kids") return p.kids && !NON_MEDICINE[p.cat];
    return p.cat === catId;
  }

  function formatPrice(n, currency) {
    var whole = Math.round(Number(n));
    return (currency || "Rs") + " " + String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function priceHtml(p, currency) {
    if (p.price == null) return '<span class="price price--ask">Price on request</span>';
    return '<span class="price">' + esc(formatPrice(p.price, currency)) + '</span><span class="price__unit">/ ' + esc(p.unit) + "</span>";
  }

  function productUrl(p, root) { return (root || "") + "medicines/" + p.id + ".html"; }
  function categoryUrl(id, root) { return (root || "") + "categories/" + id + ".html"; }
  function brandUrl(id, root) { return (root || "") + "brands/" + id + ".html"; }

  function badgesHtml(p) {
    var b = "";
    if (p.rx) b += '<span class="badge badge--rx" title="Prescription required">Rx</span>';
    if (p.kids) b += '<span class="badge badge--kids">Kids</span>';
    return b;
  }

  function actionsHtml(p, qty) {
    if (qty > 0) {
      return '<div class="stepper" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
        '<button type="button" class="stepper__btn" data-dec="' + esc(p.id) + '" aria-label="Remove one">&minus;</button>' +
        '<span class="stepper__qty" aria-live="polite">' + qty + "</span>" +
        '<button type="button" class="stepper__btn" data-inc="' + esc(p.id) + '" aria-label="Add one">+</button></div>';
    }
    return '<button type="button" class="btn-add" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to cart">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-cart"/></svg>Add</button>';
  }

  function renderCard(p, data, opts) {
    opts = opts || {};
    var idx = indexData(data);
    var root = opts.root || "";
    var url = productUrl(p, root);
    var cat = idx.cat[p.cat];
    var mfr = idx.mfr[p.mfr];
    return '<article class="pcard">' +
      '<a class="pcard__media" href="' + url + '" tabindex="-1" aria-hidden="true">' + media(p, { decorative: true, root: root }) +
      '<span class="pcard__badges">' + badgesHtml(p) + "</span></a>" +
      '<div class="pcard__body">' +
      (cat ? '<a class="pcard__cat" href="' + categoryUrl(cat.id, root) + '">' + esc(cat.name) + "</a>" : "") +
      '<h3 class="pcard__title"><a href="' + url + '">' + esc(p.name) + "</a></h3>" +
      '<p class="pcard__generic">' + esc(p.generic) + "</p>" +
      (mfr && !mfr.hidden ? '<p class="pcard__mfr">' + esc(mfr.name) + "</p>" : "") +
      '<div class="pcard__foot"><div class="pcard__price">' + priceHtml(p, opts.currency) + "</div>" +
      '<div class="pcard__actions" data-actions-for="' + esc(p.id) + '">' + actionsHtml(p, opts.qty || 0) + "</div></div>" +
      "</div></article>";
  }

  function normalize(s) {
    return String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9+./% ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  /* Returns products matching every word of the query, best matches first. */
  function search(products, q, data) {
    var terms = normalize(q).split(" ").filter(Boolean);
    if (!terms.length) return products.slice();
    var idx = indexData(data);
    var scored = [];
    products.forEach(function (p, i) {
      var name = normalize(p.name), brand = normalize(p.brand), gen = normalize(p.generic);
      var m = idx.mfr[p.mfr] || {}, c = idx.cat[p.cat] || {};
      var hay = [name, gen, normalize(m.name), normalize(m.full), normalize(c.name)].join(" ");
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        if (hay.indexOf(term) === -1) return;
        if (brand.indexOf(term) === 0 || name.indexOf(term) === 0) score += 10;
        else if (name.indexOf(term) !== -1) score += 5;
        else if (gen.indexOf(term) !== -1) score += 3;
        else score += 1;
      }
      scored.push({ p: p, s: score - i / 10000 });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.map(function (x) { return x.p; });
  }

  function waUrl(number, message) {
    var digits = String(number || "").replace(/\D/g, "");
    var valid = /^\d{10,15}$/.test(digits);
    return "https://wa.me/" + (valid ? digits : "") + "?text=" + encodeURIComponent(message);
  }

  return {
    esc: esc, packArt: packArt, media: media, isRemote: isRemote, setImages: setImages, imageFor: imageFor, colorFor: colorFor, indexData: indexData, inCategory: inCategory,
    formatPrice: formatPrice, priceHtml: priceHtml, productUrl: productUrl, categoryUrl: categoryUrl,
    brandUrl: brandUrl, badgesHtml: badgesHtml, actionsHtml: actionsHtml, renderCard: renderCard,
    search: search, normalize: normalize, waUrl: waUrl, FORM_NAME: FORM_NAME
  };
});
