"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";

import type { ProductCardModel } from "@/features/products/types/product-card.types";
import { formatCurrency } from "@/features/localization/services/currency.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useTranslation } from "@/lib/i18n/dictionary";

interface ProductCardProps {
  product: ProductCardModel;
}

// The single Product Card used across Product Discovery, Flash Deals and
// /shop/deals — one fixed element order (image, discount badge, wishlist,
// name, rating, review count, price, add-to-cart) so every card in the
// product reads as the same component, never a per-section variant.
export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );

  const formattedPrice = formatCurrency(product.price.amount, product.price.currency);
  const available = product.stockStatus !== "out_of_stock";

  const originalAmount =
    product.price.originalAmount ??
    (product.discountPercentage
      ? product.price.amount / (1 - product.discountPercentage / 100)
      : undefined);

  const formattedOriginalPrice =
    originalAmount !== undefined
      ? formatCurrency(originalAmount, product.price.currency)
      : undefined;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price.amount,
      priceUnit: product.price.unit,
      quantity: product.minOrderQuantity,
      image: product.image?.url,
      minOrderQuantity: product.minOrderQuantity,
    });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-surface transition-shadow duration-200 ease-brand hover:shadow-raised">
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <Link
          href={`/shop/products/${encodeURIComponent(product.id)}`}
          className="absolute inset-0"
          aria-label={product.name}
        >
          {product.image?.url ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-contain p-4 transition duration-300 ease-brand group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-neutral-300" />
            </div>
          )}
        </Link>

        {product.discountPercentage !== undefined && (
          <span className="absolute start-3 top-3 rounded-sm bg-discount px-2 py-1 text-label font-medium text-white">
            <span dir="ltr">-{product.discountPercentage}%</span>
          </span>
        )}

        <button
          type="button"
          onClick={() =>
            toggleWishlist({
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
            })
          }
          aria-label={
            isSaved
              ? t("removeFromWishlist", { name: product.name })
              : t("addToWishlist", { name: product.name })
          }
          aria-pressed={isSaved}
          className={`absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 shadow-raised transition-colors duration-200 ease-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
            isSaved
              ? "text-discount"
              : "text-neutral-500 hover:text-discount"
          }`}
        >
          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/shop/products/${encodeURIComponent(product.id)}`}
          className="outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <h3 className="line-clamp-2 min-h-[2.7em] text-h4 leading-6 text-foreground transition-colors duration-200 ease-brand group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
          <span className="text-body-sm font-medium text-foreground">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-caption text-muted-foreground">
            {t("reviewsCount", { count: product.reviewCount.toLocaleString("en-US") })}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-h3 font-bold text-foreground">
              {formattedPrice}
            </span>

            {formattedOriginalPrice && (
              <span className="text-body-sm text-muted-foreground line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!available}
            className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ShoppingCart className="h-4 w-4" />
            {available ? t("addToCart") : t("outOfStock")}
          </button>
        </div>
      </div>
    </article>
  );
}
