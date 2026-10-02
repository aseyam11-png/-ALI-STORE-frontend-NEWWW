import { apiClient } from "@/lib/api/http-client";

interface BackendWishlistItem {
  productId: number;
}

export async function getWishlistProductIds(): Promise<string[]> {
  const data = await apiClient.requestApi<BackendWishlistItem[]>(
    "/api/v1/wishlists",
  );

  return data.map((item) => String(item.productId));
}

export async function addWishlistProduct(
  productId: string,
): Promise<void> {
  const numericId = Number.parseInt(productId, 10);

  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return;
  }

  await apiClient.requestApi("/api/v1/wishlists", {
    method: "POST",
    body: JSON.stringify({ productId: numericId }),
  });
}

export async function removeWishlistProduct(
  productId: string,
): Promise<void> {
  const numericId = Number.parseInt(productId, 10);

  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return;
  }

  await apiClient.requestApi<void>(
    `/api/v1/wishlists/product/${numericId}`,
    { method: "DELETE" },
  );
}
