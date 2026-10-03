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

export async function getBackendPaymentByOrderId(
  orderId: string,
): Promise<BackendPayment | null> {
  const parsed = Number(orderId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid order number");
  }

  try {
    return unwrap(
      await apiClient.request<ApiEnvelope<BackendPayment>>(
        `/api/v1/payments/order/${parsed}`,
      ),
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}
