"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useMemo } from "react";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

import { getFrequentlyBoughtProducts } from "@/features/recommendations/services/recommendation.service";

import {
  featuredProducts,
} from "@/mocks/products";

import {
  normalizeB2CProduct,
} from "@/features/products/services/b2c-product.mapper";

import {
  mapMockProductToSummary,
} from "@/features/products/services/product.mapper";

import { useCartStore } from "@/stores/cart-store";

interface FrequentlyBoughtTogetherProps {
  productId: string;
}

export function FrequentlyBoughtTogether({
  productId,
}: FrequentlyBoughtTogetherProps) {
  const products =
    useMemo(
      () =>
        featuredProducts
          .map(mapMockProductToSummary)
          .map(normalizeB2CProduct),
      [],
    );

  const recommendations =
    useMemo(
      () =>
        getFrequentlyBoughtProducts(
          productId,
          3,
        ),
      [productId],
    );

  const recommendedProducts =
    recommendations
      .map(
        (item) =>
          products.find(
            (product) =>
              product.id ===
              item.productId,
          ),
      )
      .filter(
        (
          product,
        ): product is (typeof products)[number] =>
          Boolean(product),
      );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  if (
    recommendedProducts.length ===
    0
  ) {
    return null;
  }

  const total =
    recommendedProducts.reduce(
      (sum, product) =>
        sum +
        product.price,
      0,
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-2">

        <ShoppingCart className="h-5 w-5 text-[#2563EB]" />

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Frequently bought together
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Complete your purchase with commonly paired products.
          </p>
        </div>

      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        {recommendedProducts.map(
          (product) => (
            <div
              key={
                product.id
              }
              className="rounded-xl border border-slate-200 p-3"
            >

              <Link
                href={`/shop/products/${encodeURIComponent(
                  product.id,
                )}`}
              >
                <div className="relative flex aspect-square items-center justify-center rounded-lg bg-slate-50">

                  {product.images[0]?.url ? (
                    <Image
                      src={
                        product
                          .images[0]
                          .url
                      }
                      alt={
                        product
                          .images[0]
                          .alt
                      }
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-5"
                    />
                  ) : (
                    <ShoppingCart className="h-7 w-7 text-slate-300" />
                  )}

                </div>

                <p className="mt-3 line-clamp-2 text-xs font-black leading-5 text-slate-800">
                  {
                    product.name
                  }
                </p>

                <LocalizedPrice
                  amountUSD={
                    product.price
                  }
                  className="mt-2 block text-sm font-black text-[#0F2747]"
                />
              </Link>

              <button
                type="button"
                onClick={() =>
                  addItem({
                    productId:
                      product.id,
                    name:
                      product.name,
                    price:
                      product.price,
                    priceUnit:
                      "unit",
                    quantity: 1,
                    image:
                      product
                        .images[0]
                        ?.url,
                    minOrderQuantity: 1,
                  })
                }
                className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] text-[10px] font-black text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>

            </div>
          ),
        )}

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Add all
          </p>

          <LocalizedPrice
            amountUSD={total}
            className="mt-1 block text-xl font-black text-[#0F2747]"
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Recommended bundle
        </div>

      </div>

    </section>
  );
}
