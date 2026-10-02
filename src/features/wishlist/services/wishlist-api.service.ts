import { apiClient } from "@/lib/api/http-client";

export interface BackendWishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export async function getBackendWishlist() {
  return apiClient.request<BackendWishlistItem[]>("/v1/wishlists");
}

export async function addToBackendWishlist(productId: number) {
  return apiClient.request<BackendWishlistItem>("/v1/wishlists", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromBackendWishlist(productId: number) {
  return apiClient.request<void>(`/v1/wishlists/product/${productId}`, {
    method: "DELETE",
  });
}
