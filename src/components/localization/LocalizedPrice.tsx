"use client";

import { formatCurrency } from "@/features/localization/services/currency.service";

interface LocalizedPriceProps {
  amount?: number;
  amountUSD?: number;
  currency?: string;
  className?: string;
}

export function LocalizedPrice({
  amount,
  amountUSD,
  currency,
  className = "",
}: LocalizedPriceProps) {
  const value = amount ?? amountUSD;

  if (value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return (
    <span className={className}>
      {currency
        ? formatCurrency(value, currency)
        : value.toLocaleString("en-US", {
            minimumFractionDigits:
              Number.isInteger(value) ? 0 : 2,
            maximumFractionDigits: 2,
          })}
    </span>
  );
}
