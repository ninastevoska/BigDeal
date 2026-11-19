const fs = require('node:fs');
const path = require('node:path');

const mockDir = path.join(
  __dirname,
  '../mobile/src/data/mock'
);

function load(filename) {
  const filepath = path.join(mockDir, filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

const users = load('users.json');
const businesses = load('businesses.json');
const categories = load('categories.json');
const offers = load('offers.json');
const pickupSlots = load('pickupSlots.json');
const reservations = load('reservations.json');

let errors = 0;

function check(condition, message) {
  if (condition) {
    console.log(`OK: ${message}`);
  } else {
    console.error(`NAPAKA: ${message}`);
    errors++;
  }
}

function hasUniqueIds(items) {
  return new Set(items.map((item) => item.id)).size
    === items.length;
}

function exists(items, id) {
  return items.some((item) => item.id === id);
}

console.log('\n=== BIGDEAL: PREVERJANJE PODATKOV ===\n');

// 1. Enolični identifikatorji
for (const [name, items] of [
  ['uporabniki', users],
  ['podjetja', businesses],
  ['kategorije', categories],
  ['ponudbe', offers],
  ['termini', pickupSlots],
  ['rezervacije', reservations],
]) {
  check(hasUniqueIds(items), `Enolični ID: ${name}`);
}

// 2. Povezave podjetij
for (const business of businesses) {
  check(
    exists(users, business.ownerId),
    `Podjetje ${business.id} ima veljavnega lastnika`
  );
}

// 3. Povezave in pravilnost ponudb
for (const offer of offers) {
  check(
    exists(businesses, offer.businessId),
    `Ponudba ${offer.id}: podjetje obstaja`
  );

  check(
    exists(categories, offer.categoryId),
    `Ponudba ${offer.id}: kategorija obstaja`
  );

  check(
    ['PROMOTION', 'RESERVABLE'].includes(offer.type),
    `Ponudba ${offer.id}: veljaven tip`
  );

  check(
    Date.parse(offer.startDate) < Date.parse(offer.endDate),
    `Ponudba ${offer.id}: pravilni datumi`
  );

  if (offer.type === 'RESERVABLE') {
    check(
      Number.isInteger(offer.quantity) && offer.quantity >= 0,
      `Ponudba ${offer.id}: veljavna zaloga`
    );

    check(
      typeof offer.originalPrice === 'number' &&
      typeof offer.discountedPrice === 'number' &&
      offer.originalPrice > 0 &&
      offer.discountedPrice >= 0 &&
      offer.discountedPrice <= offer.originalPrice,
      `Ponudba ${offer.id}: veljavni ceni`
    );

    check(
      pickupSlots.some((slot) => slot.offerId === offer.id),
      `Ponudba ${offer.id}: ima termin prevzema`
    );
  }
}

// 4. Termini prevzema
for (const slot of pickupSlots) {
  const offer = offers.find((item) => item.id === slot.offerId);

  check(
    offer?.type === 'RESERVABLE',
    `Termin ${slot.id}: rezervacijska ponudba obstaja`
  );

  check(
    Date.parse(slot.startTime) < Date.parse(slot.endTime),
    `Termin ${slot.id}: pravilen časovni interval`
  );

  check(
    offer &&
      Date.parse(slot.startTime) >= Date.parse(offer.startDate) &&
      Date.parse(slot.endTime) <= Date.parse(offer.endDate),
    `Termin ${slot.id}: znotraj veljavnosti ponudbe`
  );
}

// 5. Rezervacije
for (const reservation of reservations) {
  const offer = offers.find(
    (item) => item.id === reservation.offerId
  );

  const slot = pickupSlots.find(
    (item) => item.id === reservation.pickupSlotId
  );

  check(
    exists(users, reservation.userId),
    `Rezervacija ${reservation.id}: uporabnik obstaja`
  );

  check(
    offer?.type === 'RESERVABLE',
    `Rezervacija ${reservation.id}: ponudba obstaja`
  );

  check(
    slot?.offerId === reservation.offerId,
    `Rezervacija ${reservation.id}: pravilen termin`
  );

  check(
    Number.isInteger(reservation.quantity) &&
      reservation.quantity > 0,
    `Rezervacija ${reservation.id}: veljavna količina`
  );

  check(
    [
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'EXPIRED',
    ].includes(reservation.status),
    `Rezervacija ${reservation.id}: veljaven status`
  );

  check(
    offer &&
      reservation.unitOriginalPrice >= 0 &&
      reservation.unitDiscountedPrice >= 0 &&
      reservation.unitDiscountedPrice <=
        reservation.unitOriginalPrice,
    `Rezervacija ${reservation.id}: veljavni ceni`
  );
}

check(
  new Set(reservations.map((r) => r.qrToken)).size
    === reservations.length,
  'QR-žetoni so enolični'
);

// 6. Glavni demonstracijski uporabnik
const anaReservations = reservations.filter(
  (reservation) => reservation.userId === 1
);

check(
  anaReservations.length >= 5,
  'Ana Novak ima vsaj 5 rezervacij'
);

console.log('\n=== REZULTAT ===');
console.log(`Uporabniki: ${users.length}`);
console.log(`Podjetja: ${businesses.length}`);
console.log(`Kategorije: ${categories.length}`);
console.log(`Ponudbe: ${offers.length}`);
console.log(`Termini: ${pickupSlots.length}`);
console.log(`Rezervacije: ${reservations.length}`);

if (errors === 0) {
  console.log('\nVSI PREVERJENI TESTI SO USPEŠNI!');
} else {
  console.error(`\nŠTEVILO NAPAK: ${errors}`);
  process.exitCode = 1;
}
