import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "./product.types";

import type { ProductFilters } from "./product-filter.types";

export type ProductQueryParams = ProductFilters;
export type ProductApiResponse = ProductListResponse;
export type ProductDetailsResponse = ProductDetails;
export type ProductSearchResponse = ProductListResponse;

export type ProductRequestState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type ProductServiceResult<T> = {
  data: T;
  success: boolean;
  error?: string;
};

export type ProductEntityMap = Record<string, ProductSummary>;
