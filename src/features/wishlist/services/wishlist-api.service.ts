import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface BackendWishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  productName?: string;
  price?: number;
  currency?: string;
  discountPercentage?: number;
  imageUrl?: string;
  brandName?: string;
  categoryName?: string;
}

export async function getServerWishlist(): Promise<BackendWishlistItem[]> {
  const response = await apiClient.request<ApiResponse<BackendWishlistItem[]>>(
    "/api/v1/wishlists",
  );
  return response.data;
}

export async function addServerWishlistItem(productId: string) {
  const response = await apiClient.request<ApiResponse<BackendWishlistItem>>(
    "/api/v1/wishlists",
    {
      method: "POST",
      body: JSON.stringify({ productId: Number(productId) }),
    },
  );
  return response.data;
}

export async function removeServerWishlistItem(productId: string) {
  await apiClient.request<ApiResponse<null>>(
    "/api/v1/wishlists/product/" + encodeURIComponent(productId),
    { method: "DELETE" },
  );
}
