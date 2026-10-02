import type { Product } from "@/mocks/products";

import { featuredProducts } from "@/mocks/products";

import {
  mapMockProductToDetails,
  mapMockProductToSummary,
} from "./product.mapper";

import type {
  ProductDetails,
  ProductListResponse,
  ProductSummary,
} from "../types/product.types";

import type { ProductFilters } from "../types/product-filter.types";

function matchesSearch(
  product: ProductSummary,
  search: string,
): boolean {
  if (!search.trim()) return true;

  const query = search.trim().toLowerCase();

  return [
    product.name,
    product.sku,
    product.supplier.name,
    product.category?.name ?? "",
    product.brand?.name ?? "",
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesFilters(
  product: ProductSummary,
  filters: ProductFilters,
): boolean {
  if (!matchesSearch(product, filters.search)) {
    return false;
  }

  if (
    filters.categoryId &&
    product.category?.id !== filters.categoryId
  ) {
    return false;
  }

  if (
    filters.brand &&
    product.brand?.name.toLowerCase() !==
      filters.brand.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.supplierId &&
    product.supplier.id !== filters.supplierId
  ) {
    return false;
  }

  if (
    filters.minPrice !== undefined &&
    product.price.amount < filters.minPrice
  ) {
    return false;
  }

  if (
    filters.maxPrice !== undefined &&
    product.price.amount > filters.maxPrice
  ) {
    return false;
  }

  if (
    filters.minRating !== undefined &&
    product.rating < filters.minRating
  ) {
    return false;
  }

  if (
    filters.verifiedSupplierOnly &&
    !product.supplier.verified
  ) {
    return false;
  }

  if (
    filters.discountOnly &&
    product.discountPercentage === undefined
  ) {
    return false;
  }

  if (
    filters.inStockOnly &&
    product.stockStatus === "out_of_stock"
  ) {
    return false;
  }

  if (
    filters.featuredOnly &&
    !product.featured
  ) {
    return false;
  }

  if (
    filters.bestsellerOnly &&
    !product.bestseller
  ) {
    return false;
  }

  if (
    filters.newArrivalOnly &&
    !product.newArrival
  ) {
    return false;
  }

  return true;
}

function sortProducts(
  products: ProductSummary[],
  sort: ProductFilters["sort"],
): ProductSummary[] {
  return [...products].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.price.amount - b.price.amount;

      case "price_desc":
        return b.price.amount - a.price.amount;

      case "rating_desc":
        return b.rating - a.rating;

      case "reviews_desc":
        return b.reviewCount - a.reviewCount;

      case "name_asc":
        return a.name.localeCompare(b.name);

      case "name_desc":
        return b.name.localeCompare(a.name);

      case "discount_desc":
        return (
          (b.discountPercentage ?? 0) -
          (a.discountPercentage ?? 0)
        );

      case "newest":
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );

      case "relevance":
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount
        );
    }
  });
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ProductListResponse> {
  const products =
    featuredProducts.map(mapMockProductToSummary);

  const filtered =
    products.filter((product) =>
      matchesFilters(product, filters),
    );

  const sorted =
    sortProducts(filtered, filters.sort);

  const totalItems = sorted.length;

  const pageSize =
    Math.max(1, filters.pageSize);

  const page =
    Math.max(1, filters.page);

  const totalPages =
    totalItems === 0
      ? 0
      : Math.ceil(totalItems / pageSize);

  const start =
    (page - 1) * pageSize;

  return {
    items: sorted.slice(
      start,
      start + pageSize,
    ),

    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage:
        totalPages > 0 &&
        page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getProductById(
  id: string,
): Promise<ProductDetails | null> {
  const product = featuredProducts.find(
    (item: Product) => item.id === id,
  );

  if (!product) return null;

  return mapMockProductToDetails(product);
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const pool = featuredProducts
    .filter((item) => item.id !== productId)
    .map(mapMockProductToSummary);

  const sameCategory = categoryId
    ? pool.filter(
        (product) =>
          product.category?.id === categoryId,
      )
    : [];

  const sameCategoryIds = new Set(
    sameCategory.map((product) => product.id),
  );

  const rest = pool.filter(
    (product) => !sameCategoryIds.has(product.id),
  );

  return [...sameCategory, ...rest].slice(
    0,
    limit,
  );
}

export async function searchProducts(
  query: string,
): Promise<ProductSummary[]> {
  const response = await getProducts({
    search: query,
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
    pageSize: 96,
  });

  return response.items;
}
