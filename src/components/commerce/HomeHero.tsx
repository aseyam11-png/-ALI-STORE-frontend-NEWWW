import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { CategoryNode } from "@/features/catalog/types/category.types";
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Gem,
  Heart,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  Watch,
} from "lucide-react";

import {
  flattenCategoryTree,
  getTopLevelCategories,
} from "@/features/catalog/services/category-api.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";
import { CATEGORY_IMAGE_URL, HERO_IMAGE_URL } from "./home-imagery";

const QUICK_LABEL_AR: Record<string, string> = {
  "men-clothing": "الملابس",
  "women-clothing": "الملابس",
  "men-shoes": "الأحذية",
  "women-shoes": "الأحذية",
  "women-bags": "الحقائب",
  "accessory-bags": "الحقائب",
  watches: "الساعات",
  jewelry: "الإكسسوارات",
  accessories: "الإكسسوارات",
  "beauty-care": "الجمال والعناية",
  kids: "أطفال",
};

const QUICK_CATEGORY_SLUGS = [
  "men-clothing",
  "women-shoes",
  "women-bags",
  "watches",
  "jewelry",
  "beauty-care",
  "kids",
];

const FALLBACK_QUICK_IMAGES = [
  CATEGORY_IMAGE_URL.fashion,
  HERO_IMAGE_URL,
  CATEGORY_IMAGE_URL.accessories,
  HERO_IMAGE_URL,
  CATEGORY_IMAGE_URL.accessories,
  CATEGORY_IMAGE_URL["beauty-care"],
  CATEGORY_IMAGE_URL.fashion,
];

function getCategoryLabel(category: CategoryNode) {
  return (
    QUICK_LABEL_AR[category.slug] ??
    CATEGORY_LABEL_AR[category.slug] ??
    category.name
  );
}

function getCategoryIcon(slug: string) {
  const normalized = slug.toLowerCase();

  if (normalized.includes("shoe")) return Footprints;
  if (normalized.includes("bag")) return ShoppingBag;
  if (normalized.includes("watch")) return Watch;
  if (
    normalized.includes("jewel") ||
    normalized.includes("accessor")
  ) {
    return Gem;
  }
  if (
    normalized.includes("beauty") ||
    normalized.includes("skincare") ||
    normalized.includes("hair") ||
    normalized.includes("makeup") ||
    normalized.includes("fragrance")
  ) {
    return Sparkles;
  }
  if (normalized.includes("kid") || normalized.includes("baby")) return Baby;
  if (
    normalized.includes("cloth") ||
    normalized.includes("shirt") ||
    normalized.includes("dress")
  ) {
    return Shirt;
  }

  return Tag;
}

function CategoryImage({
  category,
  fallback,
  priority = false,
}: {
  category: CategoryNode;
  fallback: string;
  priority?: boolean;
}) {
  const imageUrl = category.image ?? fallback;

  return (
    <div
      className="absolute inset-0 bg-neutral-100 bg-cover bg-center"
      style={{ backgroundImage: `url("${imageUrl}")` }}
      aria-hidden="true"
    >
      {category.image ? null : (
        <Image
          src={fallback}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, 12rem"
          className="object-cover"
        />
      )}
    </div>
  );
}

function QuickCategoryCard({
  category,
  index,
}: {
  category: CategoryNode;
  index: number;
}) {
  const label = getCategoryLabel(category);
  const fallback = FALLBACK_QUICK_IMAGES[index % FALLBACK_QUICK_IMAGES.length];
  const href = ("/shop/categories/" + encodeURIComponent(category.slug)) as Route;

  return (
    <Link
      href={href}
      className="group relative min-w-[142px] flex-1 basis-[142px] overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-sm transition-transform duration-200 ease-brand hover:-translate-y-0.5 hover:shadow-raised focus-visible:ring-4 focus-visible:ring-primary-100 sm:min-w-[158px]"
    >
      <div className="relative aspect-[1.35/1] overflow-hidden bg-neutral-100">
        <CategoryImage category={category} fallback={fallback} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent" />
        <span className="absolute end-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm backdrop-blur-sm">
          {(() => {
            const Icon = getCategoryIcon(category.slug);
            return <Icon className="h-4 w-4" aria-hidden="true" />;
          })()}
        </span>
      </div>
      <div className="p-3 text-center">
        <p className="text-body-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-label text-muted-foreground">استكشف القسم</p>
      </div>
    </Link>
  );
}

