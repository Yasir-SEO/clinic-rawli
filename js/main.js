/* Adil Child Care Clinic & Pharmacy — site scripts (no dependencies) */
(function () {
  "use strict";

  var TIME_ZONE = "Asia/Karachi";
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector(".header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (header && toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!header.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });
  }

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
    document.querySelectorAll("#hours-table tr[data-day]").forEach(function (row) {
      var day = parseInt(row.getAttribute("data-day"), 10);
      schedule[day] = row.getAttribute("data-closed") === "true"
        ? { closed: true, row: row }
        : { open: row.getAttribute("data-open"), close: row.getAttribute("data-close"), row: row };
    });
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

    var number = (form.getAttribute("data-whatsapp") || "").replace(/[^\dX]/gi, "");
    var hasNumber = /^\d{10,15}$/.test(number);
    if (!hasNumber && window.console) {
      console.warn("WhatsApp number is not set. Update data-whatsapp on #order-form in index.html.");
    }
    var url = "https://wa.me/" + (hasNumber ? number : "") + "?text=" + encodeURIComponent(lines.join("\n"));

    var win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
  });
})();
