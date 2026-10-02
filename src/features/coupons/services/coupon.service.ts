import type {
  AppliedCoupon,
  Coupon,
} from "../types/coupon.types";

import { formatSAR } from "@/features/localization/services/currency.service";

const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    maximumDiscount: 50,
    expiresAt:
      "2027-01-01T00:00:00.000Z",
    usedCount: 0,
    active: true,
    description:
      "10% off your order.",
  },

  {
    code: "SAVE20",
    type: "FIXED",
    value: 20,
    minimumOrderAmount: 100,
    expiresAt:
      "2027-01-01T00:00:00.000Z",
    usedCount: 0,
    active: true,
    description:
      `${formatSAR(20)} off orders of ${formatSAR(100)} or more.`,
  },

  {
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 0,
    expiresAt:
      "2027-01-01T00:00:00.000Z",
    usedCount: 0,
    active: true,
    description:
      "Free shipping on your order.",
  },
];

export interface CouponValidationResult {
  valid: boolean;

  message: string;

  applied?: AppliedCoupon;
}

export function validateCoupon(
  code: string,
  subtotal: number,
  shipping: number,
): CouponValidationResult {
  const normalizedCode =
    code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      message:
        "Enter a coupon code.",
    };
  }

  const coupon =
    coupons.find(
      (item) =>
        item.code ===
        normalizedCode,
    );

  if (!coupon) {
    return {
      valid: false,
      message:
        "Invalid coupon code.",
    };
  }

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
    ).getTime() <
    Date.now()
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
      message: `Minimum order amount is ${formatSAR(coupon.minimumOrderAmount)}.`,
    };
  }

  let discountAmount =
    0;

  let shippingDiscount =
    0;

  if (
    coupon.type ===
    "PERCENTAGE"
  ) {
    discountAmount =
      (subtotal *
        coupon.value) /
      100;

    if (
      coupon.maximumDiscount !==
        undefined
    ) {
      discountAmount =
        Math.min(
          discountAmount,
          coupon.maximumDiscount,
        );
    }
  }

  if (
    coupon.type ===
    "FIXED"
  ) {
    discountAmount =
      Math.min(
        coupon.value,
        subtotal,
      );
  }

  if (
    coupon.type ===
    "FREE_SHIPPING"
  ) {
    shippingDiscount =
      shipping;
  }

  const finalDiscount =
    discountAmount +
    shippingDiscount;

  return {
    valid: true,

    message:
      coupon.description,

    applied: {
      coupon,

      discountAmount,

      shippingDiscount,

      finalDiscount,
    },
  };
}