export async function HomeHero() {
  let categories: CategoryNode[] = [];

  try {
    categories = await getTopLevelCategories();
  } catch {
    categories = [];
  }

  const allCategories = flattenCategoryTree(categories);
  const used = new Set<string>();

  const quickCategories = QUICK_CATEGORY_SLUGS.map((slug) => {
    const match = allCategories.find((category) => category.slug === slug);
    if (match) used.add(match.id);
    return match;
  }).filter((category): category is CategoryNode => Boolean(category));

  if (quickCategories.length < 7) {
    for (const category of allCategories) {
      if (quickCategories.length >= 7) break;
      if (used.has(category.id)) continue;
      if (category.slug === "fashion") continue;
      used.add(category.id);
      quickCategories.push(category);
    }
  }

  const sidebarCategories = categories
    .flatMap((category) => [
      category,
      ...category.children.slice(0, 2),
    ])
    .slice(0, 8);

  return (
    <section className="bg-background py-4 sm:py-6">
      <div className="container-shell">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
          <aside className="order-1 overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-raised">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-brand">
                  <Tag className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-body-sm font-bold text-foreground">
                    جميع الفئات
                  </h2>
                  <p className="text-label text-muted-foreground">
                    اختر قسمًا وابدأ التسوق
                  </p>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-neutral-300" aria-hidden="true" />
            </div>

            <nav aria-label="فئات المتجر" className="p-2">
              {sidebarCategories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <Link
                    key={category.id}
                    href={
                      ("/shop/categories/" +
                        encodeURIComponent(category.slug)) as Route
                    }
                    className="group flex min-h-11 items-center gap-3 rounded-lg px-3 text-body-sm font-medium text-neutral-700 transition-colors duration-200 ease-brand hover:bg-primary-50 hover:text-brand focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-surface group-hover:text-brand">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {getCategoryLabel(category)}
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-brand" />
                  </Link>
                );
              })}

              {categories.length > 0 ? (
                <Link
                  href={"/shop/products" as Route}
                  className="mt-2 flex min-h-10 items-center justify-center rounded-lg bg-neutral-50 px-3 text-caption font-medium text-brand transition-colors hover:bg-primary-50"
                >
                  عرض كل المنتجات
                </Link>
              ) : null}
            </nav>
          </aside>

          <div className="order-2 min-w-0">
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-ink-950 shadow-raised">
              <div className="relative aspect-[16/8.6] min-h-[265px] overflow-hidden sm:min-h-[330px]">
                <Image
                  src={HERO_IMAGE_URL}
                  alt="تشكيلة مختارة من ALI STORE"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, calc(100vw - 320px)"
                  className="object-cover"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-l from-white/96 via-white/76 to-white/5"
                  aria-hidden="true"
                />

                <div className="absolute inset-y-0 start-0 flex w-full max-w-[72%] items-center px-5 py-6 sm:px-10 lg:max-w-[67%] lg:px-14">
                  <div className="max-w-xl text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-white/85 px-3 py-1.5 text-label font-medium text-brand shadow-sm backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      أحدث الاختيارات
                    </span>

                    <h1 className="mt-4 text-h2 font-bold leading-[1.25] tracking-tight text-ink-900 sm:text-h1 lg:text-display">
                      اكتشف المنتجات الرائجة
                      <br />
                      وابدأ من هنا
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-body-sm leading-7 text-neutral-600 sm:text-body">
                      أزياء، إكسسوارات، جمال وعناية — تسوق من الكتالوج الحالي
                      واكتشف ما يناسبك بسرعة.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <Link
                        href={"/shop/products" as Route}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-body-sm font-medium text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100/40"
                      >
                        تسوق الآن
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={"/shop/deals" as Route}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-white/80 px-5 text-body-sm font-medium text-neutral-700 backdrop-blur-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:border-primary-200 hover:text-brand focus-visible:ring-4 focus-visible:ring-primary-100/40"
                      >
                        العروض
                      </Link>
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between sm:inset-x-5"
                  aria-hidden="true"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-neutral-600 shadow-sm backdrop-blur-sm">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-1.5 shadow-sm backdrop-blur-sm">
                    <span className="h-1.5 w-5 rounded-full bg-brand" />
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-neutral-600 shadow-sm backdrop-blur-sm">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </div>

                <span
                  className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-label font-medium text-neutral-700 shadow-sm backdrop-blur-sm sm:end-5"
                  aria-hidden="true"
                >
                  <Heart className="h-3.5 w-3.5 text-brand" />
                  ALI STORE
                </span>
              </div>
            </div>

            {quickCategories.length > 0 ? (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scroll-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickCategories.map((category, index) => (
                  <QuickCategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
