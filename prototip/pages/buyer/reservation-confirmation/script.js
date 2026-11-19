
// Pridobimo ID rezervacije iz URL-ja.
const params = new URLSearchParams(window.location.search);
const reservationId = Number(params.get("id"));

// Pridobimo shranjene rezervacije.
const reservations = getReservations();

// Poiščemo izbrano rezervacijo.
const reservation = reservations.find(
    item => item.id === reservationId
);

const { businesses } = window.BigDealMockData;


// Oblikovanje cene v evrih.
function formatPrice(price) {

    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR"
    }).format(price);
}


// Prikaz slovenskega statusa rezervacije.
function formatStatus(status) {

    switch (status) {

        case "CONFIRMED":
            return "Potrjena";

        case "COMPLETED":
            return "Prevzeta";

        case "CANCELLED":
            return "Preklicana";

        default:
            return "Neznan status";
    }
}


// Prikaz podatkov rezervacije.
function displayReservation(reservation) {

    const business = businesses.find(
        item => item.id === reservation.businessId
    );

    document.getElementById("reservation-number").textContent =
        `Rezervacija št. ${reservation.id}`;

    document.getElementById("reservation-status").textContent =
        formatStatus(reservation.status);

    document.getElementById("offer-title").textContent =
        reservation.offerTitle;

    document.getElementById("quantity").textContent =
        `${reservation.quantity} kos`;

    document.getElementById("pickup-date").textContent =
        reservation.pickupDate;

    document.getElementById("pickup-slot").textContent =
        reservation.pickupSlot;

    document.getElementById("business-name").textContent =
        business ? business.name : "Neznan ponudnik";

    document.getElementById("business-address").textContent =
        business ? business.address : "Lokacija ni znana";

    document.getElementById("total-price").textContent =
        formatPrice(reservation.totalPrice);

    const isConfirmed = reservation.status === "CONFIRMED";

    document.getElementById("reservation-status")
        .classList.toggle("badge-success", isConfirmed);

    if (!isConfirmed) {

        document.getElementById("confirmation-title").textContent =
            "Podrobnosti rezervacije";

        document.querySelector(".success-icon").hidden = true;

        document.getElementById("pickup-code-section").hidden = true;
    }

    document.getElementById("confirmation-content").hidden = false;

    if (isConfirmed) {
        generateQRCode(reservation.qrToken);
    }
}


// Generiranje QR-kode.
function generateQRCode(token) {

    document.getElementById("qr-token").textContent = token;

    const qrContainer = document.getElementById("qrcode");

    // Preverimo, ali je knjižnica dosegljiva.
    if (typeof QRCode === "undefined") {

        document.getElementById("qr-error").hidden = false;
        qrContainer.hidden = true;
        return;
    }

    new QRCode(qrContainer, {
        text: token,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}


// Začetni prikaz strani.
if (reservation) {

    displayReservation(reservation);

} else {

    document.getElementById("error-message").hidden = false;
}
