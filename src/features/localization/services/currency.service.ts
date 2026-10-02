export function formatCurrency(
  amount: number,
  currency: string,
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const code = currency.trim().toUpperCase() || "SAR";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSAR(amount: number): string {
  return formatCurrency(amount, "SAR");
}
