/* BigDeal – ponudnikov pregled */

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

  const elements = {
    businessIcon: document.getElementById("businessIcon"),
    businessName: document.getElementById("businessName"),
    businessType: document.getElementById("businessType"),
    businessChevron: document.getElementById("businessChevron"),
    businessSelect: document.getElementById("businessSelect"),
    heroTitle: document.getElementById("heroTitle"),
    heroText: document.getElementById("heroText"),
    statGrid: document.getElementById("statGrid"),
    todayPickups: document.getElementById("todayPickups"),
    offerStockList: document.getElementById("offerStockList"),
  };

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 10) return "Dobro jutro";
    if (hour < 18) return "Dober dan";
    return "Dober večer";
  }

  /* Izbira podjetja */

  function renderBusinessSwitch(activeBusiness) {
    const ownedBusinesses = provider.getOwnedBusinesses();
    const hasChoice = ownedBusinesses.length > 1;

    elements.businessIcon.innerHTML = icon("store");
    elements.businessName.textContent = activeBusiness.name;
    elements.businessType.textContent = activeBusiness.businessType;
    elements.businessChevron.innerHTML = hasChoice ? icon("chevronDown") : "";

    elements.businessSelect.disabled = !hasChoice;
    elements.businessSelect.innerHTML = ownedBusinesses
      .map(
        (business) => `
          <option value="${business.id}" ${business.id === activeBusiness.id ? "selected" : ""}>
            ${escapeHtml(business.name)}
          </option>
        `
      )
      .join("");
  }

  /* Pozdrav */

  function renderHero(todayWaiting) {
    const count = todayWaiting.length;
    const userName = provider.currentUser.name || "";

    elements.heroTitle.textContent = `${getGreeting()}, ${userName}`;
    elements.heroText.textContent =
      count > 0
        ? `Danes vas čaka še ${count} ${provider.pluralize(count, [
            "prevzem",
            "prevzema",
            "prevzemi",
            "prevzemov",
          ])}.`
        : "Danes ni več načrtovanih prevzemov. Objavite novo ponudbo in privabite kupce.";
  }

  /* Ključni podatki */

  function renderStats(offers, reservations, todayWaiting) {
    const activeOffers = offers.filter((offer) => offer.status === "ACTIVE").length;
    const activeReservations = reservations.filter(
      (reservation) => reservation.status === "CONFIRMED"
    ).length;
    const completed = reservations.filter((reservation) => reservation.status === "COMPLETED");

    const soldItems = completed.reduce((sum, reservation) => sum + reservation.quantity, 0);
    const customerSavings = completed.reduce(
      (sum, reservation) =>
        sum +
        (reservation.originalPriceAtReservation - reservation.discountedPriceAtReservation) *
          reservation.quantity,
      0
    );

    const stats = [
      { label: "Aktivne ponudbe", value: activeOffers, iconName: "tag" },
      { label: "Prevzemi danes", value: todayWaiting.length, iconName: "clock", highlight: true },
      { label: "Odprte rezervacije", value: activeReservations, iconName: "ticket" },
      { label: "Prevzeto", value: completed.length, iconName: "check" },
    ];

    elements.statGrid.innerHTML = `
      ${stats
        .map(
          (stat) => `
            <div class="stat-card${stat.highlight ? " stat-card--highlight" : ""}">
              <span class="stat-icon">${icon(stat.iconName)}</span>
              <span class="stat-value">${stat.value}</span>
              <span class="stat-label">${stat.label}</span>
            </div>
          `
        )
        .join("")}

      <div class="stat-card stat-card--wide">
        <span class="icon-tile icon-tile--accent">${icon("piggy")}</span>
        <div class="stat-wide-text">
          <span class="stat-label">Rešenih izdelkov in prihranek kupcev</span>
          <span class="stat-wide-value">
            ${soldItems} ${provider.pluralize(soldItems, ["izdelek", "izdelka", "izdelki", "izdelkov"])}
            · ${provider.formatPrice(customerSavings)}
          </span>
        </div>
      </div>
    `;
  }

  /* Današnji prevzemi */

  function renderTodayPickups(todayWaiting) {
    if (todayWaiting.length === 0) {
      elements.todayPickups.innerHTML = `
        <div class="empty-state">
          <span class="icon-tile">${icon("clock")}</span>
          <p class="empty-state-title">Ni prevzemov za danes</p>
          <p class="empty-state-text">Ko kupci rezervirajo izdelke s prevzemom danes, se prikažejo tukaj.</p>
        </div>
      `;
      return;
    }

    const now = Date.now();

    elements.todayPickups.innerHTML = todayWaiting
      .slice(0, 4)
      .map((reservation) => {
        const isNow =
          new Date(reservation.pickupStart).getTime() <= now &&
          new Date(reservation.pickupEnd).getTime() >= now;

        return `
          <a class="pickup-row card" href="../pickups/index.html?reservation=${reservation.id}">
            <span class="pickup-time${isNow ? " pickup-time--now" : ""}">
              <strong>${provider.formatTime(reservation.pickupStart)}</strong>
              <span>${provider.formatTime(reservation.pickupEnd)}</span>
            </span>

            <span class="pickup-info">
              <span class="pickup-customer">${escapeHtml(reservation.customerName)}</span>
              <span class="pickup-offer">
                ${reservation.quantity} × ${escapeHtml(reservation.offer.title)}
              </span>
            </span>

            ${isNow ? '<span class="status-chip status-chip--waiting">Zdaj</span>' : ""}
            <span class="pickup-chevron">${icon("chevronRight")}</span>
          </a>
        `;
      })
      .join("");
  }

  /* Stanje ponudb */

  function renderOfferStock(offers, reservations) {
    if (offers.length === 0) {
      elements.offerStockList.innerHTML = `
        <div class="empty-state empty-state--flat">
          <span class="icon-tile">${icon("tag")}</span>
          <p class="empty-state-title">Še nimate ponudb</p>
          <p class="empty-state-text">Objavite prvo promocijsko ali rezervacijsko ponudbo.</p>
          <a class="btn btn-primary btn-compact" href="../create-offer/index.html">Nova ponudba</a>
        </div>
      `;
      return;
    }

    // Rezervacijske ponudbe prikažemo prve, ker zanje ponudnik spremlja zalogo.
    const sortedOffers = [...offers].sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === "RESERVABLE" ? -1 : 1;
    });

    elements.offerStockList.innerHTML = sortedOffers
      .slice(0, 4)
      .map((offer) => {
        const categoryName = provider.getCategoryName(offer.categoryId);

        if (offer.type === "PROMOTION") {
          return `
            <div class="offer-stock-item">
              ${provider.offerThumb(offer)}
              <div class="offer-stock-body">
                <div class="offer-stock-top">
                  <span class="offer-stock-title">${escapeHtml(offer.title)}</span>
                  <span class="offer-type-label">Promocija</span>
                </div>
                <span class="text-caption">${escapeHtml(categoryName)} · ${offer.discountPercentage} % popusta</span>
              </div>
            </div>
          `;
        }

        const reserved = reservations
          .filter(
            (reservation) =>
              reservation.offerId === offer.id &&
              (reservation.status === "CONFIRMED" || reservation.status === "COMPLETED")
          )
          .reduce((sum, reservation) => sum + reservation.quantity, 0);

        const total = reserved + (offer.quantity || 0);
        const percentage = total > 0 ? Math.round((reserved / total) * 100) : 0;

        return `
          <div class="offer-stock-item">
            ${provider.offerThumb(offer)}
            <div class="offer-stock-body">
              <div class="offer-stock-top">
                <span class="offer-stock-title">${escapeHtml(offer.title)}</span>
                <span class="offer-stock-price">${provider.formatPrice(offer.discountedPrice)}</span>
              </div>

              <div
                class="stock-bar"
                role="progressbar"
                aria-label="Rezervirano"
                aria-valuemin="0"
                aria-valuemax="${total}"
                aria-valuenow="${reserved}"
              >
                <span class="stock-bar-fill" style="width: ${percentage}%"></span>
              </div>

              <span class="text-caption">
                Rezervirano ${reserved} od ${total} · na voljo še ${offer.quantity}
              </span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  /* Celoten zaslon */

  function render() {
    const activeBusiness = provider.getActiveBusiness();

    if (!activeBusiness) {
      document.querySelector(".page-content").innerHTML = `
        <div class="empty-state">
          <span class="icon-tile">${icon("store")}</span>
          <p class="empty-state-title">Nimate profila podjetja</p>
          <p class="empty-state-text">Za uporabo ponudnikovega načina najprej ustvarite profil podjetja.</p>
        </div>
      `;
      return;
    }

    const offers = provider.getOffers(activeBusiness.id);
    const reservations = provider.getReservations(activeBusiness.id);

    const todayWaiting = reservations
      .filter(
        (reservation) =>
          reservation.status === "CONFIRMED" && provider.isToday(reservation.pickupStart)
      )
      .sort((a, b) => new Date(a.pickupStart) - new Date(b.pickupStart));

    renderBusinessSwitch(activeBusiness);
    renderHero(todayWaiting);
    renderStats(offers, reservations, todayWaiting);
    renderTodayPickups(todayWaiting);
    renderOfferStock(offers, reservations);
  }

  function init() {
    document.getElementById("newOfferIcon").innerHTML = icon("plus");
    document.getElementById("scanIcon").innerHTML = icon("qr");
    document.getElementById("allPickupsLink").insertAdjacentHTML("beforeend", icon("chevronRight"));
    document.getElementById("allOffersLink").insertAdjacentHTML("beforeend", icon("chevronRight"));

    elements.businessSelect.addEventListener("change", (event) => {
      provider.setActiveBusiness(Number(event.target.value));
      render();
      provider.showToast(`Aktivno podjetje: ${elements.businessName.textContent}`);
    });

    document.getElementById("notificationsButton").addEventListener("click", () => {
      provider.showToast("Obvestila bodo na voljo v naslednji različici prototipa.");
    });

    render();
  }

  init();
})();