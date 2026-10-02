export type ProductId = string;

export type ProductStatus =
  | "active"
  | "draft"
  | "archived"
  | "discontinued";

export type ProductStockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pre_order";

export type ProductPrice = {
  amount: number;
  currency: string;
  unit: string;
  originalAmount?: number;
  discountPercentage?: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sortOrder?: number;
};

export type ProductVideo = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
};

export type ProductVariantOption = {
  id: string;
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  price?: ProductPrice;
  stockQuantity: number;
  availableQuantity: number;
  options: ProductVariantOption[];
  image?: ProductImage;
  active: boolean;
};

export type ProductSpecification = {
  key: string;
  label: string;
  value: string;
  group?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
};

export type ProductBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

export type ProductSupplierSummary = {
  id: string;
  name: string;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  country?: string;
  city?: string;
  responseRate?: number;
  responseTimeHours?: number;
};

export type ProductShippingMethod = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  available: boolean;
};

export type ProductPriceTier = {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  currency: string;
};

export type ProductRatingDistribution = {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
};

export type ProductReviewSummary = {
  rating: number;
  reviewCount: number;
  distribution: ProductRatingDistribution;
};

export type ProductSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
};

export type ProductSummary = {
  id: ProductId;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: ProductPrice;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  rating: number;
  reviewCount: number;
  supplier: ProductSupplierSummary;
  shipping: string;
  thumbnail?: ProductImage;
  discountPercentage?: number;
  category?: ProductCategory;
  brand?: ProductBrand;
  stockQuantity: number;
  availableQuantity: number;
  stockStatus: ProductStockStatus;
  status: ProductStatus;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductDetails = ProductSummary & {
  description: string;
  images: ProductImage[];
  videos: ProductVideo[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  priceTiers: ProductPriceTier[];
  shippingMethods: ProductShippingMethod[];
  reviewSummary: ProductReviewSummary;
  seo: ProductSeo;
  relatedProductIds: ProductId[];
};

export type ProductPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProductListResponse = {
  items: ProductSummary[];
  pagination: ProductPagination;
};

export type ProductApiError = {
  code: string;
  message: string;
  field?: string;
  status?: number;
};
