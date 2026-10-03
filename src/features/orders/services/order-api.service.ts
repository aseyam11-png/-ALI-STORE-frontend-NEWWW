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
