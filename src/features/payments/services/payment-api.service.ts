import { apiClient } from "@/lib/api/http-client";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REQUIRES_RECONCILIATION";

export interface BackendPayment {
  id: number;
  orderId: number;
  amount: number | string;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: PaymentStatus;
  transactionId?: string | null;
  collectionStatus: "NOT_REQUIRED" | "PENDING" | "COLLECTED";
  createdAt: string;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.success === false) {
    throw new Error(response.message || "Payment request failed");
  }
  return response.data;
}

export async function processBackendPayment(input: {
  orderId: number;
  amount: number;
  method: BackendPayment["method"];
}): Promise<BackendPayment> {
  return unwrap(
    await apiClient.request<ApiEnvelope<BackendPayment>>("/api/v1/payments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}
