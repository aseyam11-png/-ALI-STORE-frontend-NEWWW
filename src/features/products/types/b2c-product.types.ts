import type { ProductStockStatus } from "./product.types";

export interface B2CProductVariant {
  id: string;
  sku?: string;
  name: string;
  value: string;
  type:
    | "color"
    | "size"
    | "storage"
    | "material"
    | "option";
  available: boolean;
  price?: number;
  originalPrice?: number;
  stock?: number;
  image?: string;
  attributes?: Record<string, string>;
}

export interface B2CProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;

  category: string;
  subcategory?: string;

  description?: string;

  price: number;
  supplierPrice?: number;
  originalPrice?: number;
  currency: string;
  discountPercentage?: number;

  stock: number;
  stockStatus: ProductStockStatus;

  images: Array<{
    url: string;
    alt: string;
  }>;

  variants: B2CProductVariant[];

  rating: number;
  reviewCount: number;

  shipping: {
    free: boolean;
    method: string;
    estimatedDelivery: string;
  };

  shippingMethods: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    estimatedMinDays: number;
    estimatedMaxDays: number;
    available: boolean;
  }>;

  returnPolicy?: string;

  featured?: boolean;
  flashSale?: boolean;
  tags?: string[];
}
