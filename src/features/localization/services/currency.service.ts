// Canonical price formatters for the ALI STORE frontend.
// Backend catalog amounts are displayed in their authoritative currency;
// no client-side currency conversion is performed.
export function formatSAR(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const hasFraction = Math.round(value * 100) % 100 !== 0;

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `${formatted} ر.س`;
}


export function formatCurrency(amount: number, currency: string, locale = "en-US"): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const normalized = currency?.trim().toUpperCase() || "USD";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalized,
    maximumFractionDigits: 2,
  }).format(value);
}
