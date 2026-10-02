"use client";

import { CheckCircle2, Tag, X } from "lucide-react";
import { useState } from "react";
import { validateServerCoupon, type BackendCoupon } from "@/features/coupons/services/coupon-api.service";
import { formatSAR } from "@/features/localization/services/currency.service";

interface CouponInputProps {
  subtotal: number;
  onApply?: (value: { code: string; discountAmount: number }) => void;
  onRemove?: () => void;
}

export function CouponInput({ subtotal, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<BackendCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setMessage("");
    setValid(null);

    try {
      const coupon = await validateServerCoupon(code);
      if (!coupon.isActive) throw new Error("الكوبون غير فعال.");
      if (new Date(coupon.expirationDate).getTime() < Date.now()) throw new Error("انتهت صلاحية الكوبون.");
      if (coupon.minimumOrderAmount !== undefined && subtotal < coupon.minimumOrderAmount) {
        throw new Error("قيمة الطلب لا تحقق الحد الأدنى لهذا الكوبون.");
      }

      const discount = Math.min(
        subtotal,
        Number(((subtotal * Number(coupon.discountPercentage)) / 100).toFixed(2)),
      );

      setApplied(coupon);
      setDiscountAmount(discount);
      setValid(true);
      setMessage("تم تطبيق الكوبون.");
      onApply?.({ code: coupon.code, discountAmount: discount });
    } catch (error) {
      setApplied(null);
      setDiscountAmount(0);
      setValid(false);
      setMessage(error instanceof Error ? error.message : "تعذر التحقق من الكوبون.");
      onRemove?.();
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setCode("");
    setApplied(null);
    setDiscountAmount(0);
    setMessage("");
    setValid(null);
    onRemove?.();
  };

  return applied ? (
    <section className="rounded-2xl border border-success-200 bg-success-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-success-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-success-800">Coupon applied</p>
          <p className="mt-1 text-xs text-success-700">Code: <span className="font-black">{applied.code}</span></p>
          <p className="mt-2 text-xs font-black text-success-700">
            Discount: {formatSAR(discountAmount)}
          </p>
        </div>
        <button type="button" onClick={remove} aria-label="Remove coupon" className="flex h-8 w-8 items-center justify-center rounded-lg text-success-600 hover:bg-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  ) : (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-brand">
          <Tag className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-black text-foreground">Coupon or promo code</h2>
          <p className="mt-1 text-xs text-muted-foreground">سيتم التحقق من الكود مع الخادم.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          placeholder="WELCOME10"
          aria-label="Coupon code"
          className="h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 text-sm font-bold uppercase outline-none focus:border-brand"
        />
        <button type="button" onClick={() => void apply()} disabled={!code.trim() || loading} className="h-11 rounded-xl bg-brand px-5 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-neutral-300">
          {loading ? "..." : "Apply"}
        </button>
      </div>

      {message && (
        <p role={valid ? "status" : "alert"} className={"mt-3 text-xs font-bold " + (valid ? "text-success-600" : "text-danger-600")}>
          {message}
        </p>
      )}
    </section>
  );
}
