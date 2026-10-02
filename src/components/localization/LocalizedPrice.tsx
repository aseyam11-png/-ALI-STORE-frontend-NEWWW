"use client";

import {
  formatSAR,
} from "@/features/localization/services/currency.service";

interface LocalizedPriceProps {
  amountUSD: number;
  className?: string;
}

// Prop name kept as `amountUSD` for API stability with existing callers —
// the value is treated as the canonical SAR amount (no currency selection,
// no conversion). See currency.service.ts for the single formatting rule.
export function LocalizedPrice({
  amountUSD,
  className = "",
}: LocalizedPriceProps) {
  return (
    <span
      className={
        className
      }
    >
      {formatSAR(amountUSD)}
    </span>
  );
}
