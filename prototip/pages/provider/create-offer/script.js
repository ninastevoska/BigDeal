
// Pridobimo demonstracijske podatke.
const { businesses, categories, offers } = window.BigDealMockData;

const form = document.getElementById("offer-form");

const originalPrice = document.getElementById("original-price");
const discountedPrice = document.getElementById("discounted-price");
const discount = document.getElementById("discount");
const quantity = document.getElementById("quantity");

const pickupSection = document.getElementById("pickup-section");
const pickupSlots = document.getElementById("pickup-slots");

const preview = document.getElementById("preview");
const errorMessage = document.getElementById("form-error");
const successMessage = document.getElementById("success-message");

const STORAGE_KEY = "bigdeal-created-offers";

let pendingOffer = null;


// Napolnimo spustne sezname s podatki.
function initializeSelects() {

    businesses.forEach(business => {

        const option = new Option(
            business.name,
            business.id
        );

        document.getElementById("business").appendChild(option);
    });

    categories.forEach(category => {

        const option = new Option(
            category.name,
            category.id
        );

        document.getElementById("category").appendChild(option);
    });
}


// Pridobimo izbrano vrsto ponudbe.
function getOfferType() {

    return document.querySelector(
        'input[name="offer-type"]:checked'
    ).value;
}


// Prilagodimo obrazec glede na vrsto ponudbe.
function updateForm() {

    const isReservable = getOfferType() === "RESERVABLE";

    document.getElementById("quantity-section").hidden =
        !isReservable;

    pickupSection.hidden = !isReservable;

    quantity.disabled = !isReservable;
    quantity.required = isReservable;

    originalPrice.required = isReservable;
    discountedPrice.required = isReservable;

    document.getElementById("type-description").textContent =
        isReservable
            ? "Kupec lahko rezervira izdelek in izbere termin prevzema."
            : "Kupec lahko izkoristi popust neposredno pri ponudniku.";

    if (isReservable && pickupSlots.children.length === 0) {
        addPickupSlot();
    }

    pickupSlots.querySelectorAll("input, button")
        .forEach(element => {
            element.disabled = !isReservable;
        });

    calculateDiscount();
}


// Samodejni izračun odstotka popusta.
function calculateDiscount() {

    const hasPrices =
        originalPrice.value !== "" &&
        discountedPrice.value !== "";

    const automatic =
        getOfferType() === "RESERVABLE" || hasPrices;

    discount.readOnly = automatic;

    document.getElementById("discount-info").textContent =
        automatic
            ? "Popust se izračuna samodejno."
            : "Vnesi odstotek popusta.";

    if (!automatic) {
        return;
    }

    const original = Number(originalPrice.value);
    const reduced = Number(discountedPrice.value);

    if (hasPrices &&
        original > 0 &&
        reduced >= 0 &&
        reduced < original) {

        discount.value = Math.round(
            ((original - reduced) / original) * 100
        );

    } else {

        discount.value = "";
    }
}


// Dodajanje novega termina prevzema.
function addPickupSlot() {

    const slot = document.createElement("div");

    slot.className = "card pickup-slot stack";

    slot.innerHTML = `
        <label class="form-group">
            <span class="form-label">Začetek prevzema</span>
            <input type="datetime-local"
                   class="form-input slot-start"
                   required>
        </label>

        <label class="form-group">
            <span class="form-label">Konec prevzema</span>
            <input type="datetime-local"
                   class="form-input slot-end"
                   required>
        </label>

        <button type="button"
                class="btn btn-secondary remove-slot">
            Odstrani termin
        </button>
    `;

    slot.querySelector(".remove-slot")
        .addEventListener("click", () => {

            slot.remove();
            hidePreview();
        });

    pickupSlots.appendChild(slot);
}


