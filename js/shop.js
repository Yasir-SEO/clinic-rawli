/* Shop / category / brand listing: filters, search, sorting and "load more". */
(function () {
  "use strict";

  var app = document.getElementById("shop-app");
  var DATA = window.STORE_DATA;
  var C = window.Catalog;
  var SITE = window.SITE || {};
  if (!app || !DATA || !C) return;

  var ROOT = document.body.getAttribute("data-root") || "";
  var IDX = C.indexData(DATA);
  var PAGE = 24;
  var esc = C.esc;

  var grid = document.getElementById("shop-grid");
  var countEl = document.getElementById("shop-count");
  var moreBtn = document.getElementById("shop-more");
  var emptyEl = document.getElementById("shop-empty");
  var chipsEl = document.getElementById("shop-chips");
  var qInput = document.getElementById("shop-q");
  var sortSel = document.getElementById("shop-sort");
  var kidsBox = document.getElementById("f-kids");
  var otcBox = document.getElementById("f-otc");
  var filterToggle = document.getElementById("shop-filter-toggle");

  var params = new URLSearchParams(window.location.search);
  var presetCat = app.getAttribute("data-cat") || "";
  var presetMfr = app.getAttribute("data-mfr") || "";

  var state = {
    cat: presetCat || params.get("cat") || "",
    mfr: (params.get("mfr") || "").split(",").filter(Boolean),
    q: params.get("q") || "",
    kids: params.get("kids") === "1",
    otc: params.get("otc") === "1",
    sort: params.get("sort") || "popular",
    shown: PAGE
  };
  if (presetMfr && state.mfr.indexOf(presetMfr) === -1) state.mfr.push(presetMfr);

  var hasPrices = DATA.products.some(function (p) { return p.price != null; });
  if (!hasPrices && sortSel) {
    Array.prototype.slice.call(sortSel.options).forEach(function (o) {
      if (o.value.indexOf("price") === 0) o.remove();
    });
  }

  // Reflect state in controls
  if (qInput) qInput.value = state.q;
  if (sortSel) sortSel.value = state.sort;
  if (kidsBox) kidsBox.checked = state.kids;
  if (otcBox) otcBox.checked = state.otc;
  document.querySelectorAll("[data-mfr-filter]").forEach(function (box) {
    box.checked = state.mfr.indexOf(box.value) !== -1;
  });

  function filtered() {
    var list = DATA.products.filter(function (p) {
      if (!C.inCategory(p, state.cat)) return false;
      if (state.mfr.length && state.mfr.indexOf(p.mfr) === -1) return false;
      if (state.kids && !p.kids) return false;
      if (state.otc && p.rx) return false;
      return true;
    });
    if (state.q) list = C.search(list, state.q, DATA);

    var byName = function (a, b) { return a.name.localeCompare(b.name); };
    switch (state.sort) {
      case "az": list.sort(byName); break;
      case "za": list.sort(function (a, b) { return b.name.localeCompare(a.name); }); break;
      case "mfr": list.sort(function (a, b) {
        return (IDX.mfr[a.mfr].name).localeCompare(IDX.mfr[b.mfr].name) || byName(a, b);
      }); break;
      case "price-asc": list.sort(function (a, b) { return (a.price == null ? 1e12 : a.price) - (b.price == null ? 1e12 : b.price); }); break;
      case "price-desc": list.sort(function (a, b) { return (b.price == null ? -1 : b.price) - (a.price == null ? -1 : a.price); }); break;
      default:
        if (!state.q) list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    }
    return list;
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cat && state.cat !== presetCat) p.set("cat", state.cat);
    var mfr = state.mfr.filter(function (m) { return m !== presetMfr; });
    if (mfr.length) p.set("mfr", mfr.join(","));
    if (state.kids) p.set("kids", "1");
    if (state.otc) p.set("otc", "1");
    if (state.sort !== "popular") p.set("sort", state.sort);
    var qs = p.toString();
    try { history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "")); } catch (e) { /* file:// */ }
  }

  function chip(label, key, value) {
    return '<button type="button" class="chip" data-clear="' + key + '"' + (value ? ' data-value="' + esc(value) + '"' : "") +
      ' aria-label="Remove filter: ' + esc(label) + '">' + esc(label) + ' <span aria-hidden="true">×</span></button>';
  }

  function renderChips() {
    if (!chipsEl) return;
    var html = "";
    if (state.q) html += chip("“" + state.q + "”", "q");
    if (state.cat && state.cat !== presetCat && IDX.cat[state.cat]) html += chip(IDX.cat[state.cat].name, "cat");
    state.mfr.forEach(function (m) {
      if (m !== presetMfr && IDX.mfr[m]) html += chip(IDX.mfr[m].name, "mfr", m);
    });
    if (state.kids) html += chip("Kids", "kids");
    if (state.otc) html += chip("No prescription needed", "otc");
    if (html) html += '<button type="button" class="chip chip--clear" data-clear="all">Clear all</button>';
    chipsEl.innerHTML = html;
    chipsEl.hidden = !html;
  }

  function render() {
    var list = filtered();
    var shown = list.slice(0, state.shown);
    grid.innerHTML = shown.map(function (p) {
      return C.renderCard(p, DATA, { root: ROOT, currency: SITE.currency, qty: window.Cart ? window.Cart.qty(p.id) : 0 });
    }).join("");
    grid.querySelectorAll("[data-actions-for]").forEach(function (el) {
      el.setAttribute("data-qty", String(window.Cart ? window.Cart.qty(el.getAttribute("data-actions-for")) : 0));
    });

    if (countEl) {
      countEl.textContent = list.length
        ? "Showing " + shown.length + " of " + list.length + (list.length === 1 ? " product" : " products")
        : "No products found";
    }
    if (moreBtn) moreBtn.hidden = shown.length >= list.length;
    if (emptyEl) {
      emptyEl.hidden = list.length > 0;
      var reqInput = emptyEl.querySelector("input[name='request']");
      if (reqInput && state.q && !reqInput.value) reqInput.value = state.q;
    }
    renderChips();
    syncUrl();
  }

  /* ---------- Events ---------- */
  var qTimer;
  if (qInput) {
    qInput.addEventListener("input", function () {
      clearTimeout(qTimer);
      qTimer = setTimeout(function () { state.q = qInput.value.trim(); state.shown = PAGE; render(); }, 150);
    });
    var qForm = qInput.closest("form");
    if (qForm) qForm.addEventListener("submit", function (e) {
      e.preventDefault(); state.q = qInput.value.trim(); state.shown = PAGE; render();
    });
  }
  if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
  if (kidsBox) kidsBox.addEventListener("change", function () { state.kids = kidsBox.checked; state.shown = PAGE; render(); });
  if (otcBox) otcBox.addEventListener("change", function () { state.otc = otcBox.checked; state.shown = PAGE; render(); });
  document.querySelectorAll("[data-mfr-filter]").forEach(function (box) {
    box.addEventListener("change", function () {
      state.mfr = Array.prototype.slice.call(document.querySelectorAll("[data-mfr-filter]:checked")).map(function (b) { return b.value; });
      state.shown = PAGE;
      render();
    });
  });
  if (moreBtn) moreBtn.addEventListener("click", function () {
    var firstNew = state.shown;
    state.shown += PAGE;
    render();
    var card = grid.children[firstNew];
    var link = card && card.querySelector(".pcard__title a");
    if (link) link.focus();
  });
  if (chipsEl) chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-clear]");
    if (!b) return;
    var key = b.getAttribute("data-clear");
    if (key === "q" || key === "all") { state.q = ""; if (qInput) qInput.value = ""; }
    if (key === "cat" || key === "all") state.cat = presetCat;
    if (key === "kids" || key === "all") { state.kids = false; if (kidsBox) kidsBox.checked = false; }
    if (key === "otc" || key === "all") { state.otc = false; if (otcBox) otcBox.checked = false; }
    if (key === "mfr" || key === "all") {
      var v = b.getAttribute("data-value");
      state.mfr = key === "all" ? (presetMfr ? [presetMfr] : []) : state.mfr.filter(function (m) { return m !== v; });
      document.querySelectorAll("[data-mfr-filter]").forEach(function (box) { box.checked = state.mfr.indexOf(box.value) !== -1; });
    }
    state.shown = PAGE;
    render();
  });
  if (filterToggle) filterToggle.addEventListener("click", function () {
    var open = !app.classList.contains("filters-open");
    app.classList.toggle("filters-open", open);
    filterToggle.setAttribute("aria-expanded", String(open));
  });

  render();
})();
