export type ProductSubmissionStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "APPROVED"
  | "PUBLISHED";

export interface ProductSubmissionVariant {
  id: string;

  optionName: string;
  optionValue: string;

  sku: string;

  supplierPrice: number;
  sellingPrice: number;
  pricingMode: ProductPricingMode;
  pricingRuleId?: string;
  price: number;
  stock: number;

  image?: string;
}

export type ProductPricingMode =
  | "AUTOMATIC"
  | "MANUAL";

export interface ProductSubmission {
  id: string;

  productId?: string;

  productName: string;
  brand: string;

  category: string;
  subcategory?: string;

  description: string;

  sku: string;

  supplierPrice: number;
  sellingPrice: number;
  pricingMode: ProductPricingMode;
  pricingRuleId?: string;
  price: number;
  stock: number;

  discountPercentage: number;

  images: string[];

  variants: ProductSubmissionVariant[];

  shippingMethod: string;
  estimatedDelivery: string;
  freeShipping: boolean;

  status: ProductSubmissionStatus;

  submittedAt?: string;
  reviewedAt?: string;

  adminNote?: string;

  version: number;
}

