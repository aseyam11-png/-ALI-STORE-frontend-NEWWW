import { apiClient } from "@/lib/api/http-client";

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku: string;
  status: string;
  categoryName?: string | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
  supplierId?: number | null;
  supplierCode?: string | null;
  supplierName?: string | null;
  supplierSku?: string | null;
  supplierCost?: number | null;
}

export interface AdminProductPage {
  content: AdminProduct[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const adminProductApi = {
  list: (page = 0, size = 50) =>
    apiClient.get<AdminProductPage>(`/admin/products?page=${page}&size=${size}`),
  get: (id: string) => apiClient.get<AdminProduct>(`/admin/products/${id}`),
  updateStatus: (id: number, status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "DISCONTINUED") =>
    apiClient.patch<AdminProduct>(`/products/${id}`, { status }),
};
