import { apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";

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
  id: number | null;
  items: BackendCartItem[];
  totalPrice: number;
  currency?: string;
}

function toPositiveProductId(productId: string | number) {
  const numericId = Number(productId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error("Invalid backend product id: " + productId);
  }
  return numericId;
}

function toPositiveQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Cart quantity must be a positive integer.");
  }
  return quantity;
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
    body: JSON.stringify({
      productId: toPositiveProductId(productId),
      quantity: toPositiveQuantity(quantity),
    }),
  });
}

export async function updateBackendCartItem(
  itemId: number,
  quantity: number,
  productId: number,
): Promise<BackendCart> {
  if (!Number.isInteger(itemId) || itemId < 1) {
    throw new Error("Invalid backend cart item id: " + itemId);
  }

  return apiClient.requestData<BackendCart>(
    "/api/v1/cart/items/" + itemId,
    {
      method: "PATCH",
      body: JSON.stringify({
        productId: toPositiveProductId(productId),
        quantity: toPositiveQuantity(quantity),
      }),
    },
  );
}

export async function removeBackendCartItem(
  itemId: number,
): Promise<BackendCart> {
  if (!Number.isInteger(itemId) || itemId < 1) {
    throw new Error("Invalid backend cart item id: " + itemId);
  }

  return apiClient.requestData<BackendCart>(
    "/api/v1/cart/items/" + itemId,
    {
      method: "DELETE",
    },
  );
}

export async function clearBackendCart(): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart", {
    method: "DELETE",
  });
}

export async function replaceBackendCart(
  items: Array<{ productId: string; quantity: number; variantId?: string }>,
): Promise<BackendCart> {
  const seenProductIds = new Set<number>();

  const requestItems = items.map((item) => {
    const productId = toPositiveProductId(item.productId);
    const quantity = toPositiveQuantity(item.quantity);

    if (item.variantId) {
      throw new Error(
        "The current cart API cannot persist product variants. Please select the base product before continuing.",
      );
    }

    if (seenProductIds.has(productId)) {
      throw new Error(
        "Product " +
          productId +
          " appears more than once in the backend cart contract.",
      );
    }

    seenProductIds.add(productId);

    return { productId, quantity };
  });

  return apiClient.requestData<BackendCart>("/api/v1/cart", {
    method: "PUT",
    body: JSON.stringify(requestItems),
  });
}

/**
 * Merge guest/local cart lines into the backend cart by product identity.
 * Quantities are additive for the same product so neither side is silently
 * discarded during authentication migration.
 */
export function mergeCartLines(
  backend: BackendCart,
  localItems: CartItem[],
): Array<{ productId: string; quantity: number; variantId?: string }> {
  const merged = new Map<
    string,
    { productId: string; quantity: number; variantId?: string }
  >();

  for (const item of backend.items) {
    const productId = String(item.productId);
    merged.set(productId, {
      productId,
      quantity: toPositiveQuantity(item.quantity),
    });
  }

  for (const item of localItems) {
    const productId = String(item.productId);
    const existing = merged.get(productId);

    if (existing) {
      if (existing.variantId || item.variantId) {
        throw new Error(
          "Cannot merge variant cart lines with the current backend cart contract.",
        );
      }

      existing.quantity = toPositiveQuantity(
        existing.quantity + toPositiveQuantity(item.quantity),
      );
      continue;
    }

    merged.set(productId, {
      productId,
      quantity: toPositiveQuantity(item.quantity),
      variantId: item.variantId,
    });
  }

  return [...merged.values()];
}

export function mapBackendCartToLocal(
  backend: BackendCart,
  localItems: CartItem[] = [],
): CartItem[] {
  const cachedByProduct = new Map(
    localItems.map((item) => [item.productId, item]),
  );

  return backend.items.map((item) => {
    const cached = cachedByProduct.get(String(item.productId));

    return {
      productId: String(item.productId),
      backendItemId: item.id,
      name: item.productName,
      price: Number(item.productPrice),
      currency: item.currency ?? cached?.currency,
      priceUnit: "unit",
      quantity: item.quantity,
      image: cached?.image,
      minOrderQuantity: cached?.minOrderQuantity ?? 1,
      variantId: undefined,
      variantLabel: undefined,
      shippingCost: undefined,
      shippingMethod: undefined,
      estimatedDelivery: undefined,
    };
  });
}
