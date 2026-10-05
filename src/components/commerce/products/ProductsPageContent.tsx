"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { getProducts } from "@/features/products/services/product.service";
import type {
  ProductFilters,
  ProductSort,
} from "@/features/products/types/product-filter.types";
import { getTopLevelCategories } from "@/features/catalog/services/category-api.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePage(value: string | null) {
  const parsed = Number(value ?? "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(value: string | null): ProductSort {
  switch (value) {
    case "price_asc":
    case "price_desc":
    case "relevance":
      return value;
    default:
      return "relevance";
  }
}

export function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const sort = parseSort(params.get("sort"));
  const page = parsePage(params.get("page"));
  const inStock = params.get("inStock") === "true";
  const minPriceParam = parseNumber(params.get("minPrice"));
  const maxPriceParam = parseNumber(params.get("maxPrice"));

  const [searchDraft, setSearchDraft] = useState(query);
  const [minPriceDraft, setMinPriceDraft] = useState(
    minPriceParam === undefined ? "" : String(minPriceParam),
  );
  const [maxPriceDraft, setMaxPriceDraft] = useState(
    maxPriceParam === undefined ? "" : String(maxPriceParam),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getTopLevelCategories,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const categories = categoriesQuery.data ?? [];

  const categoryIdForApi =
    !category.trim()
      ? undefined
      : /^\d+$/.test(category)
        ? category
        : categories.find((item) => item.slug === category)
          ? String(categories.find((item) => item.slug === category)?.id)
          : undefined;

  const numericBrandId = /^\d+$/.test(brand) ? brand : undefined;

  const legacyBrandOptionsQuery = useQuery({
    queryKey: ["catalog", "brand-options", categoryIdForApi],
    queryFn: async () =>
      (
        await getProducts({
          search: "",
          categoryId: categoryIdForApi,
          subcategoryId: undefined,
          brand: undefined,
          supplierId: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minRating: undefined,
          verifiedSupplierOnly: false,
          discountOnly: false,
          inStockOnly: false,
          featuredOnly: false,
          bestsellerOnly: false,
          newArrivalOnly: false,
          sort: "relevance",
          page: 1,
          pageSize: 100,
        })
      ).items,
    enabled: Boolean(brand && !numericBrandId),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const brandIdForApi = useMemo(() => {
    if (!brand.trim()) return undefined;
    if (numericBrandId) return numericBrandId;

    const matched = (legacyBrandOptionsQuery.data ?? []).find(
      (product) =>
        product.brand?.name === brand &&
        /^\d+$/.test(product.brand.id),
    );

    return matched?.brand?.id;
  }, [brand, numericBrandId, legacyBrandOptionsQuery.data]);

  const categoryResolutionError =
    Boolean(category) &&
    !categoriesQuery.isPending &&
    !categoryIdForApi;

  const brandResolutionError =
    Boolean(brand) &&
    !numericBrandId &&
    !legacyBrandOptionsQuery.isPending &&
    !brandIdForApi;

  const filters = useMemo<ProductFilters>(
    () => ({
      search: query,
      categoryId: categoryIdForApi,
      brand: brandIdForApi,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      inStockOnly: inStock,
      discountOnly: false,
      verifiedSupplierOnly: false,
      supplierId: undefined,
      subcategoryId: undefined,
      minRating: undefined,
      featuredOnly: false,
      bestsellerOnly: false,
      newArrivalOnly: false,
      sort,
      page,
      pageSize: 12,
    }),
    [
      query,
      categoryIdForApi,
      brandIdForApi,
      minPriceParam,
      maxPriceParam,
      inStock,
      sort,
      page,
    ],
  );

  const productsQuery = useQuery({
    queryKey: ["catalog", "products", filters],
    queryFn: () => getProducts(filters),
    enabled: !categoryResolutionError && !brandResolutionError,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const brandOptions = useMemo(() => {
    const source =
      brand && !numericBrandId
        ? legacyBrandOptionsQuery.data ?? []
        : productsQuery.data?.items ?? [];

    const byId = new Map<string, { id: string; name: string }>();
    for (const product of source) {
      if (!product.brand || !/^\d+$/.test(product.brand.id)) continue;
      byId.set(product.brand.id, {
        id: product.brand.id,
        name: product.brand.name,
      });
    }
    return Array.from(byId.values());
  }, [
    brand,
    numericBrandId,
    legacyBrandOptionsQuery.data,
    productsQuery.data?.items,
  ]);

  const products = (productsQuery.data?.items ?? []).map(normalizeB2CProduct);

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
    }

    if ("page" in changes) {
      const requested = Number(changes.page ?? "1");
      if (requested <= 1) next.delete("page");
    }

    router.push(
      (next.toString() ? pathname + "?" + next.toString() : pathname) as Route,
    );
  };

  const submitSearch = () => {
    updateParams({ q: searchDraft.trim() || undefined, page: "1" });
  };

  const applyPriceFilters = () => {
    const min = parseNumber(minPriceDraft);
    const max = parseNumber(maxPriceDraft);

    if (min !== undefined && max !== undefined && min > max) {
      updateParams({
        minPrice: String(max),
        maxPrice: String(min),
        page: "1",
      });
      return;
    }

    updateParams({
      minPrice: min === undefined ? undefined : String(min),
      maxPrice: max === undefined ? undefined : String(max),
      page: "1",
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchDraft("");
    setMinPriceDraft("");
    setMaxPriceDraft("");
    router.push(pathname as Route);
    setFiltersOpen(false);
  };

  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  const activeFilterCount = [
    query,
    category,
    brand,
    inStock ? "1" : "",
    minPriceParam !== undefined ? "1" : "",
    maxPriceParam !== undefined ? "1" : "",
    sort !== "relevance" ? "1" : "",
  ].filter(Boolean).length;

  const totalItems = productsQuery.data?.pagination.totalItems ?? 0;
  const totalPages = productsQuery.data?.pagination.totalPages ?? 1;

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-surface">
          <div className="container-shell mx-auto max-w-[1240px] py-5 sm:py-6">
            <nav
              aria-label="مسار الصفحة"
              className="mb-4 text-caption text-muted-foreground"
            >
              <span>الرئيسية</span>
              <span className="mx-2 text-neutral-300" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-foreground">المنتجات</span>
            </nav>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-h1 text-foreground sm:text-display">المنتجات</h1>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {totalItems.toLocaleString("en-US")} منتج متاح
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
                <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-md border border-border bg-background px-1 transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100 sm:w-[min(420px,42vw)] sm:flex-none">
                  <Search
                    className="ms-3 h-4.5 w-4.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        submitSearch();
                      }
                    }}
                    type="search"
                    placeholder="ابحث عن منتج أو SKU"
                    aria-label="البحث عن المنتجات"
                    className="min-w-0 flex-1 bg-transparent px-3 text-body-sm text-foreground outline-none placeholder:text-neutral-400"
                  />
                  {searchDraft ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDraft("");
                        updateParams({ q: undefined, page: "1" });
                      }}
                      aria-label="مسح البحث"
                      className="me-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground focus-visible:ring-4 focus-visible:ring-primary-100"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={submitSearch}
                  className="h-11 rounded-md bg-brand px-5 text-body-sm font-medium text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  بحث
                </button>
              </div>
            </div>

            {activeFilterCount > 0 ? (
              <div
                className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3"
                aria-label="الفلاتر المطبقة"
              >
                <span className="me-1 text-caption font-medium text-muted-foreground">
                  الفلاتر الحالية:
                </span>
                {query ? (
                  <span className="rounded-md bg-primary-50 px-2.5 py-1.5 text-caption font-medium text-brand">
                    بحث: {query}
                  </span>
                ) : null}
                {category ? (
                  <span className="rounded-md bg-primary-50 px-2.5 py-1.5 text-caption font-medium text-brand">
                    قسم
                  </span>
                ) : null}
                {brand ? (
                  <span className="rounded-md bg-primary-50 px-2.5 py-1.5 text-caption font-medium text-brand">
                    علامة
                  </span>
                ) : null}
                {inStock ? (
                  <span className="rounded-md bg-success-surface px-2.5 py-1.5 text-caption font-medium text-success-700">
                    متوفر فقط
                  </span>
                ) : null}
                {minPriceParam !== undefined || maxPriceParam !== undefined ? (
                  <span className="rounded-md bg-neutral-100 px-2.5 py-1.5 text-caption font-medium text-neutral-700">
                    نطاق سعر
                  </span>
                ) : null}
                {sort !== "relevance" ? (
                  <span className="rounded-md bg-neutral-100 px-2.5 py-1.5 text-caption font-medium text-neutral-700">
                    ترتيب مخصص
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md px-2.5 py-1.5 text-caption font-medium text-brand transition-colors duration-200 hover:bg-primary-50 focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  مسح الكل
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="container-shell mx-auto max-w-[1240px] py-6 sm:py-8 lg:py-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-body-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:border-border-hover hover:bg-neutral-50 focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              الفلاتر
              {activeFilterCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-primary-50 px-1.5 py-0.5 text-label font-medium text-brand">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <label
                htmlFor="mobile-sort-filter"
                className="text-caption font-medium text-muted-foreground"
              >
                الترتيب
              </label>
              <select
                id="mobile-sort-filter"
                value={sort}
                onChange={(event) =>
                  updateParams({
                    sort:
                      event.target.value === "relevance"
                        ? undefined
                        : event.target.value,
                    page: "1",
                  })
                }
                className="h-11 rounded-md border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
              </select>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)] xl:gap-7">
            <aside
              id="catalog-filters"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setFiltersOpen(false);
              }}
              className={
                "fixed inset-0 z-[var(--z-overlay)] overflow-y-auto bg-ink-950/40 p-3 " +
                (filtersOpen ? "block" : "hidden") +
                " lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0"
              }
            >
              <div className="min-h-full rounded-lg border border-border bg-surface p-4 shadow-modal lg:min-h-0 lg:shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 lg:hidden">
                  <h2 className="text-h4 text-foreground">الفلاتر</h2>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="إغلاق الفلاتر"
                    className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-neutral-100 focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      className="h-4 w-4 text-brand"
                      aria-hidden="true"
                    />
                    <h2 className="text-body-sm font-medium text-foreground">
                      تصفية النتائج
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-caption font-medium text-brand transition-colors duration-200 hover:text-brand-hover hover:underline focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    مسح الكل
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      className="text-caption font-medium text-muted-foreground"
                      htmlFor="category-filter"
                    >
                      القسم
                    </label>
                    <select
                      id="category-filter"
                      value={category}
                      onChange={(event) =>
                        updateParams({
                          category: event.target.value || undefined,
                          page: "1",
                        })
                      }
                      className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground outline-none transition-colors duration-200 focus:border-brand focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="">كل الأقسام</option>
                      {categories.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {CATEGORY_LABEL_AR[item.slug] ?? item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="text-caption font-medium text-muted-foreground"
                      htmlFor="brand-filter"
                    >
                      العلامة
                    </label>
                    <select
                      id="brand-filter"
                      value={brandIdForApi ?? brand}
                      onChange={(event) =>
                        updateParams({
                          brand: event.target.value || undefined,
                          page: "1",
                        })
                      }
                      className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground outline-none transition-colors duration-200 focus:border-brand focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="">كل العلامات</option>
                      {brandOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-neutral-100 pt-4">
                    <p className="text-caption font-medium text-muted-foreground">
                      السعر
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        value={minPriceDraft}
                        onChange={(event) => setMinPriceDraft(event.target.value)}
                        type="number"
                        min="0"
                        placeholder="من"
                        aria-label="الحد الأدنى للسعر"
                        className="h-11 rounded-md border border-border bg-background px-3 text-body-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                      <input
                        value={maxPriceDraft}
                        onChange={(event) => setMaxPriceDraft(event.target.value)}
                        type="number"
                        min="0"
                        placeholder="إلى"
                        aria-label="الحد الأعلى للسعر"
                        className="h-11 rounded-md border border-border bg-background px-3 text-body-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyPriceFilters}
                      className="mt-2 h-10 w-full rounded-md border border-border bg-surface text-caption font-medium text-foreground transition-colors duration-200 hover:border-border-hover hover:bg-neutral-50 focus-visible:ring-4 focus-visible:ring-primary-100"
                    >
                      تطبيق السعر
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-4">
                    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2 transition-colors duration-200 hover:bg-neutral-50">
                      <span className="text-body-sm font-medium text-foreground">
                        متوفر فقط
                      </span>
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(event) =>
                          updateParams({
                            inStock: event.target.checked
                              ? "true"
                              : undefined,
                            page: "1",
                          })
                        }
                        className="h-5 w-5 accent-brand"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            <section className="min-w-0">
              {categoryResolutionError || brandResolutionError ? (
                <div className="mx-auto max-w-2xl rounded-lg border border-warning-100 bg-warning-surface p-8 text-center shadow-raised">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-surface text-warning">
                    <Filter className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-h4 text-foreground">
                    تعذر تطبيق الفلتر
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-body-sm leading-6 text-muted-foreground">
                    {categoryResolutionError
                      ? "القسم المحدد غير موجود في الكتالوج الحالي."
                      : "العلامة المحددة غير موجودة في الكتالوج الحالي."}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-body-sm font-medium text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              ) : productsQuery.isPending ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-lg border border-border bg-surface p-3 shadow-raised"
                    >
                      <div className="aspect-square animate-pulse rounded-md bg-neutral-100" />
                      <div className="space-y-2 p-2 pt-4">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
                        <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                        <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-neutral-100" />
                        <div className="h-11 w-full animate-pulse rounded-md bg-neutral-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsQuery.isError ? (
                <div className="mx-auto max-w-2xl rounded-lg border border-danger-100 bg-danger-surface p-8 text-center shadow-raised">
                  <h2 className="text-h4 text-danger-700">
                    تعذر تحميل الكتالوج
                  </h2>
                  <p className="mx-auto mt-2 max-w-xl text-body-sm leading-6 text-danger-600">
                    تعذر جلب المنتجات حاليًا. أعد المحاولة، أو تحقق من اتصال
                    خدمة الكتالوج.
                  </p>
                  <button
                    type="button"
                    onClick={() => void productsQuery.refetch()}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-body-sm font-medium text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="mx-auto max-w-2xl rounded-lg border border-border bg-surface p-10 text-center shadow-raised">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-neutral-100 text-muted-foreground">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-h4 text-foreground">
                    لا توجد منتجات مطابقة
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
                    جرّب إزالة أحد الفلاتر أو تعديل عبارة البحث للوصول إلى
                    منتجات أكثر.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-body-sm font-medium text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    عرض كل المنتجات
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5 border-b border-border pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p
                          className="text-body-sm font-medium text-foreground"
                          aria-live="polite"
                        >
                          {totalItems.toLocaleString("en-US")} نتيجة
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          الصفحة {page} من {totalPages}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {productsQuery.isFetching ? (
                          <span
                            className="inline-flex items-center gap-2 rounded-md bg-primary-50 px-2.5 py-1.5 text-caption font-medium text-brand"
                            aria-live="polite"
                          >
                            <span
                              className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand"
                              aria-hidden="true"
                            />
                            تحديث النتائج…
                          </span>
                        ) : null}

                        <label
                          htmlFor="desktop-sort-filter"
                          className="text-caption font-medium text-muted-foreground"
                        >
                          ترتيب:
                        </label>
                        <select
                          id="desktop-sort-filter"
                          value={sort}
                          onChange={(event) =>
                            updateParams({
                              sort:
                                event.target.value === "relevance"
                                  ? undefined
                                  : event.target.value,
                              page: "1",
                            })
                          }
                          className="h-10 rounded-md border border-border bg-background px-3 text-body-sm text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                        >
                          <option value="relevance">الأكثر صلة</option>
                          <option value="price_asc">السعر: من الأقل</option>
                          <option value="price_desc">السعر: من الأعلى</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setFiltersOpen(true)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-caption font-medium text-foreground transition-colors duration-200 hover:bg-neutral-50 focus-visible:ring-4 focus-visible:ring-primary-100 lg:hidden"
                        >
                          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                          الفلاتر
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-5">
                    {products.map((product) => (
                      <B2CProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <ProductPagination
                    page={page}
                    totalPages={productsQuery.data?.pagination.totalPages ?? 0}
                    onChange={(nextPage) =>
                      updateParams({
                        page: nextPage <= 1 ? undefined : String(nextPage),
                      })
                    }
                  />
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
