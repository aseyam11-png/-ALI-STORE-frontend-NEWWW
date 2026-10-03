import { apiClient } from "@/lib/api/http-client";

export type AdminPayment = {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUND_PENDING" | "REFUNDED" | "REQUIRES_RECONCILIATION";
  transactionId?: string | null;
  collectionStatus?: "NOT_REQUIRED" | "PENDING" | "COLLECTED";
  createdAt: string;
};

export type AdminPaymentPage = {
  content: AdminPayment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
};

export async function getAdminPayments(page = 0, size = 50): Promise<AdminPaymentPage> {
  return apiClient.requestData<AdminPaymentPage>(
    `/api/v1/admin/payments?page=${Math.max(0, page)}&size=${Math.min(100, Math.max(1, size))}`,
  );
}

export async function reconcilePayment(paymentId: number): Promise<AdminPayment> {
  return apiClient.requestData<AdminPayment>(
    `/api/v1/admin/payments/${paymentId}/reconcile`,
    { method: "POST" },
  );
}

export async function collectCashOnDelivery(paymentId: number): Promise<AdminPayment> {
  return apiClient.requestData<AdminPayment>(
    `/api/v1/admin/payments/${paymentId}/cod/collect`,
    { method: "POST" },
  );
}