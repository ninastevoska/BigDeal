export interface Business {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  businessType: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
}
