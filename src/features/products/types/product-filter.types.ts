export type ProductSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "reviews_desc"
  | "name_asc"
  | "name_desc"
  | "discount_desc";

export type ProductPriceRange = {
  min?: number;
  max?: number;
};

export type ProductRatingFilter = {
  min?: number;
  max?: number;
};

export type ProductFilters = {
  search: string;
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedSupplierOnly: boolean;
  discountOnly: boolean;
  inStockOnly: boolean;
  featuredOnly: boolean;
  bestsellerOnly: boolean;
  newArrivalOnly: boolean;
  sort: ProductSort;
  page: number;
  pageSize: number;
};

export type ProductFilterUpdate = Partial<ProductFilters>;

export const defaultProductFilters: ProductFilters = {
  search: "",
  categoryId: undefined,
  subcategoryId: undefined,
  brand: undefined,
  supplierId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  verifiedSupplierOnly: false,
  discountOnly: false,
  inStockOnly: false,
  featuredOnly: false,
  bestsellerOnly: false,
  newArrivalOnly: false,
  sort: "relevance",
  page: 1,
  pageSize: 12,
};
