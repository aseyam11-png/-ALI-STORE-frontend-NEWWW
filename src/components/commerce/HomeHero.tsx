import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { getTopLevelCategories } from "@/features/catalog/services/category.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";
import { HERO_IMAGE_URL } from "./home-imagery";

// One large, real editorial photo as a full-height panel on the visual side
// — no 3D/canvas layer, no scattered floating thumbnails. The panel is
// absolutely positioned against this section (not the 3D cinematic scene
// that used to live behind HomeHero), so it now owns its own dark backdrop
// directly.
export function HomeHero() {
  const categories = getTopLevelCategories();

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 lg:min-h-[640px]">
      <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="relative z-10 lg:max-w-[46%]">
          <div className="inline-flex w-fit items-center gap-2 rounded-sm bg-white/10 px-3 py-1.5 text-label font-medium text-primary-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            مباشر من ALI STORE
          </div>

          <h1 className="mt-6 max-w-xl text-h1 font-bold tracking-tight text-white lg:text-display">
            اكتشف أسلوبك، وتسوّق ما يناسبك
          </h1>

          <p className="mt-4 max-w-md text-body-lg leading-8 text-white/70">
            اختيارات مميزة من الأزياء والإكسسوارات والعناية والتجميل — كل قطعة
            أصلية ومباشرة من ALI STORE.
          </p>

          <div className="mt-8">
            <Link
              href="/shop/products"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-brand px-8 text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/40"
            >
              تسوق الآن
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          {/* Secondary paths straight into the store's three departments —
              same slugs/labels CategoryGrid uses below, not a second
              taxonomy. */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop/categories/${category.slug}`}
                className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-body-sm font-medium text-white/85 transition-colors duration-200 ease-brand hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/30"
              >
                {CATEGORY_LABEL_AR[category.slug] ?? category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/tablet: a full-width band below the text. Desktop: a
          full-height panel on the end side (this site is RTL-only, so
          "end" renders on the left) sized independently of the text
          column's height. One <Image>, geometry controlled by breakpoint
          classes, so there's only ever one request for it. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:end-0 lg:aspect-auto lg:w-[54%]">
        <Image
          src={HERO_IMAGE_URL}
          alt="فستان سهرة أحمر من تشكيلة الأزياء في ALI STORE"
          fill
          sizes="(max-width: 1024px) 100vw, 54vw"
          priority
          className="object-cover"
        />

        {/* Fade the panel's inner edge into the dark backdrop so the photo
            and the text column read as one continuous visual. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 start-0 hidden w-1/3 bg-gradient-to-l from-ink-950 to-transparent lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent lg:hidden"
        />
      </div>
    </section>
  );
}

export default HomeHero;
