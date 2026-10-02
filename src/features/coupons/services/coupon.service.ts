import type { AppliedCoupon, Coupon } from "../types/coupon.types";
import { formatSAR } from "@/features/localization/services/currency.service";
import { apiClient, HttpApiError } from "@/lib/api/http-client";

type BackendCoupon = {
  id: number;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
  minimumOrderAmount?: number | null;
};

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  applied?: AppliedCoupon;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  shipping: number,
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, message: "Enter a coupon code." };
  }

  try {
    const backendCoupon = await apiClient.request<BackendCoupon>(
      `/api/v1/coupons/validate/${encodeURIComponent(normalizedCode)}`,
    );

    if (backendCoupon.minimumOrderAmount != null && subtotal < backendCoupon.minimumOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${formatSAR(backendCoupon.minimumOrderAmount)}.`,
      };
    }

    const discountAmount = Math.min(
      subtotal,
      (subtotal * Number(backendCoupon.discountPercentage)) / 100,
    );

    const coupon: Coupon = {
      code: backendCoupon.code,
      type: "PERCENTAGE",
      value: Number(backendCoupon.discountPercentage),
      minimumOrderAmount: backendCoupon.minimumOrderAmount ?? undefined,
      expiresAt: backendCoupon.expirationDate,
      usageLimit: backendCoupon.usageLimit ?? undefined,
      usedCount: backendCoupon.timesUsed,
      active: backendCoupon.isActive,
      description: `${backendCoupon.discountPercentage}% off your order.`,
    };

    return {
      valid: true,
      message: `${backendCoupon.discountPercentage}% discount applied.`,
      applied: {
        coupon,
        discountAmount,
        shippingDiscount: 0,
        finalDiscount: discountAmount,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message:
        error instanceof HttpApiError
          ? error.message
          : "Unable to validate coupon right now.",
    };
  }
}
