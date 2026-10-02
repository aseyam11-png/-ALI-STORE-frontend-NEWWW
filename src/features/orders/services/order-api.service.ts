import { apiClient } from "@/lib/api/http-client";

export type BackendOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface BackendShipment {
  id: number;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
}

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface BackendOrder {
  id: number;
  status: BackendOrderStatus;
  totalAmount: number;
  shippingAmount: number;
  shippingMethod: string;
  couponCode?: string | null;
  discountAmount?: number | null;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipment[];
}

export interface CreateBackendOrderRequest {
  shippingAddress: string;
  shippingMethod: "STANDARD" | "EXPRESS";
  couponCode?: string;
}

export async function createBackendOrder(
  request: CreateBackendOrderRequest,
) {
  return apiClient.request<BackendOrder>("/v1/orders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getMyOrders(page = 0, size = 20) {
  return apiClient.request<{
    content: BackendOrder[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }>(`/v1/orders?page=${page}&size=${size}`);
}

export async function getMyOrder(orderId: number) {
  return apiClient.request<BackendOrder>(`/v1/orders/${orderId}`);
}

export async function processPayment(
  orderId: number,
  amount: number,
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY",
) {
  return apiClient.request<{
    id: number;
    orderId: number;
    amount: number;
    method: string;
    status: string;
    transactionId?: string | null;
    createdAt: string;
  }>("/v1/payments", {
    method: "POST",
    body: JSON.stringify({ orderId, amount, method }),
  });
}

export async function getPayment(orderId: number) {
  return apiClient.request<{
    id: number;
    orderId: number;
    amount: number;
    method: string;
    status: string;
    transactionId?: string | null;
    createdAt: string;
  }>(`/v1/payments/order/${orderId}`);
}
