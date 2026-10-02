import { apiClient } from "@/lib/api/http-client";

export interface BackendWishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export const wishlistApi = {
  get: () => apiClient.get<BackendWishlistItem[]>("/wishlists"),
  add: (productId: number) =>
    apiClient.post<BackendWishlistItem>("/wishlists", { productId }),
  remove: (productId: number) =>
    apiClient.delete<void>(`/wishlists/product/${productId}`),
};
