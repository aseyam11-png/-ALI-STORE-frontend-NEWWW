import { apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";

export type BackendCart = {
  id: number;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subTotal: number;
  }>;
  totalPrice: number;
};

export type BackendOrder = {
  id: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  couponCode?: string | null;
  discountAmount: number;
  shippingAddress: string;
  createdAt: string;
};

export type BackendPayment = {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string | null;
};

export async function replaceBackendCart(items: CartItem[]): Promise<BackendCart> {
  await apiClient.request<void>("/api/v1/cart/items", { method: "DELETE" });

  let cart: BackendCart = await apiClient.request<BackendCart>("/api/v1/cart");
  for (const item of items) {
    const productId = Number(item.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error(`Invalid backend product id: ${item.productId}`);
    }

    cart = await apiClient.request<BackendCart>("/api/v1/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity: item.quantity,
      }),
    });
  }

  return cart;
}

export async function createBackendOrder(input: {
  shippingAddress: string;
  couponCode?: string;
}): Promise<BackendOrder> {
  return apiClient.request<BackendOrder>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      shippingAddress: input.shippingAddress,
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
    }),
  });
}

export async function processBackendPayment(input: {
  orderId: number;
  amount: number;
  method: BackendPayment["method"];
}): Promise<BackendPayment> {
  return apiClient.request<BackendPayment>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
