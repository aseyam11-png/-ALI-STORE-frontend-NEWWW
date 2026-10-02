import { apiClient } from "@/lib/api/http-client";
import type {
  BackendCart,
  BackendCartItem,
} from "@/lib/api/contracts";
import type { CartItem } from "@/stores/cart-store";

export async function getCart(): Promise<BackendCart> {
  return apiClient.request<BackendCart>(
    "/api/v1/cart",
  );
}

export async function addCartItem(
  productId: string,
  quantity: number,
): Promise<BackendCart> {
  return apiClient.request<BackendCart>(
    "/api/v1/cart/items",
    {
      method: "POST",
      body: JSON.stringify({
        productId: Number(productId),
        quantity,
      }),
    },
  );
}

export async function updateCartItem(
  itemId: number,
  productId: string,
  quantity: number,
): Promise<BackendCart> {
  return apiClient.request<BackendCart>(
    `/api/v1/cart/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        productId: Number(productId),
        quantity,
      }),
    },
  );
}

export async function removeCartItem(
  itemId: number,
): Promise<BackendCart> {
  return apiClient.request<BackendCart>(
    `/api/v1/cart/items/${itemId}`,
    {
      method: "DELETE",
    },
  );
}

export async function clearServerCart(): Promise<BackendCart> {
  return apiClient.request<BackendCart>(
    "/api/v1/cart",
    {
      method: "DELETE",
    },
  );
}

export async function syncLocalCart(
  items: CartItem[],
): Promise<BackendCart> {
  const current = await getCart();

  for (const item of current.items) {
    await removeCartItem(item.id);
  }

  for (const item of items) {
    await addCartItem(
      item.productId,
      Math.max(
        1,
        Math.floor(item.quantity),
      ),
    );
  }

  return getCart();
}

export function mapCartItem(
  item: BackendCartItem,
): CartItem {
  return {
    productId: String(item.productId),
    serverItemId: item.id,
    name: item.productName,
    price: Number(item.productPrice),
    priceUnit: "unit",
    quantity: item.quantity,
    currency: item.currency,
    minOrderQuantity: 1,
  };
}
