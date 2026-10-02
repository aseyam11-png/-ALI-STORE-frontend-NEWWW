export type PublishedProductStatus =
  | "PUBLISHED"
  | "UNPUBLISHED";

export interface PublishedCatalogProduct {
  id: string;

  submissionId: string;

  name: string;
  brand: string;

  category: string;
  subcategory?: string;

  sku: string;

  description: string;

  price: number;
  originalPrice?: number;

  stock: number;

  discountPercentage?: number;

  images: string[];

  shipping: {
    method: string;
    estimatedDelivery: string;
    free: boolean;
  };

  variants: {
    id: string;
    optionName: string;
    optionValue: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
  }[];

  status: PublishedProductStatus;

  publishedAt: string;

  version: number;
}