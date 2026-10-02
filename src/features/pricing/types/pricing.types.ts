export type PricingMode =
  | "AUTOMATIC"
  | "MANUAL";

export type PricingRuleType =
  | "FIXED"
  | "PERCENTAGE";

export interface PricingRule {
  id: string;

  name: string;

  productId?: string;

  category?: string;

  type: PricingRuleType;

  value: number;

  active: boolean;

  priority: number;
}
