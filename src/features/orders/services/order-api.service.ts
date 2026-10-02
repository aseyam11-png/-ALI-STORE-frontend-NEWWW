import type { ApiResponse, PageResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface BackendShipmentSummary {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface BackendOrder {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotalAmount: number;
  shippingAmount: number;
  shippingMethod: "STANDARD" | "EXPRESS";
  totalAmount: number;
  couponCode?: string;
  discountAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipmentSummary[];
}

export interface CreateOrderInput {
  shippingAddress: string;
  shippingMethod: "STANDARD" | "EXPRESS";
  couponCode?: string;
}

export interface BackendPayment {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionId?: string;
  createdAt: string;
}

export async function createServerOrder(input: CreateOrderInput) {
  const response = await apiClient.request<ApiResponse<BackendOrder>>(
    "/api/v1/orders",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function processServerPayment(input: {
  orderId: number;
  amount: number;
  method: BackendPayment["method"];
}) {
  const response = await apiClient.request<ApiResponse<BackendPayment>>(
    "/api/v1/payments",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function getServerOrders(page = 0, pageSize = 20) {
  const response = await apiClient.request<ApiResponse<PageResponse<BackendOrder>>>(
    "/api/v1/orders?page=" + page + "&size=" + pageSize,
  );
  return response.data;
}

export async function getServerOrder(orderId: string) {
  const response = await apiClient.request<ApiResponse<BackendOrder>>(
    "/api/v1/orders/" + encodeURIComponent(orderId),
  );
  return response.data;
}
