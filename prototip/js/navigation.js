/* BigDeal – skupna navigacija UX prototipa */

(function () {
  "use strict";

  const STORAGE_KEY = "bigdeal-prototype-mode";

  const icons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
    ticket: '<path d="M2 9a3 3 0 0 0 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 0 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2m0 4v2m0 4v2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-8.2-8.2V3h9.4l8.8 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm7 0v4h-4m0 3h4"/>',
    store: '<path d="M3 10h18l-2-7H5z"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/>',
  };


const routes = {
  buyer: [
    {
      id: "home",
      label: "Domov",
      icon: "home",
      path: "buyer/home/index.html",
    },
    {
      id: "map",
      label: "Zemljevid",
      icon: "map",
      path: "buyer/map/index.html",
    },
    {
      id: "reservations",
      label: "Rezervacije",
      icon: "ticket",
      path: "buyer/reservation/index.html",
    },
    {
      id: "profile",
      label: "Profil",
      icon: "user",
      path: "buyer/profile/index.html",
    },
  ],

  provider: [
    {
      id: "dashboard",
      label: "Pregled",
      icon: "dashboard",
      path: "provider/dashboard/index.html",
    },
    {
      id: "offers",
      label: "Ponudbe",
      icon: "tag",
      path: "provider/offers/index.html",
    },
    {
      id: "pickups",
      label: "Prevzemi",
      icon: "qr",
      path: "provider/pickups/index.html",
    },
    {
      id: "business",
      label: "Podjetje",
      icon: "store",
      path: "provider/business/index.html",
    },
  ],
};


  // Osnovno pot prototipa določimo glede na lokacijo skripte.
  const scriptUrl = new URL(document.currentScript.src);
  const prototypeRoot = new URL("../", scriptUrl);

  function urlFor(path) {
    return new URL(`pages/${path}`, prototypeRoot).href;
  }

  function getMode() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "provider"
        ? "provider"
        : "buyer";
    } catch {
      return "buyer";
    }
  }

  function setMode(mode) {
    if (mode !== "buyer" && mode !== "provider") return;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Lokalna shramba v prototipu ni obvezna.
    }

    const destination =
      mode === "provider" ? "provider/dashboard/" : "buyer/home/";

    window.location.href = urlFor(destination);
  }

  function svgIcon(name) {
    return `
      <svg viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.9"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        ${icons[name] || icons.home}
      </svg>
    `;
  }

  function renderBottomNav() {
    const nav = document.querySelector("[data-bottom-nav]");

    if (!nav) return;

    const mode = nav.dataset.mode || getMode();
    const active = nav.dataset.active || "";

    if (!routes[mode]) return;

    nav.classList.add("bottom-nav");
    nav.setAttribute(
      "aria-label",
      mode === "buyer" ? "Navigacija kupca" : "Navigacija ponudnika"
    );

    nav.innerHTML = routes[mode]
      .map((item) => {
        const isActive = item.id === active;

        return `
          <a
            href="${urlFor(item.path)}"
            class="bottom-nav-item${isActive ? " active" : ""}"
            ${isActive ? 'aria-current="page"' : ""}
          >
            <span class="bottom-nav-icon">
              ${svgIcon(item.icon)}
            </span>
            <span class="bottom-nav-label">${item.label}</span>
          </a>
        `;
      })
      .join("");
  }

  function initModeSwitches() {
    document.querySelectorAll("[data-switch-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        setMode(button.dataset.switchMode);
      });
    });
  }

  function initNavigation() {
    renderBottomNav();
    initModeSwitches();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }

  window.BigDealNavigation = {
    getMode,
    setMode,
    urlFor,
  };
})();
