import Image from "next/image";
import Link from "next/link";
import type { CategoryNode } from "@/features/catalog/types/category.types";
import { ArrowLeft, Camera, ShieldCheck } from "lucide-react";

import { getTopLevelCategories } from "@/features/catalog/services/category-api.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";
import { HERO_IMAGE_URL } from "./home-imagery";

export async function HomeHero() {
  let categories: CategoryNode[] = [];

  try {
    categories = await getTopLevelCategories();
  } catch {
    categories = [];
  }

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 lg:min-h-[640px]">
      <div className="pointer-events-none absolute -end-20 top-12 h-72 w-72 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />

      <div className="container-shell relative grid gap-8 py-10 sm:py-14 lg:min-h-[640px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12 lg:py-16">
        <div className="relative z-10 max-w-xl lg:pe-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-caption font-medium text-primary-200 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            تجربة تسوق مباشرة من ALI STORE
          </div>

          <h1 className="mt-5 max-w-xl text-h1 font-bold leading-tight tracking-tight text-white lg:text-display">
            اختَر أسرع. اكتشف أكثر. اشترِ بثقة.
          </h1>

          <p className="mt-4 max-w-lg text-body-lg leading-8 text-white/70">
            كتالوج حي، بحث سريع، تجربة مرنة، ومعلومات المنتج والتوفر كما يرسلها النظام الفعلي.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-medium text-white transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100/40"
            >
              تصفح المنتجات
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>

            <Link
              href="/shop/visual-search"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-body-sm font-medium text-white/90 transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-100/30"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              البحث بصورة
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-label font-medium text-white/50">ابدأ من قسم</p>
                <span className="text-label text-white/35">{categories.length} أقسام متاحة</span>
              </div>

              <div className="flex flex-wrap gap-2" aria-label="أقسام المتجر">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={("/shop/categories/" + encodeURIComponent(category.slug)) as import("next").Route}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/5 px-3.5 text-caption font-medium text-white/80 transition-colors duration-200 ease-brand hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-4 focus-visible:ring-primary-100/30"
                  >
                    {CATEGORY_LABEL_AR[category.slug] ?? category.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-modal">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" aria-hidden="true" />
          <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:aspect-[1/0.94]">
            <Image
              src={HERO_IMAGE_URL}
              alt="تشكيلة أزياء من ALI STORE"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
              className="object-cover transition-transform duration-700 ease-brand hover:scale-[1.02]"
            />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-2xl border border-white/10 bg-ink-950/55 p-3 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-4">
            <div>
              <p className="text-caption font-medium text-white/55">كتالوج المتجر</p>
              <p className="mt-0.5 text-body-sm font-medium text-white">منتجات مختارة وتجربة شراء أوضح</p>
            </div>
            <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-label font-medium text-white/70 sm:inline-flex">
              مباشر
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
