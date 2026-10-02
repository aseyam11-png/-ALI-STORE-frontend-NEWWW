"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

import type { ProductCardModel } from "@/features/products/types/product-card.types";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/features/wishlist/services/wishlist.service";
import {
  addCartItem,
  mapCartItem,
} from "@/features/cart/services/cart.service";
import { formatCurrency } from "@/features/localization/services/currency.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useSession } from "@/features/auth/session";
import { useTranslation } from "@/lib/i18n/dictionary";

interface ProductCardProps {
  product: ProductCardModel;
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore(
    (state) => state.addItem,
  );
  const setCartItems =
    useCartStore(
      (state) => state.setItems,
    );
  const toggleLocalWishlist =
    useWishlistStore(
      (state) => state.toggleItem,
    );
  const isSaved =
    useWishlistStore(
      (state) =>
        state.productIds.includes(
          product.id,
        ),
    );
  const {
    status: sessionStatus,
  } = useSession();

  const [cartBusy, setCartBusy] =
    useState(false);
  const [wishlistBusy, setWishlistBusy] =
    useState(false);
  const [error, setError] =
    useState("");

  const handleAddToCart =
    async () => {
      if (cartBusy) return;

      setError("");
      setCartBusy(true);

      const localItem = {
        productId:
          product.id,
        name:
          product.name,
        price:
          product.price.amount,
        currency:
          product.price.currency,
        priceUnit:
          product.price.unit,
        quantity:
          product.minOrderQuantity,
        image:
          product.image?.url,
        minOrderQuantity:
          product.minOrderQuantity,
      };

      try {
        if (
          sessionStatus ===
          "authenticated"
        ) {
          const cart =
            await addCartItem(
              product.id,
              product.minOrderQuantity,
            );

          setCartItems(
            cart.items.map(
              mapCartItem,
            ),
          );
        } else {
          addItem(localItem);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to add this product to the cart.",
        );
      } finally {
        setCartBusy(false);
      }
    };

  const handleWishlist =
    async () => {
      if (wishlistBusy) return;

      setError("");
      setWishlistBusy(true);

      try {
        if (
          sessionStatus ===
          "authenticated"
        ) {
          if (isSaved) {
            await removeFromWishlist(
              product.id,
            );
          } else {
            await addToWishlist(
              product.id,
            );
          }
        }

        await toggleLocalWishlist({
          id: product.id,
          name: product.name,
          price:
            product.price.amount,
          currency:
            product.price.currency,
          image:
            product.image?.url,
          brand:
            product.brand,
          category:
            product.category,
          originalPrice:
            product.price
              .originalAmount,
          discountPercentage:
            product.discountPercentage,
          rating:
            product.rating,
          reviewCount:
            product.reviewCount,
        });
      } catch (err) {
        const status =
          typeof err ===
            "object" &&
          err !== null &&
          "status" in err
            ? Number(
                (
                  err as {
                    status?: unknown;
                  }
                ).status,
              )
            : undefined;

        // Guest users retain a local wishlist; authenticated errors remain visible.
        if (
          status === 401
        ) {
          await toggleLocalWishlist({
            id: product.id,
            name: product.name,
            price:
              product.price.amount,
            currency:
              product.price.currency,
            image:
              product.image?.url,
            brand:
              product.brand,
            category:
              product.category,
            originalPrice:
              product.price
                .originalAmount,
            discountPercentage:
              product.discountPercentage,
            rating:
              product.rating,
            reviewCount:
              product.reviewCount,
          });
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to update wishlist.",
          );
        }
      } finally {
        setWishlistBusy(false);
      }
    };

  const originalAmount =
    product.price
      .originalAmount ??
    (product.discountPercentage
      ? product.price.amount /
        (1 -
          product.discountPercentage /
            100)
      : undefined);

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
              src={
                product.image.url
              }
              alt={
                product.image.alt
              }
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

        {product.discountPercentage !==
          undefined && (
          <span className="absolute start-3 top-3 rounded-sm bg-discount px-2 py-1 text-label font-medium text-white">
            <span dir="ltr">
              -{product.discountPercentage}%
            </span>
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            void handleWishlist();
          }}
          disabled={wishlistBusy}
          aria-label={
            isSaved
              ? t(
                  "removeFromWishlist",
                  {
                    name: product.name,
                  },
                )
              : t(
                  "addToWishlist",
                  {
                    name: product.name,
                  },
                )
          }
          aria-pressed={isSaved}
          className={`absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 shadow-raised transition-colors duration-200 ease-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
            isSaved
              ? "text-discount"
              : "text-neutral-500 hover:text-discount"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={
              isSaved
                ? "currentColor"
                : "none"
            }
          />
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
            {product.rating.toFixed(
              1,
            )}
          </span>
          <span className="text-caption text-muted-foreground">
            {t(
              "reviewsCount",
              {
                count:
                  product.reviewCount.toLocaleString(
                    "en-US",
                  ),
              },
            )}
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

            {originalAmount !==
              undefined && (
              <span className="text-body-sm text-muted-foreground line-through">
                {formatCurrency(
                  originalAmount,
                  product.price.currency,
                )}
              </span>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 text-xs font-bold text-danger-600"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleAddToCart();
            }}
            disabled={
              cartBusy ||
              product.stockStatus ===
                "out_of_stock"
            }
            className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartBusy
              ? "Adding…"
              : t("addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}
