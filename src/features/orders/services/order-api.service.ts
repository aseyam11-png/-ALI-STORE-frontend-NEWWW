import { apiClient } from "@/lib/api/http-client";

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
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
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  couponCode?: string | null;
  discountAmount?: number | null;
  shippingAddress: string;
  createdAt: string;
  items: BackendOrderItem[];
  shipments: BackendShipment[];
}

export interface BackendOrderPage {
  content: BackendOrder[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const orderApi = {
  create: (input: { shippingAddress: string; couponCode?: string }) =>
    apiClient.post<BackendOrder>("/orders", input),
  list: (page = 0, size = 20) =>
    apiClient.get<BackendOrderPage>(`/orders?page=${page}&size=${size}`),
  get: (id: string) => apiClient.get<BackendOrder>(`/orders/${id}`),
  pay: (input: {
    orderId: number;
    amount: number;
    method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  }) => apiClient.post("/payments", input),
};
