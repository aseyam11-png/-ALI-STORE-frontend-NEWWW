"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { getProducts } from "@/features/products/services/product.service";
import { apiClient } from "@/lib/api/http-client";

type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
};

type CatalogBrand = {
  id: number;
  name: string;
};

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const initialQuery = params.get("q") ?? "";
  const initialCategory = params.get("category") ?? "";
  const initialBrand = params.get("brand") ?? "";

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [inStock, setInStock] = useState(params.get("availability") === "IN_STOCK");
  const [sort, setSort] = useState(params.get("sort") ?? "relevance");
  const [page, setPage] = useState(Number(params.get("page") ?? 1) || 1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>> | null>(null);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiClient.request<CatalogCategory[]>("/api/v1/categories"),
      apiClient.request<CatalogBrand[]>("/api/v1/brands"),
    ])
      .then(([nextCategories, nextBrands]) => {
        if (!active) return;
        setCategories(nextCategories.filter((item) => item.active));
        setBrands(nextBrands);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
        setBrands([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const resolvedCategoryId = useMemo(() => {
    if (!category) return undefined;
    if (/^\d+$/.test(category)) return category;

    const match = categories.find(
      (item) => item.slug === category || item.name.toLowerCase() === category.toLowerCase(),
    );
    return match ? String(match.id) : undefined;
  }, [category, categories]);

  const resolvedBrandId = useMemo(() => {
    if (!brand) return undefined;
    if (/^\d+$/.test(brand)) return brand;

    const match = brands.find(
      (item) => item.name.toLowerCase() === brand.toLowerCase(),
    );
    return match ? String(match.id) : undefined;
  }, [brand, brands]);

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");

      getProducts({
        search,
        categoryId: resolvedCategoryId,
        subcategoryId: undefined,
        brand: resolvedBrandId,
        supplierId: undefined,
        minPrice: minPrice === "" ? undefined : Number(minPrice),
        maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        minRating: undefined,
        verifiedSupplierOnly: false,
        discountOnly: false,
        inStockOnly: inStock,
        featuredOnly: false,
        bestsellerOnly: false,
        newArrivalOnly: false,
        sort: sort === "price-low" ? "price_asc" : sort === "price-high" ? "price_desc" : "relevance",
        page,
        pageSize: PAGE_SIZE,
      })
        .then((next) => {
          if (active) setProducts(next);
        })
        .catch((caughtError: unknown) => {
          if (!active) return;
          setProducts(null);
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load products.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, resolvedCategoryId, resolvedBrandId, minPrice, maxPrice, inStock, sort, page, reloadKey]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set("q", search.trim());
    if (category) next.set("category", category);
    if (brand) next.set("brand", brand);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (inStock) next.set("availability", "IN_STOCK");
    if (sort !== "relevance") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));

    router.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  }, [router, pathname, search, category, brand, minPrice, maxPrice, inStock, sort, page]);

  const visibleProducts = useMemo(
    () => (products?.items ?? []).map(normalizeB2CProduct),
    [products],
  );

  const resetToFirstPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSort("relevance");
    setPage(1);
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-[11px] font-black text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  AliStore catalog
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Discover products
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                  Live catalog results from ALI STORE.
                </p>
              </div>

              <div className="text-sm text-neutral-400">
                <span className="font-black text-foreground">
                  {products?.pagination.totalItems ?? 0}
                </span>{" "}
                matching products
              </div>
            </div>

            <div className="mt-7 max-w-3xl">
              <div className="flex h-13 items-center rounded-2xl border border-neutral-200 bg-surface p-1.5 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100">
                <Search className="ms-3 h-5 w-5 shrink-0 text-neutral-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetToFirstPage();
                  }}
                  type="search"
                  placeholder="Search products, SKU or category..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-neutral-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      resetToFirstPage();
                    }}
                    aria-label="Clear search"
                    className="me-1 flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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
              aria-controls="product-filters-panel"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-black text-neutral-700"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <span className="text-xs font-bold text-neutral-400">
              Page {products?.pagination.page ?? page} of {products?.pagination.totalPages ?? 0}
            </span>
          </div>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              id="product-filters-panel"
              className={`h-fit rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm ${filtersOpen ? "block" : "hidden"} lg:block`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-black text-foreground">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-black text-brand hover:underline"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6">
                <label htmlFor="catalog-category" className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Category
                </label>
                <select
                  id="catalog-category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    resetToFirstPage();
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label htmlFor="catalog-brand" className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Brand
                </label>
                <select
                  id="catalog-brand"
                  value={brand}
                  onChange={(event) => {
                    setBrand(event.target.value);
                    resetToFirstPage();
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand"
                >
                  <option value="">All brands</option>
                  {brands.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">Price</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => {
                      setMinPrice(event.target.value);
                      resetToFirstPage();
                    }}
                    placeholder="Min"
                    aria-label="Minimum price"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => {
                      setMaxPrice(event.target.value);
                      resetToFirstPage();
                    }}
                    placeholder="Max"
                    aria-label="Maximum price"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand"
                  />
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-center justify-between gap-3 border-t border-neutral-100 pt-5">
                <span className="text-sm font-semibold text-neutral-700">In stock</span>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(event) => {
                    setInStock(event.target.checked);
                    resetToFirstPage();
                  }}
                  className="h-5 w-5 accent-brand"
                />
              </label>
            </aside>

            <section className="min-w-0">
              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-foreground">Live catalog</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {loading ? "Loading..." : `Showing ${visibleProducts.length} on this page`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="catalog-sort" className="text-xs font-bold text-neutral-400">
                    Sort
                  </label>
                  <div className="relative">
                    <select
                      id="catalog-sort"
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value);
                        resetToFirstPage();
                      }}
                      className="h-10 appearance-none rounded-xl border border-neutral-200 bg-surface py-2 ps-3 pe-9 text-sm font-bold text-neutral-700 outline-none focus:border-brand"
                    >
                      <option value="relevance">Featured / relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <p className="text-sm font-black text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((value) => value + 1)}
                    className="mt-4 rounded-xl bg-brand px-5 py-2 text-xs font-black text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : loading && visibleProducts.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center">
                  <p className="text-sm font-bold text-neutral-500">Loading products...</p>
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
                    {visibleProducts.map((product) => (
                      <B2CProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <ProductPagination
                    page={products?.pagination.page ?? page}
                    totalPages={products?.pagination.totalPages ?? 0}
                    onChange={setPage}
                  />
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">
                  <Search className="mx-auto h-7 w-7 text-neutral-300" />
                  <h2 className="mt-4 text-xl font-black text-foreground">No matching products</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                    Try a different search or clear some filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 h-10 rounded-xl bg-brand px-5 text-xs font-black text-white"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
