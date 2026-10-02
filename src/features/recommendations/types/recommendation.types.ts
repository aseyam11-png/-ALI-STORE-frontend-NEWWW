export type RecommendationType =
  | "SIMILAR"
  | "FREQUENTLY_BOUGHT"
  | "FREQUENTLY_BOUGHT_TOGETHER"
  | "RECENTLY_VIEWED"
  | "BASED_ON_BROWSING"
  | "TRENDING";

export interface RecommendationProduct {
  id: string;

  name: string;

  price: number;

  supplierPrice?: number;

  stock: number;

  image?: string;
  imageUrl?: string;

  brand?: string;
  category?: string;
  subcategory?: string;

  rating?: number;
  reviewCount?: number;

  originalPrice?: number;
  discountPercentage?: number;

  reason?: RecommendationType;

  href?: string;

  shipping?: string;

  currency?: string;
}

export interface RecommendationItem {
  productId: string;

  reason: RecommendationType;

  score: number;
}



