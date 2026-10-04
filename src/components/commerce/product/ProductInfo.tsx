"use client";

import {
  CheckCircle2,
  Heart,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { useState } from "react";
import { formatCurrency } from "@/features/localization/services/currency.service";
import { WishlistButton } from "@/components/commerce/WishlistButton";
import { ProductActions } from "./ProductActions";
import { StickyAddToCart } from "./StickyAddToCart";
import { ProductGallery } from "./ProductGallery";
import { VariantSelector } from "./VariantSelector";
import { useTranslation } from "@/lib/i18n/dictionary";

interface ProductInfoProps {
  product: B2CProduct;
}

export function ProductInfo({
  product,
}: ProductInfoProps) {
  const { t } = useTranslation();
  const [selectedVariant, setSelectedVariant] = useState<B2CProductVariant | undefined>(undefined);
  const stock = selectedVariant?.stock ?? product.stock;
  const activePrice = selectedVariant?.price ?? product.price;
  const available =
    selectedVariant
      ? selectedVariant.available && stock > 0
      : product.stockStatus === "in_stock" || product.stockStatus === "low_stock";
  const galleryImages = product.images.map(
    (image) => image.url,
  );

  return (
    <div className="grid gap-8 pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pb-0">
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <ProductGallery
          images={galleryImages}
          productName={product.name}
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
            {product.category}
          </span>
          {product.brand && (
            <span className="rounded-full border border-neutral-200 bg-surface px-3 py-1.5 text-label font-medium text-neutral-600">
              {product.brand}
            </span>
          )}
        </div>

        

        <div className="mt-1 flex items-start gap-4">
          <h1 className="min-w-0 flex-1 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

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
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-warning-surface px-2.5 py-1.5 text-body-sm font-medium text-warning-700">
              <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
              {product.rating.toFixed(1)}
              <span className="text-neutral-500">({product.reviewCount.toLocaleString()})</span>
            </span>
          ) : (
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-body-sm font-medium text-neutral-500">
              {t("noReviews")}
            </span>
          )}
          <span className="rounded-lg border border-neutral-200 bg-surface px-2.5 py-1.5 text-[10px] font-mono text-neutral-500">
            {t("sku")}: {product.sku}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-4xl font-bold tracking-tight text-brand-ink">
              {formatCurrency(activePrice, product.currency)}
            </span>

            {product.originalPrice &&
              product.originalPrice > activePrice && (
                <span className="mb-1 text-sm font-semibold text-neutral-400 line-through">
                  {formatCurrency(
                    product.originalPrice,
                    product.currency,
                  )}
                </span>
              )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            {product.stockStatus === "unknown" && !selectedVariant ? (
              <span className="text-xs font-bold text-neutral-500">
                {t("availabilityChecking")}
              </span>
            ) : available ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                <span className="text-xs font-black text-success-700">
                  {stock <= 5
                    ? t("onlyXLeft", { count: stock })
                    : stock + " available"}
                </span>
              </>
            ) : (
              <span className="text-xs font-black text-danger-700">
                {t("outOfStock")}
              </span>
            )}
          </div>
        </div>

        {product.variants.length > 0 && (
          <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm"><VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariant?.id}
              onChange={setSelectedVariant}
            /></div>
        )}

        <div className="mt-7 overflow-hidden rounded-2xl border border-neutral-200 bg-surface divide-y divide-neutral-100 shadow-sm">
          <div className="flex items-center justify-between gap-5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-success-600" />
              <span className="text-sm text-neutral-500">{t("delivery")}</span>
            </div>
            <span className="text-end text-sm font-black text-foreground">
              {product.shipping.method}
            </span>
          </div>

          <div className="flex items-center justify-between gap-5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-danger-500" />
              <span className="text-sm text-neutral-500">{t("returns")}</span>
            </div>
            <span className="text-end text-sm font-black text-foreground">
              {product.returnPolicy ?? "{t("returnsUnavailable")}"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success-600" />
              <div>
                <p className="text-xs font-black text-neutral-800">
                  {t("securePayment")}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  {t("paymentProcessedByAliStore")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex gap-3">
              <Truck className="h-4 w-4 shrink-0 text-brand" />
              <div>
                <p className="text-xs font-black text-neutral-800">
                  {t("fulfillment")}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  {t("fulfillmentByAliStore")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ProductActions
          product={product}
          selectedVariant={selectedVariant}
        />
        <StickyAddToCart
          product={product}
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}