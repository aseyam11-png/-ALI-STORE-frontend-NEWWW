import { apiClient } from "@/lib/api/http-client";
import type {
  BackendWishlistItem,
} from "@/lib/api/contracts";

export async function getWishlist(): Promise<
  BackendWishlistItem[]
> {
  return apiClient.request<BackendWishlistItem[]>(
    "/api/v1/wishlists",
  );
}

export async function addToWishlist(
  productId: string,
): Promise<BackendWishlistItem> {
  return apiClient.request<BackendWishlistItem>(
    "/api/v1/wishlists",
    {
      method: "POST",
      body: JSON.stringify({
        productId: Number(productId),
      }),
    },
  );
}

export async function removeFromWishlist(
  productId: string,
): Promise<void> {
  await apiClient.request<void>(
    `/api/v1/wishlists/product/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
}
