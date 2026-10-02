import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  currency: string;
  sku: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  categoryId?: number | null;
  categoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
  supplierId?: number | null;
  supplierCode?: string | null;
  supplierName?: string | null;
  supplierSku?: string | null;
  supplierCost?: number | string | null;
};

type AdminProductPage = {
  content: AdminProduct[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function getAdminProducts(page = 0, size = 50) {
  const response = await apiClient.request<ApiResponse<AdminProductPage>>(
    "/api/v1/admin/products?page=" + page + "&size=" + size,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function getAdminProduct(id: string | number) {
  const response = await apiClient.request<ApiResponse<AdminProduct>>(
    "/api/v1/admin/products/" + encodeURIComponent(String(id)),
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function updateAdminProduct(
  id: string | number,
  patch: {
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    categoryId?: number;
    brandId?: number;
    supplierSku?: string;
    supplierCost?: number;
  },
) {
  const response = await apiClient.request<ApiResponse<AdminProduct>>(
    "/api/v1/products/" + encodeURIComponent(String(id)),
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function archiveAdminProduct(id: string | number) {
  const response = await apiClient.request<ApiResponse<null>>(
    "/api/v1/products/" + encodeURIComponent(String(id)),
    { method: "DELETE" },
  );
  if (!response.success) throw new Error(response.message);
}
