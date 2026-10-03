import { apiClient } from "@/lib/api/http-client";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number | string;
  subTotal: number | string;
}

export interface BackendShipment {
  id: number;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
}

export interface BackendOrder {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "FULFILLMENT_FAILED" | "CANCELLED";
  totalAmount: number | string;
  currency: string;
  couponCode?: string | null;
  discountAmount: number | string;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipment[];
}


export interface BackendOrderPage {
  content: BackendOrder[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.success === false) {
    throw new Error(response.message || "Order request failed");
  }
  return response.data;
}

export async function createBackendOrder(input: {
  shippingAddress: string;
  couponCode?: string;
}): Promise<BackendOrder> {
  return unwrap(
    await apiClient.request<ApiEnvelope<BackendOrder>>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: input.shippingAddress.trim(),
        couponCode: input.couponCode?.trim() || undefined,
      }),
    }),
  );
}

export async function getBackendOrders(
  page = 0,
  size = 20,
): Promise<BackendOrderPage> {
  return unwrap(
    await apiClient.request<ApiEnvelope<BackendOrderPage>>(
      `/api/v1/orders?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
    ),
  );
}

export async function getBackendOrder(orderId: string): Promise<BackendOrder> {
  const parsed = Number(orderId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid order number");
  }

  return unwrap(
    await apiClient.request<ApiEnvelope<BackendOrder>>(
      `/api/v1/orders/${parsed}`,
    ),
  );
}

export async function getAdminBackendOrders(
  page = 0,
  size = 100,
): Promise<BackendOrderPage> {
  return unwrap(
    await apiClient.request<ApiEnvelope<BackendOrderPage>>(
      `/api/v1/admin/orders?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
    ),
  );
}
