// Canonical, single-currency price formatter for the ALI STORE frontend.
// Business decision: SAR (Saudi Riyal) only — no multi-currency selection.
// This is the one place price amounts are turned into display strings;
// every price-bearing component should render through this instead of
// hand-rolling "$" / "SAR" / toFixed(2) strings, so the whole app shows one
// consistent format. Amounts are formatted as-is (no unit conversion) —
// they are treated as already being in SAR.
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
