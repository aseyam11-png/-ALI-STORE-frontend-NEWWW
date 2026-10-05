import type { WishlistProduct } from "@/features/wishlist/types/wishlist.types";

const STORAGE_KEY = "alistore:guest-wishlist:v1";

function normalizeProduct(value: unknown): WishlistProduct | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<WishlistProduct>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const price = Number(item.price);

  if (!id || !name || !Number.isFinite(price) || price < 0) {
    return null;
  }

  return {
    id,
    name,
    price,
    image: typeof item.image === "string" ? item.image : undefined,
    brand: typeof item.brand === "string" ? item.brand : undefined,
    category: typeof item.category === "string" ? item.category : undefined,
    currency: typeof item.currency === "string" ? item.currency : undefined,
    originalPrice:
      typeof item.originalPrice === "number" && Number.isFinite(item.originalPrice)
        ? item.originalPrice
        : undefined,
    discountPercentage:
      typeof item.discountPercentage === "number" &&
      Number.isFinite(item.discountPercentage)
        ? item.discountPercentage
        : undefined,
    rating:
      typeof item.rating === "number" && Number.isFinite(item.rating)
        ? item.rating
        : undefined,
    reviewCount:
      typeof item.reviewCount === "number" &&
      Number.isFinite(item.reviewCount)
        ? item.reviewCount
        : undefined,
  };
}

export function readGuestWishlist(): WishlistProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    return parsed.flatMap((item) => {
      const normalized = normalizeProduct(item);
      if (!normalized || seen.has(normalized.id)) return [];
      seen.add(normalized.id);
      return [normalized];
    });
  } catch {
    return [];
  }
}

export function writeGuestWishlist(items: WishlistProduct[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Guest persistence is best-effort.
  }
}

export function clearGuestWishlist(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access failures.
  }
}
