import { apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";
import type { BackendOrder } from "@/features/orders/services/order.service";

export type BackendCart = {
  id: number;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    currency?: string;
    quantity: number;
    subTotal: number;
  }>;
  totalPrice: number;
  currency?: string;
};

export type BackendPayment = {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REQUIRES_RECONCILIATION" | "REFUND_PENDING" | "REFUNDED";
  transactionId?: string | null;
  collectionStatus?: "NOT_REQUIRED" | "PENDING" | "COLLECTED";
};

export async function replaceBackendCart(items: CartItem[]): Promise<BackendCart> {
  const requestItems = items.map((item) => {
    const productId = Number(item.productId);

    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error(`Invalid backend product id: ${item.productId}`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Cart quantity must be a positive integer.");
    }

    return {
      productId,
      quantity: item.quantity,
    };
  });

  return apiClient.requestData<BackendCart>("/api/v1/cart", {
    method: "PUT",
    body: JSON.stringify(requestItems),
  });
}

export async function getBackendCart(): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart");
}

export function mapBackendCartToLocal(
  backend: BackendCart,
  localItems: CartItem[],
): CartItem[] {
  const cachedByProduct = new Map(
    localItems.map((item) => [item.productId, item]),
  );

  return backend.items.map((item) => {
    const cached = cachedByProduct.get(String(item.productId));

    return {
      productId: String(item.productId),
      name: item.productName,
      price: Number(item.productPrice),
      currency: item.currency ?? cached?.currency,
      priceUnit: "unit",
      quantity: item.quantity,
      image: cached?.image,
      minOrderQuantity: cached?.minOrderQuantity ?? 1,
      variantId: cached?.variantId,
      variantLabel: cached?.variantLabel,
    };
  });
}

export async function createBackendOrder(input: {
  shippingAddress: string;
  couponCode?: string;
  idempotencyKey: string;
}): Promise<BackendOrder> {
  return apiClient.requestData<BackendOrder>("/api/v1/orders", {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
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
  return apiClient.requestData<BackendPayment>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}