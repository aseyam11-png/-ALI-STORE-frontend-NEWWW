import { apiClient, HttpApiError } from "@/lib/api/http-client";
import type { AppliedCoupon, Coupon } from "../types/coupon.types";

type BackendCoupon = {
  id?: number;
  code: string;
  discountPercentage?: number | null;
  expirationDate?: string | null;
  isActive?: boolean | null;
  usageLimit?: number | null;
  timesUsed?: number | null;
  minimumOrderAmount?: number | null;
};

function toCoupon(input: BackendCoupon): Coupon {
  const value = Number(input.discountPercentage ?? 0);
  return {
    code: input.code,
    type: "PERCENTAGE",
    value,
    minimumOrderAmount: input.minimumOrderAmount ?? undefined,
    expiresAt: input.expirationDate ?? new Date(0).toISOString(),
    usageLimit: input.usageLimit ?? undefined,
    usedCount: Number(input.timesUsed ?? 0),
    active: Boolean(input.isActive),
    description: `${value}% off`,
  };
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  applied?: AppliedCoupon;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, message: "Enter a coupon code." };

  try {
    const coupon = toCoupon(
      await apiClient.requestData<BackendCoupon>(
        `/api/v1/coupons/validate/${encodeURIComponent(normalized)}`,
      ),
    );

    if (!coupon.active) return { valid: false, message: "This coupon is no longer active." };

    const expiresAt = new Date(coupon.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return { valid: false, message: "This coupon has expired." };
    }

    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: "This coupon has reached its usage limit." };
    }

    if (coupon.minimumOrderAmount !== undefined && subtotal < coupon.minimumOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${coupon.minimumOrderAmount}.`,
      };
    }

    const discountAmount = Math.min(
      subtotal,
      Number((subtotal * coupon.value / 100).toFixed(2)),
    );

    return {
      valid: true,
      message: coupon.description,
      applied: {
        coupon,
        discountAmount,
        shippingDiscount: 0,
        finalDiscount: discountAmount,
      },
    };
  } catch (error) {
    if (error instanceof HttpApiError && error.status === 404) {
      return { valid: false, message: "Invalid coupon code." };
    }
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Unable to validate coupon.",
    };
  }
}