import type { Business } from '../../models/Business';
import type { Offer } from '../../models/Offer';

import { mockStore } from '../mockStore';
import { offerRepository } from './offerRepository';

export interface BusinessRepository {
  getAll(): Promise<Business[]>;
  getById(id: number): Promise<Business | null>;
  getByOwnerId(ownerId: number): Promise<Business[]>;
  search(query: string): Promise<Business[]>;
  getOffers(businessId: number): Promise<Offer[]>;
}

export const businessRepository: BusinessRepository = {
  async getAll(): Promise<Business[]> {
    return mockStore.getBusinesses();
  },

  async getById(id: number): Promise<Business | null> {
    return (
      mockStore
        .getBusinesses()
        .find((business) => business.id === id) ?? null
    );
  },

  async getByOwnerId(ownerId: number): Promise<Business[]> {
    return mockStore
      .getBusinesses()
      .filter((business) => business.ownerId === ownerId);
  },

  async search(query: string): Promise<Business[]> {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase('sl-SI');

    if (!normalizedQuery) {
      return mockStore.getBusinesses();
    }

    return mockStore.getBusinesses().filter((business) => {
      const searchableText = [
        business.name,
        business.description ?? '',
        business.businessType,
        business.address,
      ]
        .join(' ')
        .toLocaleLowerCase('sl-SI');

      return searchableText.includes(normalizedQuery);
    });
  },

  async getOffers(businessId: number): Promise<Offer[]> {
    return offerRepository.getAll({ businessId });
  },
};
