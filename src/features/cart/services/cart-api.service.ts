import { apiClient } from "@/lib/api/http-client";

export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  currency?: string;
  quantity: number;
  subTotal: number;
}

export interface BackendCart {
  id: number;
  items: BackendCartItem[];
  totalPrice: number;
  currency?: string;
}

export async function getBackendCart(): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart");
}

export async function addBackendCartItem(
  productId: number,
  quantity: number,
): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateBackendCartItem(
  itemId: number,
  quantity: number,
  productId: number,
): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>(`/api/v1/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function removeBackendCartItem(itemId: number): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>(`/api/v1/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearBackendCart(): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart", {
    method: "DELETE",
  });
}

export async function replaceBackendCart(
  items: Array<{ productId: string; quantity: number }>,
): Promise<BackendCart> {
  const seenProductIds = new Set<number>();

  const requestItems = items.map((item) => {
    const productId = Number(item.productId);

    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error(`Invalid backend product id: ${item.productId}`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Cart quantity must be a positive integer.");
    }

    if (seenProductIds.has(productId)) {
      throw new Error(
        `Product ${productId} appears more than once in the backend cart contract.`,
      );
    }

    seenProductIds.add(productId);

    return {
      productId,
      quantity: item.quantity,
    };
  });

  return apiClient.requestData<BackendCart>("/api/v1/cart", {
    method: "PUT",
    body: JSON.stringify(requestItems),
  });
}
