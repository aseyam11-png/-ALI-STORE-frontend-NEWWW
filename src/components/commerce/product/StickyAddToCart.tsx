"use client";

import { ShoppingCart } from "lucide-react";

import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { getVariantPrice, getVariantStock } from "@/features/products/services/variant.utils";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

interface StickyAddToCartProps {
  product: B2CProduct;
  selectedVariant?: B2CProductVariant;
}

export function StickyAddToCart({
  product,
  selectedVariant,
}: StickyAddToCartProps) {
  const selectedStock = getVariantStock(product, selectedVariant);
  const available =
    selectedStock > 0 &&
    (selectedVariant?.available ?? true) &&
    (product.stockStatus === "in_stock" ||
      product.stockStatus === "low_stock");
  const price = getVariantPrice(product, selectedVariant);

  const activatePrimaryCartAction = () => {
    const button = document.getElementById(
      "primary-product-add-to-cart",
    );

    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return;
    }

    button.click();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-surface/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-neutral-600">
            {product.name}
          </p>
          <LocalizedPrice
            amountUSD={price}
            currency={product.currency}
            className="mt-0.5 text-base font-black text-brand-ink"
          />
        </div>

        <button
          type="button"
          onClick={activatePrimaryCartAction}
          disabled={!available}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          aria-label={"Add " + product.name + " to cart"}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {available ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
