import type { CartItem } from "@/stores/cart-store";

const STORAGE_KEY = "alistore:guest-cart:v1";

function normalizeItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<CartItem>;
  const productId = typeof item.productId === "string" ? item.productId.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const price = Number(item.price);
  const quantity = Number(item.quantity);

  if (
    !productId ||
    !name ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return {
    productId,
    name,
    price,
    priceUnit: typeof item.priceUnit === "string" ? item.priceUnit : "unit",
    currency: typeof item.currency === "string" ? item.currency : undefined,
    quantity,
    image: typeof item.image === "string" ? item.image : undefined,
    minOrderQuantity:
      Number.isInteger(item.minOrderQuantity) && Number(item.minOrderQuantity) > 0
        ? Number(item.minOrderQuantity)
        : 1,
    shippingCost:
      typeof item.shippingCost === "number" && Number.isFinite(item.shippingCost)
        ? item.shippingCost
        : undefined,
    shippingMethod:
      typeof item.shippingMethod === "string" ? item.shippingMethod : undefined,
    estimatedDelivery:
      typeof item.estimatedDelivery === "string"
        ? item.estimatedDelivery
        : undefined,
    variantId: typeof item.variantId === "string" ? item.variantId : undefined,
    variantLabel:
      typeof item.variantLabel === "string" ? item.variantLabel : undefined,
  };
}

export function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const normalized = normalizeItem(item);
      return normalized ? [normalized] : [];
    });
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Guest persistence is best-effort; cart functionality must remain usable.
  }
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access failures.
  }
}
