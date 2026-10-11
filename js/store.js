/* Cart, mini-cart drawer, header search suggestions and add-to-cart buttons. */
(function () {
  "use strict";

  var DATA = window.STORE_DATA;
  var C = window.Catalog;
  var SITE = window.SITE || {};
  if (!DATA || !C) return;

  var ROOT = document.body.getAttribute("data-root") || "";
  var IDX = C.indexData(DATA);
  var KEY = "adil_cart_v1";
  var esc = C.esc;

  /* ---------- Storage ---------- */
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (l) {
        return l && l.id && l.qty > 0 && (l.custom || IDX.prod[l.id]);
      }) : [];
    } catch (e) { return []; }
  }

  function persist() {
    try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
  }

  var items = load();

  function emit() {
    persist();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  function find(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  /* ---------- Public cart API ---------- */
  var Cart = {
    qty: function (id) { var l = find(id); return l ? l.qty : 0; },
    add: function (id, delta) {
      var l = find(id);
      if (l) l.qty += delta;
      else if (delta > 0 && IDX.prod[id]) items.push({ id: id, qty: delta });
      items = items.filter(function (x) { return x.qty > 0; });
      emit();
    },
    set: function (id, qty) {
      var l = find(id);
      if (l) l.qty = Math.max(0, Math.min(99, qty | 0));
      items = items.filter(function (x) { return x.qty > 0; });
      emit();
    },
    remove: function (id) {
      items = items.filter(function (x) { return x.id !== id; });
      emit();
    },
    clear: function () { items = []; emit(); },
    addRequest: function (name, qty) {
      name = String(name || "").trim().slice(0, 120);
      if (!name) return;
      items.push({ id: "req-" + Date.now().toString(36), qty: qty || 1, custom: true, name: name });
      emit();
    },
    count: function () { return items.reduce(function (n, l) { return n + l.qty; }, 0); },
    lines: function () {
      return items.map(function (l) {
        var p = l.custom ? null : IDX.prod[l.id];
        return {
          id: l.id, qty: l.qty, custom: !!l.custom, product: p,
          name: p ? p.name : l.name,
          unit: p ? p.unit + (p.pack ? " · " + p.pack : "") : "Item",
          price: p ? p.price : null,
          rx: p ? p.rx : false
        };
      });
    },
    totals: function () {
      var amount = 0, unpriced = 0;
      Cart.lines().forEach(function (l) {
        if (l.price == null) unpriced += 1;
        else amount += l.price * l.qty;
      });
      return { amount: amount, unpriced: unpriced, hasRx: Cart.lines().some(function (l) { return l.rx; }) };
    }
  };
  window.Cart = Cart;

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) { items = load(); document.dispatchEvent(new CustomEvent("cart:change")); }
  });

  /* ---------- Rendering helpers ---------- */
  function money(n) { return C.formatPrice(n, SITE.currency); }

  function updateBadges() {
    var n = Cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(n);
      el.hidden = n === 0;
    });
    document.querySelectorAll("[data-cart-label]").forEach(function (el) {
      el.textContent = n === 1 ? "1 item" : n + " items";
    });
  }

  function updateActions() {
    document.querySelectorAll("[data-actions-for]").forEach(function (el) {
      var p = IDX.prod[el.getAttribute("data-actions-for")];
      if (!p) return;
      var qty = Cart.qty(p.id);
      if (el.getAttribute("data-qty") === String(qty)) return;
      el.setAttribute("data-qty", String(qty));
      el.innerHTML = C.actionsHtml(p, qty);
    });
  }

  function updateInCart() {
    document.querySelectorAll("[data-incart]").forEach(function (el) {
      var qty = Cart.qty(el.getAttribute("data-incart"));
      el.hidden = qty === 0;
      el.innerHTML = qty ? '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg> ' + qty +
        (qty === 1 ? " is" : " are") + ' in your cart · <button type="button" class="link-btn" data-cart-open>View cart</button>' : "";
    });
  }

  function thumb(line) {
    if (line.product) return C.media(line.product, { decorative: true, root: ROOT });
    return '<span class="thumb-request" aria-hidden="true"><svg class="icon"><use href="#i-file"/></svg></span>';
  }

  function renderMini() {
    var body = document.getElementById("mini-cart");
    var foot = document.getElementById("mini-cart-foot");
    if (!body || !foot) return;
    var lines = Cart.lines();
    if (!lines.length) {
      body.innerHTML = '<div class="mini-empty"><svg class="icon icon--xl" aria-hidden="true"><use href="#i-cart"/></svg>' +
        "<p>Your cart is empty.</p>" +
        '<a class="btn btn--primary" href="' + ROOT + 'shop.html">Browse medicines</a></div>';
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = '<ul class="mini-list" role="list">' + lines.map(function (l) {
      var href = l.product ? C.productUrl(l.product, ROOT) : null;
      return '<li class="mini-item">' +
        '<span class="mini-item__thumb">' + thumb(l) + "</span>" +
        '<div class="mini-item__info">' +
        (href ? '<a href="' + href + '">' + esc(l.name) + "</a>" : "<span>" + esc(l.name) + ' <em class="muted">(requested)</em></span>') +
        '<span class="mini-item__meta">' + (l.price == null ? "Price on request" : money(l.price) + " / " + esc(l.unit)) +
        (l.rx ? ' · <span class="badge badge--rx">Rx</span>' : "") + "</span>" +
        '<div class="mini-item__row"><div class="stepper stepper--sm" role="group" aria-label="Quantity">' +
        '<button type="button" class="stepper__btn" data-dec="' + esc(l.id) + '" aria-label="Remove one">&minus;</button>' +
        '<span class="stepper__qty">' + l.qty + "</span>" +
        '<button type="button" class="stepper__btn" data-inc="' + esc(l.id) + '" aria-label="Add one">+</button></div>' +
        '<button type="button" class="link-remove" data-remove="' + esc(l.id) + '">Remove</button></div>' +
        "</div></li>";
    }).join("") + "</ul>";

    var t = Cart.totals();
    foot.innerHTML =
      '<div class="mini-total"><span>Subtotal</span><strong>' +
      (t.amount ? money(t.amount) : "On request") + "</strong></div>" +
      (t.unpriced ? '<p class="mini-note">Prices for ' + t.unpriced + (t.unpriced === 1 ? " item" : " items") + " will be confirmed on WhatsApp.</p>" : "") +
      (SITE.freeDeliveryOver != null ? '<p class="mini-note mini-note--offer"><svg class="icon" aria-hidden="true"><use href="#i-truck"/></svg> Free home delivery over ' + money(SITE.freeDeliveryOver) +
        (SITE.deliveryRadiusKm != null ? " within " + SITE.deliveryRadiusKm + " km" : "") + "</p>" : "") +
      '<div class="mini-actions"><a class="btn btn--outline" href="' + ROOT + 'cart.html">View cart</a>' +
      '<a class="btn btn--primary" href="' + ROOT + 'checkout.html">Checkout</a></div>';
  }

  /* ---------- Cross-store "cart" button inc/dec (custom items too) ---------- */
  function step(id, delta) {
    if (IDX.prod[id]) { Cart.add(id, delta); return; }
    var l = find(id);
    if (l) Cart.set(id, l.qty + delta);
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(html) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.innerHTML = html;
    el.hidden = false;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () { el.hidden = true; }, 250);
    }, 3200);
  }
  window.showToast = toast;

  /* ---------- Drawer ---------- */
  var drawer = document.getElementById("cart-drawer");
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) { window.location.href = ROOT + "cart.html"; return; }
    lastFocus = document.activeElement;
    renderMini();
    drawer.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    document.body.classList.add("no-scroll");
    var close = drawer.querySelector(".drawer__close");
    if (close) close.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () { drawer.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.openCartDrawer = openDrawer;

  /* ---------- Click handling ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-add],[data-inc],[data-dec],[data-remove],[data-cart-open],[data-cart-close],[data-add-qty],[data-qty-step],[data-request-name]");
    if (!t) return;

    if (t.hasAttribute("data-request-name")) {
      var reqName = t.getAttribute("data-request-name");
      Cart.addRequest(reqName, 1);
      t.textContent = "Added ✓";
      t.disabled = true;
      toast('<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg><span><strong>' + esc(reqName) +
        '</strong> added as a request. We\'ll confirm availability and price on WhatsApp.</span><button type="button" class="toast__link" data-cart-open>View cart</button>');
      return;
    }

    if (t.hasAttribute("data-qty-step")) {
      var box = t.closest(".qty");
      var field = box && box.querySelector("input");
      if (field) field.value = Math.max(1, Math.min(99, (parseInt(field.value, 10) || 1) + parseInt(t.getAttribute("data-qty-step"), 10)));
      return;
    }

    if (t.hasAttribute("data-add")) {
      var id = t.getAttribute("data-add");
      var p = IDX.prod[id];
      Cart.add(id, 1);
      if (p) {
        toast('<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg><span><strong>' + esc(p.name) +
          '</strong> added to cart.</span><button type="button" class="toast__link" data-cart-open>View cart</button>');
      }
      var fresh = document.querySelector('[data-actions-for="' + id + '"] [data-inc]');
      if (fresh && t.closest("[data-actions-for]")) fresh.focus();
    } else if (t.hasAttribute("data-add-qty")) {
      var pid = t.getAttribute("data-add-qty");
      var input = document.getElementById(t.getAttribute("data-qty-input"));
      var qty = Math.max(1, Math.min(99, parseInt(input && input.value, 10) || 1));
      Cart.add(pid, qty);
      var prod = IDX.prod[pid];
      toast('<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg><span><strong>' + qty + " × " + esc(prod ? prod.name : "") +
        '</strong> added to cart.</span><button type="button" class="toast__link" data-cart-open>View cart</button>');
    } else if (t.hasAttribute("data-inc")) {
      step(t.getAttribute("data-inc"), 1);
    } else if (t.hasAttribute("data-dec")) {
      step(t.getAttribute("data-dec"), -1);
    } else if (t.hasAttribute("data-remove")) {
      Cart.remove(t.getAttribute("data-remove"));
    } else if (t.hasAttribute("data-cart-open")) {
      e.preventDefault();
      openDrawer();
    } else if (t.hasAttribute("data-cart-close")) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- "Request a medicine" forms ---------- */
  document.addEventListener("submit", function (e) {
    var form = e.target.closest("[data-request-form]");
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector("input[name='request']");
    var name = input ? input.value.trim() : "";
    if (!name) { if (input) input.focus(); return; }
    Cart.addRequest(name, 1);
    input.value = "";
    toast('<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg><span><strong>' + esc(name) +
      '</strong> added as a request. We\'ll confirm availability on WhatsApp.</span><button type="button" class="toast__link" data-cart-open>View cart</button>');
  });

  /* ---------- Full medicine list for "request any medicine" ---------- */
  var MedIndex = (function () {
    var data = null, norm = null, loading = null;
    function load() {
      if (data) return Promise.resolve(data);
      if (!loading) {
        loading = fetch(ROOT + "data/all-medicines.json")
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) {
            if (d && d.items) {
              data = d;
              norm = d.items.map(function (it) { return C.normalize(it[0] + " " + d.makers[it[1]]); });
            }
            return data;
          })
          .catch(function () { return null; });
      }
      return loading;
    }
    function label(it) {
      var maker = data.makers[it[1]];
      return it[0] + (maker ? " – " + maker : "") + (it[2] ? " (" + it[2] + ")" : "");
    }
    function search(q, limit) {
      if (!data) return [];
      var terms = C.normalize(q).split(" ").filter(Boolean);
      if (!terms.length) return [];
      var hits = [];
      for (var i = 0; i < norm.length; i++) {
        var n = norm[i], ok = true;
        for (var t = 0; t < terms.length; t++) { if (n.indexOf(terms[t]) === -1) { ok = false; break; } }
        if (ok) hits.push({ i: i, s: n.indexOf(terms[0]) === 0 ? 2 : 1 });
      }
      hits.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
      return hits.slice(0, limit || 20).map(function (h) {
        var it = data.items[h.i];
        return { name: it[0], maker: data.makers[it[1]], pack: it[2], label: label(it) };
      });
    }
    function rowHtml(m) {
      return '<div class="req-row"><span class="req-row__text"><strong>' + esc(m.name) + "</strong><small>" +
        esc([m.maker, m.pack].filter(Boolean).join(" · ")) + "</small></span>" +
        '<button type="button" class="req-row__btn" data-request-name="' + esc(m.label) + '">Request</button></div>';
    }
    return { load: load, search: search, rowHtml: rowHtml };
  })();
  window.MedIndex = MedIndex;

  /* ---------- Header search suggestions ---------- */
  (function () {
    var input = document.getElementById("site-search");
    var box = document.getElementById("search-suggest");
    if (!input || !box) return;
    var active = -1;
    var results = [];

    function close() { box.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }

    function render() {
      var q = input.value.trim();
      if (q.length < 2) { close(); return; }
      results = C.search(DATA.products, q, DATA).slice(0, 6);
      if (!results.length) {
        box.innerHTML = '<div class="suggest__empty">No match for “' + esc(q) + '”. <a href="' + ROOT + "shop.html?q=" +
          encodeURIComponent(q) + '">Search all</a> or request it in your cart.</div>';
      } else {
        box.innerHTML = results.map(function (p, i) {
          var m = IDX.mfr[p.mfr];
          return '<a class="suggest__item" role="option" id="sg-' + i + '" href="' + C.productUrl(p, ROOT) + '">' +
            '<span class="suggest__thumb">' + C.media(p, { decorative: true, root: ROOT }) + "</span>" +
            '<span class="suggest__text"><strong>' + esc(p.name) + "</strong><small>" + esc(p.generic) +
            (m && !m.hidden ? " · " + esc(m.name) : "") + "</small></span>" +
            (p.rx ? '<span class="badge badge--rx">Rx</span>' : "") + "</a>";
        }).join("") +
          '<a class="suggest__all" href="' + ROOT + "shop.html?q=" + encodeURIComponent(q) + '">See all results for “' + esc(q) + "”</a>";
      }
      box.hidden = false;
      input.setAttribute("aria-expanded", "true");
      active = -1;

      var shown = {};
      results.forEach(function (p) { shown[C.normalize(p.name)] = true; });
      MedIndex.load().then(function () {
        if (input.value.trim() !== q || box.hidden) return;
        var extra = MedIndex.search(q, 12).filter(function (m) { return !shown[C.normalize(m.name)]; }).slice(0, 5);
        if (!extra.length) return;
        var empty = box.querySelector(".suggest__empty");
        if (empty) empty.remove();
        box.insertAdjacentHTML("beforeend", '<div class="suggest__group">Not in our online shop? Request it and we\'ll arrange it:</div>' +
          extra.map(MedIndex.rowHtml).join(""));
      });
    }

    function highlight(i) {
      var opts = box.querySelectorAll(".suggest__item");
      opts.forEach(function (o) { o.classList.remove("is-active"); });
      if (i >= 0 && opts[i]) {
        opts[i].classList.add("is-active");
        input.setAttribute("aria-activedescendant", opts[i].id);
      } else {
        input.removeAttribute("aria-activedescendant");
      }
      active = i;
    }

    var timer;
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(render, 120); });
    input.addEventListener("focus", function () { if (input.value.trim().length >= 2) render(); });
    input.addEventListener("keydown", function (e) {
      var n = box.querySelectorAll(".suggest__item").length;
      if (e.key === "ArrowDown" && n) { e.preventDefault(); highlight((active + 1) % n); }
      else if (e.key === "ArrowUp" && n) { e.preventDefault(); highlight(active <= 0 ? n - 1 : active - 1); }
      else if (e.key === "Enter" && active >= 0) {
        e.preventDefault();
        var opt = box.querySelectorAll(".suggest__item")[active];
        if (opt) window.location.href = opt.getAttribute("href");
      } else if (e.key === "Escape") { close(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search")) close();
    });
  })();

  /* ---------- Init ---------- */
  document.addEventListener("cart:change", function () {
    updateBadges();
    updateActions();
    updateInCart();
    renderMini();
  });
  updateBadges();
  updateActions();
  updateInCart();
})();
