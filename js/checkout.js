/* Cart page and checkout (orders are sent to the shop on WhatsApp). */
(function () {
  "use strict";

  var DATA = window.STORE_DATA;
  var C = window.Catalog;
  var SITE = window.SITE || {};
  var Cart = window.Cart;
  if (!DATA || !C || !Cart) return;

  var ROOT = document.body.getAttribute("data-root") || "";
  var esc = C.esc;
  var LAST_ORDER_KEY = "adil_last_order_v1";

  function money(n) { return C.formatPrice(n, SITE.currency); }

  function thumb(l) {
    if (l.product) return C.media(l.product, { decorative: true, root: ROOT });
    return '<span class="thumb-request" aria-hidden="true"><svg class="icon"><use href="#i-file"/></svg></span>';
  }

  function deliveryOfferText() {
    return "Free home delivery on orders over " + money(SITE.freeDeliveryOver) +
      (SITE.deliveryRadiusKm != null ? " within " + SITE.deliveryRadiusKm + " km of the shop" : "");
  }

  function lineTotal(l) { return l.price == null ? "On request" : money(l.price * l.qty); }

  function totalsHtml(t, opts) {
    var delivery = opts && opts.delivery;
    var fee = SITE.deliveryFee;
    var rows = '<div class="totals__row"><span>Subtotal</span><strong>' + (t.amount ? money(t.amount) : "On request") + "</strong></div>";
    var freeOver = SITE.freeDeliveryOver;
    var isFree = freeOver != null && !t.unpriced && t.amount >= freeOver;
    if (isFree) fee = 0;
    if (delivery === "delivery") {
      rows += '<div class="totals__row"><span>Delivery</span><strong>' +
        (fee === 0 ? "Free" : freeOver != null ? "Free over " + money(freeOver) : fee == null ? "Confirmed on WhatsApp" : money(fee)) + "</strong></div>";
      if (freeOver != null && !isFree) fee = null;
    } else if (delivery === "pickup") {
      rows += '<div class="totals__row"><span>Pickup from shop</span><strong>Free</strong></div>';
    }
    var total = t.amount + (delivery === "delivery" && fee ? fee : 0);
    rows += '<div class="totals__row totals__row--grand"><span>Total</span><strong>' +
      (t.unpriced ? (t.amount ? money(total) + " + items on request" : "Confirmed on WhatsApp")
        : delivery === "delivery" && fee == null ? money(total) + " + delivery" : money(total)) +
      "</strong></div>";
    if (t.unpriced) {
      rows += '<p class="totals__note">' + t.unpriced + (t.unpriced === 1 ? " item has" : " items have") +
        " no listed price. We'll confirm the final price on WhatsApp before you pay.</p>";
    }
    if (freeOver != null && delivery !== "pickup") {
      rows += '<p class="totals__note totals__note--offer">' + deliveryOfferText() + ".</p>";
    }
    return rows;
  }

  /* ================= CART PAGE ================= */
  var cartApp = document.getElementById("cart-app");

  function renderCart() {
    var lines = Cart.lines();
    if (!lines.length) {
      cartApp.innerHTML = '<div class="empty-state">' +
        '<svg class="icon icon--xl" aria-hidden="true"><use href="#i-cart"/></svg>' +
        "<h2>Your cart is empty</h2><p>Browse our medicines, or request any medicine you need and we'll arrange it.</p>" +
        '<a class="btn btn--primary btn--lg" href="' + ROOT + 'shop.html">Browse medicines</a></div>';
      return;
    }
    var t = Cart.totals();
    cartApp.innerHTML =
      '<div class="cart-layout"><div class="cart-lines">' +
      '<div class="cart-table" role="table" aria-label="Cart items">' +
      '<div class="cart-row cart-row--head" role="row"><span role="columnheader">Product</span><span role="columnheader">Price</span>' +
      '<span role="columnheader">Quantity</span><span role="columnheader">Total</span><span role="columnheader"><span class="sr-only">Remove</span></span></div>' +
      lines.map(function (l) {
        var href = l.product ? C.productUrl(l.product, ROOT) : null;
        return '<div class="cart-row" role="row">' +
          '<div class="cart-row__product" role="cell"><span class="cart-row__thumb">' + thumb(l) + "</span><div>" +
          (href ? '<a class="cart-row__name" href="' + href + '">' + esc(l.name) + "</a>" : '<span class="cart-row__name">' + esc(l.name) + "</span>") +
          '<span class="cart-row__meta">' + (l.custom ? "Requested item · we'll confirm availability" : esc(l.product.generic)) + "</span>" +
          (l.rx ? '<span class="badge badge--rx">Rx · prescription needed</span>' : "") + "</div></div>" +
          '<div class="cart-row__price" role="cell"><span class="cart-row__label">Price</span>' +
          (l.price == null ? "On request" : money(l.price) + " / " + esc(l.unit)) + "</div>" +
          '<div role="cell"><span class="cart-row__label">Quantity</span><div class="stepper" role="group" aria-label="Quantity of ' + esc(l.name) + '">' +
          '<button type="button" class="stepper__btn" data-dec="' + esc(l.id) + '" aria-label="Remove one">&minus;</button>' +
          '<span class="stepper__qty">' + l.qty + "</span>" +
          '<button type="button" class="stepper__btn" data-inc="' + esc(l.id) + '" aria-label="Add one">+</button></div></div>' +
          '<div class="cart-row__total" role="cell"><span class="cart-row__label">Total</span>' + lineTotal(l) + "</div>" +
          '<div role="cell"><button type="button" class="icon-btn" data-remove="' + esc(l.id) + '" aria-label="Remove ' + esc(l.name) + '">' +
          '<svg class="icon" aria-hidden="true"><use href="#i-trash"/></svg></button></div>' +
          "</div>";
      }).join("") + "</div>" +
      '<div class="cart-extra">' +
      '<form class="request-form" data-request-form><label for="cart-request">Can\'t find a medicine? Add it here</label>' +
      '<div class="request-form__row"><input id="cart-request" name="request" type="text" placeholder="e.g. Medicine name and strength" autocomplete="off">' +
      '<button class="btn btn--outline" type="submit">Add request</button></div></form>' +
      '<a class="link-back" href="' + ROOT + 'shop.html">← Continue shopping</a></div>' +
      "</div>" +
      '<aside class="cart-summary" aria-labelledby="cart-summary-title"><h2 id="cart-summary-title">Cart totals</h2>' +
      totalsHtml(t) +
      (t.hasRx ? '<p class="note note--sm"><svg class="icon" aria-hidden="true"><use href="#i-file"/></svg> Your cart has prescription medicines. You\'ll send the prescription photo on WhatsApp.</p>' : "") +
      '<a class="btn btn--primary btn--lg btn--block" href="' + ROOT + 'checkout.html">Proceed to checkout</a></aside></div>';
  }

  if (cartApp) {
    renderCart();
    document.addEventListener("cart:change", renderCart);
  }

  /* ================= CHECKOUT ================= */
  var checkout = document.getElementById("checkout-app");
  if (!checkout) return;

  var form = document.getElementById("checkout-form");
  var review = document.getElementById("order-review");
  var success = document.getElementById("order-success");
  var emptyBox = document.getElementById("checkout-empty");
  var addressField = document.getElementById("co-address-field");
  var rxField = document.getElementById("co-rx-field");

  function deliveryMode() {
    var r = form.querySelector("input[name='delivery']:checked");
    return r ? r.value : "pickup";
  }

  function renderReview() {
    var lines = Cart.lines();
    var t = Cart.totals();
    var hasLines = lines.length > 0;
    form.hidden = !hasLines;
    review.parentElement.hidden = !hasLines;
    if (emptyBox) emptyBox.hidden = hasLines || !success.hidden;
    if (!hasLines) return;

    review.innerHTML = '<ul class="review-list" role="list">' + lines.map(function (l) {
      return '<li><span class="review-list__thumb">' + thumb(l) + '</span><span class="review-list__name">' + esc(l.name) +
        ' <span class="muted">× ' + l.qty + "</span>" + (l.rx ? ' <span class="badge badge--rx">Rx</span>' : "") +
        "</span><strong>" + lineTotal(l) + "</strong></li>";
    }).join("") + "</ul>" + totalsHtml(t, { delivery: deliveryMode() });

    rxField.hidden = !t.hasRx;
    var rxBox = document.getElementById("co-rx");
    if (rxBox) rxBox.required = t.hasRx;
  }

  function toggleAddress() {
    var isDelivery = deliveryMode() === "delivery";
    addressField.hidden = !isDelivery;
    document.getElementById("co-address").required = isDelivery;
    renderReview();
  }

  form.querySelectorAll("input[name='delivery']").forEach(function (r) { r.addEventListener("change", toggleAddress); });
  ["co-name", "co-phone", "co-address", "co-rx"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(el.type === "checkbox" ? "change" : "input", function () {
      if (el.getAttribute("aria-invalid") === "true") setError(el, "");
    });
  });
  document.addEventListener("cart:change", renderReview);

  function setError(input, msg) {
    var err = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) {
      err.textContent = msg || "";
      err.hidden = !msg;
      if (msg) input.setAttribute("aria-describedby", err.id);
      else input.removeAttribute("aria-describedby");
    }
  }

  function validate() {
    var first = null;
    var name = document.getElementById("co-name");
    var phone = document.getElementById("co-phone");
    var address = document.getElementById("co-address");
    var rx = document.getElementById("co-rx");

    var phoneDigits = phone.value.replace(/\D/g, "");
    var phoneOk = /^(03\d{9}|923\d{9})$/.test(phoneDigits);

    setError(name, name.value.trim() ? "" : "Please enter your name.");
    setError(phone, phoneOk ? "" : "Please enter a valid mobile number, e.g. 0300 1234567.");
    setError(address, address.required && !address.value.trim() ? "Please enter your delivery address." : "");
    if (!name.value.trim()) first = first || name;
    if (!phoneOk) first = first || phone;
    if (address.required && !address.value.trim()) first = first || address;
    if (rx && rx.required && !rx.checked) {
      setError(rx, "Please confirm you'll send the prescription.");
      first = first || rx;
    } else if (rx) {
      setError(rx, "");
    }
    if (first) first.focus();
    return !first;
  }

  function orderId() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "ADL-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" +
      String(Math.floor(1000 + Math.random() * 9000));
  }

  function buildMessage(order) {
    var t = order.totals;
    var lines = [
      "*New order – " + (SITE.businessName || "Adil Child Care Clinic & Pharmacy") + "*",
      "Order #: " + order.id,
      "",
      "Name: " + order.name,
      "Phone: " + order.phone,
      "Delivery: " + (order.delivery === "delivery" ? "Home delivery" + (SITE.freeDeliveryOver != null ? " (free over " + money(SITE.freeDeliveryOver) + (SITE.deliveryRadiusKm != null ? " within " + SITE.deliveryRadiusKm + " km" : "") + ")" : "") : "Pickup from shop")
    ];
    if (order.delivery === "delivery") lines.push("Address: " + order.address);
    lines.push("Payment: " + order.payment, "", "*Items*");
    order.lines.forEach(function (l, i) {
      lines.push((i + 1) + ". " + l.name + " (" + l.unit + ") × " + l.qty +
        (l.price != null ? " — " + money(l.price * l.qty) : "") + (l.rx ? " [Rx]" : "") + (l.custom ? " [requested]" : ""));
    });
    lines.push("");
    if (t.amount) lines.push("Subtotal: " + money(t.amount) + (t.unpriced ? " (+ items on request)" : ""));
    else lines.push("Prices: please confirm");
    if (order.notes) lines.push("", "Notes: " + order.notes);
    if (t.hasRx) lines.push("", "I will send the prescription photo in this chat.");
    return lines.join("\n");
  }

  function showSuccess(order, url) {
    form.hidden = true;
    review.parentElement.hidden = true;
    if (emptyBox) emptyBox.hidden = true;
    success.hidden = false;
    document.getElementById("success-id").textContent = order.id;
    document.getElementById("success-wa").setAttribute("href", url);
    document.getElementById("success-items").innerHTML = order.lines.map(function (l) {
      return "<li>" + esc(l.name) + ' <span class="muted">× ' + l.qty + "</span></li>";
    }).join("");
    var rxNote = document.getElementById("success-rx");
    if (rxNote) rxNote.hidden = !order.totals.hasRx;
    success.scrollIntoView({ behavior: "smooth", block: "start" });
    var heading = success.querySelector("h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Cart.lines().length) return;
    if (!validate()) return;

    var payment = form.querySelector("input[name='payment']:checked");
    var order = {
      id: orderId(),
      name: document.getElementById("co-name").value.trim(),
      phone: document.getElementById("co-phone").value.trim(),
      delivery: deliveryMode(),
      address: document.getElementById("co-address").value.trim(),
      payment: payment ? payment.value : "Cash",
      notes: document.getElementById("co-notes").value.trim(),
      lines: Cart.lines().map(function (l) {
        return { name: l.name, unit: l.unit, qty: l.qty, price: l.price, rx: l.rx, custom: l.custom };
      }),
      totals: Cart.totals()
    };

    var url = C.waUrl(SITE.whatsapp, buildMessage(order));
    if (!/^\d{10,15}$/.test(String(SITE.whatsapp || "").replace(/\D/g, "")) && window.console) {
      console.warn("WhatsApp number is not set. Update site.config.json and run the build.");
    }
    try { window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ order: order, url: url })); } catch (err) { /* ignore */ }

    var win = window.open(url, "_blank");
    if (win) win.opener = null;
    Cart.clear();
    showSuccess(order, url);
    if (!win) window.location.href = url;
  });

  // Prefill saved customer details
  try {
    var saved = JSON.parse(window.localStorage.getItem(LAST_ORDER_KEY) || "null");
    if (saved && saved.order) {
      var o = saved.order;
      ["name", "phone", "address"].forEach(function (k) {
        var el = document.getElementById("co-" + k);
        if (el && !el.value && o[k]) el.value = o[k];
      });
      if (!Cart.lines().length && new URLSearchParams(window.location.search).get("placed") === "1") {
        showSuccess(o, saved.url);
      }
    }
  } catch (err) { /* ignore */ }

  toggleAddress();
})();
