"use client";

import {
  formatCurrency,
} from "@/features/localization/services/currency.service";

interface LocalizedPriceProps {
  amountUSD: number;
  currency?: string;
  className?: string;
}

// Prop name kept as `amountUSD` for API compatibility with older callers.
// When `currency` is provided, the backend currency is rendered directly;
// no client-side conversion or markup is performed.
export function LocalizedPrice({
  amountUSD,
  currency = "SAR",
  className = "",
}: LocalizedPriceProps) {
  return (
    <span
      className={
        className
      }
    >
      {formatCurrency(amountUSD, currency)}
    </span>
  );
}
