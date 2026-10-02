import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  parentId?: number;
  parentName?: string;
}

export interface BackendBrand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

export async function getCatalogCategories(): Promise<BackendCategory[]> {
  const response = await apiClient.request<ApiResponse<BackendCategory[]>>(
    "/api/v1/categories",
  );
  return response.data.filter((item) => item.active);
}

export async function getCatalogBrands(): Promise<BackendBrand[]> {
  const response = await apiClient.request<ApiResponse<BackendBrand[]>>(
    "/api/v1/brands",
  );
  return response.data;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<BackendCategory | null> {
  try {
    const response = await apiClient.request<ApiResponse<BackendCategory>>(
      `/api/v1/categories/slug/${encodeURIComponent(slug)}`,
    );
    return response.data;
  } catch {
    return null;
  }
}
