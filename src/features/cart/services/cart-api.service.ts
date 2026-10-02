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

export const cartApi = {
  get: () => apiClient.get<BackendCart>("/cart"),
  add: (productId: number, quantity: number) =>
    apiClient.post<BackendCart>("/cart/items", { productId, quantity }),
  update: (itemId: number, quantity: number) =>
    apiClient.put<BackendCart>(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: number) =>
    apiClient.delete<BackendCart>(`/cart/items/${itemId}`),
  clear: () => apiClient.delete<BackendCart>("/cart/items"),
};
