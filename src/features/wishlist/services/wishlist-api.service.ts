import { apiClient } from "@/lib/api/http-client";

export type BackendWishlistItem = {
  id: number;
  userId: number;
  productId: number;
  productName?: string | null;
  price?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  createdAt: string;
};

export async function getMyWishlist() {
  return apiClient.request<BackendWishlistItem[]>("/api/v1/wishlists");
}

export async function getWishlistIds(): Promise<string[]> {
  const items = await apiClient.request<BackendWishlistItem[]>("/api/v1/wishlists");
  return items.map((item) => String(item.productId));
}

export async function addToWishlist(productId: string): Promise<void> {
  const numericId = Number(productId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error(`Invalid product id: ${productId}`);
  }

  await apiClient.request<BackendWishlistItem>("/api/v1/wishlists", {
    method: "POST",
    body: JSON.stringify({ productId: numericId }),
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const numericId = Number(productId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error(`Invalid product id: ${productId}`);
  }

  await apiClient.request<void>(`/api/v1/wishlists/product/${numericId}`, {
    method: "DELETE",
  });
}