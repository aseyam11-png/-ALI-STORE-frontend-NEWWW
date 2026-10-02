export function formatCurrency(amount: number, currency = "SAR"): string {
  const value = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSAR(amount: number): string {
  return formatCurrency(amount, "SAR");
}
