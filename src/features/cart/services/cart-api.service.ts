import { apiClient } from "@/lib/api/http-client";
import type { CartItem } from "@/stores/cart-store";

export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  variantId?: number | null;
  variantName?: string | null;
  variantValue?: string | null;
  variantSku?: string | null;
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

function toPositiveVariantId(variantId?: string) {
  if (!variantId) return undefined;
  const numericId = Number(variantId);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error("Invalid backend variant id: " + variantId);
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
  variantId?: string,
): Promise<BackendCart> {
  return apiClient.requestData<BackendCart>("/api/v1/cart/items", {
    method: "POST",
    body: JSON.stringify({
      productId: toPositiveProductId(productId),
      ...(toPositiveVariantId(variantId) !== undefined
        ? { variantId: toPositiveVariantId(variantId) }
        : {}),
      quantity: toPositiveQuantity(quantity),
    }),
  });
}

export async function updateBackendCartItem(
  itemId: number,
  quantity: number,
  productId: number,
  variantId?: string,
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
        ...(toPositiveVariantId(variantId) !== undefined
          ? { variantId: toPositiveVariantId(variantId) }
          : {}),
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
  const seenCartLines = new Set<string>();

  const requestItems = items.map((item) => {
    const productId = toPositiveProductId(item.productId);
    const quantity = toPositiveQuantity(item.quantity);

    const variantId = toPositiveVariantId(item.variantId);
    const lineKey = productId + ":" + (variantId ?? "base");

    if (seenCartLines.has(lineKey)) {
      throw new Error("The same product variant appears more than once in the backend cart contract.");
    }

    seenCartLines.add(lineKey);

    return {
      productId,
      ...(variantId !== undefined ? { variantId } : {}),
      quantity,
    };
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
    const variantId = item.variantId == null ? undefined : String(item.variantId);
    const key = productId + ":" + (variantId ?? "base");
    merged.set(key, {
      productId,
      quantity: toPositiveQuantity(item.quantity),
      variantId,
    });
  }

  for (const item of localItems) {
    const productId = String(item.productId);
    const variantId = item.variantId;
    const key = productId + ":" + (variantId ?? "base");
    const existing = merged.get(key);

    if (existing) {

      existing.quantity = toPositiveQuantity(
        existing.quantity + toPositiveQuantity(item.quantity),
      );
      continue;
    }

    merged.set(key, {
      productId,
      quantity: toPositiveQuantity(item.quantity),
      variantId,
    });
  }

  return [...merged.values()];
}

export function mapBackendCartToLocal(
  backend: BackendCart,
  localItems: CartItem[] = [],
): CartItem[] {
  const cachedByLine = new Map(
    localItems.map((item) => [
      item.productId + ":" + (item.variantId ?? "base"),
      item,
    ]),
  );

  return backend.items.map((item) => {
    const key = String(item.productId) + ":" + (item.variantId == null ? "base" : String(item.variantId));
    const cached = cachedByLine.get(key);

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
      variantId: item.variantId == null ? undefined : String(item.variantId),
      variantLabel: item.variantName && item.variantValue
        ? item.variantName + ": " + item.variantValue
        : undefined,
      shippingCost: undefined,
      shippingMethod: undefined,
      estimatedDelivery: undefined,
    };
  });
}
