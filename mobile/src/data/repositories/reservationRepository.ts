import type {
  Reservation,
} from '../../models/Reservation';

import { mockStore } from '../mockStore';

export interface CreateReservationInput {
  userId: number;
  offerId: number;
  pickupSlotId: number;
  quantity: number;
}

export interface ReservationRepository {
  getAll(): Promise<Reservation[]>;
  getById(id: number): Promise<Reservation | null>;
  getByUserId(userId: number): Promise<Reservation[]>;
  getByOfferId(offerId: number): Promise<Reservation[]>;
  getByQrToken(token: string): Promise<Reservation | null>;

  create(input: CreateReservationInput): Promise<Reservation>;
  cancel(id: number): Promise<Reservation>;
  complete(qrToken: string): Promise<Reservation>;
}

function generateReservationId(): number {
  const reservations = mockStore.getReservations();

  return Math.max(0, ...reservations.map((r) => r.id)) + 1;
}

// Samo za prototip. V produkciji žetone generira backend.
function generateDemoQrToken(id: number): string {
  return `BIGDEAL-DEMO-${id}`;
}

export const reservationRepository: ReservationRepository = {
  async getAll(): Promise<Reservation[]> {
    return mockStore.getReservations();
  },

  async getById(id: number): Promise<Reservation | null> {
    return (
      mockStore
        .getReservations()
        .find((reservation) => reservation.id === id) ?? null
    );
  },

  async getByUserId(userId: number): Promise<Reservation[]> {
    return mockStore
      .getReservations()
      .filter((reservation) => reservation.userId === userId);
  },

  async getByOfferId(offerId: number): Promise<Reservation[]> {
    return mockStore
      .getReservations()
      .filter((reservation) => reservation.offerId === offerId);
  },

  async getByQrToken(
    token: string
  ): Promise<Reservation | null> {
    return (
      mockStore
        .getReservations()
        .find((reservation) => reservation.qrToken === token) ??
      null
    );
  },

  async create(
    input: CreateReservationInput
  ): Promise<Reservation> {
    const { userId, offerId, pickupSlotId, quantity } = input;

    // 1. Preverimo uporabnika.
    const user = mockStore
      .getUsers()
      .find((item) => item.id === userId);

    if (!user) {
      throw new Error('Uporabnik ne obstaja.');
    }

    // 2. Preverimo ponudbo.
    const offer = mockStore
      .getOffers()
      .find((item) => item.id === offerId);

    if (!offer) {
      throw new Error('Ponudba ne obstaja.');
    }

    if (offer.type !== 'RESERVABLE') {
      throw new Error(
        'Promocijskih ponudb ni mogoče rezervirati.'
      );
    }

    // 3. Preverimo veljavnost ponudbe.
    const now = Date.now();

    if (
      offer.status !== 'ACTIVE' ||
      now < new Date(offer.startDate).getTime() ||
      now >= new Date(offer.endDate).getTime()
    ) {
      throw new Error('Ponudba trenutno ni aktivna.');
    }

    // 4. Preverimo količino.
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        'Količina mora biti pozitivno celo število.'
      );
    }

    if (offer.quantity === null || offer.quantity < quantity) {
      throw new Error(
        'Na voljo ni dovolj izdelkov za rezervacijo.'
      );
    }

    // 5. Preverimo termin prevzema.
    const slot = mockStore
      .getPickupSlots()
      .find((item) => item.id === pickupSlotId);

    if (!slot) {
      throw new Error('Termin prevzema ne obstaja.');
    }

    if (slot.offerId !== offerId) {
      throw new Error(
        'Izbrani termin ne pripada tej ponudbi.'
      );
    }

    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();

    if (
      !Number.isFinite(slotStart) ||
      !Number.isFinite(slotEnd) ||
      slotStart <= now ||
      slotEnd <= slotStart ||
      slotEnd > new Date(offer.endDate).getTime()
    ) {
      throw new Error(
        'Izbrani termin prevzema ni veljaven.'
      );
    }

    // 6. Preverimo ceni.
    if (
      offer.originalPrice === null ||
      offer.discountedPrice === null
    ) {
      throw new Error(
        'Rezervacijska ponudba nima določenih cen.'
      );
    }

    // 7. Ustvarimo novo rezervacijo.
    const id = generateReservationId();

    const reservation: Reservation = {
      id,
      userId,
      offerId,
      pickupSlotId,
      quantity,
      unitOriginalPrice: offer.originalPrice,
      unitDiscountedPrice: offer.discountedPrice,
      status: 'CONFIRMED',
      qrToken: generateDemoQrToken(id),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    // 8. Zmanjšamo razpoložljivo količino.
    mockStore.updateOffer({
      ...offer,
      quantity: offer.quantity - quantity,
    });

    // 9. Shranimo rezervacijo.
    mockStore.addReservation(reservation);

    return { ...reservation };
  },

  async cancel(id: number): Promise<Reservation> {
    const reservation = mockStore
      .getReservations()
      .find((item) => item.id === id);

    if (!reservation) {
      throw new Error('Rezervacija ne obstaja.');
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new Error(
        'Preklicati je mogoče samo potrjene rezervacije.'
      );
    }

    const offer = mockStore
      .getOffers()
      .find((item) => item.id === reservation.offerId);

    if (!offer || offer.quantity === null) {
      throw new Error(
        'Ponudbe ni mogoče posodobiti.'
      );
    }

    const updatedReservation: Reservation = {
      ...reservation,
      status: 'CANCELLED',
    };

    // Preklicano količino vrnemo v zalogo.
    mockStore.updateOffer({
      ...offer,
      quantity: offer.quantity + reservation.quantity,
    });

    mockStore.updateReservation(updatedReservation);

    return { ...updatedReservation };
  },

  async complete(qrToken: string): Promise<Reservation> {
    const reservation = mockStore
      .getReservations()
      .find((item) => item.qrToken === qrToken);

    if (!reservation) {
      throw new Error('QR-koda ni veljavna.');
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new Error(
        'Rezervacija ni več na voljo za prevzem.'
      );
    }

    const slot = mockStore
      .getPickupSlots()
      .find((item) => item.id === reservation.pickupSlotId);

    if (!slot) {
      throw new Error('Termin prevzema ne obstaja.');
    }

    const now = Date.now();

    if (
      now < new Date(slot.startTime).getTime() ||
      now > new Date(slot.endTime).getTime()
    ) {
      throw new Error(
        'Prevzem ni mogoč zunaj izbranega termina.'
      );
    }

    const updatedReservation: Reservation = {
      ...reservation,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };

    mockStore.updateReservation(updatedReservation);

    return { ...updatedReservation };
  },
};