// Preberemo in preverimo termine prevzema.
function getPickupSlots(startDate, endDate) {

    const slots = [];

    pickupSlots.querySelectorAll(".pickup-slot")
        .forEach(element => {

            const start = new Date(
                element.querySelector(".slot-start").value
            );

            const end = new Date(
                element.querySelector(".slot-end").value
            );

            if (!Number.isFinite(start.getTime()) ||
                !Number.isFinite(end.getTime()) ||
                start >= end) {

                throw new Error(
                    "Začetek termina mora biti pred koncem."
                );
            }

            if (start < startDate || end > endDate) {

                throw new Error(
                    "Termin mora biti znotraj veljavnosti ponudbe."
                );
            }

            if (start < new Date()) {

                throw new Error(
                    "Termin prevzema ne sme biti v preteklosti."
                );
            }

            slots.push({
                startTime: start.toISOString(),
                endTime: end.toISOString()
            });
        });

    if (slots.length === 0) {

        throw new Error(
            "Dodaj vsaj en termin prevzema."
        );
    }

    return slots;
}


// Pridobivanje in validacija podatkov obrazca.
function getOfferData() {

    const type = getOfferType();

    const businessId = Number(
        document.getElementById("business").value
    );

    const categoryId = Number(
        document.getElementById("category").value
    );

    const title = document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const imageUrl =
        document.getElementById("image-url").value.trim();

    const original = originalPrice.value === ""
        ? null : Number(originalPrice.value);

    const reduced = discountedPrice.value === ""
        ? null : Number(discountedPrice.value);

    const discountPercentage = Number(discount.value);

    const startDate = new Date(
        document.getElementById("start-date").value +
        "T00:00:00"
    );

    const endDate = new Date(
        document.getElementById("end-date").value +
        "T23:59:59"
    );

    // Preverjanje osnovnih podatkov.
    if (!title || !description ||
        !businesses.some(item => item.id === businessId) ||
        !categories.some(item => item.id === categoryId)) {

        throw new Error(
            "Izpolni vse obvezne podatke."
        );
    }

    // Preverjanje povezave do fotografije.
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {

        throw new Error(
            "URL fotografije mora uporabljati HTTP ali HTTPS."
        );
    }

    // Preverjanje datumov.
    if (!Number.isFinite(startDate.getTime()) ||
        !Number.isFinite(endDate.getTime()) ||
        endDate < startDate) {

        throw new Error(
            "Datum konca ne sme biti pred datumom začetka."
        );
    }

    if (endDate < new Date()) {

        throw new Error(
            "Ponudba ne sme biti že potekla."
        );
    }

    // Če je vnesena ena cena, zahtevamo tudi drugo.
    const pricesProvided = original !== null || reduced !== null;

    if (type === "RESERVABLE" || pricesProvided) {

        if (original === null ||
            reduced === null ||
            !Number.isFinite(original) ||
            !Number.isFinite(reduced) ||
            original <= 0 ||
            reduced < 0 ||
            reduced >= original) {

            throw new Error(
                "Znižana cena mora biti manjša od redne cene."
            );
        }
    }

    // Preverjanje popusta.
    if (!Number.isInteger(discountPercentage) ||
        discountPercentage < 1 ||
        discountPercentage > 100) {

        throw new Error(
            "Popust mora biti med 1 in 100 %."
        );
    }

    let availableQuantity = null;
    let slots = [];

    // Dodatna pravila za rezervacijske ponudbe.
    if (type === "RESERVABLE") {

        availableQuantity = Number(quantity.value);

        if (!Number.isInteger(availableQuantity) ||
            availableQuantity < 1) {

            throw new Error(
                "Količina mora biti pozitivno celo število."
            );
        }

        slots = getPickupSlots(startDate, endDate);
    }

    return {
        businessId: businessId,
        categoryId: categoryId,

        title: title,
        description: description,

        type: type,
        status: startDate <= new Date()
            ? "ACTIVE" : "INACTIVE",

        originalPrice: original,
        discountedPrice: reduced,
        discountPercentage: discountPercentage,

        quantity: availableQuantity,
        imageUrl: imageUrl || null,

        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),

        pickupSlots: slots
    };
}


