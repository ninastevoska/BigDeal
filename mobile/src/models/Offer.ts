export type OfferType = 'PROMOTION' | 'RESERVABLE';

export type OfferStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'EXPIRED';

export interface Offer {
  id: number;

  businessId: number;
  categoryId: number;

  title: string;
  description: string | null;

  type: OfferType;
  status: OfferStatus;

  originalPrice: number | null;
  discountedPrice: number | null;
  discountPercentage: number | null;

  quantity: number | null;

  imageUrl: string | null;

  startDate: string;
  endDate: string;
  createdAt: string;
}
