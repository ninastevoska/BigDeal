import usersJson from './mock/users.json';
import businessesJson from './mock/businesses.json';
import categoriesJson from './mock/categories.json';
import offersJson from './mock/offers.json';
import pickupSlotsJson from './mock/pickupSlots.json';
import reservationsJson from './mock/reservations.json';

import type { User } from '../models/User';
import type { Business } from '../models/Business';
import type { Category } from '../models/Category';
import type { Offer } from '../models/Offer';
import type { PickupSlot } from '../models/PickupSlot';
import type { Reservation } from '../models/Reservation';

type Listener = () => void;

// Začetni podatki iz JSON datotek.
// Predpostavljamo, da ustrezajo TypeScript modelom.
const users = usersJson as User[];
const businesses = businessesJson as Business[];
const categories = categoriesJson as Category[];

let offers = offersJson as unknown as Offer[];
let pickupSlots = pickupSlotsJson as PickupSlot[];
let reservations = reservationsJson as unknown as Reservation[];

// Funkcije, ki jih obvestimo o spremembah.
const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export const mockStore = {
  // BRANJE PODATKOV

  getUsers(): User[] {
    return users.map((user) => ({ ...user }));
  },

  getBusinesses(): Business[] {
    return businesses.map((business) => ({ ...business }));
  },

  getCategories(): Category[] {
    return categories.map((category) => ({ ...category }));
  },

  getOffers(): Offer[] {
    return offers.map((offer) => ({ ...offer }));
  },

  getPickupSlots(): PickupSlot[] {
    return pickupSlots.map((slot) => ({ ...slot }));
  },

  getReservations(): Reservation[] {
    return reservations.map((reservation) => ({
      ...reservation,
    }));
  },

  // DODAJANJE PODATKOV

  addOffer(offer: Offer): void {
    offers = [...offers, { ...offer }];
    notifyListeners();
  },

  addPickupSlot(slot: PickupSlot): void {
    pickupSlots = [...pickupSlots, { ...slot }];
    notifyListeners();
  },

  addReservation(reservation: Reservation): void {
    reservations = [
      ...reservations,
      { ...reservation },
    ];
    notifyListeners();
  },

  // POSODABLJANJE PODATKOV

  updateOffer(updatedOffer: Offer): void {
    offers = offers.map((offer) =>
      offer.id === updatedOffer.id
        ? { ...updatedOffer }
        : offer
    );

    notifyListeners();
  },

  updateReservation(updatedReservation: Reservation): void {
    reservations = reservations.map((reservation) =>
      reservation.id === updatedReservation.id
        ? { ...updatedReservation }
        : reservation
    );

    notifyListeners();
  },

  // OBVESCANJE O SPREMEMBAH

  subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
