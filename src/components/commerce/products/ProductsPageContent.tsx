"use client";

import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { getProducts } from "@/features/products/services/product.service";
import type { ProductFilters, ProductSort } from "@/features/products/types/product-filter.types";
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

  const categoryIdForApi = !category.trim() ? undefined : /^\d+$/.test(category) ? category : (categories.find((item) => item.slug === category) ? String(categories.find((item) => item.slug === category)?.id) : undefined);

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

    router.push((next.toString() ? pathname + "?" + next.toString() : pathname) as Route);
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

  const activeFilterCount = [
    query,
    category,
    brand,
    inStock ? "1" : "",
    minPriceParam !== undefined ? "1" : "",
    maxPriceParam !== undefined ? "1" : "",
    sort !== "relevance" ? "1" : "",
  ].filter(Boolean).length;

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-[11px] font-black text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  ALI STORE catalog
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  المنتجات
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                  كتالوج حي من المنتجات المنشورة، مع توفر وأسعار محدثة من المصدر.
                </p>
              </div>

              <div className="text-sm text-neutral-400">
                <span className="font-black text-foreground">
                  {productsQuery.data?.pagination.totalItems ?? 0}
                </span>{" "}
                منتج
              </div>
            </div>

            <div className="mt-7 max-w-4xl">
              <div className="flex h-13 items-center rounded-2xl border border-neutral-200 bg-surface p-1.5 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100">
                <Search className="ms-3 h-5 w-5 shrink-0 text-neutral-400" />
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
                  placeholder="ابحث بالاسم أو SKU..."
                  aria-label="البحث عن المنتجات"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-neutral-400"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDraft("");
                      updateParams({ q: undefined, page: "1" });
                    }}
                    aria-label="مسح البحث"
                    className="me-1 flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={submitSearch}
                  className="hidden h-10 rounded-xl bg-brand px-6 text-sm font-black text-white hover:bg-brand-hover sm:block"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-black text-neutral-700"
            >
              <Filter className="h-4 w-4" />
              الفلاتر {activeFilterCount > 0 ? "(" + activeFilterCount + ")" : ""}
            </button>
            <span className="text-xs font-bold text-neutral-400">
              {productsQuery.isFetching ? "جارٍ التحديث…" : "بيانات مباشرة"}
            </span>
          </div>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              id="catalog-filters"
              className={`fixed inset-0 z-[var(--z-overlay)] overflow-y-auto bg-ink-950/40 p-4 ${filtersOpen ? "block" : "hidden"} lg:static lg:z-auto lg:block lg:overflow-visible lg:bg-transparent lg:p-0`}
            >
              <div className="min-h-full rounded-2xl border border-neutral-200 bg-surface p-5 shadow-modal lg:min-h-0 lg:shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 lg:hidden">
                  <h2 className="text-base font-bold text-foreground">الفلاتر</h2>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="إغلاق الفلاتر"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-black text-foreground">الفلاتر</h2>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-black text-brand hover:underline"
                >
                  مسح الكل
                </button>
              </div>

              <label className="mt-6 block text-xs font-black text-neutral-500" htmlFor="category-filter">
                القسم
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(event) => updateParams({ category: event.target.value || undefined, page: "1" })}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
              >
                <option value="">كل الأقسام</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {CATEGORY_LABEL_AR[item.slug] ?? item.name}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-neutral-500" htmlFor="brand-filter">
                العلامة
              </label>
              <select
                id="brand-filter"
                value={brandIdForApi ?? brand}
                onChange={(event) => updateParams({ brand: event.target.value || undefined, page: "1" })}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
              >
                <option value="">كل العلامات</option>
                {brandOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-neutral-500" htmlFor="sort-filter">
                الترتيب
              </label>
              <select
                id="sort-filter"
                value={sort}
                onChange={(event) => updateParams({ sort: event.target.value === "relevance" ? undefined : event.target.value, page: "1" })}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
              </select>

              <div className="mt-5">
                <p className="text-xs font-black text-neutral-500">السعر</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    value={minPriceDraft}
                    onChange={(event) => setMinPriceDraft(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="من"
                    aria-label="الحد الأدنى للسعر"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                  />
                  <input
                    value={maxPriceDraft}
                    onChange={(event) => setMaxPriceDraft(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="إلى"
                    aria-label="الحد الأعلى للسعر"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPriceFilters}
                  className="mt-2 h-10 w-full rounded-xl border border-neutral-200 text-xs font-black text-neutral-700 hover:bg-neutral-50"
                >
                  تطبيق السعر
                </button>
              </div>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-700">متوفر فقط</span>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(event) => updateParams({ inStock: event.target.checked ? "true" : undefined, page: "1" })}
                    className="h-5 w-5 accent-brand"
                  />
                </label>

              </div>
              </div>
            </aside>

            <section className="min-w-0">
              {categoryResolutionError || brandResolutionError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                  <h2 className="text-lg font-black text-amber-800">
                    تعذر تطبيق الفلتر
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-amber-700">
                    {categoryResolutionError
                      ? "القسم المحدد غير موجود في الكتالوج الحالي."
                      : "العلامة المحددة غير موجودة في الكتالوج الحالي."}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-xs font-black text-white"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              ) : productsQuery.isPending ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-[0.86] animate-pulse rounded-2xl bg-neutral-100" />
                  ))}
                </div>
              ) : productsQuery.isError ? (
                <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
                  <h2 className="text-lg font-black text-danger-700">تعذر تحميل الكتالوج</h2>
                  <p className="mt-2 text-sm text-danger-600">
                    تحقق من تشغيل Spring Boot ومن قيمة NEXT_PUBLIC_API_BASE_URL.
                  </p>
                  <button
                    type="button"
                    onClick={() => void productsQuery.refetch()}
                    className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-xs font-black text-white"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
                  <h2 className="text-xl font-black text-foreground">لا توجد منتجات مطابقة</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    غيّر الفلاتر أو أعد ضبط البحث.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-foreground">
                        المنتجات
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        الصفحة {page} من {productsQuery.data?.pagination.totalPages ?? 1}
                      </p>
                    </div>
                    {productsQuery.isFetching && (
                      <span className="text-xs font-bold text-brand">تحديث…</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                    {products.map((product) => (
                      <B2CProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <ProductPagination
                    page={page}
                    totalPages={productsQuery.data?.pagination.totalPages ?? 0}
                    onChange={(nextPage) => updateParams({ page: nextPage <= 1 ? undefined : String(nextPage) })}
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
