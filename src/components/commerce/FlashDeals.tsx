import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

import { featuredProducts } from "@/mocks/products";
import { mapLegacyProductToCard } from "@/features/products";

import { FlashDealsLazy } from "./FlashDealsLazy";

// Same real discount data /shop/deals uses (featuredProducts filtered by an
// active discount) — no separate "deals" dataset, no fabricated countdown.
export function FlashDeals() {
  const deals = featuredProducts
    .filter((product) => product.discount !== undefined && product.discount > 0)
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .map(mapLegacyProductToCard);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-discount px-3 py-1.5 text-label font-medium text-white">
              <Flame className="h-3.5 w-3.5" />
              عروض محدودة
            </div>

            <h2 className="mt-4 text-h2 font-bold tracking-tight text-white lg:text-h1">
              عروض اليوم
            </h2>
          </div>

          <Link
            href="/shop/deals"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-white transition-colors duration-200 ease-brand hover:text-primary-300"
          >
            تصفّح جميع العروض
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-10">
          <FlashDealsLazy products={deals} />
        </div>
      </div>
    </section>
  );
}
