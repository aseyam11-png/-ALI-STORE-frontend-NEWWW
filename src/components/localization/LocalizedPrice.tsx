"use client";

import { formatCurrency } from "@/features/localization/services/currency.service";

interface LocalizedPriceProps {
  amount: number;
  currency: string;
  className?: string;
}

export function LocalizedPrice({
  amount,
  currency,
  className = "",
}: LocalizedPriceProps) {
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
