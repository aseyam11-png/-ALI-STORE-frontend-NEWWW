"use client";

import { formatCurrency } from "@/features/localization/services/currency.service";

interface LocalizedPriceProps {
  amountUSD: number;
  currency?: string;
  className?: string;
}

export function LocalizedPrice({
  amountUSD,
  currency = "SAR",
  className = "",
}: LocalizedPriceProps) {
  return (
    <span className={className}>
      {formatCurrency(amountUSD, currency)}
    </span>
  );
}
