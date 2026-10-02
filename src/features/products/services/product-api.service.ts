import { apiClient } from "@/lib/api/http-client";
import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku?: string | null;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT" | "DISCONTINUED";
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  availableQuantity: number;
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
}

export interface BackendPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductListQuery {
  q?: string;
  category?: number;
  brand?: number;
  minPrice?: number;
  maxPrice?: number;
  availability?: "IN_STOCK" | "OUT_OF_STOCK";
  sort?: "relevance" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

function mapProduct(product: BackendProduct): B2CProduct {
  const stock = Math.max(0, Number(product.availableQuantity ?? 0));

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    brand: product.brandName ?? "ALI STORE",
    category: product.categoryName,
    description: product.description ?? "",
    price: Number(product.price),
    currency: product.currency,
    stock,
    images: (product.images?.length
      ? product.images
      : product.primaryImageUrl
        ? [product.primaryImageUrl]
        : []
    ).map((url) => ({ url, alt: product.name })),
    variants: [] as B2CProductVariant[],
    rating: 0,
    reviewCount: 0,
    shipping: {
      free: false,
      method: "STANDARD",
      estimatedDelivery: "Calculated at checkout",
    },
    returnPolicy: "14-day return policy",
    featured: false,
    flashSale: false,
    tags: [],
  };
}

function buildQuery(query: ProductListQuery) {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.category) params.set("category", String(query.category));
  if (query.brand) params.set("brand", String(query.brand));
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.availability) params.set("availability", query.availability);
  params.set("sort", query.sort ?? "relevance");
  params.set("page", String(Math.max(0, query.page ?? 0)));
  params.set("pageSize", String(Math.min(100, Math.max(1, query.pageSize ?? 20))));

  return params.toString();
}

export async function getProducts(query: ProductListQuery = {}) {
  const page = await apiClient.request<BackendPage<BackendProduct>>(
    `/v1/products?${buildQuery(query)}`,
  );

  return {
    ...page,
    content: page.content.map(mapProduct),
  };
}

export async function getProductById(id: number) {
  const product = await apiClient.request<BackendProduct>(`/v1/products/${id}`);
  return mapProduct(product);
}

export async function getProductBySlug(slug: string) {
  const product = await apiClient.request<BackendProduct>(
    `/v1/products/slug/${encodeURIComponent(slug)}`,
  );
  return mapProduct(product);
}

export async function getCategories() {
  return apiClient.request<Array<{
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    active: boolean;
    parentId?: number | null;
  }>>("/v1/categories");
}

export async function getBrands() {
  return apiClient.request<Array<{
    id: number;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
  }>>("/v1/brands");
}

export async function getShippingQuote(
  subtotal: number,
  method: "STANDARD" | "EXPRESS",
  currency: string,
) {
  return apiClient.request<{
    method: "STANDARD" | "EXPRESS";
    amount: number;
    freeShippingThreshold: number;
    currency: string;
    estimatedMinDays: number;
    estimatedMaxDays: number;
  }>(
    `/v1/shipping/quote?subtotal=${encodeURIComponent(subtotal)}&method=${method}&currency=${encodeURIComponent(currency)}`,
  );
}
