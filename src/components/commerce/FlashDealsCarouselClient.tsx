"use client";

import { useEffect, useReducer } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ProductCardModel } from "@/features/products/types/product-card.types";
import { ProductCard } from "./ProductCard";

interface FlashDealsCarouselClientProps {
  products: ProductCardModel[];
}

export function FlashDealsCarouselClient({
  products,
}: FlashDealsCarouselClientProps) {
  // Mount-time direction read: Embla's drag/scroll direction is a hook-init
  // option, not something rtl: CSS variants can affect on their own — same
  // pattern already used by the deals carousel prior to this rebuild.
  const isRtl =
    typeof document !== "undefined" &&
    document.documentElement.dir === "rtl";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: isRtl ? "rtl" : "ltr",
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  // canScrollPrev()/canScrollNext() are plain methods, not reactive state —
  // re-invoking them during render always reflects the current position;
  // this reducer only exists to give React a reason to re-render when
  // Embla's internal position changes (dispatched from event callbacks, not
  // synchronously in the effect body).
  const [, notifyScrollChange] = useReducer((tick: number) => tick + 1, 0);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", notifyScrollChange);
    emblaApi.on("reInit", notifyScrollChange);

    return () => {
      emblaApi.off("select", notifyScrollChange);
      emblaApi.off("reInit", notifyScrollChange);
    };
  }, [emblaApi]);

  const canScrollPrev = emblaApi?.canScrollPrev() ?? false;
  const canScrollNext = emblaApi?.canScrollNext() ?? false;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 lg:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 basis-[62%] sm:basis-[38%] lg:basis-[24%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          aria-label="العروض السابقة"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 ease-brand hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          aria-label="العروض التالية"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 ease-brand hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
