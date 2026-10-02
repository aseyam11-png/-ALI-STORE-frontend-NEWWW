import { apiClient } from "@/lib/api/http-client";

export interface BackendCoupon {
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
  minimumOrderAmount?: number | null;
}

export const couponApi = {
  validate: (code: string) =>
    apiClient.get<BackendCoupon>(`/coupons/validate/${encodeURIComponent(code.trim().toUpperCase())}`),
};
