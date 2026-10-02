import type {
  PricingMode,
  PricingRule,
} from "../types/pricing.types";

export function calculateSellingPrice(
  supplierPrice: number,
  mode: PricingMode,
  rule?: PricingRule,
  manualPrice?: number,
) {
  const safeSupplierPrice =
    Math.max(
      0,
      Number(supplierPrice) || 0,
    );

  if (mode === "MANUAL") {
    return Math.max(
      0,
      Number(manualPrice) ||
        safeSupplierPrice,
    );
  }

  if (
    !rule ||
    !rule.active
  ) {
    return safeSupplierPrice;
  }

  if (
    rule.type === "FIXED"
  ) {
    return Math.max(
      0,
      safeSupplierPrice +
        rule.value,
    );
  }

  return Math.max(
    0,
    safeSupplierPrice *
      (1 + rule.value / 100),
  );
}

export function calculateProfitPerUnit(
  supplierPrice: number,
  sellingPrice: number,
) {
  return Math.max(
    0,
    Number(sellingPrice) -
      Number(supplierPrice),
  );
}

export function roundPrice(
  value: number,
) {
  return Math.round(
    value * 100,
  ) / 100;
}
