export type CouponType =
  | "PERCENTAGE"
  | "FIXED"
  | "FREE_SHIPPING";

export interface Coupon {
  code: string;

  type: CouponType;

  value: number;

  minimumOrderAmount?: number;

  maximumDiscount?: number;

  expiresAt: string;

  usageLimit?: number;

  usedCount: number;

  active: boolean;

  description: string;
}

export interface AppliedCoupon {
  coupon: Coupon;

  discountAmount: number;

  shippingDiscount: number;

  finalDiscount: number;
}