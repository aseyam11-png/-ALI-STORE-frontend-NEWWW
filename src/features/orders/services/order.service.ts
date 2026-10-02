import { apiClient } from "@/lib/api/http-client";

export type BackendShipment = {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
};

export type BackendOrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
};

export type BackendOrder = {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  couponCode?: string | null;
  discountAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipment[];
};

type BackendPage<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export async function getOrders(page = 0, pageSize = 50) {
  return apiClient.request<BackendPage<BackendOrder>>(
    `/api/v1/orders?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, pageSize))}`,
  );
}

export async function getOrder(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) return null;

  return apiClient.request<BackendOrder>(`/api/v1/orders/${numericId}`);
}
