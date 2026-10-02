import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminPricingRule = {
  id: number;
  name: string;
  productId?: number | null;
  categoryId?: number | null;
  type: "FIXED" | "PERCENTAGE";
  value: number | string;
  active: boolean;
  priority: number;
};

export async function getPricingRules() {
  const response = await apiClient.request<ApiResponse<AdminPricingRule[]>>(
    "/api/v1/admin/pricing-rules",
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function createPricingRule(input: Omit<AdminPricingRule, "id">) {
  const response = await apiClient.request<ApiResponse<AdminPricingRule>>(
    "/api/v1/admin/pricing-rules",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function updatePricingRule(
  id: number,
  input: Omit<AdminPricingRule, "id">,
) {
  const response = await apiClient.request<ApiResponse<AdminPricingRule>>(
    "/api/v1/admin/pricing-rules/" + id,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function deletePricingRule(id: number) {
  const response = await apiClient.request<ApiResponse<null>>(
    "/api/v1/admin/pricing-rules/" + id,
    { method: "DELETE" },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}
