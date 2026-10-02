import type { PricingRule } from "../types/pricing.types";

// Plain, server-safe data — deliberately NOT in a "use client" module.
// `src/stores/pricing-rule-store.ts` (client-only, Zustand) seeds its state
// from this same array for the admin pricing UI; server code (product
// detail SSR) reads this array directly. A client Zustand store's state
// never reaches the Node server process (there is no backend to persist
// admin edits to), so the server was always going to show pricing computed
// from this seed regardless — reading it directly here is what the
// previous `usePricingRuleStore.getState()` call from a Server Component
// was actually doing before it crashed (see PRICING_RULES_BUG in the
// forensic report): a "use client" module's exports become RSC client
// references when imported into server code, so `.getState` was never a
// real function there, not even for the very first, un-edited render.
export const pricingRulesSeed: PricingRule[] = [
  {
    id: "RULE-001",
    name: "Electronics + 10 SAR",
    category: "Electronics",
    type: "FIXED",
    value: 10,
    active: true,
    priority: 10,
  },

  {
    id: "RULE-002",
    name: "Home & Garden + 15 SAR",
    category: "Home & Garden",
    type: "FIXED",
    value: 15,
    active: true,
    priority: 10,
  },

  {
    id: "RULE-003",
    name: "Premium + 50%",
    category: "Premium",
    type: "PERCENTAGE",
    value: 50,
    active: true,
    priority: 10,
  },

  {
    id: "RULE-004",
    name: "Headphones Special + 20 SAR",
    productId: "p-001",
    type: "FIXED",
    value: 20,
    active: true,
    priority: 100,
  },
];

export function getActiveRule(
  rules: PricingRule[],
  productId?: string,
  category?: string,
): PricingRule | undefined {
  return rules
    .filter(
      (rule) =>
        rule.active &&
        ((productId && rule.productId === productId) ||
          (!rule.productId && category && rule.category === category)),
    )
    .sort((a, b) => b.priority - a.priority)[0];
}

export function getActiveRuleForCategory(
  rules: PricingRule[],
  category?: string,
): PricingRule | undefined {
  return rules
    .filter(
      (rule) =>
        rule.active && !rule.productId && rule.category === category,
    )
    .sort((a, b) => b.priority - a.priority)[0];
}
