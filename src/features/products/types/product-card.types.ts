import type { ProductImage } from "./product.types";

export type ProductCardModel = {
  id: string;
  name: string;

  price: {
    amount: number;
    currency: string;
    unit: string;
    originalAmount?: number;
  };

  minOrderQuantity: number;

  rating: number;
  reviewCount: number;

  // Never populate this with an internal/supplier-sourced rating, price, or
  // identity beyond `name`/`verified` — this is the canonical customer-
  // facing view model. See product-card.mapper.ts.
  supplier: {
    id?: string;
    name: string;
    verified: boolean;
  };

  shipping: string;

  discountPercentage?: number;

  image?: ProductImage;

  stockStatus?: string;

  category?: string;

  brand?: string;

  featured?: boolean;

  bestseller?: boolean;

  newArrival?: boolean;
};
