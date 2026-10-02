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

export async function setServerCartItemQuantity(
  productId: string,
  quantity: number,
): Promise<BackendCart> {
  const response = await apiClient.request<ApiResponse<BackendCart>>(
    "/api/v1/cart/items/product/" + encodeURIComponent(productId),
    {
      method: "PUT",
      body: JSON.stringify({ productId: Number(productId), quantity }),
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
  const server = await getServerCart();
  const localByProduct = new Map(items.map((item) => [item.productId, item]));

  for (const serverItem of server.items) {
    if (!localByProduct.has(String(serverItem.productId))) {
      await removeServerCartItem(serverItem.id);
    }
  }

  let latest = server;
  for (const item of items) {
    latest = await setServerCartItemQuantity(item.productId, Math.max(1, item.quantity));
  }

  return latest;
}
