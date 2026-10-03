import { apiClient } from "@/lib/api/http-client";

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

export async function getBackendCart() {
  return apiClient.request<BackendCart>("/v1/cart");
}

export async function addBackendCartItem(productId: number, quantity: number) {
  return apiClient.request<BackendCart>("/v1/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateBackendCartItem(
  itemId: number,
  productId: number,
  quantity: number,
) {
  return apiClient.request<BackendCart>(`/v1/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function removeBackendCartItem(itemId: number) {
  return apiClient.request<BackendCart>(`/v1/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearBackendCart() {
  return apiClient.request<BackendCart>("/v1/cart", {
    method: "DELETE",
  });
}

export async function syncCart(
  items: Array<{ productId: string; quantity: number }>,
) {
  const numericItems = items.map((item) => ({
    productId: Number(item.productId),
    quantity: item.quantity,
  }));

  if (
    numericItems.some(
      (item) => !Number.isInteger(item.productId) || item.productId < 1,
    )
  ) {
    throw new Error("One or more cart items are not linked to a live catalog product.");
  }

  await clearBackendCart();
  for (const item of numericItems) {
    await addBackendCartItem(item.productId, item.quantity);
  }

  return getBackendCart();
}