"use client";

import {
  CheckCircle2,
  Tag,
  X,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  validateCoupon,
} from "@/features/coupons/services/coupon.service";

import type {
  AppliedCoupon,
} from "@/features/coupons/types/coupon.types";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

interface CouponInputProps {
  subtotal: number;

  onApply?: (
    coupon: AppliedCoupon,
  ) => void;

  onRemove?: () => void;
}

export function CouponInput({
  subtotal,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [
    code,
    setCode,
  ] = useState("");

  const [
    applied,
    setApplied,
  ] =
    useState<AppliedCoupon | null>(
      null,
    );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    valid,
    setValid,
  ] = useState<
    boolean | null
  >(null);

  const [applying, setApplying] = useState(false);

  const apply = async () => {
    setApplying(true);
    const result = await validateCoupon(code, subtotal);
    setApplying(false);

    setMessage(result.message);

    setValid(
      result.valid,
    );

    if (
      result.valid &&
      result.applied
    ) {
      setApplied(
        result.applied,
      );

      onApply?.(
        result.applied,
      );
    } else {
      setApplied(null);
    }
  };

  const remove = () => {
    setCode("");
    setApplied(null);
    setMessage("");
    setValid(null);
    onRemove?.();
  };

  if (applied) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-sm font-black text-emerald-800">
              Coupon applied
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              Code:{" "}
              <span className="font-black">
                {
                  applied.coupon.code
                }
              </span>
            </p>

            <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-emerald-700">

              Discount:

              <LocalizedPrice
                amountUSD={
                  applied.finalDiscount
                }
              />

            </div>

          </div>

          <button
            type="button"
            onClick={
              remove
            }
            aria-label="Remove coupon"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
          <Tag className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-900">
            Coupon or promo code
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Enter your discount code before placing the order.
          </p>
        </div>

      </div>

      <div className="mt-4 flex gap-2">

        <input
          value={code}
          onChange={(
            event,
          ) =>
            setCode(
              event.target.value,
            )
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="e.g. WELCOME10"
          aria-label="Coupon code"
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-bold uppercase outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={apply}
          disabled={!code.trim() || applying}
          className="h-11 rounded-xl bg-[#2563EB] px-5 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {applying ? "Checking..." : "Apply"}
        </button>

      </div>

      {message && (
        <p
          role={
            valid
              ? "status"
              : "alert"
          }
          className={`mt-3 text-xs font-bold ${
            valid
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-3 text-[9px] text-slate-400">
        Coupon availability is checked securely with ALI STORE.
      </div>

    </section>
  );
}