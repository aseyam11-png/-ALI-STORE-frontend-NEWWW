"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";

import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { getProducts } from "@/features/products/services/product.service";
import type { B2CProduct } from "@/features/products/types/b2c-product.types";

import {
  filterCatalogProducts,
  sortCatalogProducts,
  type CatalogFilterState,
} from "@/features/catalog/services/catalog-filter.service";

import { paginate } from "@/features/catalog/services/pagination.service";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [search, setSearch] =
    useState("");

  const [allProducts, setAllProducts] = useState<B2CProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      setCatalogLoading(true);
      setCatalogError("");

      void getProducts({
        search,
        categoryId: undefined,
        subcategoryId: undefined,
        brand: undefined,
        supplierId: undefined,
        minPrice:
          minPrice.trim()
            ? Number(minPrice)
            : undefined,
        maxPrice:
          maxPrice.trim()
            ? Number(maxPrice)
            : undefined,
        minRating: undefined,
        verifiedSupplierOnly: false,
        discountOnly: false,
        inStockOnly: inStock,
        featuredOnly: false,
        bestsellerOnly: false,
        newArrivalOnly: false,
        sort: "relevance",
        page: 1,
        pageSize: 100,
      })
        .then((response) => {
          if (cancelled) return;
          setAllProducts(
            response.items.map(
              normalizeB2CProduct,
            ),
          );
        })
        .catch((error) => {
          if (cancelled) return;
          setAllProducts([]);
          setCatalogError(
            error instanceof Error
              ? error.message
              : "Unable to load products.",
          );
        })
        .finally(() => {
          if (!cancelled) {
            setCatalogLoading(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    search,
    minPrice,
    maxPrice,
    inStock,
  ]);

  const brands = useMemo(
    () => [
      "All brands",
      ...Array.from(
        new Set(
          allProducts
            .map(
              (product) =>
                product.brand,
            )
            .filter(Boolean),
        ),
      ),
    ],
    [allProducts],
  );

  // Derived from the catalog itself (same pattern as `brands` above) rather
  // than a hardcoded list — a hardcoded department list drifts out of sync
  // with what's actually in `allProducts` and, worse, out of sync with the
  // store's real Fashion/Accessories/Beauty & Care taxonomy (features/
  // catalog/data/category-tree.ts), which the current mock catalog items
  // don't belong to yet. Every option here is guaranteed to match at least
  // one real product.
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          allProducts
            .map(
              (product) =>
                product.category,
            )
            .filter(Boolean),
        ),
      ),
    ],
    [allProducts],
  );

  const [category, setCategory] =
    useState("All");

  const [brand, setBrand] =
    useState("All brands");

  const [rating, setRating] =
    useState("all");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [freeShipping, setFreeShipping] =
    useState(false);

  const [inStock, setInStock] =
    useState(false);

  const [dealsOnly, setDealsOnly] =
    useState(false);

  const [sort, setSort] =
    useState("featured");

  const [page, setPage] =
    useState(1);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const filterState =
    useMemo<CatalogFilterState>(
      () => ({
        search,
        brand:
          brand === "All brands"
            ? "all"
            : brand,
        rating,
        minPrice,
        maxPrice,
        selected: {},
        freeShipping,
        inStock,
        dealsOnly,
      }),
      [
        search,
        brand,
        rating,
        minPrice,
        maxPrice,
        freeShipping,
        inStock,
        dealsOnly,
      ],
    );

  const filteredProducts =
    useMemo(() => {
      let result =
        allProducts.filter(
          (product) => {
            if (
              category !==
                "All" &&
              !product.category
                .toLowerCase()
                .includes(
                  category.toLowerCase(),
                )
            ) {
              return false;
            }

            return true;
          },
        );

      result =
        filterCatalogProducts(
          result,
          filterState,
        );

      return sortCatalogProducts(
        result,
        sort,
      );
    }, [
      allProducts,
      category,
      filterState,
      sort,
    ]);

  const paginated =
    useMemo(
      () =>
        paginate(
          filteredProducts,
          page,
          PAGE_SIZE,
        ),
      [
        filteredProducts,
        page,
      ],
    );

  const visibleProducts =
    paginated.items;

  const resetToFirstPage =
    () => {
      setPage(1);
    };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setBrand("All brands");
    setRating("all");
    setMinPrice("");
    setMaxPrice("");
    setFreeShipping(false);
    setInStock(false);
    setDealsOnly(false);
    setPage(1);
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-background">

        {/* Header */}
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
                  Search, compare and filter every product AliStore sources,
                  sells and ships directly.
                </p>
              </div>

              <div className="text-sm text-neutral-400">
                <span className="font-black text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                matching products
              </div>

            </div>

            {/* Search */}
            <div className="mt-7 max-w-3xl">

              <div className="flex h-13 items-center rounded-2xl border border-neutral-200 bg-surface p-1.5 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100">

                <Search className="ms-3 h-5 w-5 shrink-0 text-neutral-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );
                    resetToFirstPage();
                  }}
                  type="search"
                  placeholder="Search products, brands or categories..."
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

                <button
                  type="button"
                  onClick={
                    resetToFirstPage
                  }
                  className="hidden h-10 rounded-xl bg-brand px-6 text-sm font-black text-white hover:bg-brand-hover sm:block"
                >
                  Search
                </button>

              </div>
            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {/* Mobile filter */}
          <div className="mb-5 flex items-center justify-between lg:hidden">

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(
                  (value) =>
                    !value,
                )
              }
              aria-expanded={filtersOpen}
              aria-controls="product-filters-panel"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-black text-neutral-700"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <span className="text-xs font-bold text-neutral-400">
              Page{" "}
              {paginated.pagination.page}{" "}
              of{" "}
              {
                paginated
                  .pagination
                  .totalPages
              }
            </span>

          </div>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">

            {/* Filters */}
            <aside
              id="product-filters-panel"
              className={`h-fit rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm ${
                filtersOpen
                  ? "block"
                  : "hidden"
              } lg:block`}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />

                  <h2 className="text-sm font-black text-foreground">
                    Filters
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-[11px] font-black text-brand hover:underline"
                >
                  Clear
                </button>

              </div>

              {/* Category */}
              <div className="mt-6">

                <label
                  htmlFor="catalog-category"
                  className="text-xs font-black uppercase tracking-wide text-neutral-500"
                >
                  Category
                </label>

                <select
                  id="catalog-category"
                  value={category}
                  onChange={(event) => {
                    setCategory(
                      event.target.value,
                    );
                    resetToFirstPage();
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>

              </div>

              {/* Brand */}
              <div className="mt-5">

                <label
                  htmlFor="catalog-brand"
                  className="text-xs font-black uppercase tracking-wide text-neutral-500"
                >
                  Brand
                </label>

                <select
                  id="catalog-brand"
                  value={brand}
                  onChange={(event) => {
                    setBrand(
                      event.target.value,
                    );
                    resetToFirstPage();
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                >
                  {brands.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>

              </div>

              {/* Rating */}
              <div className="mt-5">

                <label
                  htmlFor="catalog-rating"
                  className="text-xs font-black uppercase tracking-wide text-neutral-500"
                >
                  Rating
                </label>

                <select
                  id="catalog-rating"
                  value={rating}
                  onChange={(event) => {
                    setRating(
                      event.target.value,
                    );
                    resetToFirstPage();
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                >
                  <option value="all">
                    Any rating
                  </option>

                  <option value="4">
                    4★ & above
                  </option>

                  <option value="4.5">
                    4.5★ & above
                  </option>

                  <option value="4.8">
                    4.8★ & above
                  </option>
                </select>

              </div>

              {/* Price */}
              <div className="mt-5">

                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Price
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">

                  <input
                    type="number"
                    min="0"
                    value={
                      minPrice
                    }
                    onChange={(event) => {
                      setMinPrice(
                        event.target
                          .value,
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Min"
                    aria-label="Minimum price"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                  />

                  <input
                    type="number"
                    min="0"
                    value={
                      maxPrice
                    }
                    onChange={(event) => {
                      setMaxPrice(
                        event.target
                          .value,
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Max"
                    aria-label="Maximum price"
                    className="h-10 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                  />

                </div>
              </div>

              {/* Toggles */}
              <div className="mt-6 border-t border-neutral-100 pt-5">

                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-700">
                    Free shipping
                  </span>

                  <input
                    type="checkbox"
                    checked={
                      freeShipping
                    }
                    onChange={(event) => {
                      setFreeShipping(
                        event.target
                          .checked,
                      );
                      resetToFirstPage();
                    }}
                    className="h-5 w-5 accent-brand"
                  />
                </label>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-700">
                    In stock
                  </span>

                  <input
                    type="checkbox"
                    checked={
                      inStock
                    }
                    onChange={(event) => {
                      setInStock(
                        event.target
                          .checked,
                      );
                      resetToFirstPage();
                    }}
                    className="h-5 w-5 accent-brand"
                  />
                </label>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-neutral-700">
                    Deals only
                  </span>

                  <input
                    type="checkbox"
                    checked={
                      dealsOnly
                    }
                    onChange={(event) => {
                      setDealsOnly(
                        event.target
                          .checked,
                      );
                      resetToFirstPage();
                    }}
                    className="h-5 w-5 accent-brand"
                  />
                </label>

              </div>

            </aside>

            {/* Catalog */}
            <section className="min-w-0">

              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-black text-foreground">
                    All products
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Showing{" "}
                    {paginated
                      .items
                      .length}{" "}
                    of{" "}
                    {
                      paginated
                        .pagination
                        .totalItems
                    }{" "}
                    products
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <label
                    htmlFor="catalog-sort"
                    className="text-xs font-bold text-neutral-400"
                  >
                    Sort
                  </label>

                  <div className="relative">

                    <select
                      id="catalog-sort"
                      value={sort}
                      onChange={(event) => {
                        setSort(
                          event.target
                            .value,
                        );
                        resetToFirstPage();
                      }}
                      className="h-10 appearance-none rounded-xl border border-neutral-200 bg-surface py-2 ps-3 pe-9 text-sm font-bold text-neutral-700 outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="featured">
                        Featured
                      </option>

                      <option value="price-low">
                        Price: Low to High
                      </option>

                      <option value="price-high">
                        Price: High to Low
                      </option>

                      <option value="rating">
                        Highest Rated
                      </option>

                      <option value="reviews">
                        Most Reviewed
                      </option>

                      <option value="discount">
                        Biggest Discount
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                  </div>

                </div>

              </div>

              {catalogLoading ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center">
                  <p className="text-sm font-bold text-neutral-600">
                    Loading products…
                  </p>
                </div>
              ) : catalogError ? (
                <div className="rounded-2xl border border-danger-100 bg-danger-surface p-10 text-center">
                  <h2 className="text-xl font-black text-danger-700">
                    Unable to load catalog
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-danger-600">
                    {catalogError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogError("");
                      setCatalogLoading(true);
                      void getProducts({
                        search,
                        categoryId: undefined,
                        subcategoryId: undefined,
                        brand: undefined,
                        supplierId: undefined,
                        minPrice:
                          minPrice.trim()
                            ? Number(minPrice)
                            : undefined,
                        maxPrice:
                          maxPrice.trim()
                            ? Number(maxPrice)
                            : undefined,
                        minRating: undefined,
                        verifiedSupplierOnly: false,
                        discountOnly: false,
                        inStockOnly: inStock,
                        featuredOnly: false,
                        bestsellerOnly: false,
                        newArrivalOnly: false,
                        sort: "relevance",
                        page: 1,
                        pageSize: 100,
                      })
                        .then((response) =>
                          setAllProducts(
                            response.items.map(
                              normalizeB2CProduct,
                            ),
                          ),
                        )
                        .catch((error) =>
                          setCatalogError(
                            error instanceof Error
                              ? error.message
                              : "Unable to load products.",
                          ),
                        )
                        .finally(() =>
                          setCatalogLoading(false),
                        );
                    }}
                    className="mt-5 h-10 rounded-xl bg-brand px-5 text-xs font-black text-white hover:bg-brand-hover"
                  >
                    Retry
                  </button>
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div
                    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    aria-live="polite"
                  >
                    {visibleProducts.map(
                      (product) => (
                        <B2CProductCard
                          key={
                            product.id
                          }
                          product={
                            product
                          }
                        />
                      ),
                    )}
                  </div>

                  <ProductPagination
                    page={
                      paginated
                        .pagination
                        .page
                    }
                    totalPages={
                      paginated
                        .pagination
                        .totalPages
                    }
                    onChange={
                      (nextPage) =>
                        setPage(
                          nextPage,
                        )
                    }
                  />

                  <div className="mt-4 text-center text-[11px] font-semibold text-neutral-400">
                    Page{" "}
                    {
                      paginated
                        .pagination
                        .page
                    }{" "}
                    of{" "}
                    {
                      paginated
                        .pagination
                        .totalPages
                    }
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">

                  <Search className="mx-auto h-7 w-7 text-neutral-300" />

                  <h2 className="mt-4 text-xl font-black text-foreground">
                    No matching products
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                    Try a different search or clear some filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-5 h-10 rounded-xl bg-brand px-5 text-xs font-black text-white hover:bg-brand-hover"
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



