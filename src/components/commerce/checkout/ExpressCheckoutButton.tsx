"use client";

import Link from "next/link";
import {
  ArrowRight,
  Zap,
} from "lucide-react";

import { useCustomerStore } from "@/stores/customer-store";
import { useCartStore } from "@/stores/cart-store";

export function ExpressCheckoutButton() {
  const items =
    useCartStore(
      (state) => state.items,
    );

  const getDefaultAddress =
    useCustomerStore(
      (state) =>
        state.getDefaultAddress,
    );

  const address =
    getDefaultAddress();

  if (
    items.length === 0 ||
    !address
  ) {
    return null;
  }

  return (
    <Link
      href="/shop/checkout?express=1"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-[#2563EB] transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
    >
      <Zap className="h-4 w-4" />
      Express checkout
      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
    </Link>
  );
}