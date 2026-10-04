"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Clock3, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  clearRecentlyViewed,
  getRecentlyViewed,
  recordRecentlyViewed,
  removeRecentlyViewed,
  subscribeRecentlyViewed,
  type RecentlyViewedItem,
} from "@/features/recently-viewed/services/recently-viewed.service";

interface RecentlyViewedSectionProps {
  product: Omit<RecentlyViewedItem, "viewedAt">;
}

export function RecentlyViewedSection({
  product,
}: RecentlyViewedSectionProps) {
  const items = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewed,
    () => [],
  );

  const recordableProduct = useMemo(
    () => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      currency: product.currency,
    }),
    [
      product.id,
      product.name,
      product.imageUrl,
      product.price,
      product.currency,
    ],
  );

  useEffect(() => {
    recordRecentlyViewed(recordableProduct);
  }, [recordableProduct]);

  const visibleItems = items.filter((item) => item.id !== product.id);

  if (visibleItems.length === 0) return null;

  return (
    <section
      className="mt-10 border-t border-neutral-200 pt-8"
      aria-labelledby="recently-viewed-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-label font-medium uppercase tracking-[0.12em] text-neutral-400">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            شاهدت مؤخرًا
          </div>
          <h2
            id="recently-viewed-title"
            className="mt-2 text-h3 font-bold text-foreground"
          >
            شاهدت مؤخرًا
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            منتجات حفظها المتصفح من زياراتك السابقة.
          </p>
        </div>

        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-600 transition hover:border-danger-100 hover:bg-danger-surface hover:text-danger-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          مسح السجل
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleItems.slice(0, 8).map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <Link
              href={("/shop/products/" + encodeURIComponent(item.id)) as Route}
              className="block outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-100"
              aria-label={"فتح " + item.name}
            >
              <div className="relative aspect-square bg-neutral-50">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-4 transition-transform duration-300 ease-brand group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-caption text-neutral-400">
                    لا توجد صورة
                  </div>
                )}
              </div>

              <div className="p-3.5">
                <h3 className="line-clamp-2 min-h-10 text-body-sm font-medium leading-5 text-foreground">
                  {item.name}
                </h3>
                <p className="mt-2 text-label text-muted-foreground">
                  آخر سعر معروف
                </p>
                <LocalizedPrice
                  amountUSD={item.price}
                  currency={item.currency}
                  className="mt-0.5 block text-body font-bold text-foreground"
                />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => removeRecentlyViewed(item.id)}
              aria-label={"حذف " + item.name + " من السجل"}
              className="absolute end-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-400 shadow-sm backdrop-blur transition hover:text-danger-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
