import { HttpApiError, apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number | string;
  currency?: string | null;
  quantity: number;
  subTotal: number | string;
}

export interface BackendCart {
  id: number | null;
  items: BackendCartItem[];
  totalPrice: number | string;
  currency?: string | null;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.success === false) {
    throw new Error(response.message || "Cart request failed");
  }
  return response.data;
}

function productIdToNumber(productId: string): number {
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("This cart item is from an outdated catalog and must be refreshed.");
  }
  return id;
}

export async function getBackendCart(): Promise<BackendCart> {
  const response = await apiClient.request<ApiEnvelope<BackendCart>>(
    "/api/v1/cart",
  );
  return unwrap(response);
}

export async function replaceBackendCart(items: CartItem[]): Promise<BackendCart> {
  const requests = items.map((item) => ({
    productId: productIdToNumber(item.productId),
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));

  const response = await apiClient.request<ApiEnvelope<BackendCart>>(
    "/api/v1/cart",
    {
      method: "PUT",
      body: JSON.stringify(requests),
    },
  );
  return unwrap(response);
}

export async function clearBackendCart(): Promise<BackendCart> {
  const response = await apiClient.request<ApiEnvelope<BackendCart>>(
    "/api/v1/cart",
    {
      method: "DELETE",
    },
  );
  return unwrap(response);
}

export function mapBackendCartItems(
  backend: BackendCart,
  localItems: CartItem[],
): CartItem[] {
  const localByProductId = new Map(
    localItems.map((item) => [item.productId, item]),
  );

  return backend.items.map((item) => {
    const cached = localByProductId.get(String(item.productId));
    return {
      productId: String(item.productId),
      name: item.productName,
      price: Number(item.productPrice),
      currency: item.currency ?? undefined,
      priceUnit: "unit",
      quantity: item.quantity,
      image: cached?.image,
      minOrderQuantity: cached?.minOrderQuantity ?? 1,
      variantId: cached?.variantId,
      variantLabel: cached?.variantLabel,
      backendItemId: item.id,
    } as CartItem & { backendItemId?: number };
  });
}

export async function synchronizeCart(
  localItems: CartItem[],
): Promise<BackendCart> {
  const backend = await getBackendCart();

  // Authenticated carts are server-authoritative. Only migrate a local cart
  // when the user's server cart is genuinely empty.
  if (backend.items.length === 0 && localItems.length > 0) {
    return replaceBackendCart(localItems);
  }

  return backend;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpApiError && error.status === 401;
}
