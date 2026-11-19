/* BigDeal – prevzemi in potrjevanje s QR-kodo */

/* ===== Pomožne funkcije ponudnikovega načina (enake na zaslonih Pregled in Prevzemi) ===== */

(function () {
  "use strict";

  const KEYS = {
    business: "bigdeal-prototype-business",
    pickups: "bigdeal-prototype-pickups",
    newOffers: "bigdeal-prototype-new-offers",
  };

  const data = window.BigDealMockData || {};

  /* Testni podatki ponudnikovega načina – prijavljeni uporabnik upravlja dve podjetji */

  const currentUser = data.currentUser || { id: 1, name: "Nina", businessIds: [1, 2] };
  const reservationsData = data.reservations || createMockReservations();

  function createMockReservations() {
    // Termine računamo glede na trenutni čas, da prototip vedno prikazuje aktualne prevzeme.
    const baseTime = new Date();
    baseTime.setMinutes(0, 0, 0);

    function at(hoursFromNow) {
      return new Date(baseTime.getTime() + hoursFromNow * 3600000).toISOString();
    }

    function reservation(id, customerName, offerId, quantity, startHour, endHour, status, qrToken) {
      const offer = (data.offers || []).find((item) => item.id === offerId) || {};

      return {
        id,
        customerName,
        offerId,
        quantity,
        originalPriceAtReservation: offer.originalPrice,
        discountedPriceAtReservation: offer.discountedPrice,
        status,
        qrToken,
        pickupStart: at(startHour),
        pickupEnd: at(endHour),
        createdAt: at(startHour - 20),
        pickedUpAt: status === "COMPLETED" ? at(startHour + 0.5) : null,
      };
    }

    return [
      reservation(1, "Ana Kovač", 1, 2, -1, 1, "CONFIRMED", "BD-4K7P2Q"),
      reservation(2, "Petra Zupan", 6, 1, -1, 2, "CONFIRMED", "BD-8R2L6W"),
      reservation(3, "Marko Vidmar", 1, 1, 1, 3, "CONFIRMED", "BD-9M3X5T"),
      reservation(4, "Luka Horvat", 6, 2, 22, 24, "CONFIRMED", "BD-2H5N8C"),
      reservation(5, "Nina Repnik", 1, 3, -26, -24, "COMPLETED", "BD-6T1J4Z"),
      reservation(6, "Jure Bizjak", 6, 1, -50, -48, "COMPLETED", "BD-3F9D7K"),
      reservation(7, "Eva Mlakar", 1, 1, -6, -4, "CONFIRMED", "BD-7Y4B1E"),
      reservation(8, "Tim Sever", 6, 1, -3, -1, "CANCELLED", "BD-5W8Q3U"),
      reservation(9, "Sara Potočnik", 3, 1, -1, 2, "CONFIRMED", "BD-1A6S9P"),
      reservation(10, "Gal Turk", 8, 1, 20, 22, "CONFIRMED", "BD-4G2V7M"),
      reservation(11, "Maja Lešnik", 3, 1, -30, -28, "COMPLETED", "BD-8L3K5R"),
      reservation(12, "Rok Dolenc", 5, 1, -1, 2, "CONFIRMED", "BD-6D9X2H"),
      reservation(13, "Zala Kranjc", 9, 1, 2, 4, "CONFIRMED", "BD-3Z7C1N"),
    ];
  }

  /* Lokalna shramba – v prototipu ni obvezna, zato napake tiho prezremo */

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Prototip deluje tudi brez lokalne shrambe.
    }
  }

  /* Podjetja */

  function getOwnedBusinesses() {
    const ids = currentUser.businessIds || [];
    return (data.businesses || []).filter((business) => ids.includes(business.id));
  }

  function getActiveBusiness() {
    const owned = getOwnedBusinesses();
    const storedId = read(KEYS.business, null);

    return owned.find((business) => business.id === storedId) || owned[0] || null;
  }

  function setActiveBusiness(businessId) {
    write(KEYS.business, businessId);
  }

  function getBusinessById(businessId) {
    return (data.businesses || []).find((business) => business.id === businessId) || null;
  }

  /* Ponudbe */

  function getAllOffers() {
    return [...(data.offers || []), ...read(KEYS.newOffers, [])];
  }

  function getOffers(businessId) {
    return getAllOffers().filter((offer) => offer.businessId === businessId);
  }

  function getOfferById(offerId) {
    return getAllOffers().find((offer) => offer.id === offerId) || null;
  }

  /* Rezervacije */

  function getReservations(businessId) {
    const completed = read(KEYS.pickups, {});
    const now = Date.now();

    return reservationsData
      .map((reservation) => {
        const offer = getOfferById(reservation.offerId);
        let status = reservation.status;
        let pickedUpAt = reservation.pickedUpAt;

        if (completed[reservation.id]) {
          status = "COMPLETED";
          pickedUpAt = completed[reservation.id];
        } else if (
          status === "CONFIRMED" &&
          new Date(reservation.pickupEnd).getTime() < now
        ) {
          // Potrjena rezervacija, katere termin je minil, se šteje kot potekla.
          status = "EXPIRED";
        }

        return { ...reservation, status, pickedUpAt, offer };
      })
      .filter(
        (reservation) =>
          businessId == null ||
          (reservation.offer && reservation.offer.businessId === businessId)
      );
  }

  function completeReservation(reservationId) {
    const completed = read(KEYS.pickups, {});
    const pickedUpAt = new Date().toISOString();

    completed[reservationId] = pickedUpAt;
    write(KEYS.pickups, completed);

    return pickedUpAt;
  }

  const statusMeta = {
    CONFIRMED: { label: "Za prevzem", className: "status-chip--waiting" },
    COMPLETED: { label: "Prevzeto", className: "status-chip--done" },
    EXPIRED: { label: "Poteklo", className: "status-chip--muted" },
    CANCELLED: { label: "Preklicano", className: "status-chip--muted" },
  };

  function statusChip(status) {
    const meta = statusMeta[status] || statusMeta.CONFIRMED;
    return `<span class="status-chip ${meta.className}">${meta.label}</span>`;
  }

  /* Kategorije */

  function getCategories() {
    return data.categories || [];
  }

  function getCategoryName(categoryId) {
    const category = getCategories().find((item) => item.id === categoryId);
    return category ? category.name : "Drugo";
  }

  /* Oblikovanje vrednosti */

  const priceFormatter = new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  });

  function formatPrice(value) {
    return value == null ? "" : priceFormatter.format(value);
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("sl-SI", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function dayDifference(iso) {
    const target = startOfDay(new Date(iso));
    const today = startOfDay(new Date());
    return Math.round((target - today) / 86400000);
  }

  function isToday(iso) {
    return dayDifference(iso) === 0;
  }

  function formatDayLabel(iso) {
    const difference = dayDifference(iso);

    if (difference === 0) return "Danes";
    if (difference === 1) return "Jutri";
    if (difference === -1) return "Včeraj";

    return new Date(iso).toLocaleDateString("sl-SI", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });
  }

  function formatPickupWindow(reservation) {
    return `${formatDayLabel(reservation.pickupStart)}, ${formatTime(
      reservation.pickupStart
    )}–${formatTime(reservation.pickupEnd)}`;
  }

  function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("sl-SI", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  // Slovenska dvojina in množina: 1 prevzem, 2 prevzema, 3 prevzemi, 5 prevzemov.
  function pluralize(count, forms) {
    const remainder = Math.abs(count) % 100;

    if (remainder === 1) return forms[0];
    if (remainder === 2) return forms[1];
    if (remainder === 3 || remainder === 4) return forms[2];

    return forms[3];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Ikone */

  const icons = {
    store: '<path d="M3 10h18l-2-7H5z"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm7 0v4h-4m0 3h4"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-8.2-8.2V3h9.4l8.8 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',
    ticket: '<path d="M2 9a3 3 0 0 0 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 0 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2m0 4v2m0 4v2"/>',
    piggy: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    // Kategorije
    food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    fashion: '<path d="M20.4 18.6 13 12l1.7-1.4A3 3 0 1 0 10 8M13 12l-9.4 6.6A1 1 0 0 0 4.2 20h15.6a1 1 0 0 0 .6-1.4z"/>',
    electronics: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    beauty: '<path d="M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-5-4-7-6-11z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    sport: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    gift: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  };

  const categoryIcons = {
    1: "food",
    2: "fashion",
    3: "electronics",
    4: "beauty",
    5: "home",
    6: "sport",
    7: "book",
    8: "gift",
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.tag}</svg>`;
  }

  function categoryIcon(categoryId) {
    return icon(categoryIcons[categoryId] || "tag");
  }

  /* Fotografije ponudb */

  // Če ponudba v testnih podatkih nima fotografije, uporabimo sliko iz assets/images.
  const offerImageFiles = {
    1: "pecivo.jpg",
    2: "lokalne-dobrote.jpeg",
    3: "jesenska-jakna.jpeg",
    4: "zimska-kolekcija.jpeg",
    5: "slusalke.jpeg",
    6: "krema.jpeg",
    7: "izdelki-za-dom.jpeg",
    8: "nahrbtnik.jpeg",
    9: "knjige.jpeg",
    10: "darila.jpeg",
  };

  const prototypeRoot = new URL("../../../", window.location.href);

  function getOfferImageUrl(offer) {
    if (!offer) return null;

    const path =
      offer.imageUrl ||
      (offerImageFiles[offer.id] ? `assets/images/${offerImageFiles[offer.id]}` : null);

    return path ? new URL(path, prototypeRoot).href : null;
  }

  function offerThumb(offer, modifier = "") {
    const imageUrl = getOfferImageUrl(offer);
    const categoryId = offer ? offer.categoryId : null;

    return `
      <span class="offer-thumb${modifier ? ` offer-thumb--${modifier}` : ""}">
        ${categoryIcon(categoryId)}
        ${imageUrl ? `<img src="${imageUrl}" alt="" loading="lazy">` : ""}
      </span>
    `;
  }

  // Manjkajočo fotografijo odstranimo, da ostane vidna ikona kategorije.
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.matches && event.target.matches(".offer-thumb img")) {
        event.target.remove();
      }
    },
    true
  );

  /* Navigacija */

  // navigation.js povezuje na mape (npr. provider/pickups/). Ko prototip odpremo
  // neposredno iz datoteke (file://), brskalnik index.html v mapi ne odpre sam,
  // zato povezavam dodamo index.html. Na strežniku (npr. Live Server) delujejo enako.
  function withIndexFile(href) {
    const url = new URL(href, window.location.href);
    if (url.pathname.endsWith("/")) url.pathname += "index.html";
    return url.href;
  }

  function fixNavigationLinks() {
    document.querySelectorAll(".bottom-nav a[href]").forEach((link) => {
      link.href = withIndexFile(link.getAttribute("href"));
    });
  }

  // Preklop načina prestrežemo pred navigation.js, da tudi ta vodi na index.html.
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-switch-mode]");
      if (!button || !window.BigDealNavigation) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const mode = button.dataset.switchMode === "provider" ? "provider" : "buyer";

      try {
        localStorage.setItem("bigdeal-prototype-mode", mode);
      } catch {
        // Prototip deluje tudi brez lokalne shrambe.
      }

      const destination = mode === "provider" ? "provider/dashboard/" : "buyer/home/";
      window.location.href = withIndexFile(window.BigDealNavigation.urlFor(destination));
    },
    true
  );

  // navigation.js izriše spodnjo navigacijo ob DOMContentLoaded, zato popravek izvedemo za njim.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixNavigationLinks);
  } else {
    fixNavigationLinks();
  }

  /* Kratko obvestilo na dnu zaslona */

  let toastTimer = null;

  function showToast(message) {
    const frame = document.querySelector(".phone-frame") || document.body;
    let toast = frame.querySelector(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      frame.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("toast--visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 2600);
  }

  window.BigDealProvider = {
    currentUser,
    getOwnedBusinesses,
    getActiveBusiness,
    setActiveBusiness,
    getBusinessById,
    getOffers,
    getOfferById,
    getReservations,
    completeReservation,
    statusChip,
    getCategories,
    getCategoryName,
    formatPrice,
    formatTime,
    formatDate,
    formatDayLabel,
    formatPickupWindow,
    isToday,
    pluralize,
    escapeHtml,
    icon,
    categoryIcon,
    offerThumb,
    showToast,
  };
})();

/* ===== Zaslon ===== */

(function () {
  "use strict";

  const provider = window.BigDealProvider;
  const { escapeHtml, icon } = provider;

  const SIMULATED_DELAY = 700;

  const filters = {
    waiting: (reservation) => reservation.status === "CONFIRMED",
    done: (reservation) => reservation.status === "COMPLETED",
    other: (reservation) =>
      reservation.status === "EXPIRED" || reservation.status === "CANCELLED",
  };

  const state = {
    business: provider.getActiveBusiness(),
    reservations: [],
    filter: "waiting",
    query: "",
  };

  const elements = {
    headerBusinessName: document.getElementById("headerBusinessName"),
    searchInput: document.getElementById("searchInput"),
    statusTabs: document.getElementById("statusTabs"),
    reservationList: document.getElementById("reservationList"),
    sheet: document.getElementById("sheet"),
    sheetPanel: document.getElementById("sheetPanel"),
  };

  let lastFocusedElement = null;

  /* Podatki */

  function loadReservations() {
    state.reservations = state.business ? provider.getReservations(state.business.id) : [];
  }

  function sortReservations(list, filter) {
    const copy = [...list];

    if (filter === "waiting") {
      return copy.sort((a, b) => new Date(a.pickupStart) - new Date(b.pickupStart));
    }

    if (filter === "done") {
      return copy.sort((a, b) => new Date(b.pickedUpAt) - new Date(a.pickedUpAt));
    }

    return copy.sort((a, b) => new Date(b.pickupStart) - new Date(a.pickupStart));
  }

  function matchesQuery(reservation) {
    if (!state.query) return true;

    const haystack = [
      reservation.customerName,
      reservation.offer ? reservation.offer.title : "",
      reservation.qrToken,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(state.query);
  }

  function getTotalToPay(reservation) {
    return reservation.discountedPriceAtReservation * reservation.quantity;
  }

  /* Seznam */

  function renderTabs() {
    elements.statusTabs.querySelectorAll("[data-filter]").forEach((tab) => {
      const isActive = tab.dataset.filter === state.filter;
      tab.classList.toggle("segmented-item--active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    Object.keys(filters).forEach((key) => {
      const count = state.reservations.filter(filters[key]).length;
      elements.statusTabs.querySelector(`[data-count="${key}"]`).textContent = count;
    });
  }

  function reservationCard(reservation) {
    const isLive =
      reservation.status === "CONFIRMED" &&
      new Date(reservation.pickupStart).getTime() <= Date.now();

    const timeText =
      reservation.status === "COMPLETED"
        ? `Prevzeto ${provider.formatDayLabel(reservation.pickedUpAt).toLowerCase()} ob ${provider.formatTime(reservation.pickedUpAt)}`
        : provider.formatPickupWindow(reservation);

    return `
      <button
        type="button"
        class="reservation-card card${isLive ? " reservation-card--live" : ""}"
        data-action="details"
        data-id="${reservation.id}"
      >
        <span class="reservation-card-main">
          ${provider.offerThumb(reservation.offer)}

          <span class="reservation-card-body">
            <span class="reservation-card-top">
              <span class="reservation-customer">${escapeHtml(reservation.customerName)}</span>
              ${provider.statusChip(reservation.status)}
            </span>

            <span class="reservation-offer">
              <span class="reservation-quantity">${reservation.quantity}×</span>
              ${escapeHtml(reservation.offer.title)}
            </span>
          </span>
        </span>

        <span class="reservation-meta">
          <span class="reservation-meta-item">${icon("clock")} ${timeText}</span>
          <span class="reservation-code">${escapeHtml(reservation.qrToken)}</span>
        </span>
      </button>
    `;
  }

  function emptyState() {
    if (state.query) {
      return `
        <div class="empty-state">
          <span class="icon-tile">${icon("search")}</span>
          <p class="empty-state-title">Ni zadetkov</p>
          <p class="empty-state-text">Za »${escapeHtml(state.query)}« ni rezervacij. Preverite črkovanje ali spremenite filter.</p>
        </div>
      `;
    }

    const messages = {
      waiting: ["Ni rezervacij za prevzem", "Ko kupci rezervirajo vaše izdelke, se rezervacije prikažejo tukaj."],
      done: ["Še ni prevzetih rezervacij", "Potrjeni prevzemi se bodo zbirali v tej zgodovini."],
      other: ["Ni preteklih ali preklicanih rezervacij", "Tukaj se prikažejo potekle in preklicane rezervacije."],
    };

    const [title, text] = messages[state.filter];

    return `
      <div class="empty-state">
        <span class="icon-tile">${icon("ticket")}</span>
        <p class="empty-state-title">${title}</p>
        <p class="empty-state-text">${text}</p>
      </div>
    `;
  }

  function renderList() {
    const visible = sortReservations(
      state.reservations.filter(filters[state.filter]).filter(matchesQuery),
      state.filter
    );

    if (visible.length === 0) {
      elements.reservationList.innerHTML = emptyState();
      return;
    }

    // Rezervacije za prevzem združimo po dnevih, da ponudnik hitro vidi današnje.
    if (state.filter === "waiting") {
      const groups = new Map();

      visible.forEach((reservation) => {
        const label = provider.formatDayLabel(reservation.pickupStart);
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label).push(reservation);
      });

      elements.reservationList.innerHTML = [...groups.entries()]
        .map(
          ([label, items]) => `
            <div class="day-group">
              <h2 class="day-heading">${label} <span>${items.length}</span></h2>
              <div class="stack">${items.map(reservationCard).join("")}</div>
            </div>
          `
        )
        .join("");
      return;
    }

    elements.reservationList.innerHTML = `<div class="stack">${visible.map(reservationCard).join("")}</div>`;
  }

  function render() {
    renderTabs();
    renderList();
  }

  /* Spodnji list */

  function openSheet(html) {
    if (elements.sheet.hidden) {
      lastFocusedElement = document.activeElement;
    }

    elements.sheetPanel.innerHTML = html;
    elements.sheet.hidden = false;

    requestAnimationFrame(() => {
      elements.sheet.classList.add("sheet--open");
      const focusTarget = elements.sheetPanel.querySelector("[data-autofocus]") ||
        elements.sheetPanel.querySelector("button");
      if (focusTarget) focusTarget.focus();
    });
  }

  function closeSheet() {
    elements.sheet.classList.remove("sheet--open");

    setTimeout(() => {
      elements.sheet.hidden = true;
      elements.sheetPanel.innerHTML = "";
      if (lastFocusedElement) lastFocusedElement.focus();
    }, 200);
  }

  function sheetHeader(title) {
    return `
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="sheet-header">
        <h2 class="sheet-title" id="sheetTitle">${title}</h2>
        <button type="button" class="header-icon-button sheet-close" data-action="close" aria-label="Zapri">
          ${icon("close")}
        </button>
      </div>
    `;
  }

  function detailList(reservation, options = {}) {
    const rows = [
      ["Stranka", escapeHtml(reservation.customerName)],
      ["Izdelek", escapeHtml(reservation.offer.title)],
      ["Količina", `${reservation.quantity} ${provider.pluralize(reservation.quantity, ["kos", "kosa", "kosi", "kosov"])}`],
      ["Termin", provider.formatPickupWindow(reservation)],
      [
        "Za plačilo",
        `<strong>${provider.formatPrice(getTotalToPay(reservation))}</strong>
         <span class="detail-original">${provider.formatPrice(reservation.originalPriceAtReservation * reservation.quantity)}</span>`,
      ],
      ["Koda", `<span class="reservation-code">${escapeHtml(reservation.qrToken)}</span>`],
    ];

    if (options.showStatus) {
      rows.unshift(["Status", provider.statusChip(reservation.status)]);
    }

    if (reservation.status === "COMPLETED" && reservation.pickedUpAt) {
      rows.push([
        "Prevzeto",
        `${provider.formatDayLabel(reservation.pickedUpAt)}, ${provider.formatTime(reservation.pickedUpAt)}`,
      ]);
    }

    return `
      <div class="detail-product">
        ${provider.offerThumb(reservation.offer, "large")}
        <span class="detail-product-text">
          <span class="detail-product-title">${escapeHtml(reservation.offer.title)}</span>
          <span class="text-caption">${escapeHtml(provider.getCategoryName(reservation.offer.categoryId))}</span>
        </span>
      </div>

      <dl class="detail-list">
        ${rows.map(([label, value]) => `<div class="detail-row"><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
      </dl>
    `;
  }

  /* Pogled: skener */

  function getDemoCodes() {
    // Testne kode pokrivajo glavni potek in alternativne poteke scenarija P-04.
    const all = provider.getReservations(null);
    const own = state.reservations;
    const now = Date.now();
    const codes = [];

    const valid = own.find(
      (r) => r.status === "CONFIRMED" && new Date(r.pickupStart).getTime() <= now
    );
    const early = own.find(
      (r) => r.status === "CONFIRMED" && new Date(r.pickupStart).getTime() > now
    );
    const done = own.find((r) => r.status === "COMPLETED");
    const expired = own.find((r) => r.status === "EXPIRED" || r.status === "CANCELLED");
    const foreign = all.find(
      (r) => r.offer && r.offer.businessId !== state.business.id && r.status === "CONFIRMED"
    );

    if (valid) codes.push({ token: valid.qrToken, label: "Veljavna" });
    if (early) codes.push({ token: early.qrToken, label: "Pred terminom" });
    if (done) codes.push({ token: done.qrToken, label: "Že prevzeta" });
    if (expired) codes.push({ token: expired.qrToken, label: expired.status === "CANCELLED" ? "Preklicana" : "Potekla" });
    if (foreign) codes.push({ token: foreign.qrToken, label: "Drugo podjetje" });
    codes.push({ token: "BD-000000", label: "Neveljavna" });

    return codes;
  }

  function showScanner() {
    const demoCodes = getDemoCodes();

    openSheet(`
      ${sheetHeader("Skeniranje QR-kode")}

      <div class="scanner" aria-hidden="true">
        <div class="scanner-frame">
          <span class="scanner-corner scanner-corner--tl"></span>
          <span class="scanner-corner scanner-corner--tr"></span>
          <span class="scanner-corner scanner-corner--bl"></span>
          <span class="scanner-corner scanner-corner--br"></span>
          <span class="scanner-line"></span>
          <span class="scanner-placeholder">${icon("qr")}</span>
        </div>
        <p class="scanner-hint">Usmerite kamero v QR-kodo kupca</p>
      </div>

      <div class="demo-codes">
        <p class="text-caption">Prototip: izberite testno kodo za simulacijo skeniranja</p>
        <div class="chip-row">
          ${demoCodes
            .map(
              (code) => `
                <button type="button" class="demo-chip" data-action="verify" data-token="${code.token}">
                  <span>${code.label}</span>
                  <small>${code.token}</small>
                </button>
              `
            )
            .join("")}
        </div>
      </div>

      <form class="manual-code" id="manualCodeForm" novalidate>
        <label class="form-label" for="manualCodeInput">Koda se ne prebere? Vnesite jo ročno</label>
        <div class="manual-code-row">
          <input
            class="form-input manual-code-input"
            id="manualCodeInput"
            name="code"
            placeholder="npr. BD-4K7P2Q"
            autocomplete="off"
            autocapitalize="characters"
          >
          <button type="submit" class="btn btn-primary">Preveri</button>
        </div>
        <p class="form-error" id="manualCodeError" hidden></p>
      </form>
    `);
  }

  /* Pogled: preverjanje */

  function verifyToken(rawToken) {
    const token = rawToken.trim().toUpperCase();
    const reservation = provider.getReservations(null).find((item) => item.qrToken === token);

    if (!reservation) {
      return {
        ok: false,
        title: "QR-koda ni veljavna",
        message: "Rezervacije s to kodo ni mogoče najti. Prosite kupca, naj odpre rezervacijo v aplikaciji in kodo pokaže znova.",
      };
    }

    if (!reservation.offer || reservation.offer.businessId !== state.business.id) {
      return {
        ok: false,
        title: "Rezervacija ne pripada temu podjetju",
        message: `Koda velja za drugo podjetje. Preverite, ali je aktivno podjetje »${state.business.name}« pravilno izbrano.`,
      };
    }

    if (reservation.status === "COMPLETED") {
      return {
        ok: false,
        reservation,
        title: "Rezervacija je že prevzeta",
        message: "Prevzem te rezervacije je bil že potrjen, zato ga ni mogoče potrditi ponovno.",
      };
    }

    if (reservation.status === "CANCELLED") {
      return {
        ok: false,
        reservation,
        title: "Rezervacija je preklicana",
        message: "Kupec je rezervacijo preklical. Izdelke lahko prodate po običajnem postopku.",
      };
    }

    if (reservation.status === "EXPIRED") {
      return {
        ok: false,
        reservation,
        title: "Rezervacija je potekla",
        message: "Termin prevzema je že minil, zato rezervacija ni več veljavna.",
      };
    }

    const isEarly = new Date(reservation.pickupStart).getTime() > Date.now();

    return {
      ok: true,
      reservation,
      warning: isEarly
        ? `Kupec je prišel pred izbranim terminom (${provider.formatPickupWindow(reservation)}). Prevzem lahko kljub temu potrdite.`
        : null,
    };
  }

  function showVerifying(token) {
    openSheet(`
      ${sheetHeader("Preverjanje rezervacije")}
      <div class="verifying">
        <span class="verifying-spinner" aria-hidden="true"></span>
        <p>Preverjamo kodo <strong>${escapeHtml(token.trim().toUpperCase())}</strong> ...</p>
      </div>
    `);

    setTimeout(() => showResult(verifyToken(token)), SIMULATED_DELAY);
  }

  function showResult(result) {
    if (result.ok) {
      const { reservation } = result;

      openSheet(`
        ${sheetHeader("Preverjanje rezervacije")}

        <div class="result result--success">
          <span class="result-icon">${icon("check")}</span>
          <p class="result-title">Rezervacija je veljavna</p>
          <p class="result-text">Izročite izdelke in prejmite plačilo, nato potrdite prevzem.</p>
        </div>

        ${result.warning ? `<div class="notice notice--warning">${icon("clock")}<span>${result.warning}</span></div>` : ""}

        ${detailList(reservation)}

        <div class="sheet-actions">
          <button type="button" class="btn btn-primary btn-full" data-action="confirm" data-id="${reservation.id}" data-autofocus>
            ${icon("check")} Potrdi prevzem
          </button>
          <button type="button" class="btn btn-secondary btn-full" data-action="close">Prekliči</button>
        </div>
      `);
      return;
    }

    openSheet(`
      ${sheetHeader("Preverjanje rezervacije")}

      <div class="result result--error">
        <span class="result-icon">${icon("alert")}</span>
        <p class="result-title">${result.title}</p>
        <p class="result-text">${result.message}</p>
      </div>

      ${result.reservation ? detailList(result.reservation, { showStatus: true }) : ""}

      <div class="sheet-actions">
        <button type="button" class="btn btn-primary btn-full" data-action="scan" data-autofocus>Skeniraj znova</button>
        <button type="button" class="btn btn-secondary btn-full" data-action="close">Zapri</button>
      </div>
    `);
  }

  /* Pogled: potrditev */

  function confirmPickup(button) {
    const reservationId = Number(button.dataset.id);

    button.disabled = true;
    button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Potrjevanje ...';

    setTimeout(() => {
      // V končni različici zaledni sistem ponovno preveri status, preden ga spremeni.
      const pickedUpAt = provider.completeReservation(reservationId);

      loadReservations();
      render();

      const reservation = state.reservations.find((item) => item.id === reservationId);

      openSheet(`
        ${sheetHeader("Prevzem potrjen")}

        <div class="result result--success result--large">
          <span class="result-icon">${icon("check")}</span>
          <p class="result-title">Prevzem je potrjen</p>
          <p class="result-text">
            ${escapeHtml(reservation.customerName)} je prevzel/-a
            ${reservation.quantity}× ${escapeHtml(reservation.offer.title)}
            ob ${provider.formatTime(pickedUpAt)}.
          </p>
          ${provider.statusChip("COMPLETED")}
        </div>

        <div class="sheet-actions">
          <button type="button" class="btn btn-primary btn-full" data-action="scan" data-autofocus>
            ${icon("qr")} Skeniraj naslednjo
          </button>
          <button type="button" class="btn btn-secondary btn-full" data-action="close">Končaj</button>
        </div>
      `);
    }, SIMULATED_DELAY);
  }

  /* Pogled: podrobnosti iz seznama */

  function showDetails(reservationId) {
    const reservation = state.reservations.find((item) => item.id === reservationId);

    if (!reservation) {
      provider.showToast("Rezervacije ni mogoče najti.");
      return;
    }

    const actions =
      reservation.status === "CONFIRMED"
        ? `
          <p class="text-caption sheet-note">Prevzem potrdite s skeniranjem kupčeve QR-kode.</p>
          <div class="sheet-actions">
            <button type="button" class="btn btn-primary btn-full" data-action="scan" data-autofocus>
              ${icon("qr")} Skeniraj QR-kodo
            </button>
            <button type="button" class="btn btn-secondary btn-full" data-action="close">Zapri</button>
          </div>
        `
        : `
          <div class="sheet-actions">
            <button type="button" class="btn btn-secondary btn-full" data-action="close" data-autofocus>Zapri</button>
          </div>
        `;

    openSheet(`
      ${sheetHeader("Podrobnosti rezervacije")}
      ${detailList(reservation, { showStatus: true })}
      ${actions}
    `);
  }

  /* Dogodki */

  function handleAction(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const { action } = target.dataset;

    if (action === "scan") showScanner();
    if (action === "close") closeSheet();
    if (action === "verify") showVerifying(target.dataset.token);
    if (action === "confirm") confirmPickup(target);
    if (action === "details") showDetails(Number(target.dataset.id));
  }

  function handleManualCode(event) {
    if (event.target.id !== "manualCodeForm") return;

    event.preventDefault();

    const input = document.getElementById("manualCodeInput");
    const error = document.getElementById("manualCodeError");
    const value = input.value.trim();

    if (!value) {
      error.textContent = "Vnesite kodo rezervacije.";
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    showVerifying(value);
  }

  function initIcons() {
    document.getElementById("scanCtaIcon").innerHTML = icon("qr");
    document.getElementById("scanCtaArrow").innerHTML = icon("chevronRight");
    document.getElementById("searchIcon").innerHTML = icon("search");
  }

  function init() {
    initIcons();

    if (!state.business) {
      document.querySelector(".page-content").innerHTML = `
        <div class="empty-state">
          <span class="icon-tile">${icon("store")}</span>
          <p class="empty-state-title">Nimate profila podjetja</p>
          <p class="empty-state-text">Za potrjevanje prevzemov najprej ustvarite profil podjetja.</p>
        </div>
      `;
      return;
    }

    elements.headerBusinessName.textContent = state.business.name;

    loadReservations();
    render();

    document.querySelector(".phone-frame").addEventListener("click", handleAction);
    elements.sheetPanel.addEventListener("submit", handleManualCode);

    elements.statusTabs.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-filter]");
      if (!tab) return;

      state.filter = tab.dataset.filter;
      render();
    });

    elements.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      renderList();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.sheet.hidden) closeSheet();
    });

    // Neposreden vstop s pregleda: ?scan=1 ali ?reservation=ID
    const params = new URLSearchParams(window.location.search);

    if (params.get("scan") === "1") {
      showScanner();
    } else if (params.get("reservation")) {
      showDetails(Number(params.get("reservation")));
    }
  }

  init();
})();