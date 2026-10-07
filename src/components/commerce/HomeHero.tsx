"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { getCategoryNavImage, HERO_SLIDES } from "./home-imagery";
import { getTopLevelCategories } from "@/features/catalog/services/category-api.service";

export function HomeHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
    duration: 28,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getTopLevelCategories,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const categories = (categoriesQuery.data ?? []).map((category) => ({
    id: category.id,
    label: category.name,
    slug: category.slug,
    href: "/shop/categories/" + category.slug,
  }));

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    if (!emblaApi || paused || reducedMotion) return;

    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
  }, [emblaApi, paused, reducedMotion]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [resetAutoplay]);

  const handleManualNavigation = (action: () => void) => {
    action();
    window.setTimeout(resetAutoplay, 50);
  };

  return (
    <section aria-label="عروض ALI STORE" className="bg-background">
      <div className="container-shell py-4 sm:py-5 lg:py-6">
        <div
          className="relative overflow-hidden rounded-xl border border-border bg-ink-950 shadow-floating sm:rounded-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {HERO_SLIDES.map((slide) => (
                <article
                  key={slide.id}
                  role="group"
                  className="min-w-0 flex-[0_0_100%]"
                  aria-roledescription="شريحة"
                >
                  <div className="relative aspect-[6/1] min-h-[180px] sm:min-h-[200px] lg:min-h-0">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={slide.id === HERO_SLIDES[0].id}
                      sizes="(max-width: 768px) 100vw, 1440px"
                      className="object-cover"
                    />

                    <div
                      className="absolute inset-0 bg-gradient-to-l from-ink-950/78 via-ink-950/25 to-transparent"
                      aria-hidden="true"
                    />

                    <div className="absolute inset-x-0 bottom-[70px] p-4 sm:p-5 lg:p-7">
                      <div className="max-w-sm text-white">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/35 px-2.5 py-1 text-label font-medium text-white/85 backdrop-blur-md">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          مختارات ALI STORE
                        </div>

                        <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                          {slide.title}
                        </h1>

                        <Link
                          href={slide.href as Route}
                          className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-white px-4 text-body-sm font-medium text-ink-900 shadow-raised transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                          اكتشف الآن
                          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink-950/90 backdrop-blur-md">
            <div className="container-shell flex min-h-[62px] items-center gap-2 overflow-x-auto py-1.5 scroll-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex shrink-0 items-center gap-1.5 px-1.5 text-label font-semibold text-white/60">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-300" aria-hidden="true" />
                أقسام المتجر
              </div>

              {categories.length > 0 ? (
                categories.map((category) => {
                  const active = false;
                  const image = getCategoryNavImage(category.slug, category.label);

                  return (
                    <Link
                      key={category.id}
                      href={category.href as Route}
                      aria-current={active ? "page" : undefined}
                      className={
                        "group relative isolate flex h-[48px] min-w-[118px] shrink-0 items-end overflow-hidden rounded-lg border px-2.5 py-1.5 text-white shadow-sm transition duration-200 ease-brand hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                        (active ? "border-primary-300 ring-1 ring-primary-300/80" : "border-white/10")
                      }
                      style={
                        image
                          ? {
                              backgroundImage:
                                "linear-gradient(180deg, rgba(11, 14, 20, 0.06) 0%, rgba(11, 14, 20, 0.82) 100%), url(" +
                                image +
                                ")",
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }
                          : {
                              backgroundImage:
                                "linear-gradient(180deg, rgba(63, 67, 75, 0.72), rgba(11, 14, 20, 0.98))",
                            }
                      }
                    >
                      <span className="relative z-10 truncate text-caption font-semibold drop-shadow-sm">
                        {category.label}
                      </span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-2.5 bottom-0 z-20 h-0.5 rounded-full bg-primary-300"
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 z-0 bg-brand/0 transition-colors duration-200 group-hover:bg-brand/10"
                      />
                    </Link>
                  );
                })
              ) : (
                <span
                  aria-busy={categoriesQuery.isPending}
                  className="px-1 text-caption text-white/50"
                >
                  {categoriesQuery.isPending
                    ? "جاري تحميل التصنيفات…"
                    : "التصنيفات غير متاحة حاليًا"}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="الصورة السابقة"
            onClick={() => handleManualNavigation(() => emblaApi?.scrollPrev())}
            className="absolute start-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/45 text-white backdrop-blur-md transition hover:bg-ink-950/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:start-4 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="الصورة التالية"
            onClick={() => handleManualNavigation(() => emblaApi?.scrollNext())}
            className="absolute end-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/45 text-white backdrop-blur-md transition hover:bg-ink-950/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:end-4 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-[68px] z-30 flex justify-center">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/45 px-2 py-1 backdrop-blur-md"
              aria-label="التنقل بين صور البانر"
            >
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={"الانتقال إلى " + slide.title}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => handleManualNavigation(() => scrollTo(index))}
                  className={
                    "rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 " +
                    (selectedIndex === index
                      ? "h-1.5 w-7 bg-white"
                      : "h-1.5 w-1.5 bg-white/45 hover:bg-white/75")
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
