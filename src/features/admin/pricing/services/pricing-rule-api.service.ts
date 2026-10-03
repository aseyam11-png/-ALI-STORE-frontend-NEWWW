import { apiClient } from "@/lib/api/http-client";

export type AdminPricingScope = "GLOBAL" | "CATEGORY" | "PRODUCT";
export type AdminPricingType = "PERCENTAGE_MARKUP" | "FIXED_MARKUP";

export type AdminPricingRule = {
  id: number;
  scope: AdminPricingScope;
  type: AdminPricingType;
  value: number;
  active: boolean;
  priority: number;
  categoryId?: number | null;
  categoryName?: string | null;
  productId?: number | null;
  productName?: string | null;
};

export type PricingRuleInput = {
  scope: AdminPricingScope;
  type: AdminPricingType;
  value: number;
  active?: boolean;
  priority?: number;
  categoryId?: number;
  productId?: number;
};

export async function getPricingRules(): Promise<AdminPricingRule[]> {
  return apiClient.requestData<AdminPricingRule[]>("/api/v1/admin/pricing/rules");
}

export async function createPricingRule(input: PricingRuleInput): Promise<AdminPricingRule> {
  return apiClient.requestData<AdminPricingRule>("/api/v1/admin/pricing/rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePricingRule(id: number, input: PricingRuleInput): Promise<AdminPricingRule> {
  return apiClient.requestData<AdminPricingRule>(`/api/v1/admin/pricing/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deletePricingRule(id: number): Promise<void> {
  await apiClient.requestData<void>(`/api/v1/admin/pricing/rules/${id}`, {
    method: "DELETE",
  });
}

export async function repriceProduct(productId: number): Promise<number> {
  return apiClient.requestData<number>(`/api/v1/admin/pricing/reprice/product/${productId}`, {
    method: "POST",
  });
}