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
  rating: "rating_desc",
  reviews: "reviews_desc",
  discount: "discount_desc",
};

/*
  Frontend integration boundary — has zero consumers today (this function
  was previously an unreachable stub with no callers). Rather than leave it
  orphaned, it now runs a real local search through the same canonical
  product service the rest of the catalog uses (mock-backed, honest, no
  fabricated results), so this is the ONE place "search" logic lives
  instead of a page re-implementing its own filtering. `query.category` is
  passed straight through as `categoryId` — in the current mock catalog a
  product's category id happens to be its slugified name (see
  product.mapper.ts), so this coincidentally lines up, but a real backend's
  category ids will need a real slug→id resolution here, not this shortcut.

  Later this function's body becomes:

    fetch(searchQueryToApiPath(query))

  and reads the Spring Boot response — nothing about this function's
  signature or its callers needs to change when that happens.
*/
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
    minRating: query.filters.rating,
    verifiedSupplierOnly: false,
    discountOnly: query.filters.discount === "sale",
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