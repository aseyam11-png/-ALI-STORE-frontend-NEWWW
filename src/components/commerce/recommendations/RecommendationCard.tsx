"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Plus, ShoppingCart, Star } from "lucide-react";

import type { RecommendationProduct } from "@/features/recommendations/types/recommendation.types";
import {
  addBackendCartItem,
  mapBackendCartToLocal,
} from "@/features/cart/services/cart-api.service";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/features/auth/session";
import { formatCurrency } from "@/features/localization/services/currency.service";

interface RecommendationCardProps {
  product: RecommendationProduct;
}

export function RecommendationCard({
  product,
}: RecommendationCardProps) {
  const session = useSession();
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addToCart = async () => {
    if (
      busy ||
      (product.stock ?? 0) <= 0
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const localLine = {
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        priceUnit: "unit",
        quantity: 1,
        image: product.image ?? product.imageUrl,
        minOrderQuantity: 1,
      };

      if (session.status === "authenticated") {
        const numericId = Number(product.id);
        if (!Number.isInteger(numericId) || numericId < 1) {
          throw new Error("Invalid product id.");
        }

        const currentItems = useCartStore.getState().items;
        const backend = await addBackendCartItem(numericId, 1);

        replaceItems(
          mapBackendCartToLocal(
            backend,
            [...currentItems, localLine],
          ),
        );
      } else {
        addLocalItem(localLine);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to add the product to your cart.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="min-w-[210px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link
        href={product.href ?? ("/shop/products/" + encodeURIComponent(product.id))}
        className="block"
      >
        <div className="relative aspect-square bg-slate-50">
          {product.image ?? product.imageUrl ? (
            <Image
              src={product.image ?? product.imageUrl ?? ""}
              alt={product.name}
              fill
              sizes="210px"
              className="object-contain p-6"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="text-[10px] font-black text-[#2563EB]">
            {product.brand}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-black">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {(product.rating ?? 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400">
            ({product.reviewCount ?? 0})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-black text-[#0F2747]">
            {formatCurrency(
              product.price,
              product.currency ?? "USD",
            )}
          </span>

          <button
            type="button"
            onClick={() => void addToCart()}
            disabled={busy || (product.stock ?? 0) <= 0}
            aria-busy={busy}
            aria-label={"Add " + product.name + " to cart"}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-[10px] font-bold text-red-600">
            {error}
          </p>
        )}

        {product.shipping && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            {product.shipping}
          </div>
        )}
      </div>
    </article>
  );
}
