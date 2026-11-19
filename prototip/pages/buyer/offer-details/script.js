
// Pridobimo ID ponudbe iz URL-ja.
const params = new URLSearchParams(window.location.search);
const offerId = Number(params.get("id"));

const { offers, businesses, categories } = window.BigDealMockData;

// Poiščemo izbrano ponudbo.
const offer = getOfferWithStock(offerId);


// Oblikovanje cene v evrih.
function formatPrice(price) {
    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR"
    }).format(price);
}


// Prikaz podatkov o ponudbi.
function displayOffer(offer) {

    document.getElementById("offer-title").textContent =
        offer.title;

    document.getElementById("offer-description").textContent =
        offer.description;

    document.getElementById("offer-discount").textContent =
        `-${offer.discountPercentage} %`;

    const status = document.getElementById("offer-status");
    const isActive = offer.status === "ACTIVE";

    status.textContent = isActive ? "Aktivna" : "Neaktivna";
    status.classList.toggle("badge-success", isActive);

    displayCategory(offer);
    displayBusiness(offer);
    displayImage(offer);
    displayPrices(offer);
    displayValidity(offer);
    displayReservationOptions(offer);

    document.getElementById("offer-content").hidden = false;
    document.getElementById("offer-footer").hidden = false;
}
// Prikaz obdobja veljavnosti ponudbe.
function displayValidity(offer) {

    const section = document.getElementById("validity-section");

    // Če datuma nista določena, razdelka ne prikažemo.
    if (!offer.startDate || !offer.endDate) {
        section.hidden = true;
        return;
    }

    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    document.getElementById("offer-valid-from").textContent =
        `Velja od: ${startDate.toLocaleDateString("sl-SI")}`;

    document.getElementById("offer-valid-to").textContent =
        `Velja do: ${endDate.toLocaleDateString("sl-SI")}`;

    section.hidden = false;
}

// Prikaz kategorije.
function displayCategory(offer) {

    const category = categories.find(
        item => item.id === offer.categoryId
    );

    document.getElementById("offer-category").textContent =
        category ? category.name : "Drugo";
}


// Prikaz podatkov o ponudniku.
function displayBusiness(offer) {

    const business = businesses.find(
        item => item.id === offer.businessId
    );

    if (!business) {
        document.getElementById("business-name").textContent =
            "Ponudnik ni znan";

        return;
    }

    document.getElementById("business-name").textContent =
        business.name;

    document.getElementById("business-type").textContent =
        business.businessType;

    document.getElementById("business-address").textContent =
        business.address;
}


// Prikaz fotografije, če obstaja.
function displayImage(offer) {

    const image = document.getElementById("offer-image");
    const placeholder = document.getElementById("image-placeholder");

    if (offer.imageUrl) {

        image.addEventListener("error", () => {
            image.hidden = true;
            placeholder.hidden = false;
        });

        image.alt = offer.title;
        image.hidden = false;
        placeholder.hidden = true;
        image.src = new URL(offer.imageUrl, new URL("../../../", window.location.href)).href;
    }
}


// Prikaz cen in prihranka.
function displayPrices(offer) {

    const discountedPrice =
        document.getElementById("discounted-price");

    const originalPrice =
        document.getElementById("original-price");

    const saving =
        document.getElementById("offer-saving");

    if (offer.discountedPrice !== null) {

        discountedPrice.textContent =
            formatPrice(offer.discountedPrice);

    } else {

        discountedPrice.textContent =
            `${offer.discountPercentage} % popusta`;
    }

    if (offer.originalPrice !== null) {

        originalPrice.textContent =
            formatPrice(offer.originalPrice);
    }

    if (offer.originalPrice !== null &&
        offer.discountedPrice !== null) {

        const amountSaved =
            offer.originalPrice - offer.discountedPrice;

        saving.textContent =
            `Prihraniš ${formatPrice(amountSaved)}`;
    }
}


// Prikaz možnosti glede na vrsto ponudbe.
function displayReservationOptions(offer) {

    const reserveButton =
        document.getElementById("reserve-button");

    const availabilitySection =
        document.getElementById("availability-section");

    const paymentInfo =
        document.getElementById("payment-info");

    const promotionInfo =
        document.getElementById("promotion-info");

    const unavailableInfo =
        document.getElementById("unavailable-info");

    if (offer.type === "RESERVABLE") {

        document.getElementById("offer-quantity").textContent =
            `Na voljo še ${offer.quantity} izdelkov`;

        const canReserve =
            offer.status === "ACTIVE" && offer.quantity > 0;

        reserveButton.disabled = !canReserve;
        paymentInfo.hidden = !canReserve;
        unavailableInfo.hidden = canReserve;

        reserveButton.addEventListener("click", () => {

            window.location.href =
                `../reservation/index.html?id=${offer.id}`;

        });

    } else {

        reserveButton.hidden = true;
        availabilitySection.hidden = true;
        paymentInfo.hidden = true;
        promotionInfo.hidden = false;
    }
}


// Začetni prikaz strani.
if (offer) {

    displayOffer(offer);

} else {

    document.getElementById("error-message").hidden = false;
}
