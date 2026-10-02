"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { getVariantPrice, getVariantStock, getVariantLabel } from "@/features/products/services/variant.utils";

export function ProductActions({ product, selectedVariant }: { product: B2CProduct; selectedVariant?: B2CProductVariant }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const price = getVariantPrice(product, selectedVariant);
  const stock = getVariantStock(product, selectedVariant);
  const available = stock > 0 && (selectedVariant?.available ?? true);

  const addToCart = () => {
    if (!available) return;
    const safeQuantity = Math.min(quantity, stock);
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: safeQuantity,
      priceUnit: "piece",
      image: selectedVariant?.image ?? product.images[0]?.url,
      minOrderQuantity: 1,
      shippingMethod: product.shipping.method,
      estimatedDelivery: product.shipping.estimatedDelivery,
      variantId: selectedVariant?.id,
      variantLabel: getVariantLabel(selectedVariant),
    });
    setMessage("تمت إضافة المنتج إلى السلة.");
  };

  return (
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
      {selectedVariant && (
        <div className="mb-5 rounded-xl bg-info-surface px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-brand">الخيار المحدد</p>
          <p className="mt-1 text-sm font-black">{selectedVariant.name}: {selectedVariant.value}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black">الكمية</p>
          <p className="mt-1 text-xs text-neutral-400">{available ? "متوفر للطلب" : "غير متوفر حاليًا"}</p>
        </div>
        <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="إنقاص الكمية" className="flex h-11 w-11 items-center justify-center disabled:opacity-40"><Minus className="h-4 w-4" /></button>
          <span className="flex h-11 min-w-16 items-center justify-center border-x border-neutral-200 px-4 text-sm font-black">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={!available || quantity >= stock} aria-label="زيادة الكمية" className="flex h-11 w-11 items-center justify-center disabled:opacity-40"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={addToCart} disabled={!available} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-neutral-300">
          <ShoppingCart className="h-4 w-4" />
          أضف إلى السلة
        </button>
        <button type="button" onClick={() => { addToCart(); if (available) router.push("/shop/checkout"); }} disabled={!available} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-surface text-sm font-black text-brand disabled:cursor-not-allowed disabled:opacity-50">
          <Zap className="h-4 w-4" />
          اشترِ الآن
        </button>
      </div>
      {message && <p role="status" className="mt-4 text-sm font-bold text-success-700">{message}</p>}
    </div>
  );
}
