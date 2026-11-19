
// Pridobimo ID ponudbe iz URL-ja.
const params = new URLSearchParams(window.location.search);
const offerId = Number(params.get("id"));

const { offers, businesses } = window.BigDealMockData;

// Poiščemo izbrano ponudbo.
const offer = getOfferWithStock(offerId);


// Začetna količina in termin prevzema.
let quantity = 1;
let selectedSlot = "";


// Oblikovanje cene v evrih.
function formatPrice(price) {

    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR"
    }).format(price);
}


// Preverimo, ali je ponudbo mogoče rezervirati.
function canReserve(offer) {

    return offer &&
        offer.type === "RESERVABLE" &&
        offer.status === "ACTIVE" &&
        Number.isInteger(offer.quantity) &&
        offer.quantity > 0 &&
        Number.isFinite(offer.discountedPrice);
}


// Prikaz sporočila o napaki.
function showError(message) {

    document.getElementById("error-description").textContent =
        message;

    document.getElementById("error-message").hidden = false;
}


// Prikaz podatkov izbrane ponudbe.
function displayOffer() {

    const business = businesses.find(
        item => item.id === offer.businessId
    );

    document.getElementById("offer-title").textContent =
        offer.title;

    document.getElementById("business-name").textContent =
        business ? business.name : "Neznan ponudnik";

    document.getElementById("unit-price").textContent =
        `${formatPrice(offer.discountedPrice)} / kos`;

    document.getElementById("available-quantity").textContent =
        `Na voljo ${offer.quantity} izdelkov`;

    document.getElementById("pickup-address").textContent =
        business ? business.address : "Lokacija ni znana";

    document.getElementById("reservation-form").hidden = false;

    updateSummary();
}


// Posodobitev količine, cen in povzetka rezervacije.
function updateSummary() {

    const totalPrice = offer.discountedPrice * quantity;

    document.getElementById("quantity-value").textContent =
        quantity;

    document.getElementById("summary-quantity").textContent =
        `${quantity} kos`;

    const selectedOption = getPickupOptions(offer).find(
    slot => slot.value === selectedSlot
    );

    document.getElementById("summary-slot").textContent =
        selectedOption ? selectedOption.label : "Ni izbran";

    document.getElementById("summary-total").textContent =
        formatPrice(totalPrice);

    // Izračun redne cene in prihranka.
    if (Number.isFinite(offer.originalPrice)) {

        const originalTotal = offer.originalPrice * quantity;
        const saving = originalTotal - totalPrice;

        document.getElementById("summary-original-price").textContent =
            formatPrice(originalTotal);

        document.getElementById("summary-saving").textContent =
            formatPrice(saving);

    } else {

        document.getElementById("summary-original-price").textContent =
            "—";

        document.getElementById("summary-saving").textContent =
            "—";
    }

    // Preprečimo izbiro količine zunaj dovoljenih meja.
    document.getElementById("decrease-quantity").disabled =
        quantity <= 1;

    document.getElementById("increase-quantity").disabled =
        quantity >= offer.quantity;

    // Potrditev je mogoča šele po izbiri termina.
    document.getElementById("confirm-button").disabled =
        !selectedOption;

    // Skrijemo stara sporočila po spremembi obrazca.
    document.getElementById("success-message").hidden = true;
    document.getElementById("form-error").hidden = true;
}


// Dogodki za upravljanje obrazca.
function initializeEvents() {

    // Povečanje količine.
    document.getElementById("increase-quantity")
        .addEventListener("click", () => {

            if (quantity < offer.quantity) {
                quantity++;
                updateSummary();
            }
        });

    // Zmanjšanje količine.
    document.getElementById("decrease-quantity")
        .addEventListener("click", () => {

            if (quantity > 1) {
                quantity--;
                updateSummary();
            }
        });

    // Izbira termina prevzema.
    const pickupSlots =
        document.querySelectorAll('input[name="pickup-slot"]');

    pickupSlots.forEach(slot => {

        slot.addEventListener("change", () => {

            selectedSlot = slot.value;
            updateSummary();

        });

    });

    // Oddaja obrazca.
    document.getElementById("reservation-form")
        .addEventListener("submit", confirmReservation);
}


// Preverjanje in potrditev rezervacije.
function confirmReservation(event) {

    event.preventDefault();

    const errorMessage =
        document.getElementById("form-error");

    try {

        const reservation = createReservation(
            offerId,
            quantity,
            selectedSlot
        );

        // Preusmeritev na potrditveni zaslon.
        window.location.href =
            `../reservation-confirmation/index.html?id=${reservation.id}`;

    } catch (error) {

        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    }
}
// Dinamični prikaz terminov prevzema.
function displayPickupSlots() {

    const container =
        document.getElementById("pickup-options");

    const slots = getPickupOptions(offer);

    container.replaceChildren();

    if (slots.length === 0) {

        container.textContent =
            "Trenutno ni razpoložljivih terminov prevzema.";

        return;
    }

    slots.forEach(slot => {

        const label = document.createElement("label");

        label.className = "pickup-option card";

        const input = document.createElement("input");

        input.type = "radio";
        input.name = "pickup-slot";
        input.value = slot.value;
        input.required = true;

        label.appendChild(input);

        label.appendChild(
            document.createTextNode(slot.label)
        );

        container.appendChild(label);
    });
}



// Začetni prikaz strani.

if (offer) {

    document.getElementById("back-link").href =
        `../offer-details/index.html?id=${offer.id}`;
}

if (!offer) {

    showError("Izbrana ponudba ne obstaja.");

} else if (!canReserve(offer)) {

    showError("Izbrane ponudbe ni mogoče rezervirati.");

} else {

    displayPickupSlots();
    displayOffer();
    initializeEvents();
}
