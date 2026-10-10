"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  Footprints,
  Gem,
  Shirt,
  Watch,
} from "lucide-react";

import {
  flattenCategoryTree,
  getCategories,
} from "@/features/catalog/services/category-api.service";
import type { CategoryNode } from "@/features/catalog/types/category.types";
import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

type TargetKey = "clothing" | "shoes" | "watches" | "accessories";

type Target = {
  key: TargetKey;
  title: string;
  description: string;
  slugs: string[];
  keywords: string[];
  Icon: typeof Shirt;
};

const TARGETS: Target[] = [
  {
    key: "clothing",
    title: "الملابس",
    description: "رجال، نساء، وأطفال",
    slugs: ["fashion", "clothing", "apparel"],
    keywords: ["fashion", "clothing", "apparel", "ملابس", "أزياء"],
    Icon: Shirt,
  },
  {
    key: "shoes",
    title: "الأحذية",
    description: "يومي، رياضي، ورسمي",
    slugs: ["shoes", "shoe", "footwear"],
    keywords: ["shoes", "shoe", "footwear", "أحذية"],
    Icon: Footprints,
  },
  {
    key: "watches",
    title: "الساعات",
    description: "تصاميم مختارة",
    slugs: ["watches", "watch"],
    keywords: ["watches", "watch", "ساعات"],
    Icon: Watch,
  },
  {
    key: "accessories",
    title: "الإكسسوارات",
    description: "حقائب، مجوهرات ونظارات",
    slugs: ["accessories"],
    keywords: ["accessories", "jewelry", "sunglasses", "bags", "إكسسوارات"],
    Icon: Gem,
  },
];

const EMPTY_FILTERS = {
  search: "",
  subcategoryId: undefined,
  brand: undefined,
  supplierId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  verifiedSupplierOnly: false,
  discountOnly: false,
  inStockOnly: true,
  featuredOnly: false,
  bestsellerOnly: false,
  newArrivalOnly: false,
  sort: "relevance" as const,
  page: 1,
  pageSize: 4,
};

function resolveTarget(categories: CategoryNode[], target: Target) {
  const flattened = flattenCategoryTree(categories);
  const bySlug = new Map(flattened.map((category) => [category.slug, category]));

  for (const slug of target.slugs) {
    const exact = bySlug.get(slug);
    if (exact) return exact;
  }

  return flattened.find((category) => {
    const haystack = (category.slug + " " + category.name).toLocaleLowerCase();
    return target.keywords.some((keyword) => haystack.includes(keyword));
  });
}

