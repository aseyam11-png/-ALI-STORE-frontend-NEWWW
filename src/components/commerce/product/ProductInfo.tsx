"use client";

import {
  CheckCircle2,
  Heart,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";

import type {
  B2CProduct,
  B2CProductVariant,
} from "@/features/products/types/b2c-product.types";
import {
  getVariantPrice,
  getVariantStock,
  getVariantImage,
} from "@/features/products/services/variant.utils";

import { useWishlistStore } from "@/stores/wishlist-store";
import { formatSAR } from "@/features/localization/services/currency.service";

import { ProductActions } from "./ProductActions";
import { ProductGallery } from "./ProductGallery";
import { VariantSelector } from "./VariantSelector";

interface ProductInfoProps {
  product: B2CProduct;
}

// Owns the whole purchase panel — gallery, identity, rating, price,
// variants, quantity, and CTAs — as one client island. Previously
// page.tsx rendered its own ProductGallery *and* this component rendered
// a second, variant-aware one inside its own grid, so the gallery
// appeared twice with two different image sets. This is now the only
// place the gallery renders.
//
// Takes an already-normalized `B2CProduct`, not a raw/loose object it
// normalizes itself — the caller (the product detail page) is the one
// place that maps the canonical product model into this view shape, once,
// so this component (and every other consumer of the same normalized
// value) never has to know the mock model's shape.
export function ProductInfo({
  product,
}: ProductInfoProps) {
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const saved =
    useWishlistStore(
      (state) =>
        state.productIds.includes(
          product.id,
        ),
    );

  const firstVariant =
    product.variants.find(
      (variant) =>
        variant.available &&
        (variant.stock ===
          undefined ||
          variant.stock > 0),
    );

  const [
    selectedVariant,
    setSelectedVariant,
  ] =
    useState<
      B2CProductVariant | undefined
    >(firstVariant);

  const activePrice =
    getVariantPrice(
      product,
      selectedVariant,
    );

  const activeStock =
    getVariantStock(
      product,
      selectedVariant,
    );

  const activeImage =
    getVariantImage(
      product,
      selectedVariant,
    );

  const galleryImages =
    activeImage
      ? [
          activeImage,
          ...product.images
            .map(
              (image) =>
                image.url,
            )
            .filter(
              (url) =>
                url !==
                activeImage,
            ),
        ]
      : product.images.map(
          (image) =>
            image.url,
        );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">

      {/* Gallery */}
      <div className="min-w-0">
        <ProductGallery
          key={
            selectedVariant?.id ??
            "base"
          }
          images={
            galleryImages
          }
          productName={
            product.name
          }
        />
      </div>

      {/* Information */}
      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-info-surface px-3 py-1 text-[11px] font-black text-brand">
            {product.category}
          </span>

          {product.flashSale && (
            <span className="rounded-full bg-danger-surface px-3 py-1 text-[11px] font-black text-danger-600">
              Flash Sale
            </span>
          )}

        </div>

        <p className="mt-5 text-sm font-black text-brand">
          {product.brand}
        </p>

        <div className="mt-1 flex items-start gap-4">

          <h1 className="min-w-0 flex-1 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                name: product.name,
                price: activePrice,
                image: activeImage ?? product.images[0]?.url,
                brand: product.brand,
                category: product.category,
                originalPrice: product.originalPrice,
                discountPercentage: product.discountPercentage,
                rating: product.rating,
                reviewCount: product.reviewCount,
              })
            }
            aria-label={
              saved
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={saved}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
              saved
                ? "border-danger-100 bg-danger-surface text-danger-500"
                : "border-neutral-200 bg-surface text-neutral-500 hover:text-danger-500"
            }`}
          >
            <Heart
              className="h-5 w-5"
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">

          <span className="inline-flex items-center gap-1.5 text-sm font-black text-foreground">
            <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
            {product.rating.toFixed(1)}
          </span>

          <span className="text-sm text-neutral-400">
            {product.reviewCount.toLocaleString()} reviews
          </span>

        </div>

        {/* Dynamic price / stock */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

          <div className="flex flex-wrap items-end gap-3">

            <span className="text-4xl font-black text-foreground">
              {formatSAR(activePrice)}
            </span>

            {product.originalPrice &&
              product.originalPrice >
                activePrice && (
                <span className="mb-1 text-sm font-semibold text-neutral-400 line-through">
                  {formatSAR(product.originalPrice)}
                </span>
              )}

          </div>

          <div className="mt-3 flex items-center gap-2">

            {activeStock > 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success-600" />

                <span className="text-xs font-black text-success-700">
                  {activeStock <= 5
                    ? `Only ${activeStock} left in stock`
                    : `${activeStock} available`}
                </span>
              </>
            ) : (
              <span className="text-xs font-black text-danger-700">
                This variant is out of stock
              </span>
            )}

          </div>

          {selectedVariant?.sku && (
            <p className="mt-2 text-[10px] font-mono text-neutral-400">
              SKU:{" "}
              {selectedVariant.sku}
            </p>
          )}

        </div>

        {/* Dynamic variants */}
        <div className="mt-7">
          <VariantSelector
            variants={
              product.variants
            }
            selectedVariantId={
              selectedVariant?.id
            }
            onChange={(
              variant,
            ) =>
              setSelectedVariant(
                variant,
              )
            }
          />
        </div>

        {/* Shipping */}
        <div className="mt-7 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-surface">

          <div className="flex items-center justify-between gap-5 px-5 py-4">

            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-success-600" />

              <span className="text-sm text-neutral-500">
                Delivery
              </span>
            </div>

            <span className="text-end text-sm font-black text-foreground">
              {
                product.shipping
                  .estimatedDelivery
              }
            </span>

          </div>

          <div className="flex items-center justify-between gap-5 px-5 py-4">

            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-brand" />

              <span className="text-sm text-neutral-500">
                Returns
              </span>
            </div>

            <span className="text-end text-sm font-black text-foreground">
              {product.returnPolicy}
            </span>

          </div>

        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex gap-3">

              <ShieldCheck className="h-4 w-4 shrink-0 text-success-600" />

              <div>
                <p className="text-xs font-black text-neutral-800">
                  Secure payment
                </p>

                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  Payment is processed securely by AliStore.
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex gap-3">

              <Heart className="h-4 w-4 shrink-0 text-danger-500" />

              <div>
                <p className="text-xs font-black text-neutral-800">
                  Save for later
                </p>

                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  Keep this product in your wishlist.
                </p>
              </div>

            </div>
          </div>

        </div>

        <ProductActions
          product={product}
          selectedVariant={
            selectedVariant
          }
        />

      </div>
    </div>
  );
}
