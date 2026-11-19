export type ReservationStatus =
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Reservation {
  id: number;

  userId: number;
  offerId: number;
  pickupSlotId: number;

  quantity: number;

  unitOriginalPrice: number;
  unitDiscountedPrice: number;

  status: ReservationStatus;
  qrToken: string;

  createdAt: string;
  completedAt: string | null;
}
