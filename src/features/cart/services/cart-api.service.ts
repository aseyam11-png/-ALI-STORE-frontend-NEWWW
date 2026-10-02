import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";

export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subTotal: number;
}

export interface BackendCart {
  id: number;
  items: BackendCartItem[];
  totalPrice: number;
}

export async function getServerCart(): Promise<BackendCart> {
  const response = await apiClient.request<ApiResponse<BackendCart>>("/api/v1/cart");
  return response.data;
}

export async function addServerCartItem(
  productId: string,
  quantity: number,
): Promise<BackendCart> {
  const response = await apiClient.request<ApiResponse<BackendCart>>(
    "/api/v1/cart/items",
    {
      method: "POST",
      body: JSON.stringify({
        productId: Number(productId),
        quantity: Math.max(1, Math.floor(quantity)),
      }),
    },
  );
  return response.data;
}

export async function setServerCartItemQuantity(
  productId: string,
  quantity: number,
): Promise<BackendCart> {
  const response = await apiClient.request<ApiResponse<BackendCart>>(
    "/api/v1/cart/items/product/" + encodeURIComponent(productId),
    {
      method: "PUT",
      body: JSON.stringify({
        productId: Number(productId),
        quantity: Math.max(1, Math.floor(quantity)),
      }),
    },
  );
  return response.data;
}

export async function removeServerCartItem(itemId: number): Promise<void> {
  await apiClient.request<ApiResponse<null>>(
    "/api/v1/cart/items/" + encodeURIComponent(String(itemId)),
    { method: "DELETE" },
  );
}

export async function syncLocalCart(items: CartItem[]): Promise<BackendCart> {
  let server = await getServerCart();
  const localByProduct = new Map(
    items.map((item) => [item.productId, item]),
  );
  const serverProductIds = new Set(
    server.items.map((item) => String(item.productId)),
  );

  for (const serverItem of server.items) {
    if (!localByProduct.has(String(serverItem.productId))) {
      await removeServerCartItem(serverItem.id);
    }
  }

  for (const item of items) {
    if (serverProductIds.has(item.productId)) {
      server = await setServerCartItemQuantity(
        item.productId,
        Math.max(1, item.quantity),
      );
    } else {
      server = await addServerCartItem(
        item.productId,
        Math.max(1, item.quantity),
      );
    }
  }

  return server;
}
