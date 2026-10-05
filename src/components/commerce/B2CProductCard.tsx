"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import type { B2CProduct } from "@/features/products/types/b2c-product.types";
import { formatCurrency } from "@/features/localization/services/currency.service";
import {
  addBackendCartItem,
  mapBackendCartToLocal,
} from "@/features/cart/services/cart-api.service";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/commerce/WishlistButton";
import { ProductQuickView } from "@/components/commerce/ProductQuickView";
import { getSession } from "@/features/auth/session";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useTranslation } from "@/lib/i18n/dictionary";

interface B2CProductCardProps {
  product: B2CProduct;
}

export function B2CProductCard({ product }: B2CProductCardProps) {
  const { t } = useTranslation();
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [cartBusy, setCartBusy] = useState(false);
  const [cartError, setCartError] = useState("");
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const available =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "low_stock";
  const checking = product.stockStatus === "unknown";

  const handleCart = async () => {
    if (!available || cartBusy) return;

    setCartBusy(true);
    setCartError("");

    try {
      const localLine = {
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        priceUnit: "unit",
        quantity: 1,
        image: product.images[0]?.url,
        minOrderQuantity: 1,
      };

      const numericId = Number(product.id);
      const session = await getSession();

      if (session) {
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
    } catch (error) {
      setCartError(
        error instanceof Error
          ? error.message
          : "تعذر إضافة المنتج إلى السلة.",
      );
    } finally {
      setCartBusy(false);
    }
  };

  return (
    <>
      <article className="interactive-lift group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-raised hover:border-border-hover hover:shadow-floating">
        <div className="media-frame relative aspect-square overflow-hidden bg-neutral-50">
          <Link
            href={
              ("/shop/products/" + encodeURIComponent(product.id)) as Route
            }
            className="absolute inset-0 outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            aria-label={t("viewProduct", { name: product.name })}
          >
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 22vw"
                className="object-contain p-4 transition-transform duration-500 ease-brand group-hover:scale-[1.04] sm:p-5"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-medium text-neutral-300">
                {t("noImage")}
              </div>
            )}
          </Link>

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex max-w-[calc(100%-3rem)] flex-wrap gap-1.5">
              {product.flashSale ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-danger-500 px-2.5 py-1 text-label font-medium text-white shadow-sm">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  عرض سريع
                </span>
              ) : null}

              {product.discountPercentage !== undefined ? (
                <span className="rounded-md bg-discount px-2.5 py-1 text-label font-medium text-white shadow-sm">
                  -{product.discountPercentage}%
                </span>
              ) : null}
            </div>
          </div>

          <WishlistButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url,
              brand: product.brand || undefined,
              category: product.category,
              originalPrice: product.originalPrice,
              discountPercentage: product.discountPercentage,
              rating: product.rating,
              reviewCount: product.reviewCount,
            }}
            className="absolute end-3 top-3 z-10 transition-transform duration-200 ease-brand group-hover:scale-105"
          />

          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            aria-label={"عرض سريع " + product.name}
            className="absolute bottom-3 end-3 z-10 inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-surface/95 px-3 text-caption font-medium text-foreground shadow-raised transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-surface hover:shadow-floating focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            عرض سريع
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <Link
            href={
              ("/shop/products/" + encodeURIComponent(product.id)) as Route
            }
            className="rounded-md outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            {product.brand ? (
              <p className="text-caption font-medium text-brand">
                {product.brand}
              </p>
            ) : null}

            <h3 className="mt-1.5 line-clamp-2 min-h-[3rem] text-body font-medium leading-6 text-foreground transition-colors duration-200 group-hover:text-brand">
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 flex min-h-5 items-center gap-2">
            {product.reviewCount > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 text-body-sm font-medium text-foreground">
                  <Star
                    className="h-4 w-4 fill-warning-500 text-warning-500"
                    aria-hidden="true"
                  />
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-caption text-muted-foreground">
                  {t("reviewsCount", {
                    count: product.reviewCount.toLocaleString(),
                  })}
                </span>
              </>
            ) : (
              <span className="text-caption text-muted-foreground">
                لا توجد تقييمات بعد
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <LocalizedPrice
              amountUSD={product.price}
              currency={product.currency}
              className="text-h3 text-foreground"
            />
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-caption text-muted-foreground line-through">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex min-h-5 items-center gap-2">
            {checking ? (
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-caption font-medium text-neutral-600">
                يتم التحقق من التوفر…
              </span>
            ) : available ? (
              <span
                className={
                  "inline-flex items-center rounded-md px-2 py-1 text-caption font-medium " +
                  (product.stock <= 5
                    ? "bg-warning-surface text-warning-700"
                    : "bg-success-surface text-success-700")
                }
              >
                {product.stock <= 5
                  ? t("onlyXLeft", { count: product.stock })
                  : t("inStock")}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-danger-surface px-2 py-1 text-caption font-medium text-danger-700">
                {t("outOfStock")}
              </span>
            )}
          </div>

          <div className="mt-3 rounded-md border border-border bg-neutral-50/80 p-3 transition-colors duration-200 group-hover:border-border-hover">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-success-600"
                aria-hidden="true"
              />
              <span className="truncate text-caption font-medium text-foreground">
                {t("shippedByAliStore")}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-label text-muted-foreground">
              <Truck
                className="h-3.5 w-3.5 shrink-0 text-success-600"
                aria-hidden="true"
              />
              <span className="truncate">{product.shipping.method}</span>
            </div>
          </div>

          {cartError ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-danger-surface px-3 py-2 text-caption font-medium leading-5 text-danger-700"
            >
              {cartError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleCart()}
            disabled={!available || cartBusy}
            aria-busy={cartBusy}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-body-sm font-medium text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-raised focus-visible:ring-4 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:transform-none disabled:bg-neutral-300 disabled:shadow-none"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {cartBusy
              ? "جارٍ الإضافة…"
              : checking
                ? "يتم التحقق من التوفر"
                : t("addToCart")}
          </button>
        </div>
      </article>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={() => void handleCart()}
        addBusy={cartBusy}
      />
    </>
  );
}
