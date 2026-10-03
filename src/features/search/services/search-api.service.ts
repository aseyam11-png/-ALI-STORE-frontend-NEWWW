import type {
  SearchQuery,
  SearchResult,
} from "../types/search-query.types";

import { getProducts } from "@/features/products/services/product.service";
import type { ProductSort } from "@/features/products/types/product-filter.types";
import type { ProductSummary } from "@/features/products/types/product.types";

const SORT_MAP: Record<SearchQuery["sort"], ProductSort> = {
  featured: "relevance",
  "price-low": "price_asc",
  "price-high": "price_desc",
};

export async function executeSearch(
  query: SearchQuery,
): Promise<SearchResult<ProductSummary>> {
  const response = await getProducts({
    search: query.q ?? "",
    categoryId: query.category,
    subcategoryId: undefined,
    brand: query.filters.brand?.[0],
    supplierId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedSupplierOnly: false,
    discountOnly: false,
    inStockOnly: query.filters.availability === "in-stock",
    featuredOnly: false,
    bestsellerOnly: false,
    newArrivalOnly: false,
    sort: SORT_MAP[query.sort],
    page: query.page,
    pageSize: query.pageSize,
  });

  return {
    items: response.items,
    total: response.pagination.totalItems,
    page: response.pagination.page,
    pageSize: response.pagination.pageSize,
    totalPages: response.pagination.totalPages,
    query,
  };
}
