"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";

import type { ProductCardModel } from "@/features/products/types/product-card.types";
import { formatCurrency } from "@/features/localization/services/currency.service";
import {
  addBackendCartItem,
  mapBackendCartToLocal,
} from "@/features/cart/services/cart-api.service";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/commerce/WishlistButton";
import { getSession } from "@/features/auth/session";
import { useTranslation } from "@/lib/i18n/dictionary";
import { trackEcommerceEvent } from "@/lib/ux/analytics";

interface ProductCardProps {
  product: ProductCardModel;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceItems = useCartStore((state) => state.replaceItems);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canAddToCart =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "low_stock";

  const handleAddToCart = async () => {
    if (!canAddToCart || busy) return;

    setBusy(true);
    setError("");

    const localLine = {
      productId: product.id,
      name: product.name,
      price: product.price.amount,
      currency: product.price.currency,
      priceUnit: product.price.unit,
      quantity: product.minOrderQuantity,
      image: product.image?.url,
      minOrderQuantity: product.minOrderQuantity,
    };

    try {
      const session = await getSession();

      if (session) {
        const numericId = Number(product.id);
        if (!Number.isInteger(numericId) || numericId < 1) {
          throw new Error("Invalid product id.");
        }

        const currentItems = useCartStore.getState().items;
        const backend = await addBackendCartItem(
          numericId,
          product.minOrderQuantity,
        );

        replaceItems(
          mapBackendCartToLocal(
            backend,
            [...currentItems, localLine],
          ),
        );
      } else {
        addLocalItem(localLine);
      }

      trackEcommerceEvent("add_to_cart", {
        currency: product.price.currency,
        value: product.price.amount * product.minOrderQuantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price.amount,
            quantity: product.minOrderQuantity,
            item_category: product.category,
            item_brand: product.brand,
          },
        ],
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر إضافة المنتج إلى السلة.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="interactive-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
      <div className="media-frame relative aspect-square overflow-hidden bg-neutral-50">
        <Link
          href={("/shop/products/" + encodeURIComponent(product.id)) as Route}
          className="absolute inset-0 outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          aria-label={product.name}
        >
          {product.image?.url ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-contain p-4 transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-300">
              <ShoppingCart className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
        </Link>

        {product.discountPercentage !== undefined ? (
          <span className="pointer-events-none absolute start-3 top-3 rounded-lg bg-discount px-2 py-1 text-label font-medium text-white shadow-sm">
            -{product.discountPercentage}%
          </span>
        ) : null}

        <WishlistButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price.amount,
            image: product.image?.url,
            brand: product.brand,
            category: product.category,
            originalPrice: product.price.originalAmount,
            discountPercentage: product.discountPercentage,
            rating: product.rating,
            reviewCount: product.reviewCount,
          }}
          className="absolute end-3 top-3 transition-transform duration-200 ease-brand group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link
          href={("/shop/products/" + encodeURIComponent(product.id)) as Route}
          className="rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <h3 className="line-clamp-2 min-h-[2.9rem] text-body font-medium leading-6 text-foreground transition-colors duration-200 group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex min-h-5 items-center gap-1.5">
          {product.reviewCount > 0 ? (
            <>
              <Star className="h-4 w-4 fill-warning-500 text-warning-500" aria-hidden="true" />
              <span className="text-body-sm font-medium text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-caption text-muted-foreground">
                {t("reviewsCount", {
                  count: product.reviewCount.toLocaleString("en-US"),
                })}
              </span>
            </>
          ) : (
            <span className="text-caption text-muted-foreground">
              لا توجد تقييمات بعد
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-h3 font-bold text-foreground">
              {formatCurrency(
                product.price.amount,
                product.price.currency,
              )}
            </span>
            {product.price.originalAmount !== undefined &&
            product.price.originalAmount > product.price.amount ? (
              <span className="text-caption text-muted-foreground line-through">
                {formatCurrency(
                  product.price.originalAmount,
                  product.price.currency,
                )}
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            {product.stockStatus === "unknown" ? (
              <span className="text-caption font-medium text-neutral-500">
                يتم التحقق من التوفر…
              </span>
            ) : canAddToCart ? (
              <span className="text-caption font-medium text-success-700">
                {product.stockStatus === "low_stock"
                  ? "توفر محدود"
                  : t("inStock")}
              </span>
            ) : (
              <span className="text-caption font-medium text-danger-700">
                {t("outOfStock")}
              </span>
            )}
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-caption font-medium text-danger-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!canAddToCart || busy}
            aria-busy={busy}
            className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-body-sm font-medium text-white transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover disabled:cursor-not-allowed disabled:transform-none disabled:bg-neutral-300 focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {busy
              ? "جارٍ الإضافة…"
              : product.stockStatus === "unknown"
                ? "يتم التحقق من التوفر"
                : canAddToCart
                  ? t("addToCart")
                  : t("outOfStock")}
          </button>
        </div>
      </div>
    </article>
  );
}
