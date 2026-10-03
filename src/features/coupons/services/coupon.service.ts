import type {
  AppliedCoupon,
  Coupon,
} from "../types/coupon.types";
import { apiClient } from "@/lib/api/http-client";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

interface BackendCoupon {
  id: number;
  code: string;
  discountPercentage: number | string;
  expirationDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
  minimumOrderAmount?: number | string | null;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.success === false) {
    throw new Error(response.message || "Coupon request failed");
  }
  return response.data;
}

function mapCoupon(coupon: BackendCoupon): Coupon {
  const value = Number(coupon.discountPercentage);

  return {
    code: coupon.code,
    type: "PERCENTAGE",
    value: Number.isFinite(value) ? value : 0,
    minimumOrderAmount:
      coupon.minimumOrderAmount == null
        ? undefined
        : Number(coupon.minimumOrderAmount),
    expiresAt: coupon.expirationDate,
    usageLimit: coupon.usageLimit ?? undefined,
    usedCount: coupon.timesUsed,
    active: coupon.isActive,
    description: `${coupon.discountPercentage}% discount`,
  };
}

export async function validateBackendCoupon(
  code: string,
  subtotal: number,
): Promise<AppliedCoupon> {
  const normalized = code.trim().toUpperCase();

  if (!normalized) {
    throw new Error("Enter a coupon code.");
  }

  const response = await apiClient.request<ApiEnvelope<BackendCoupon>>(
    `/api/v1/coupons/validate/${encodeURIComponent(normalized)}`,
  );

  const coupon = mapCoupon(unwrap(response));

  if (!coupon.active) {
    throw new Error("This coupon is no longer active.");
  }

  const minimum =
    coupon.minimumOrderAmount == null ? 0 : coupon.minimumOrderAmount;
  if (subtotal < minimum) {
    throw new Error(
      `Minimum order amount is ${minimum.toFixed(2)}.`,
    );
  }

  const discountAmount = Math.min(
    subtotal,
    (subtotal * Math.max(0, coupon.value)) / 100,
  );

  return {
    coupon,
    discountAmount,
    shippingDiscount: 0,
    finalDiscount: discountAmount,
  };
}
