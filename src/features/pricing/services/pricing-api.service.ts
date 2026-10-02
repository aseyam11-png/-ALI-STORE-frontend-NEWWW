import { apiClient } from "@/lib/api/http-client";

export type PricingRule = {
  id: number;
  name: string;
  scope: "PRODUCT" | "CATEGORY";
  productId?: number | null;
  productName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  type: "FIXED" | "PERCENTAGE";
  value: number;
  priority: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Page<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
};

export type PricingRuleInput = Omit<
  PricingRule,
  "id" | "productName" | "categoryName" | "createdAt" | "updatedAt"
>;

export async function getPricingRules() {
  return apiClient.request<Page<PricingRule>>(
    "/api/v1/admin/pricing-rules?page=0&size=100",
  );
}

export async function createPricingRule(input: PricingRuleInput) {
  return apiClient.request<PricingRule>("/api/v1/admin/pricing-rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePricingRule(id: number, input: PricingRuleInput) {
  return apiClient.request<PricingRule>("/api/v1/admin/pricing-rules/" + id, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deletePricingRule(id: number) {
  await apiClient.request<void>("/api/v1/admin/pricing-rules/" + id, {
    method: "DELETE",
  });
}

export async function previewSellingPrice(productId: number) {
  return apiClient.request<number>(
    "/api/v1/admin/pricing-rules/preview/" + productId,
  );
}
