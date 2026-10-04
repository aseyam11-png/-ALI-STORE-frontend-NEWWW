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
      <div className="rounded-2xl border border-success-100 bg-success-surface p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-success-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-success-800">
              You unlocked free shipping!
            </p>

            <p className="mt-1 text-[11px] text-success-700">
              Your current order qualifies for free shipping.
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-info-surface p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand">
          <Truck className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-black text-foreground">
            Add{" "}
            <LocalizedPrice
              amountUSD={
                remaining
              }
              className="font-black text-brand"
            />{" "}
            more to unlock free shipping
          </p>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Free shipping starts at{" "}
            <LocalizedPrice
              amountUSD={
                threshold
              }
            />
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">

            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

          <div className="mt-2 flex justify-between text-[9px] font-bold text-neutral-400">

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