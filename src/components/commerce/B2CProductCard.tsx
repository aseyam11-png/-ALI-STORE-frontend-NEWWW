"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Heart, ShoppingCart, Star, Truck, Zap } from "lucide-react";

import type { B2CProduct } from "@/features/products/types/b2c-product.types";
import { formatSAR } from "@/features/localization/services/currency.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslation } from "@/lib/i18n/dictionary";
import { useSession } from "@/features/auth/session";
import {
  addServerWishlistItem,
  removeServerWishlistItem,
} from "@/features/wishlist/services/wishlist-api.service";

export function B2CProductCard({ product }: { product: B2CProduct }) {
  const { t } = useTranslation();
  const session = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const saved = useWishlistStore((state) => state.productIds.includes(product.id));
  const available = product.availability === "IN_STOCK";

  const handleCart = () => {
    if (!available) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      priceUnit: "piece",
      quantity: 1,
      image: product.images[0]?.url,
      minOrderQuantity: 1,
      shippingMethod: product.shipping.method,
      estimatedDelivery: product.shipping.estimatedDelivery,
    });
  };

  const handleWishlist = async () => {
    const snapshot = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      brand: product.brand,
      category: product.category,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      reviewCount: product.reviewCount,
    };

    try {
      if (session.status === "authenticated") {
        if (saved) {
          await removeServerWishlistItem(product.id);
        } else {
          await addServerWishlistItem(product.id);
        }
      }

      toggleWishlist(snapshot);
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      brand: product.brand,
      category: product.category,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      reviewCount: product.reviewCount,
    });
    } catch {
      return;
    }
  };

  const oldPrice = product.originalPrice && product.originalPrice > product.price
    ? formatSAR(product.originalPrice)
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link
          href={"/shop/products/" + encodeURIComponent(product.id)}
          className="absolute inset-0"
          aria-label={t("viewProduct", { name: product.name })}
        >
          {product.images[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-6 transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold text-neutral-300">
              {t("noImage")}
            </div>
          )}
        </Link>

        {product.flashSale && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-lg bg-danger-500 px-2.5 py-1 text-[10px] font-black text-white">
            <Zap className="h-3 w-3" />
            -{product.discountPercentage}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={saved ? t("removeFromWishlist", { name: product.name }) : t("addToWishlist", { name: product.name })}
          aria-pressed={saved}
          className={"absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 " +
            (saved ? "text-danger-500" : "text-neutral-500 hover:text-danger-500")}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link href={"/shop/products/" + encodeURIComponent(product.id)}>
          <p className="text-xs font-black text-brand">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 min-h-[48px] text-sm font-bold leading-6 text-foreground group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
          <span className="text-sm font-black">{product.rating > 0 ? product.rating.toFixed(1) : "جديد"}</span>
          {product.reviewCount > 0 && (
            <span className="text-xs text-neutral-400">{t("reviewsCount", { count: product.reviewCount.toLocaleString() })}</span>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-black text-foreground">{formatSAR(product.price)}</span>
          {oldPrice && <span className="text-xs font-semibold text-neutral-400 line-through">{oldPrice}</span>}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {product.availability === "IN_STOCK" ? (
            <span className="text-xs font-bold text-success-700">{t("inStock")}</span>
          ) : product.availability === "UNKNOWN" ? (
            <span className="text-xs font-bold text-warning-700">التوفر يتأكد عند الطلب</span>
          ) : (
            <span className="text-xs font-black text-danger-700">{t("outOfStock")}</span>
          )}
        </div>

        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success-600" />
            <span className="truncate text-xs font-bold text-neutral-800">{t("shippedByAliStore")}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
            <Truck className="h-3.5 w-3.5 text-success-600" />
            {product.shipping.method}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCart}
          disabled={!available}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <ShoppingCart className="h-4 w-4" />
          {available ? t("addToCart") : t("outOfStock")}
        </button>
      </div>
    </article>
  );
}
