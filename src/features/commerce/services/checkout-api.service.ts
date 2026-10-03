import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder } from "@/features/orders/services/order.service";
import {
  getBackendCart,
  mapBackendCartToLocal,
  replaceBackendCart,
  type BackendCart,
} from "@/features/cart/services/cart-api.service";

export type { BackendCart };

export {
  getBackendCart,
  mapBackendCartToLocal,
  replaceBackendCart,
};

export type BackendPayment = {
  id: number;
  orderId: number;
  amount: number;
  method:
    | "CREDIT_CARD"
    | "PAYPAL"
    | "CASH_ON_DELIVERY";
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REQUIRES_RECONCILIATION"
    | "REFUND_PENDING"
    | "REFUNDED";
  transactionId?: string | null;
  collectionStatus?:
    | "NOT_REQUIRED"
    | "PENDING"
    | "COLLECTED";
};

export async function createBackendOrder(input: {
  shippingAddress: string;
  couponCode?: string;
  idempotencyKey: string;
}): Promise<BackendOrder> {
  return apiClient.requestData<BackendOrder>(
    "/api/v1/orders",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        shippingAddress:
          input.shippingAddress,
        ...(input.couponCode
          ? { couponCode: input.couponCode }
          : {}),
      }),
    },
  );
}

export async function processBackendPayment(
  input: {
    orderId: number;
    amount: number;
    method: BackendPayment["method"];
  },
): Promise<BackendPayment> {
  return apiClient.requestData<BackendPayment>(
    "/api/v1/payments",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function getBackendPaymentByOrderId(
  orderId: string,
): Promise<BackendPayment | null> {
  const numericId = Number(orderId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  try {
    return await apiClient.requestData<BackendPayment>(
      "/api/v1/payments/order/" + numericId,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      Number(
        (error as { status?: unknown }).status,
      ) === 404
    ) {
      return null;
    }
    throw error;
  }
}
