export const PRODUCT_DEFAULT_CURRENCY = "SAR";
export const PRODUCT_DEFAULT_UNIT = "piece";

export const PRODUCT_MIN_RATING = 0;
export const PRODUCT_MAX_RATING = 5;

export const PRODUCT_DEFAULT_PAGE = 1;
export const PRODUCT_DEFAULT_PAGE_SIZE = 12;

export const PRODUCT_PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

export const PRODUCT_SORT_OPTIONS = [
  "relevance",
  "newest",
  "price_asc",
  "price_desc",
  "rating_desc",
  "reviews_desc",
  "name_asc",
  "name_desc",
  "discount_desc",
] as const;

export const PRODUCT_STOCK_STATUSES = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "pre_order",
] as const;
