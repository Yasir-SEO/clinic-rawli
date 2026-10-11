/* Adil Child Care Clinic & Pharmacy — site scripts (no dependencies) */
(function () {
  "use strict";

  var TIME_ZONE = "Asia/Karachi";
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var header = document.querySelector(".header");

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Open / closed status (Pakistan time) ---------- */
  function toMinutes(hhmm) {
    var parts = String(hhmm).split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
  }

  function formatTime(hhmm) {
    var mins = toMinutes(hhmm) % (24 * 60);
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + suffix;
  }

  function nowInPakistan() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
    return { day: day, minutes: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
  }

  function readHours() {
    var schedule = {};
    var rows = document.querySelectorAll("#hours-table tr[data-day]");
    if (rows.length) {
      rows.forEach(function (row) {
        var day = parseInt(row.getAttribute("data-day"), 10);
        schedule[day] = row.getAttribute("data-closed") === "true"
          ? { closed: true, row: row }
          : { open: row.getAttribute("data-open"), close: row.getAttribute("data-close"), row: row };
      });
      return schedule;
    }
    // Pages without the hours table use the hours from site.config.json (js/config.js).
    var hours = window.SITE && window.SITE.hours;
    if (hours) {
      ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].forEach(function (name, day) {
        var h = hours[name];
        schedule[day] = h ? { open: h[0], close: h[1] } : { closed: true };
      });
    }
    return schedule;
  }

  function computeStatus(schedule, now) {
    var today = schedule[now.day];
    var yesterday = schedule[(now.day + 6) % 7];

    // Still open from yesterday's late-night shift (e.g. 18:00–02:00)?
    if (yesterday && !yesterday.closed) {
      var yOpen = toMinutes(yesterday.open);
      var yClose = toMinutes(yesterday.close);
      if (yClose <= yOpen && now.minutes < yClose) {
        return { open: true, until: yesterday.close };
      }
    }

    if (today && !today.closed) {
      var open = toMinutes(today.open);
      var close = toMinutes(today.close);
      var overnight = close <= open;
      if (now.minutes >= open && (overnight || now.minutes < close)) {
        return { open: true, until: today.close };
      }
      if (now.minutes < open) {
        return { open: false, nextLabel: "opens at " + formatTime(today.open) };
      }
    }

    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      var s = schedule[d];
      if (s && !s.closed) {
        var when = i === 1 ? "tomorrow" : DAY_NAMES[d];
        return { open: false, nextLabel: "opens " + when + " " + formatTime(s.open) };
      }
    }
    return { open: false, nextLabel: "" };
  }

  function updateOpenStatus() {
    var schedule = readHours();
    if (!Object.keys(schedule).length) return;

    var now;
    try { now = nowInPakistan(); } catch (e) { return; }
    if (now.day < 0) return;

    var status = computeStatus(schedule, now);
    var today = schedule[now.day];

    document.querySelectorAll("#hours-table tr").forEach(function (r) { r.classList.remove("is-today"); });
    if (today && today.row) today.row.classList.add("is-today");

    var pill = document.querySelector("[data-open-pill]");
    if (pill) {
      pill.textContent = status.open ? "Open now" : "Closed now";
      pill.classList.toggle("is-open", status.open);
      pill.classList.toggle("is-closed", !status.open);
    }

    var todayHours = document.querySelector("[data-today-hours]");
    if (todayHours) {
      todayHours.textContent = today && !today.closed
        ? formatTime(today.open) + " – " + formatTime(today.close)
        : "Closed today";
    }

    document.querySelectorAll("[data-doctor-today]").forEach(function (doc) {
      var days = (doc.getAttribute("data-days") || "").split(",").filter(Boolean).map(Number);
      var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var next = null;
      for (var k = 1; k <= 7 && next === null; k++) if (days.indexOf((now.day + k) % 7) >= 0) next = (now.day + k) % 7;
      doc.textContent = days.indexOf(now.day) >= 0 ? " · at the clinic today"
        : next !== null ? " · next: " + NAMES[next] : "";
      doc.classList.toggle("is-today", days.indexOf(now.day) >= 0);
    });

    var bar = document.querySelector("[data-open-status]");
    var barText = document.querySelector("[data-open-text]");
    if (bar && barText) {
      barText.textContent = status.open
        ? "Open now · until " + formatTime(status.until)
        : "Closed now" + (status.nextLabel ? " · " + status.nextLabel : "");
      bar.classList.toggle("is-open", status.open);
      bar.classList.toggle("is-closed", !status.open);
    }
  }

  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);

  /* ---------- Main menu: dropdowns on desktop, accordion on phones ---------- */
  (function () {
    var nav = document.querySelector(".navbar");
    if (!nav) return;
    var toggle = nav.querySelector(".navbar__toggle");
    var buttons = Array.prototype.slice.call(nav.querySelectorAll(".nav-item--menu > .nav-link"));
    var desktop = window.matchMedia("(min-width: 921px)");
    var hover = window.matchMedia("(hover: hover) and (min-width: 921px)");

    function closeAll(except) {
      buttons.forEach(function (b) { if (b !== except) b.setAttribute("aria-expanded", "false"); });
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") !== "true";
        if (desktop.matches) closeAll(b);
        b.setAttribute("aria-expanded", String(open));
      });
      b.parentNode.addEventListener("mouseleave", function () {
        if (hover.matches) b.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (desktop.matches && !nav.contains(e.target)) closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = nav.querySelector('.nav-item--menu > .nav-link[aria-expanded="true"]');
      if (open) { closeAll(); open.focus(); }
    });
    nav.addEventListener("focusout", function (e) {
      if (desktop.matches && !nav.contains(e.relatedTarget)) closeAll();
    });
  })();

  /* ---------- WhatsApp order form ---------- */
  var form = document.getElementById("order-form");
  if (!form) return;

  var typeSelect = form.querySelector("#f-type");
  var nameInput = form.querySelector("#f-name");
  var ageInput = form.querySelector("#f-age");
  var details = form.querySelector("#f-details");
  var detailsLabel = form.querySelector("[data-details-label]");

  var TYPES = {
    medicine: {
      title: "Medicine order",
      label: "Medicines you need",
      detailsHeading: "Medicines",
      placeholder: "e.g. Paracetamol syrup 120ml × 1\nORS sachets × 5"
    },
    clinic: {
      title: "Clinic visit",
      label: "What is the problem?",
      detailsHeading: "Problem",
      placeholder: "e.g. Fever and cough for 2 days. When is the doctor available today?"
    },
    question: {
      title: "Question",
      label: "Your question",
      detailsHeading: "Question",
      placeholder: "Type your question here"
    }
  };

  function applyType() {
    var type = typeSelect.value;
    var cfg = TYPES[type] || TYPES.medicine;
    detailsLabel.textContent = cfg.label;
    details.setAttribute("placeholder", cfg.placeholder);
    form.querySelectorAll("[data-show-for]").forEach(function (el) {
      el.hidden = el.getAttribute("data-show-for") !== type;
    });
  }

  typeSelect.addEventListener("change", applyType);
  applyType();

  function setError(input, show) {
    var err = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (err) {
      err.hidden = !show;
      if (show) input.setAttribute("aria-describedby", err.id);
      else input.removeAttribute("aria-describedby");
    }
  }

  [nameInput, details].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.value.trim()) setError(input, false);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var text = details.value.trim();
    setError(nameInput, !name);
    setError(details, !text);
    if (!name) { nameInput.focus(); return; }
    if (!text) { details.focus(); return; }

    var type = typeSelect.value;
    var cfg = TYPES[type] || TYPES.medicine;
    var lines = [
      "Assalam-o-Alaikum! (from the Adil Child Care website)",
      "",
      "*" + cfg.title + "*",
      "Name: " + name
    ];
    if (type === "clinic" && ageInput.value.trim()) {
      lines.push("Child's age: " + ageInput.value.trim());
    }
    lines.push(cfg.detailsHeading + ":", text);
    if (type === "medicine") {
      var collect = form.querySelector("input[name='collect']:checked");
      if (collect) lines.push("", "Collection: " + collect.value);
    }

    var number = (window.SITE && window.SITE.whatsapp) || form.getAttribute("data-whatsapp") || "";
    if (!/^\d{10,15}$/.test(String(number).replace(/\D/g, "")) && window.console) {
      console.warn("WhatsApp number is not set. Update site.config.json and run the build.");
    }
    var url = window.Catalog
      ? window.Catalog.waUrl(number, lines.join("\n"))
      : "https://wa.me/?text=" + encodeURIComponent(lines.join("\n"));

    var win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
  });
})();
