import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder } from "@/features/orders/services/order.service";

export type AdminPayment = {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string | null;
  createdAt: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  sku: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  images: string[];
  primaryImageUrl?: string | null;
  supplierId?: number | null;
  supplierCode?: string | null;
  supplierName?: string | null;
  supplierSku?: string | null;
  supplierCost?: number | null;
};

type Page<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function updateAdminProductStatus(
  productId: number,
  status: AdminProduct["status"],
) {
  return apiClient.request<AdminProduct>("/api/v1/admin/products/" + productId, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminProducts(page = 0, size = 50) {
  return apiClient.request<Page<AdminProduct>>(
    "/api/v1/admin/products?page=" + Math.max(0, page) + "&size=" + Math.min(100, Math.max(1, size)),
  );
}

export async function getAdminPayments(page = 0, size = 100) {
  return apiClient.request<Page<AdminPayment>>(
    "/api/v1/admin/payments?page=" + Math.max(0, page) + "&size=" + Math.min(100, Math.max(1, size)),
  );
}

export async function getAdminOrders(page = 0, size = 100) {
  return apiClient.request<Page<BackendOrder>>(
    "/api/v1/admin/orders?page=" + Math.max(0, page) + "&size=" + Math.min(100, Math.max(1, size)),
  );
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: BackendOrder["status"],
) {
  return apiClient.request<BackendOrder>("/api/v1/admin/orders/" + orderId + "/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateShipmentStatus(
  shipmentId: number,
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED",
) {
  return apiClient.request("/api/v1/shipments/" + shipmentId + "/status?status=" + status, {
    method: "PATCH",
  });
}