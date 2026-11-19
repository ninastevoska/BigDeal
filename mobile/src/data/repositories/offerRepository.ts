import type {
  Offer,
  OfferType,
} from '../../models/Offer';

import { mockStore } from '../mockStore';

export interface OfferFilters {
  categoryId?: number;
  businessId?: number;
  type?: OfferType;
  search?: string;
  activeOnly?: boolean;
}

export interface OfferRepository {
  getAll(filters?: OfferFilters): Promise<Offer[]>;
  getById(id: number): Promise<Offer | null>;
  create(offer: Offer): Promise<Offer>;
  update(offer: Offer): Promise<Offer>;
}

function isOfferActive(offer: Offer): boolean {
  const now = Date.now();

  return (
    offer.status === 'ACTIVE' &&
    new Date(offer.startDate).getTime() <= now &&
    now < new Date(offer.endDate).getTime()
  );
}

export const offerRepository: OfferRepository = {
  async getAll(filters = {}): Promise<Offer[]> {
    let offers = mockStore.getOffers();

    if (filters.activeOnly) {
      offers = offers.filter(isOfferActive);
    }

    if (filters.categoryId !== undefined) {
      offers = offers.filter(
        (offer) => offer.categoryId === filters.categoryId
      );
    }

    if (filters.businessId !== undefined) {
      offers = offers.filter(
        (offer) => offer.businessId === filters.businessId
      );
    }

    if (filters.type !== undefined) {
      offers = offers.filter(
        (offer) => offer.type === filters.type
      );
    }

    if (filters.search?.trim()) {
      const query = filters.search
        .trim()
        .toLocaleLowerCase('sl-SI');

      offers = offers.filter((offer) => {
        const searchableText = [
          offer.title,
          offer.description ?? '',
        ]
          .join(' ')
          .toLocaleLowerCase('sl-SI');

        return searchableText.includes(query);
      });
    }

    return offers;
  },

  async getById(id: number): Promise<Offer | null> {
    return (
      mockStore
        .getOffers()
        .find((offer) => offer.id === id) ?? null
    );
  },

  async create(offer: Offer): Promise<Offer> {
    const exists = mockStore
      .getOffers()
      .some((item) => item.id === offer.id);

    if (exists) {
      throw new Error(
        `Ponudba z ID ${offer.id} že obstaja.`
      );
    }

    mockStore.addOffer(offer);

    return { ...offer };
  },

  async update(offer: Offer): Promise<Offer> {
    const exists = mockStore
      .getOffers()
      .some((item) => item.id === offer.id);

    if (!exists) {
      throw new Error(
        `Ponudba z ID ${offer.id} ne obstaja.`
      );
    }

    mockStore.updateOffer(offer);

    return { ...offer };
  },
};
