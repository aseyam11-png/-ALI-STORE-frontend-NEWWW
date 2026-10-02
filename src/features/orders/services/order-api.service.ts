import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export type BackendOrder = {
  id: number;
  status: string;
  totalAmount: number | string;
  shippingAmount: number | string;
  shippingMethod: string;
  couponCode?: string | null;
  discountAmount?: number | string | null;
  paymentStatus: string;
  shippingAddress: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number | string;
    subTotal: number | string;
  }>;
  shipments: Array<{
    id: number;
    status: string;
    carrier?: string | null;
    trackingNumber?: string | null;
    estimatedDeliveryDate?: string | null;
  }>;
};

export async function createBackendOrder(input: {
  shippingAddress: string;
  couponCode?: string;
  shippingMethod: "STANDARD" | "EXPRESS";
}) {
  const response = await apiClient.request<ApiResponse<BackendOrder>>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function getBackendOrders(page = 0, size = 20) {
  const response = await apiClient.request<ApiResponse<{
    content: BackendOrder[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
  }>>("/api/v1/orders?page=" + page + "&size=" + size);
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function getBackendOrder(id: string | number) {
  const response = await apiClient.request<ApiResponse<BackendOrder>>("/api/v1/orders/" + encodeURIComponent(String(id)));
  if (!response.success) throw new Error(response.message);
  return response.data;
}
