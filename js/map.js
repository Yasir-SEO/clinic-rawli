/* Home page map: OpenStreetMap with a labelled pin for the shop (Leaflet).
   If Leaflet can't load, the Google Maps frame inside #shop-map stays as it is. */
(function () {
  "use strict";
  var el = document.getElementById("shop-map");
  var L = window.L;
  if (!el || !L) return;
  var lat = parseFloat(el.getAttribute("data-lat"));
  var lng = parseFloat(el.getAttribute("data-lng"));
  if (!isFinite(lat) || !isFinite(lng)) return;
  var name = el.getAttribute("data-name") || "";
  var note = el.getAttribute("data-note") || "";

  el.innerHTML = "";
  el.classList.add("shop-map--live");
  var touch = L.Browser.mobile;
  var map = L.map(el, {
    center: [lat, lng],
    zoom: 17,
    scrollWheelZoom: false, // don't trap page scrolling; click the map to enable
    dragging: !touch,       // on phones, one finger scrolls the page, two fingers zoom
    tap: !touch
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.on("click", function () { map.scrollWheelZoom.enable(); });

  var pin = L.divIcon({
    className: "map-pin",
    html: '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 51s17-17.2 17-30A17 17 0 0 0 3 21c0 12.8 17 30 17 30z" fill="#0f766e" stroke="#fff" stroke-width="2.5"/>' +
      '<circle cx="20" cy="21" r="10" fill="#fff"/><path d="M17.5 14.5h5v4h4v5h-4v4h-5v-4h-4v-5h4z" fill="#e2574c"/></svg>',
    iconSize: [40, 52],
    iconAnchor: [20, 51],
    tooltipAnchor: [0, -50]
  });
  var label = document.createElement("div");
  var strong = document.createElement("strong");
  strong.textContent = name;
  label.appendChild(strong);
  if (note) {
    var small = document.createElement("span");
    small.textContent = note;
    label.appendChild(small);
  }
  L.marker([lat, lng], { icon: pin, title: name, alt: name, keyboard: false })
    .addTo(map)
    .bindTooltip(label, { permanent: true, direction: "top", className: "map-label", opacity: 1 })
    .openTooltip();
  // Show the pin below the middle so its name label above it stays in view.
  map.panBy([0, -Math.min(90, el.clientHeight * 0.18)], { animate: false });
})();
