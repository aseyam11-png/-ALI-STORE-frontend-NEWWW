"use client";

import Image from "next/image";
import Link from "next/link";
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
import { useSession } from "@/features/auth/session";
import { useTranslation } from "@/lib/i18n/dictionary";

interface ProductCardProps {
  product: ProductCardModel;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const session = useSession();
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
      if (session.status === "authenticated") {
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-raised">
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <Link
          href={"/shop/products/" + encodeURIComponent(product.id)}
          className="absolute inset-0"
          aria-label={product.name}
        >
          {product.image?.url ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-neutral-300" />
            </div>
          )}
        </Link>

        {product.discountPercentage !== undefined && (
          <span className="absolute start-3 top-3 rounded-sm bg-discount px-2 py-1 text-label font-medium text-white">
            -{product.discountPercentage}%
          </span>
        )}

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
          className="absolute end-3 top-3"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={"/shop/products/" + encodeURIComponent(product.id)}
          className="outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <h3 className="line-clamp-2 min-h-[2.7em] text-h4 leading-6 text-foreground transition-colors duration-200 group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
          <span className="text-body-sm font-medium text-foreground">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-caption text-muted-foreground">
            {t("reviewsCount", {
              count: product.reviewCount.toLocaleString("en-US"),
            })}
          </span>
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
              product.price.originalAmount > product.price.amount && (
                <span className="text-body-sm text-muted-foreground line-through">
                  {formatCurrency(
                    product.price.originalAmount,
                    product.price.currency,
                  )}
                </span>
              )}
          </div>

          <div className="mt-3">
            {product.stockStatus === "unknown" ? (
              <span className="text-xs font-semibold text-neutral-500">
                Availability is being confirmed
              </span>
            ) : canAddToCart ? (
              <span className="text-xs font-semibold text-success-700">
                {product.stockStatus === "low_stock"
                  ? "Limited availability"
                  : t("inStock")}
              </span>
            ) : (
              <span className="text-xs font-semibold text-danger-700">
                {t("outOfStock")}
              </span>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-xs font-bold text-danger-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!canAddToCart || busy}
            aria-busy={busy}
            className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-body font-medium text-white transition-colors duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ShoppingCart className="h-4 w-4" />
            {busy
              ? "Adding..."
              : product.stockStatus === "unknown"
                ? "Checking availability"
                : canAddToCart
                  ? t("addToCart")
                  : t("outOfStock")}
          </button>
        </div>
      </div>
    </article>
  );
}
