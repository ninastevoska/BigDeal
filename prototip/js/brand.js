/* BigDeal – skupna komponenta logotipa */

(function () {
  "use strict";

  function renderBrand() {
    document.querySelectorAll("[data-bigdeal-brand]").forEach((element) => {
      const small = element.dataset.bigdealBrand === "small";
      const showTagline = element.dataset.tagline !== "false";

      element.classList.add("bigdeal-brand");

      if (small) {
        element.classList.add("bigdeal-brand--small");
      }

      element.innerHTML = `
        <div class="bigdeal-logo" role="img" aria-label="BigDeal">
          <span class="bigdeal-logo-big">big</span>
          <span class="bigdeal-logo-deal">deal</span>
          <span class="bigdeal-logo-dot">.</span>
        </div>
        ${showTagline ? `
        ` : ""}
      `;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBrand);
  } else {
    renderBrand();
  }
})();
