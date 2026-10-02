"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";

import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { getVariantImage, getVariantPrice, getVariantStock } from "@/features/products/services/variant.utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ProductActions } from "./ProductActions";
import { ProductGallery } from "./ProductGallery";

export function ProductInfo({ product }: { product: B2CProduct }) {
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const saved = useWishlistStore((state) => state.productIds.includes(product.id));
  const firstVariant = product.variants.find((variant) => variant.available && (variant.stock === undefined || variant.stock > 0));
  const [selectedVariant, setSelectedVariant] = useState<B2CProductVariant | undefined>(firstVariant);

  const activePrice = getVariantPrice(product, selectedVariant);
  const activeStock = getVariantStock(product, selectedVariant);
  const activeImage = getVariantImage(product, selectedVariant);
  const galleryImages = activeImage
    ? [activeImage, ...product.images.map((image) => image.url).filter((url) => url !== activeImage)]
    : product.images.map((image) => image.url);

  const wishlistProduct = {
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <ProductGallery key={selectedVariant?.id ?? "base"} images={galleryImages} productName={product.name} />

      <div className="min-w-0">
        <span className="inline-flex rounded-full bg-info-surface px-3 py-1 text-[11px] font-black text-brand">{product.category}</span>

        <div className="mt-4 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-brand">{product.brand}</p>
            <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(wishlistProduct)}
            aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={saved}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${saved ? "border-danger-100 bg-danger-surface text-danger-500" : "border-neutral-200 bg-surface text-neutral-500 hover:text-danger-500"}`}
          >
            <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {product.rating > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-black">
              <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-neutral-400">{product.reviewCount.toLocaleString()} تقييم</span>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <span className="text-4xl font-black text-foreground">{activePrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} {product.currency}</span>
          {activeStock <= 0 && (
            <p className="mt-2 text-sm font-bold text-danger-600">غير متوفر حاليًا</p>
          )}
          {activeStock > 0 && (
            <p className="mt-2 text-sm font-bold text-success-700">متوفر</p>
          )}
        </div>

        <ProductActions product={product} selectedVariant={selectedVariant} />
      </div>
    </div>
  );
}
