import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export type BackendCoupon = {
  code: string;
  discountPercentage: number | string;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
  minimumOrderAmount?: number | string | null;
};

export async function validateBackendCoupon(code: string) {
  const response = await apiClient.request<ApiResponse<BackendCoupon>>(
    "/api/v1/coupons/validate/" + encodeURIComponent(code.trim().toUpperCase()),
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
}
