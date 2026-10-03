"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { CheckCircle2, ShoppingCart, Star, Truck, Zap } from "lucide-react";

import type { B2CProduct } from "@/features/products/types/b2c-product.types";
import { formatCurrency } from "@/features/localization/services/currency.service";
import { addBackendCartItem, mapBackendCartToLocal } from "@/features/cart/services/cart-api.service";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/commerce/WishlistButton";
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
          : "Unable to add this product to the cart.",
      );
    } finally {
      setCartBusy(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link
          href={("/shop/products/" + encodeURIComponent(product.id)) as Route}
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

        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          {product.flashSale && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-danger-500 px-2.5 py-1 text-[10px] font-black text-white">
              <Zap className="h-3 w-3" />
              FLASH SALE
            </span>
          )}
          {product.discountPercentage !== undefined && (
            <span className="rounded-lg bg-warning-500 px-2.5 py-1 text-[10px] font-black text-white">
              -{product.discountPercentage}%
            </span>
          )}
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
          className="absolute end-3 top-3"
        />
      </div>

      <div className="p-4">
        <Link href={("/shop/products/" + encodeURIComponent(product.id)) as import("next").Route}>
          {product.brand && (
            <p className="text-xs font-black text-brand">{product.brand}</p>
          )}
          <h3 className="mt-1 line-clamp-2 min-h-[48px] text-sm font-bold leading-6 text-foreground group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          {product.reviewCount > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 text-sm font-black">
                <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400">
                {t("reviewsCount", {
                  count: product.reviewCount.toLocaleString(),
                })}
              </span>
            </>
          ) : (
            <span className="text-xs text-neutral-400">
              لا توجد تقييمات بعد
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <LocalizedPrice
            amountUSD={product.price}
            currency={product.currency}
            className="text-xl font-black text-foreground"
          />
          {product.originalPrice &&
            product.originalPrice > product.price && (
              <span className="text-xs font-semibold text-neutral-400 line-through">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {checking ? (
            <span className="text-xs font-bold text-neutral-500">
              Availability is being confirmed
            </span>
          ) : available ? (
            <span
              className={
                "text-xs font-bold " +
                (product.stock <= 5 ? "text-warning-700" : "text-success-700")
              }
            >
              {product.stock <= 5
                ? t("onlyXLeft", { count: product.stock })
                : t("inStock")}
            </span>
          ) : (
            <span className="text-xs font-black text-danger-700">
              {t("outOfStock")}
            </span>
          )}
        </div>

        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success-600" />
            <span className="truncate text-xs font-bold text-neutral-800">
              {t("shippedByAliStore")}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
            <Truck className="h-3.5 w-3.5 text-success-600" />
            {product.shipping.method}
          </div>
        </div>

        {cartError && (
          <p role="alert" className="mt-3 text-xs font-bold text-danger-700">
            {cartError}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleCart()}
          disabled={!available || cartBusy}
          aria-busy={cartBusy}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartBusy
            ? "Adding..."
            : checking
              ? "Checking availability"
              : t("addToCart")}
        </button>
      </div>
    </article>
  );
}
