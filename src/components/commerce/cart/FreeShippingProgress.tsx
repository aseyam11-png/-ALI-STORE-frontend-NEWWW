"use client";

import {
  CheckCircle2,
  Truck,
} from "lucide-react";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

interface FreeShippingProgressProps {
  subtotal: number;
  threshold: number;
}

export function FreeShippingProgress({
  subtotal,
  threshold,
}: FreeShippingProgressProps) {
  const remaining =
    Math.max(
      0,
      threshold -
        subtotal,
    );

  const percentage =
    Math.min(
      100,
      (subtotal /
        threshold) *
        100,
    );

  if (
    remaining <= 0
  ) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-emerald-800">
              You unlocked free shipping!
            </p>

            <p className="mt-1 text-[11px] text-emerald-700">
              Your current order qualifies for free shipping.
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2563EB]">
          <Truck className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-black text-slate-900">
            Add{" "}
            <LocalizedPrice
              amountUSD={
                remaining
              }
              className="font-black text-[#2563EB]"
            />{" "}
            more to unlock free shipping
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Free shipping starts at{" "}
            <LocalizedPrice
              amountUSD={
                threshold
              }
            />
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">

            <div
              className="h-full rounded-full bg-[#2563EB] transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

          <div className="mt-2 flex justify-between text-[9px] font-bold text-slate-400">

            <LocalizedPrice
              amountUSD={
                subtotal
              }
            />

            <LocalizedPrice
              amountUSD={
                threshold
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}