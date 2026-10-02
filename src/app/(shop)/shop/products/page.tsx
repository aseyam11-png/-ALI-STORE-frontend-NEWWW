"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { getCatalogBrands, getCatalogCategories } from "@/features/catalog/services/catalog-api.service";
import { getProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { defaultProductFilters } from "@/features/products/types/product-filter.types";

const PAGE_SIZE = 12;

function buildSearchHref(params: URLSearchParams) {
  const query = params.toString();
  return query ? "/shop/products?" + query : "/shop/products";
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "relevance");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("availability") === "IN_STOCK");
  const [discountOnly, setDiscountOnly] = useState(searchParams.get("discountOnly") === "true");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: getCatalogCategories,
    staleTime: 60_000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["catalog-brands"],
    queryFn: getCatalogBrands,
    staleTime: 60_000,
  });

  const categoryId = useMemo(() => {
    if (!category) return undefined;
    const match = categories.find(
      (item) => String(item.id) === category || item.slug === category,
    );
    return match ? String(match.id) : undefined;
  }, [category, categories]);

  const brandId = useMemo(() => {
    if (!brand) return undefined;
    const match = brands.find(
      (item) => String(item.id) === brand || item.name.toLowerCase() === brand.toLowerCase(),
    );
    return match ? String(match.id) : undefined;
  }, [brand, brands]);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const productsQuery = useQuery({
    queryKey: [
      "products",
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort,
      inStockOnly,
      discountOnly,
      page,
    ],
    queryFn: () =>
      getProducts({
        ...defaultProductFilters,
        search,
        categoryId,
        brand: brandId,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStockOnly,
        discountOnly,
        sort: sort as typeof defaultProductFilters.sort,
        page,
        pageSize: PAGE_SIZE,
      }),
    staleTime: 15_000,
  });

  const products = productsQuery.data?.items.map(normalizeB2CProduct) ?? [];
  const pagination = productsQuery.data?.pagination;

  const applyUrl = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }

    params.delete("page");
    router.replace(buildSearchHref(params));
  };

  const submitSearch = () => {
    applyUrl({ q: search.trim() || undefined });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    setInStockOnly(false);
    setDiscountOnly(false);
    applyUrl({
      q: undefined,
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
      availability: undefined,
      discountOnly: undefined,
    });
  };

  const hasFilters =
    Boolean(search || category || brand || minPrice || maxPrice) ||
    inStockOnly ||
    discountOnly ||
    sort !== "relevance";

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-label font-medium uppercase tracking-wide text-muted-foreground">ALI STORE catalog</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">كل المنتجات</h1>
                <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                  النتائج المعروضة من الكتالوج المنشور في الخادم، مع توفر المنتج والتحقق من السعر عند الشراء.
                </p>
              </div>

              <span className="text-body-sm font-medium text-muted-foreground">
                {pagination ? pagination.totalItems : 0} منتج
              </span>
            </div>

            <div className="mt-7 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-background p-1.5 focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100">
              <Search className="ms-3 h-5 w-5 shrink-0 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
                placeholder="ابحث عن منتج أو SKU..."
                aria-label="بحث المنتجات"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-neutral-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    applyUrl({ q: undefined });
                  }}
                  aria-label="مسح البحث"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={submitSearch}
                className="hidden h-10 rounded-xl bg-brand px-6 text-sm font-medium text-white hover:bg-brand-hover sm:block"
              >
                بحث
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-bold"
              aria-expanded={filtersOpen}
            >
              <Filter className="h-4 w-4" />
              الفلاتر
            </button>
            <span className="text-xs font-bold text-neutral-400">
              صفحة {pagination?.page ?? page} من {pagination?.totalPages ?? 0}
            </span>
          </div>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              className={(filtersOpen ? "block" : "hidden") + " h-fit rounded-2xl border border-neutral-200 bg-surface p-5 lg:block"}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-bold text-foreground">الفلاتر</h2>
                </div>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="text-xs font-bold text-brand hover:underline">
                    مسح الكل
                  </button>
                )}
              </div>

              <label className="mt-6 block text-xs font-bold text-neutral-500" htmlFor="catalog-category">القسم</label>
              <select
                id="catalog-category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  applyUrl({ category: event.target.value || undefined });
                }}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
              >
                <option value="">كل الأقسام</option>
                {categories.filter((item) => !item.parentId).map((item) => (
                  <option key={item.id} value={item.slug}>{item.name}</option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-bold text-neutral-500" htmlFor="catalog-brand">العلامة</label>
              <select
                id="catalog-brand"
                value={brand}
                onChange={(event) => {
                  setBrand(event.target.value);
                  applyUrl({ brand: event.target.value || undefined });
                }}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
              >
                <option value="">كل العلامات</option>
                {brands.map((item) => (
                  <option key={item.id} value={String(item.id)}>{item.name}</option>
                ))}
              </select>

              <div className="mt-5">
                <p className="text-xs font-bold text-neutral-500">السعر</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} onBlur={() => applyUrl({ minPrice: minPrice || undefined })} min="0" type="number" placeholder="من" className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand" />
                  <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} onBlur={() => applyUrl({ maxPrice: maxPrice || undefined })} min="0" type="number" placeholder="إلى" className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand" />
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-neutral-700">
                <span>متوفر فقط</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => {
                    setInStockOnly(event.target.checked);
                    applyUrl({ availability: event.target.checked ? "IN_STOCK" : undefined });
                  }}
                  className="h-5 w-5 accent-brand"
                />
              </label>

              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-neutral-700">
                <span>العروض فقط</span>
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(event) => {
                    setDiscountOnly(event.target.checked);
                    applyUrl({ discountOnly: event.target.checked ? "true" : undefined });
                  }}
                  className="h-5 w-5 accent-brand"
                />
              </label>

              <label className="mt-5 block text-xs font-bold text-neutral-500" htmlFor="catalog-sort">الترتيب</label>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  applyUrl({ sort: event.target.value === "relevance" ? undefined : event.target.value });
                }}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">الأقل سعرًا</option>
                <option value="price_desc">الأعلى سعرًا</option>
                <option value="discount_desc">الأعلى خصمًا</option>
              </select>
            </aside>

            <section className="min-w-0">
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-[3/5] animate-pulse rounded-2xl bg-neutral-100" />
                  ))}
                </div>
              ) : productsQuery.isError ? (
                <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
                  <h2 className="text-lg font-bold text-danger-700">تعذر تحميل الكتالوج</h2>
                  <p className="mt-2 text-sm text-danger-600">تحقق من اتصال الـAPI وحاول مرة أخرى.</p>
                  <button type="button" onClick={() => productsQuery.refetch()} className="mt-5 rounded-xl bg-danger-600 px-5 py-2.5 text-sm font-bold text-white">
                    إعادة المحاولة
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center">
                  <h2 className="text-xl font-bold text-foreground">لا توجد نتائج</h2>
                  <p className="mt-2 text-sm text-muted-foreground">جرّب إزالة بعض الفلاتر أو تغيير كلمة البحث.</p>
                  <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">
                    مسح الفلاتر
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <B2CProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={!pagination.hasPreviousPage}
                        onClick={() => applyUrl({ page: String(Math.max(1, pagination.page - 1)) })}
                        className="h-10 rounded-xl border border-neutral-200 bg-surface px-4 text-sm font-bold disabled:opacity-40"
                      >
                        السابق
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                        .slice(Math.max(0, pagination.page - 3), Math.min(pagination.totalPages, pagination.page + 2))
                        .map((pageNumber) => (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => applyUrl({ page: String(pageNumber) })}
                            className={"h-10 min-w-10 rounded-xl px-3 text-sm font-bold " + (pageNumber === pagination.page ? "bg-brand text-white" : "border border-neutral-200 bg-surface text-neutral-700")}
                          >
                            {pageNumber}
                          </button>
                        ))}

                      <button
                        type="button"
                        disabled={!pagination.hasNextPage}
                        onClick={() => applyUrl({ page: String(pagination.page + 1) })}
                        className="h-10 rounded-xl border border-neutral-200 bg-surface px-4 text-sm font-bold disabled:opacity-40"
                      >
                        التالي
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