// Skrijemo predogled, ko uporabnik spremeni podatke.
function hidePreview() {

    pendingOffer = null;
    preview.hidden = true;
    successMessage.hidden = true;
    errorMessage.hidden = true;
}


// Prikaz predogleda ponudbe.
function displayPreview(event) {

    event.preventDefault();

    try {

        pendingOffer = getOfferData();

        const business = businesses.find(
            item => item.id === pendingOffer.businessId
        );

        const category = categories.find(
            item => item.id === pendingOffer.categoryId
        );

        document.getElementById("preview-title").textContent =
            pendingOffer.title;

        document.getElementById("preview-description").textContent =
            pendingOffer.description;

        const price = pendingOffer.discountedPrice !== null
            ? `${pendingOffer.discountedPrice.toFixed(2)} €`
            : "Ni določena";

        const details = [
            `Ponudnik: ${business.name}`,
            `Kategorija: ${category.name}`,
            `Popust: ${pendingOffer.discountPercentage} %`,
            `Znižana cena: ${price}`,
            `Začetek: ${new Date(pendingOffer.startDate).toLocaleDateString("sl-SI")}`,
            `Konec: ${new Date(pendingOffer.endDate).toLocaleDateString("sl-SI")}`
        ];

        if (pendingOffer.type === "RESERVABLE") {

            details.push(
                `Količina: ${pendingOffer.quantity}`
            );

            pendingOffer.pickupSlots.forEach(slot => {

                details.push(
                    `Prevzem: ${new Date(slot.startTime).toLocaleString("sl-SI")} – ${new Date(slot.endTime).toLocaleString("sl-SI")}`
                );
            });
        }

        document.getElementById("preview-details").textContent =
            details.join("\n");

        const image = document.getElementById("preview-image");

        image.hidden = !pendingOffer.imageUrl;

        if (pendingOffer.imageUrl) {
            image.alt = pendingOffer.title;
            image.src = pendingOffer.imageUrl;
        } else {
            image.removeAttribute("src");
        }

        preview.hidden = false;
        errorMessage.hidden = true;
        successMessage.hidden = true;

        preview.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        hidePreview();

        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
    }
}


// Objava in shranjevanje ponudbe.
function publishOffer() {

    if (!pendingOffer) {
        return;
    }

    try {

        const data = getOfferData();

        const savedOffers = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        // Določimo naslednji prosti ID.
        const newId = Math.max(
            0,
            ...offers.map(item => item.id),
            ...savedOffers.map(item => item.id)
        ) + 1;

        const newOffer = {
            id: newId,
            ...data,
            createdAt: new Date().toISOString()
        };

        savedOffers.push(newOffer);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedOffers)
        );

        // Ponastavimo obrazec.
        form.reset();
        pickupSlots.replaceChildren();

        hidePreview();
        updateForm();

        successMessage.textContent =
            `Ponudba št. ${newId} je uspešno shranjena!`;

        successMessage.hidden = false;

        successMessage.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        errorMessage.textContent = error.message;
        errorMessage.hidden = false;

        errorMessage.scrollIntoView();
    }
}


// Dogodki.

document.querySelectorAll('input[name="offer-type"]')
    .forEach(input => {

        input.addEventListener("change", updateForm);
    });

originalPrice.addEventListener("input", calculateDiscount);
discountedPrice.addEventListener("input", calculateDiscount);

document.getElementById("add-slot")
    .addEventListener("click", () => {

        addPickupSlot();
        hidePreview();
    });

document.getElementById("preview-image")
    .addEventListener("error", event => {

        event.target.hidden = true;
    });

form.addEventListener("input", hidePreview);
form.addEventListener("change", hidePreview);
form.addEventListener("submit", displayPreview);

document.getElementById("publish-button")
    .addEventListener("click", publishOffer);


// Začetna priprava obrazca.
initializeSelects();
updateForm();
