// Canonical currency formatting for customer-facing prices.
// The backend is the source of truth for both the numeric amount and currency.
// No conversion is performed here.
export function formatCurrency(
  amount: number,
  currency: string,
): string {
  const value = Number.isFinite(amount)
    ? amount
    : 0;

  const normalized =
    (currency || "USD").toUpperCase();

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: normalized,
        maximumFractionDigits: 2,
      },
    ).format(value);
  } catch {
    return `${value.toFixed(2)} ${normalized}`;
  }
}

export function formatSAR(
  amount: number,
): string {
  return formatCurrency(
    amount,
    "SAR",
  );
}
