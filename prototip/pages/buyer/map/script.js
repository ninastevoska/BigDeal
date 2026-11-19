
/* BigDeal – interaktivni zemljevid lokalnih ponudb */

(function () {
  "use strict";

  const data = window.BigDealMockData;

  const listElement = document.getElementById("map-offers-list");
  const messageElement = document.getElementById("map-message");
  const mapCount = document.getElementById("map-count");
  const resultsCount = document.getElementById("results-count");
  const mapElement = document.getElementById("offers-map");

  const CITY = "Maribor";
  const MAP_CENTER = [46.5547, 15.6459];

  // Demonstracijske lokacije podjetij v Mariboru.
  // To niso dejanski naslovi ali preverjene koordinate trgovin.
  const BUSINESS_BASE_LOCATIONS = {
    1: [46.5598, 15.6456], // Lokalna tržnica
    2: [46.5502, 15.6525], // Urban Style
  };

  // Vizualni zamiki oznak ponudb istega ponudnika.
  // Oznake zato ne predstavljajo natančnih lokacij izdelkov.
  const OFFER_OFFSETS = [
    [0, 0],
    [0.0009, 0.0007],
    [-0.0008, 0.0006],
    [0.0008, -0.0007],
    [-0.0007, -0.0008],
  ];

  let selectedType = "ALL";
  let map = null;
  let markersLayer = null;
  let highlightTimeout = null;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("sl-SI", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  function getImageUrl(path) {
    if (!path || typeof path !== "string") {
      return null;
    }

    // Pot do slike je relativna glede na mapo prototip/.
    const prototypeRoot = new URL("../../../", window.location.href);

    return new URL(path, prototypeRoot).href;
  }

  function getBusiness(id) {
    return data.businesses.find(
      (business) => business.id === id
    );
  }

  function getCityBusinesses() {
    return data.businesses.filter((business) =>
      business.address
        ?.toLowerCase()
        .includes(CITY.toLowerCase())
    );
  }

  function getVisibleOffers() {
    const cityBusinessIds = new Set(
      getCityBusinesses().map((business) => business.id)
    );

    return data.offers.filter((offer) => {
      const isActive = offer.status === "ACTIVE";
      const isInCity = cityBusinessIds.has(offer.businessId);

      const matchesType =
        selectedType === "ALL" ||
        offer.type === selectedType;

      return isActive && isInCity && matchesType;
    });
  }

  function getOfferTypeLabel(type) {
    return type === "RESERVABLE"
      ? "Rezervacija"
      : "Promocija";
  }

  function getOfferPosition(offer, indexWithinBusiness) {
    const base =
      BUSINESS_BASE_LOCATIONS[offer.businessId] || MAP_CENTER;

    const offset = OFFER_OFFSETS[
      indexWithinBusiness % OFFER_OFFSETS.length
    ];

    return [
      base[0] + offset[0],
      base[1] + offset[1],
    ];
  }

  /* Kartice ponudb */

  function createOfferCard(offer) {
    const business = getBusiness(offer.businessId);
    const imageUrl = getImageUrl(offer.imageUrl);

    const imageMarkup = imageUrl
      ? `
        <img
          src="${escapeHtml(imageUrl)}"
          alt="${escapeHtml(offer.title)}"
          loading="lazy"
        >
      `
      : `
        <div class="map-offer-placeholder">
          BigDeal
        </div>
      `;

    const priceMarkup = offer.discountedPrice != null
      ? `
        <span class="map-offer-price">
          ${formatPrice(offer.discountedPrice)}
        </span>
      `
      : "";

    const discountMarkup = offer.discountPercentage != null
      ? `
        <span class="map-offer-discount">
          −${Number(offer.discountPercentage)} %
        </span>
      `
      : "";

    return `
      <a
        class="map-offer"
        data-offer-id="${escapeHtml(offer.id)}"
        href="../offer-details/index.html?id=${encodeURIComponent(offer.id)}"
      >
        ${imageMarkup}

        <div class="map-offer-content">
          <span class="map-offer-type">
            ${getOfferTypeLabel(offer.type)}
          </span>

          <h3 class="map-offer-title">
            ${escapeHtml(offer.title)}
          </h3>

          <p class="map-offer-business">
            ${escapeHtml(business?.name || "Lokalni ponudnik")}
          </p>

          ${priceMarkup}
          ${discountMarkup}
        </div>
      </a>
    `;
  }

  /* Ikone oznak na zemljevidu */

  function createOfferMarkerIcon(type) {
    const isReservable = type === "RESERVABLE";

    const className = isReservable
      ? "offer-marker--reservable"
      : "offer-marker--promotion";

    const label = isReservable ? "R" : "A";

    return L.divIcon({
      className: "bigdeal-offer-marker-wrapper",
      html: `
        <div class="offer-marker ${className}">
          ${label}
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -20],
    });
  }

  /* Poudarjanje kartice ob izbiri oznake */

  function highlightOfferCard(offerId) {
    const card = Array.from(
      listElement.querySelectorAll("[data-offer-id]")
    ).find(
      (element) => element.dataset.offerId === String(offerId)
    );

    if (!card) {
      return;
    }

    if (highlightTimeout !== null) {
      clearTimeout(highlightTimeout);
    }

    listElement.querySelectorAll(".map-offer").forEach(
      (element) => element.classList.remove("is-highlighted")
    );

    card.classList.add("is-highlighted");

    card.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    highlightTimeout = setTimeout(() => {
      card.classList.remove("is-highlighted");
      highlightTimeout = null;
    }, 1800);
  }

  /* Posamezne oznake vseh vidnih ponudb */

  function renderMarkers(offers) {
    if (!map || !markersLayer) {
      return;
    }

    markersLayer.clearLayers();

    // Vsaka ponudba ima svojo stabilno pozicijo,
    // ne glede na trenutno izbrani filter.
    const allCityOffers = data.offers.filter((offer) => {
      const business = getBusiness(offer.businessId);

      return (
        offer.status === "ACTIVE" &&
        business?.address
          ?.toLowerCase()
          .includes(CITY.toLowerCase())
      );
    });

    const offerPositions = new Map();
    const businessCounters = new Map();

    allCityOffers.forEach((offer) => {
      const index = businessCounters.get(offer.businessId) || 0;

      businessCounters.set(offer.businessId, index + 1);

      offerPositions.set(
        offer.id,
        getOfferPosition(offer, index)
      );
    });

    offers.forEach((offer) => {
      const business = getBusiness(offer.businessId);
      const position = offerPositions.get(offer.id);

      if (!position) {
        return;
      }

      const marker = L.marker(position, {
        icon: createOfferMarkerIcon(offer.type),
        title: offer.title,
        alt: offer.title,
      });

      const priceText = offer.discountedPrice != null
        ? `<strong>${formatPrice(offer.discountedPrice)}</strong><br>`
        : "";

      const discountText = offer.discountPercentage != null
        ? `<span>Popust: −${Number(offer.discountPercentage)} %</span>`
        : "";

      marker.bindPopup(`
        <div class="bigdeal-map-popup">
          <strong>${escapeHtml(offer.title)}</strong>
          <div>${escapeHtml(business?.name || "Ponudnik")}</div>
          <div>${getOfferTypeLabel(offer.type)}</div>
          ${priceText}
          ${discountText}
          <div><small>Demonstracijska lokacija</small></div>
        </div>
      `);

      marker.on("click", () => {
        highlightOfferCard(offer.id);
      });

      markersLayer.addLayer(marker);
    });
  }

  /* Prikaz seznama in zemljevida */

  function renderOffers() {
    const visibleOffers = getVisibleOffers();

    listElement.innerHTML = visibleOffers
      .map(createOfferCard)
      .join("");

    const count = visibleOffers.length;

    resultsCount.textContent = `${count} ponudb`;
    mapCount.textContent = `${count} lokalnih ponudb`;

    messageElement.textContent = count === 0
      ? "Za izbrani filter trenutno ni ponudb."
      : "";

    renderMarkers(visibleOffers);
  }

  /* Inicializacija zemljevida */

  function initializeMap() {
    if (typeof L === "undefined") {
      mapElement.innerHTML = `
        <p style="padding:20px;text-align:center">
          Za prikaz zemljevida je potrebna internetna povezava.
        </p>
      `;

      return;
    }

    map = L.map("offers-map", {
      zoomControl: false,
    }).setView(MAP_CENTER, 13);

    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);

    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  /* Filtriranje rezervacij in promocij */

  function initializeFilters() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextType = button.dataset.filter;

        if (!["ALL", "RESERVABLE", "PROMOTION"].includes(nextType)) {
          return;
        }

        selectedType = nextType;

        document.querySelectorAll("[data-filter]").forEach((item) => {
          const isActive = item === button;

          item.classList.toggle("active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        renderOffers();
      });
    });
  }

  /* Zagon strani */

  function initialize() {
    if (!data || !Array.isArray(data.offers) ||
        !Array.isArray(data.businesses)) {
      mapCount.textContent = "Ni podatkov";
      messageElement.textContent =
        "Skupni testni podatki niso na voljo.";

      return;
    }

    initializeMap();
    initializeFilters();
    renderOffers();
  }

  initialize();
})();
