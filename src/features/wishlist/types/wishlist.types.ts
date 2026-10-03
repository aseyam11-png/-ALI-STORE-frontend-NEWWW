export interface WishlistProduct {
  id: string;
  name: string;
  price: number;

  image?: string;

  brand?: string;
  category?: string;
  currency?: string;

  originalPrice?: number;
  discountPercentage?: number;

  rating?: number;
  reviewCount?: number;
}