"use client";

import { create } from "zustand";

import type {
  PricingRule,
} from "@/features/pricing/types/pricing.types";

import {
  getActiveRule as getActiveRuleFromRules,
  getActiveRuleForCategory as getActiveRuleForCategoryFromRules,
  pricingRulesSeed,
} from "@/features/pricing/data/pricing-rules.seed";

interface PricingRuleState {
  rules: PricingRule[];

  addRule: (
    rule: Omit<PricingRule, "id">,
  ) => void;

  updateRule: (
    id: string,
    patch: Partial<PricingRule>,
  ) => void;

  removeRule: (
    id: string,
  ) => void;

  getActiveRule: (
    productId?: string,
    category?: string,
  ) => PricingRule | undefined;

  getActiveRuleForCategory: (
    category?: string,
  ) => PricingRule | undefined;
}

export const usePricingRuleStore =
  create<PricingRuleState>(
    (set, get) => ({
      rules: pricingRulesSeed,

      addRule: (rule) => {
        set((state) => ({
          rules: [
            {
              ...rule,
              id: `RULE-${Date.now()}`,
            },
            ...state.rules,
          ],
        }));
      },

      updateRule: (
        id,
        patch,
      ) => {
        set((state) => ({
          rules:
            state.rules.map(
              (rule) =>
                rule.id === id
                  ? {
                      ...rule,
                      ...patch,
                    }
                  : rule,
            ),
        }));
      },

      removeRule: (id) => {
        set((state) => ({
          rules:
            state.rules.filter(
              (rule) =>
                rule.id !== id,
            ),
        }));
      },

      getActiveRule: (
        productId,
        category,
      ) =>
        getActiveRuleFromRules(
          get().rules,
          productId,
          category,
        ),

      getActiveRuleForCategory: (
        category,
      ) =>
        getActiveRuleForCategoryFromRules(
          get().rules,
          category,
        ),
    }),
  );
