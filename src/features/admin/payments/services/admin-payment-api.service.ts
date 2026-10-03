import { apiClient } from "@/lib/api/http-client";

export async function reconcilePayment(paymentId: number) {
  return apiClient.requestData(`/api/v1/admin/payments/${paymentId}/reconcile`, {
    method: "POST",
  });
}

export async function collectCashOnDelivery(paymentId: number) {
  return apiClient.requestData(`/api/v1/admin/payments/${paymentId}/cod/collect`, {
    method: "POST",
  });
}

export async function retryRefund(refundId: number) {
  return apiClient.requestData(`/api/v1/admin/payments/refunds/${refundId}/retry`, {
    method: "POST",
  });
}