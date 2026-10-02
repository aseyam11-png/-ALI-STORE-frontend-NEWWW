import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/http-client";

export interface BackendCoupon {
  id: number;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number;
  timesUsed: number;
  minimumOrderAmount?: number;
}

export async function validateServerCoupon(code: string) {
  const response = await apiClient.request<ApiResponse<BackendCoupon>>(
    "/api/v1/coupons/validate/" + encodeURIComponent(code.trim().toUpperCase()),
  );
  return response.data;
}
