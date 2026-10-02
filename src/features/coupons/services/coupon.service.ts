import { apiClient } from "@/lib/api/http-client";
import type {
  BackendCoupon,
} from "@/lib/api/contracts";

import type {
  AppliedCoupon,
  Coupon,
} from "../types/coupon.types";

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  applied?: AppliedCoupon;
}

function mapCoupon(
  coupon: BackendCoupon,
): Coupon {
  return {
    code: coupon.code,
    type: "PERCENTAGE",
    value: Number(
      coupon.discountPercentage,
    ),
    minimumOrderAmount:
      coupon.minimumOrderAmount ??
      undefined,
    expiresAt:
      coupon.expirationDate,
    usageLimit:
      coupon.usageLimit ??
      undefined,
    usedCount:
      coupon.timesUsed,
    active:
      coupon.isActive,
    description:
      `${Number(coupon.discountPercentage)}% discount`,
  };
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  shipping: number,
): Promise<CouponValidationResult> {
  const normalizedCode =
    code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      message: "Enter a coupon code.",
    };
  }

  try {
    const backendCoupon =
      await apiClient.request<BackendCoupon>(
        `/api/v1/coupons/validate/${encodeURIComponent(normalizedCode)}`,
      );

    const coupon =
      mapCoupon(backendCoupon);

    if (!coupon.active) {
      return {
        valid: false,
        message:
          "This coupon is no longer active.",
      };
    }

    if (
      new Date(
        coupon.expiresAt,
      ).getTime() <= Date.now()
    ) {
      return {
        valid: false,
        message:
          "This coupon has expired.",
      };
    }

    if (
      coupon.usageLimit !==
        undefined &&
      coupon.usedCount >=
        coupon.usageLimit
    ) {
      return {
        valid: false,
        message:
          "This coupon has reached its usage limit.",
      };
    }

    if (
      coupon.minimumOrderAmount !==
        undefined &&
      subtotal <
        coupon.minimumOrderAmount
    ) {
      return {
        valid: false,
        message:
          `Minimum order amount is ${coupon.minimumOrderAmount}.`,
      };
    }

    const discountAmount =
      Math.min(
        subtotal,
        (subtotal *
          coupon.value) /
          100,
      );

    void shipping;

    return {
      valid: true,
      message:
        coupon.description,
      applied: {
        coupon,
        discountAmount,
        shippingDiscount: 0,
        finalDiscount:
          discountAmount,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid coupon code.",
    };
  }
}
