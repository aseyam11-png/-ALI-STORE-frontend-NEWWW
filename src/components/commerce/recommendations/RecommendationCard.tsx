"use client";

import {
  CheckCircle2,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";

import type { RecommendationProduct } from "@/features/recommendations/types/recommendation.types";
import { useCartStore } from "@/stores/cart-store";
import { formatSAR } from "@/features/localization/services/currency.service";

interface RecommendationCardProps {
  product: RecommendationProduct;
}

export function RecommendationCard({
  product,
}: RecommendationCardProps) {
  const addItem = useCartStore(
    (state) => state.addItem,
  );

  const addToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      supplierPrice:
        product.supplierPrice,
      priceUnit: "unit",
      quantity: 1,
      image: product.image,
      minOrderQuantity: 1,
      shippingMethod:
        product.shipping,
    });
  };

  return (
    <article className="min-w-[210px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex aspect-square items-center justify-center bg-slate-50 text-slate-300">
        <ShoppingCart className="h-10 w-10" />
      </div>

      <div className="p-4">

        <p className="text-[10px] font-black text-[#2563EB]">
          {product.brand}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-black">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {(product.rating ?? 0).toFixed(1)}
          </span>

          <span className="text-[10px] text-slate-400">
            ({product.reviewCount})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-black text-[#0F2747]">
            {formatSAR(product.price)}
          </span>

          <button
            type="button"
            onClick={addToCart}
            disabled={(product.stock ?? 0) <= 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          {product.shipping}
        </div>

      </div>
    </article>
  );
}
