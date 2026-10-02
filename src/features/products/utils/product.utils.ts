export function normalizeProductSearch(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

export function calculateDiscountPercentage(
  originalPrice: number,
  currentPrice: number,
): number {
  if (
    originalPrice <= 0 ||
    currentPrice < 0 ||
    currentPrice >= originalPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - currentPrice) /
      originalPrice) *
      100,
  );
}

export function calculateTierPrice(
  unitPrice: number,
  quantity: number,
): number {
  if (quantity <= 0) {
    return unitPrice;
  }

  return Number(
    (unitPrice * quantity)
      .toFixed(2),
  );
}

export function isProductAvailable(
  stockQuantity: number,
  minOrderQuantity: number,
): boolean {
  return (
    stockQuantity >=
    Math.max(
      1,
      minOrderQuantity,
    )
  );
}

export function formatProductQuantity(
  quantity: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
  ).format(quantity);
}
