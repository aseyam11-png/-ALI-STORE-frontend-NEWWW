"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
} from "lucide-react";
import { useMemo } from "react";

import {
  getSimilarProducts,
} from "@/features/recommendations/services/recommendation.service";

import {
  featuredProducts,
} from "@/mocks/products";

import {
  normalizeB2CProduct,
} from "@/features/products/services/b2c-product.mapper";

import {
  mapMockProductToSummary,
} from "@/features/products/services/product.mapper";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

interface SimilarProductsProps {
  productId: string;
}

export function SimilarProducts({
  productId,
}: SimilarProductsProps) {
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
        getSimilarProducts(
          productId,
          4,
        ),
      [productId],
    );

  const similar =
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

  if (
    similar.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="mt-8">

      <div className="flex items-end justify-between gap-4">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
            More to explore
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Similar products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products selected from the same category and related attributes.
          </p>
        </div>

        <Link
          href="/shop/products"
          className="hidden items-center gap-1 text-xs font-black text-[#2563EB] sm:inline-flex"
        >
          Browse all
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>

      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {similar.map(
          (product) => (
            <Link
              key={
                product.id
              }
              href={`/shop/products/${encodeURIComponent(
                product.id,
              )}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >

              <div className="relative flex aspect-square items-center justify-center bg-slate-50">

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
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-8 transition group-hover:scale-105"
                  />
                ) : (
                  <div className="text-xs text-slate-300">
                    No image
                  </div>
                )}

              </div>

              <div className="p-4">

                <p className="text-[10px] font-black text-[#2563EB]">
                  {
                    product.brand
                  }
                </p>

                <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900">
                  {
                    product.name
                  }
                </h3>

                <div className="mt-3 flex items-center gap-1">

                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                  <span className="text-xs font-black text-slate-700">
                    {
                      product.rating
                    }
                  </span>

                  <span className="text-[10px] text-slate-400">
                    ({product.reviewCount})
                  </span>

                </div>

                <LocalizedPrice
                  amountUSD={
                    product.price
                  }
                  className="mt-3 block text-lg font-black text-[#0F2747]"
                />

              </div>

            </Link>
          ),
        )}

      </div>

    </section>
  );
}