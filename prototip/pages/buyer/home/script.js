/* BigDeal – logika kupčevega domačega zaslona */

(function () {
  "use strict";

  const searchInput = document.getElementById("offer-search");
  const categoryList = document.getElementById("category-list");
  const offerList = document.getElementById("offer-list");
  const offerCount = document.getElementById("offer-count");
  const message = document.getElementById("offers-message");

  let offers = [];
  let businesses = [];
  let categories = [];
  let selectedCategory = null;

  const categoryIcons = {
    1: "🥐",
    2: "👗",
    3: "💻",
    4: "🧴",
    5: "🏠",
    6: "⚽",
    7: "📚",
    8: "✨",
  };

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
    if (value === null || value === undefined) {
      return "";
    }

    return new Intl.NumberFormat("sl-SI", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  function getBusiness(id) {
    return businesses.find((business) => business.id === id);
  }

  function getCategoryIcon(categoryId) {
    return categoryIcons[categoryId] || "🛍️";
  }

  /* Pretvorba relativne poti slike v lokalni URL */

  function getImageUrl(imageUrl) {
    if (!imageUrl) {
      return null;
    }

    // imageUrl je pot glede na koren prototipa.
    const prototypeRoot = new URL("../../../", window.location.href);

    return new URL(imageUrl, prototypeRoot).href;
  }

  /* Kategorije */

  function renderCategories() {
    const allCategories = [
      { id: null, name: "Vse", icon: "✨" },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: getCategoryIcon(category.id),
      })),
    ];

    categoryList.innerHTML = allCategories.map((category) => {
      const active = selectedCategory === category.id;

      return `
        <button
          type="button"
          class="category-button${active ? " active" : ""}"
          data-category="${category.id ?? "all"}"
          aria-pressed="${active}"
        >
          <span class="category-icon">${category.icon}</span>
          <span class="category-label">
            ${escapeHtml(category.name)}
          </span>
        </button>
      `;
    }).join("");
  }

  /* Fotografija posamezne ponudbe */

  function renderOfferImage(offer) {
    const imageUrl = getImageUrl(offer.imageUrl);

    if (!imageUrl) {
      return `
        <div class="offer-image-placeholder">
          <span>${getCategoryIcon(offer.categoryId)}</span>
        </div>
      `;
    }

    return `
      <img
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(offer.title)}"
        loading="lazy"
      >
    `;
  }

  /* Kartica ponudbe */

  function renderOffer(offer) {
    const business = getBusiness(offer.businessId);
    const businessName = business?.name || "Lokalni ponudnik";
    const reservable = offer.type === "RESERVABLE";

    const discount = offer.discountPercentage != null
      ? Number(offer.discountPercentage)
      : null;

    const hasPrice = offer.discountedPrice != null;
    const hasOriginalPrice = offer.originalPrice != null;

    const priceMarkup = hasPrice
      ? `
        <div class="offer-card-prices">
          <span class="offer-card-price">
            ${formatPrice(offer.discountedPrice)}
          </span>

          ${hasOriginalPrice ? `
            <span class="offer-card-original-price">
              ${formatPrice(offer.originalPrice)}
            </span>
          ` : ""}
        </div>
      `
      : "";

    return `
      <a
        class="offer-card"
        href="../offer-details/index.html?id=${encodeURIComponent(offer.id)}"
      >
        <div class="offer-card-image">

          ${renderOfferImage(offer)}

          <span class="offer-card-badge${
            reservable ? "" : " offer-card-badge--promotion"
          }">
            ${reservable ? "Rezervacija" : "Promocija"}
          </span>

        </div>

        <div class="offer-card-content">

          <h3 class="offer-card-title">
            ${escapeHtml(offer.title)}
          </h3>

          <p class="offer-card-business">
            ${escapeHtml(businessName)}
          </p>

          ${priceMarkup}

          ${discount !== null ? `
            <span class="offer-card-discount">
              −${discount} %
            </span>
          ` : ""}

        </div>
      </a>
    `;
  }

  /* Iskanje in filtriranje */

  function renderOffers() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredOffers = offers.filter((offer) => {
      const business = getBusiness(offer.businessId);
      const category = categories.find(
        (item) => item.id === offer.categoryId
      );

      const matchesCategory = selectedCategory === null
        || offer.categoryId === selectedCategory;

      const searchableText = [
        offer.title,
        offer.description,
        business?.name,
        category?.name,
      ].join(" ").toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });

    offerCount.textContent = `${filteredOffers.length} ponudb`;

    offerList.innerHTML = filteredOffers
      .map(renderOffer)
      .join("");

    message.textContent = filteredOffers.length === 0
      ? "Ni ponudb, ki ustrezajo tvojemu iskanju."
      : "";
  }

  /* Inicializacija skupnih testnih podatkov */

  function initialize() {
    const data = window.BigDealMockData;

    if (!data) {
      message.textContent = "Testni podatki niso na voljo.";
      return;
    }

    offers = data.offers.filter(
      (offer) => offer.status === "ACTIVE"
    );

    businesses = data.businesses;
    categories = data.categories;

    renderCategories();
    renderOffers();
  }

  /* Dogodki */

  categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");

    if (!button) {
      return;
    }

    const id = button.dataset.category;

    selectedCategory = id === "all" ? null : Number(id);

    renderCategories();
    renderOffers();
  });

  searchInput.addEventListener("input", renderOffers);

  document.getElementById("explore-button")
    .addEventListener("click", () => {
      document.getElementById("offers-section")
        .scrollIntoView({ behavior: "smooth" });
    });

  initialize();
})();
