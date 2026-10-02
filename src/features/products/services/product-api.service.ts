import { apiClient } from "@/lib/api/http-client";

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku?: string | null;
  status: string;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  categoryId?: number | null;
  categoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
}

export interface BackendPage<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export async function fetchProducts(input: {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK";
  sort?: "relevance" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.category) {
    if (/^\d+$/.test(input.category)) params.set("category", input.category);
    else params.set("categorySlug", input.category);
  }
  if (input.brand) {
    if (/^\d+$/.test(input.brand)) params.set("brand", input.brand);
    else params.set("brandName", input.brand);
  }
  if (input.minPrice) params.set("minPrice", input.minPrice);
  if (input.maxPrice) params.set("maxPrice", input.maxPrice);
  if (input.availability) params.set("availability", input.availability);
  params.set("sort", input.sort ?? "relevance");
  params.set("page", String(input.page ?? 0));
  params.set("pageSize", String(input.pageSize ?? 24));

  return apiClient.get<BackendPage<BackendProduct>>(
    `/products?${params.toString()}`,
  );
}

export async function fetchProduct(id: string) {
  if (!/^\d+$/.test(id)) return null;
  return apiClient.get<BackendProduct>(`/products/${id}`);
}

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  parentId?: number | null;
  parentName?: string | null;
}

export function fetchCategories() {
  return apiClient.get<BackendCategory[]>("/categories");
}
