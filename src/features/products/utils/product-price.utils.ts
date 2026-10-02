// Note: this file previously also exported formatProductPrice(), a
// USD/Intl.NumberFormat "currency" formatter. It had zero live consumers
// (dead code) and directly contradicted the SAR-only pricing policy (see
// features/localization/services/currency.service.ts for the one canonical
// price formatter), so it was removed rather than left as a dormant
// USD-formatting landmine next to the real formatter.
export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number,
): number {
  const discount =
    Math.max(
      0,
      Math.min(
        100,
        discountPercentage,
      ),
    ) / 100;

  return Number(
    (
      price *
      (1 - discount)
    ).toFixed(2),
  );
}

export function calculateSavings(
  originalPrice: number,
  currentPrice: number,
): number {
  return Number(
    Math.max(
      0,
      originalPrice -
        currentPrice,
    ).toFixed(2),
  );
}
