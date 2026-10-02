import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export type BackendPayment = {
  id: number;
  orderId: number;
  amount: number | string;
  method: PaymentMethod;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionId?: string | null;
  createdAt: string;
};

export async function processBackendPayment(input: {
  orderId: number;
  amount: number;
  method: PaymentMethod;
}) {
  const response = await apiClient.request<ApiResponse<BackendPayment>>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.success) throw new Error(response.message);
  return response.data;
}
