export type B2CAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export interface B2CProductVariant {
  id: string;
  sku?: string;
  name: string;
  value: string;
  type: "color" | "size" | "storage" | "material" | "option";
  available: boolean;
  price?: number;
  originalPrice?: number;
  stock?: number;
  image?: string;
  attributes?: Record<string, string>;
}

export interface B2CProduct {
  id: string;
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
  availability: B2CAvailability;
  images: Array<{ url: string; alt: string }>;
  variants: B2CProductVariant[];
  rating: number;
  reviewCount: number;
  shipping: { free: boolean; method: string; estimatedDelivery: string };
  returnPolicy: string;
  featured?: boolean;
  flashSale?: boolean;
  tags?: string[];
}
