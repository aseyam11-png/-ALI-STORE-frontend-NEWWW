import { apiClient } from "@/lib/api/http-client";
import type {
  BackendOrder,
  BackendPayment,
  CreateOrderPayload,
  CreatePaymentPayload,
  PageResponse,
} from "@/lib/api/contracts";

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<BackendOrder> {
  return apiClient.request<BackendOrder>(
    "/api/v1/orders",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listMyOrders(
  page = 0,
  pageSize = 20,
): Promise<PageResponse<BackendOrder>> {
  const params = new URLSearchParams({
    page: String(Math.max(0, page)),
    size: String(
      Math.min(
        100,
        Math.max(1, pageSize),
      ),
    ),
  });

  return apiClient.request<PageResponse<BackendOrder>>(
    `/api/v1/orders?${params.toString()}`,
  );
}

export async function getMyOrder(
  orderId: string,
): Promise<BackendOrder> {
  return apiClient.request<BackendOrder>(
    `/api/v1/orders/${encodeURIComponent(orderId)}`,
  );
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<BackendPayment> {
  return apiClient.request<BackendPayment>(
    "/api/v1/payments",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getPayment(
  orderId: string,
): Promise<BackendPayment> {
  return apiClient.request<BackendPayment>(
    `/api/v1/payments/order/${encodeURIComponent(orderId)}`,
  );
}
