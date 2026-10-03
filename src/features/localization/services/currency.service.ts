// Canonical price formatters for the ALI STORE frontend.
// Backend amounts are displayed in their authoritative currency.
// No client-side currency conversion is performed.

function formatNumericAmount(
  amount: number,
  locale = "en-US",
): string {
  const value = Number.isFinite(amount) ? amount : 0;

  return value.toLocaleString(locale, {
    minimumFractionDigits:
      Math.round(value * 100) % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatSAR(amount: number): string {
  return formatNumericAmount(amount) + " ر.س";
}

export function formatCurrency(
  amount: number,
  currency?: string,
  locale = "en-US",
): string {
  const normalized = currency?.trim().toUpperCase();

  // Missing currency is an incomplete backend contract, not permission
  // to invent a denomination. Render a neutral numeric amount instead.
  if (!normalized) {
    return formatNumericAmount(amount, locale);
  }

  const value = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalized,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // An unsupported currency code is also rendered neutrally rather than
    // silently presenting the value as a different currency.
    return formatNumericAmount(amount, locale);
  }
}
