
// Ključ, pod katerim shranjujemo rezervacije.
const RESERVATIONS_KEY = "bigdeal-reservations";


// Pridobivanje vseh shranjenih rezervacij.
function getReservations() {

    const data = localStorage.getItem(RESERVATIONS_KEY);

    return data ? JSON.parse(data) : [];
}


// Shranjevanje rezervacij.
function saveReservations(reservations) {

    localStorage.setItem(
        RESERVATIONS_KEY,
        JSON.stringify(reservations)
    );
}


// Izračun trenutno razpoložljive količine.
function getAvailableQuantity(offer) {

    const reservations = getReservations();

    const reservedQuantity = reservations
        .filter(reservation =>
            reservation.offerId === offer.id &&
            (
                reservation.status === "CONFIRMED" ||
                reservation.status === "COMPLETED"
            )
        )
        .reduce((sum, reservation) =>
            sum + reservation.quantity, 0
        );

    return Math.max(0, offer.quantity - reservedQuantity);
}


// Pridobivanje ponudbe s posodobljeno zalogo.
function getOfferWithStock(offerId) {

    const offer = getAllOffers().find(
        item => item.id === offerId
    );

    if (!offer) {
        return undefined;
    }

    if (offer.type === "RESERVABLE") {

        return {
            ...offer,
            quantity: getAvailableQuantity(offer)
        };
    }

    return { ...offer };
}


// Ustvarjanje rezervacije.
function createReservation(offerId, quantity, pickupSlot) {

    const offer = getOfferWithStock(offerId);

    if (!offer ||
        offer.type !== "RESERVABLE" ||
        offer.status !== "ACTIVE") {

        throw new Error(
            "Ponudbe ni mogoče rezervirati."
        );
    }

    if (!Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > offer.quantity) {

        throw new Error(
            "Izbrana količina ni več na voljo."
        );
    }

    const selectedOption = getPickupOptions(offer).find(
    slot => slot.value === pickupSlot
    );

    if (!selectedOption) {

        throw new Error(
            "Izbrani termin prevzema ni več veljaven."
        );
    }

    const reservations = getReservations();

    const id = Math.max(
        0,
        ...reservations.map(item => item.id)
    ) + 1;

    

    const reservation = {

        id: id,
        offerId: offer.id,
        businessId: offer.businessId,
        userId: null,

        offerTitle: offer.title,
        quantity: quantity,

        pickupDate: selectedOption.pickupDate,
        pickupSlot: selectedOption.pickupSlot,

        unitOriginalPrice: offer.originalPrice,
        unitDiscountedPrice: offer.discountedPrice,

        totalPrice: Number(
            (offer.discountedPrice * quantity).toFixed(2)
        ),

        status: "CONFIRMED",
        qrToken: `BIGDEAL-DEMO-${id}`,

        createdAt: new Date().toISOString(),
        completedAt: null
    };

    reservations.push(reservation);

    saveReservations(reservations);

    return reservation;
}

// Pridobivanje ponudb, ki jih je ustvaril ponudnik.
function getCreatedOffers() {

    const data = localStorage.getItem("bigdeal-created-offers");

    return data ? JSON.parse(data) : [];
}


// Združevanje demonstracijskih in novih ponudb.
function getAllOffers() {

    const mockOffers = window.BigDealMockData.offers;
    const createdOffers = getCreatedOffers();

    const now = new Date();

    const updatedOffers = createdOffers.map(offer => {

        const isActive =
            new Date(offer.startDate) <= now &&
            new Date(offer.endDate) >= now;

        return {
            ...offer,
            status: isActive ? "ACTIVE" : "INACTIVE"
        };
    });

    return [...mockOffers, ...updatedOffers];
}
// Pridobivanje razpoložljivih terminov prevzema.
function getPickupOptions(offer) {

    let slots = offer.pickupSlots;

    // Za stare demonstracijske ponudbe pripravimo
    // tri privzete termine za naslednji dan.
    if (!Array.isArray(slots)) {

        slots = [10, 12, 16].map(hour => {

            const start = new Date();

            start.setDate(start.getDate() + 1);
            start.setHours(hour, 0, 0, 0);

            const end = new Date(start);
            end.setHours(hour + 1);

            return {
                startTime: start.toISOString(),
                endTime: end.toISOString()
            };
        });
    }

    return slots
        .filter(slot => {

            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);

            return start > new Date() && end > start;
        })
        .map(slot => {

            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);

            const date = start.toLocaleDateString("sl-SI");

            const startTime = start.toLocaleTimeString("sl-SI", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const endTime = end.toLocaleTimeString("sl-SI", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const endDate = end.toLocaleDateString("sl-SI");

            const time = date === endDate
                ? `${startTime}–${endTime}`
                : `${startTime}–${endDate} ${endTime}`;

            return {
                value: `${slot.startTime}|${slot.endTime}`,
                label: `${date}, ${time}`,
                pickupDate: date,
                pickupSlot: time
            };
        });
}