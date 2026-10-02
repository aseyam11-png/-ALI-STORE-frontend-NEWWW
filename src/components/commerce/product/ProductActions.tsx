"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingCart, Zap } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { formatSAR } from "@/features/localization/services/currency.service";
import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { getVariantPrice, getVariantStock, getVariantLabel } from "@/features/products/services/variant.utils";

export function ProductActions({
  product,
  selectedVariant,
}: {
  product: B2CProduct;
  selectedVariant?: B2CProductVariant;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const price = getVariantPrice(product, selectedVariant);
  const stock = getVariantStock(product, selectedVariant);
  const available = product.availability === "IN_STOCK" && stock > 0 && (selectedVariant?.available ?? true);

  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
    setMessage("");
  };

  const increase = () => {
    if (!available) return;
    setQuantity((current) => Math.min(stock, current + 1));
    setMessage("");
  };

  const addToCart = () => {
    if (!available) return;

    addItem({
      productId: product.id,
      name: product.name,
      price,
      priceUnit: "piece",
      quantity,
      image: selectedVariant?.image ?? product.images[0]?.url,
      minOrderQuantity: 1,
      shippingMethod: "STANDARD",
      estimatedDelivery: "تظهر بعد اختيار الشحن",
      variantId: selectedVariant?.id,
      variantLabel: getVariantLabel(selectedVariant),
    });

    setMessage("تمت إضافة المنتج إلى السلة.");
  };

  const buyNow = () => {
    addToCart();
    if (available) router.push("/shop/checkout");
  };

  return (
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
      {selectedVariant && (
        <div className="mb-5 rounded-xl bg-info-surface px-4 py-3">
          <p className="text-label font-medium uppercase tracking-wide text-brand">الخيار</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{selectedVariant.name}</span>
            <span className="text-xs font-bold text-brand">{selectedVariant.value}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">الكمية</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {product.availability === "UNKNOWN"
              ? "التوفر سيتأكد من الخادم عند إتمام الطلب."
              : available
                ? "المنتج متوفر للطلب."
                : "المنتج غير متوفر حاليًا."}
          </p>
        </div>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-neutral-200">
          <button type="button" onClick={decrease} disabled={quantity <= 1} aria-label="تقليل الكمية" className="flex h-11 w-11 items-center justify-center text-neutral-600 disabled:opacity-40">
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-11 min-w-14 items-center justify-center border-x border-neutral-200 px-4 text-sm font-black" aria-live="polite">
            {quantity}
          </span>
          <button type="button" onClick={increase} disabled={!available || quantity >= stock} aria-label="زيادة الكمية" className="flex h-11 w-11 items-center justify-center text-neutral-600 disabled:opacity-40">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">الإجمالي المبدئي</p>
          <p className="mt-1 text-2xl font-black text-foreground">{formatSAR(price * quantity)}</p>
        </div>
        {product.flashSale && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-danger-surface px-2.5 py-1 text-xs font-black text-danger-700">
            <Zap className="h-3.5 w-3.5" />
            خصم {product.discountPercentage}%
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={addToCart} disabled={!available} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300">
          <ShoppingCart className="h-4 w-4" />
          {available ? "أضف إلى السلة" : "غير متوفر"}
        </button>
        <button type="button" onClick={buyNow} disabled={!available} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-surface text-sm font-bold text-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40">
          <Zap className="h-4 w-4" />
          اشترِ الآن
        </button>
      </div>

      {message && (
        <p role="status" className="mt-4 flex items-center gap-2 text-xs font-bold text-success-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      )}
    </div>
  );
}
