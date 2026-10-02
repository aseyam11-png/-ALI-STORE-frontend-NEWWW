"use client";

import dynamic from "next/dynamic";

import type { ProductCardModel } from "@/features/products/types/product-card.types";

// `ssr: false` requires a Client Component boundary in the App Router — this
// file exists only to hold that boundary so FlashDeals.tsx can stay a Server
// Component. Embla's JS is deferred out of the initial bundle either way.
const FlashDealsCarouselClient = dynamic(
  () =>
    import("./FlashDealsCarouselClient").then(
      (mod) => mod.FlashDealsCarouselClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-5 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[380px] shrink-0 basis-[62%] animate-pulse rounded-lg bg-white/10 sm:basis-[38%] lg:basis-[24%]"
          />
        ))}
      </div>
    ),
  },
);

export function FlashDealsLazy({
  products,
}: {
  products: ProductCardModel[];
}) {
  return <FlashDealsCarouselClient products={products} />;
}