export function HomepageCategoryExplorer() {
  const [activeKey, setActiveKey] = useState<TargetKey>("clothing");
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["homepage", "categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });

  const targets = useMemo(
    () =>
      TARGETS.map((target) => ({
        ...target,
        category: resolveTarget(categoriesQuery.data ?? [], target),
      })),
    [categoriesQuery.data],
  );

  const activeTarget = targets.find((target) => target.key === activeKey);
  const activeCategory = activeTarget?.category;

  const horizontalItems = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.children.slice(0, 10);
  }, [activeCategory]);

  const queryCategoryIds = useMemo(() => {
    if (!activeCategory) return [];
    if (activeSubcategoryId) return [activeSubcategoryId];

    return Array.from(
      new Set([
        activeCategory.id,
        ...activeCategory.children.map((child) => child.id),
      ]),
    ).slice(0, 10);
  }, [activeCategory, activeSubcategoryId]);

  const productQueries = useQueries({
    queries: queryCategoryIds.map((categoryId) => ({
      queryKey: ["homepage", "category-products", categoryId],
      queryFn: () =>
        getProducts({
          ...EMPTY_FILTERS,
          categoryId,
        }),
      staleTime: 60_000,
    })),
  });

  const products = Array.from(
    new Map(
      productQueries
        .flatMap((query) => query.data?.items ?? [])
        .map((product) => [product.id, normalizeB2CProduct(product)]),
    ).values(),
  ).slice(0, 4);

  const loading =
    categoriesQuery.isPending ||
    productQueries.some((query) => query.isPending);

  const failed =
    categoriesQuery.isError && queryCategoryIds.length === 0;

  const handleCategoryChange = (key: TargetKey) => {
    setActiveKey(key);
    setActiveSubcategoryId(null);
  };

  return (
    <section className="bg-background" aria-labelledby="homepage-category-title">
      <div className="container-shell py-7 sm:py-9 lg:py-11">
        <SectionHeading
          eyebrow="تصفح أسرع"
          title="تسوّق حسب القسم"
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[224px_minmax(0,1fr)] lg:items-start lg:gap-5">
          <aside className="rounded-2xl border border-neutral-200 bg-neutral-100 p-2.5 shadow-raised">
            <div className="px-3 pb-2.5">
              <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
                الأقسام
              </p>
            </div>

            <nav aria-label="الأقسام الرئيسية" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {targets.map((target) => {
                const Icon = target.Icon;
                const active = target.key === activeKey;
                const available = Boolean(target.category);

                return (
                  <button
                    key={target.key}
                    type="button"
                    aria-pressed={active}
                    disabled={!available}
                    onClick={() => handleCategoryChange(target.key)}
                    className={
                      "relative flex min-h-14 items-center gap-3 rounded-xl border bg-surface px-3 py-2 text-start transition-all duration-200 ease-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 " +
                      (active
                        ? "border-primary-200 bg-primary-50 text-brand shadow-sm"
                        : "border-transparent text-foreground shadow-none hover:border-neutral-200 hover:bg-white") +
                      (!available ? " cursor-not-allowed opacity-45" : "")
                    }
                  >
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                        (active
                          ? "bg-white text-brand ring-1 ring-primary-100"
                          : "bg-neutral-100 text-neutral-600")
                      }
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm font-medium">
                        {target.title}
                      </span>
                      <span
                        className={
                          "mt-0.5 block truncate text-label " +
                          (active ? "text-brand/70" : "text-muted-foreground")
                        }
                      >
                        {available ? target.description : "غير متاح حاليًا"}
                      </span>
                    </span>

                    <ChevronLeft
                      className={
                        "h-4 w-4 shrink-0 rtl:rotate-180 " +
                        (active ? "text-brand" : "text-neutral-300")
                      }
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </nav>

            <Link
              href={"/shop/products" as Route}
              className="mt-1.5 flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface px-3 text-caption font-medium text-neutral-700 transition hover:border-primary-200 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              جميع المنتجات
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </aside>

          <div className="min-w-0">
            <div className="rounded-2xl border border-border bg-surface p-2.5 shadow-raised">
              <div className="flex items-center justify-between gap-3 px-2">
                <div className="min-w-0">
                  <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
                    الأقسام الفرعية
                  </p>
                  <p className="mt-0.5 truncate text-body-sm font-medium text-foreground">
                    {activeTarget?.title ?? "الكتالوج"}
                  </p>
                </div>

                {activeCategory ? (
                  <Link
                    href={
                      ("/shop/categories/" +
                        encodeURIComponent(activeCategory.slug)) as Route
                    }
                    className="hidden shrink-0 items-center gap-1.5 text-caption font-medium text-brand hover:underline sm:inline-flex"
                  >
                    مشاهدة القسم
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>

              {horizontalItems.length > 0 ? (
                <nav
                  aria-label={"أقسام " + (activeTarget?.title ?? "المتجر")}
                  className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1 scroll-smooth"
                >
                  <button
                    type="button"
                    aria-pressed={activeSubcategoryId === null}
                    onClick={() => setActiveSubcategoryId(null)}
                    className={
                      "inline-flex min-h-10 shrink-0 items-center rounded-lg px-3.5 text-body-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 " +
                      (activeSubcategoryId === null
                        ? "bg-brand text-white"
                        : "border border-border bg-background text-neutral-700 hover:border-primary-200 hover:text-brand")
                    }
                  >
                    الكل
                  </button>

                  {horizontalItems.map((category) => {
                    const active = activeSubcategoryId === category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveSubcategoryId(category.id)}
                        className={
                          "inline-flex min-h-10 shrink-0 items-center rounded-lg px-3.5 text-body-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 " +
                          (active
                            ? "bg-brand text-white"
                            : "border border-border bg-background text-neutral-700 hover:border-primary-200 hover:text-brand")
                        }
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </nav>
              ) : (
                <div className="mt-2 rounded-xl border border-dashed border-border px-4 py-3 text-caption text-muted-foreground">
                  لا توجد أقسام فرعية متاحة لهذا القسم حاليًا.
                </div>
              )}
            </div>

            <div className="mt-4">
              {loading ? (
                <div
                  className="grid grid-cols-2 gap-4 md:grid-cols-4"
                  aria-busy="true"
                  aria-label="جارٍ تحميل المنتجات"
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[0.86] animate-pulse rounded-xl bg-neutral-100"
                    />
                  ))}
                </div>
              ) : failed ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center"
                >
                  <p className="text-body-sm font-medium text-danger-700">
                    تعذر تحميل أقسام المتجر الآن.
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                  <p className="text-body-sm font-medium text-neutral-700">
                    لا توجد منتجات متاحة في هذا القسم حاليًا.
                  </p>
                  <Link
                    href={"/shop/products" as Route}
                    className="mt-3 inline-flex items-center gap-2 text-caption font-medium text-brand hover:underline"
                  >
                    تصفح الكتالوج الكامل
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {products.map((product) => (
                    <B2CProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomepageCategoryExplorer;
