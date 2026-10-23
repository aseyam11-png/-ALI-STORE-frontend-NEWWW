import { apiClient } from "@/lib/api/http-client";

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
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
  supplierProductId?: string | null;
  supplierCost?: number | null;
};

export type AdminProductPage = {
  content: AdminProduct[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function getAdminProducts(page = 0, size = 50): Promise<AdminProductPage> {
  return apiClient.requestData<AdminProductPage>(
    `/api/v1/admin/products?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
  );
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid product id");
  return apiClient.requestData<AdminProduct>(`/api/v1/admin/products/${numericId}`);
}

export async function updateAdminProduct(
  id: string | number,
  patch: Partial<Pick<AdminProduct, "name" | "description" | "price" | "currency" | "categoryId" | "brandId" | "supplierSku" | "supplierCost">> & {
    status?: AdminProduct["status"];
  },
): Promise<AdminProduct> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid product id");

  return apiClient.requestData<AdminProduct>(`/api/v1/products/${numericId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function archiveAdminProduct(id: string | number): Promise<void> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw new Error("Invalid product id");
  await apiClient.requestData<void>(`/api/v1/products/${numericId}`, { method: "DELETE" });
}