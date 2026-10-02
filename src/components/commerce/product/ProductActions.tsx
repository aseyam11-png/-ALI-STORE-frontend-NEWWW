"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { formatSAR } from "@/features/localization/services/currency.service";
import type {
  B2CProduct,
  B2CProductVariant,
} from "@/features/products/types/b2c-product.types";

import {
  getVariantPrice,
  getVariantStock,
  getVariantLabel,
} from "@/features/products/services/variant.utils";

interface ProductActionsProps {
  product: B2CProduct;
  selectedVariant?: B2CProductVariant;
}

export function ProductActions({
  product,
  selectedVariant,
}: ProductActionsProps) {
  const router = useRouter();

  const addItem = useCartStore(
    (state) => state.addItem,
  );

  const [quantity, setQuantity] =
    useState(1);

  const [message, setMessage] =
    useState("");

  const price =
    getVariantPrice(
      product,
      selectedVariant,
    );

  const stock =
    getVariantStock(
      product,
      selectedVariant,
    );

  const available =
    stock > 0 &&
    (selectedVariant?.available ??
      true);

  const subtotal =
    price * quantity;

  const increase = () => {
    if (quantity < stock) {
      setQuantity(
        (current) =>
          current + 1,
      );

      setMessage("");
    }
  };

  const decrease = () => {
    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1,
        ),
    );

    setMessage("");
  };

  const addToCart = () => {
    if (!available) {
      return;
    }

    addItem({
      productId:
        product.id,

      name:
        product.name,

      price,

      currency:
        product.currency,

      supplierPrice:
        product.supplierPrice,

      priceUnit:
        "unit",

      quantity,

      image:
        selectedVariant?.image ??
        product.images[0]?.url,

      minOrderQuantity:
        1,

      shippingCost:
        product.shipping.free
          ? 0
          : undefined,

      shippingMethod:
        product.shipping.method,

      estimatedDelivery:
        product.shipping
          .estimatedDelivery,

      variantId:
        selectedVariant?.id,

      variantLabel:
        getVariantLabel(
          selectedVariant,
        ),
    });
  };

  const handleAddToCart = () => {
    addToCart();

    setMessage(
      "Product added to cart.",
    );
  };

  const handleBuyNow = () => {
    if (!available) {
      return;
    }

    addToCart();
    router.push("/shop/checkout");
  };

  return (
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">

      {selectedVariant && (
        <div className="mb-5 rounded-xl bg-info-surface px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-brand">
            Selected variant
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-foreground">
              {selectedVariant.name}
            </span>

            <span className="text-xs font-bold text-brand">
              {selectedVariant.value}
            </span>

            {selectedVariant.sku && (
              <span className="text-[10px] font-mono text-neutral-400">
                SKU:{" "}
                {
                  selectedVariant.sku
                }
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-black text-foreground">
            Quantity
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {available
              ? `${stock} available`
              : "This option is currently unavailable"}
          </p>
        </div>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-neutral-200">

          <button
            type="button"
            onClick={decrease}
            disabled={
              quantity <= 1
            }
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span
            className="flex h-11 min-w-16 items-center justify-center border-x border-neutral-200 px-4 text-sm font-black"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={increase}
            disabled={
              !available ||
              quantity >= stock
            }
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>

        </div>

      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-4">

        <span className="text-sm text-neutral-500">
          Estimated subtotal
        </span>

        <span className="text-2xl font-black text-foreground">
          {formatSAR(subtotal)}
        </span>

      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <button
          type="button"
          onClick={
            handleAddToCart
          }
          disabled={!available}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface text-sm font-black text-neutral-800 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </button>

        <button
          type="button"
          onClick={
            handleBuyNow
          }
          disabled={!available}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <Zap className="h-4 w-4" />
          Buy now
        </button>

      </div>

      {message && (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl bg-success-surface px-4 py-3 text-sm font-semibold text-success-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

    </div>
  );
}
