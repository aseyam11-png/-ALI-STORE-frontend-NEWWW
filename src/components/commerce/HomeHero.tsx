"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { HERO_SLIDES } from "./home-imagery";

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
      <div className="container-shell py-5 sm:py-6 lg:py-7">
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
                  <div className="relative aspect-[16/6] min-h-[300px] sm:min-h-0">
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

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                      <div className="max-w-md text-white">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/35 px-3 py-1.5 text-label font-medium text-white/85 backdrop-blur-md">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          مختارات ALI STORE
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                          {slide.title}
                        </h1>

                        <Link
                          href={slide.href as Route}
                          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-body-sm font-medium text-ink-900 shadow-raised transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
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

          <button
            type="button"
            aria-label="الصورة السابقة"
            onClick={() => handleManualNavigation(() => emblaApi?.scrollPrev())}
            className="absolute start-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/45 text-white backdrop-blur-md transition hover:bg-ink-950/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:start-5 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="الصورة التالية"
            onClick={() => handleManualNavigation(() => emblaApi?.scrollNext())}
            className="absolute end-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/45 text-white backdrop-blur-md transition hover:bg-ink-950/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:end-5 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center sm:bottom-5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/45 px-2.5 py-1.5 backdrop-blur-md"
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
