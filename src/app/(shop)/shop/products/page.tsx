"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";
import { getProducts } from "@/features/products/services/product.service";
import { fetchCategories, type BackendCategory } from "@/features/products/services/product-api.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";
import { HttpApiError } from "@/lib/api/http-client";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [inStock, setInStock] = useState(searchParams.get("availability") === "IN_STOCK");
  const [sort, setSort] = useState<"relevance" | "price_asc" | "price_desc">(
    searchParams.get("sort") === "price_asc" ? "price_asc" : searchParams.get("sort") === "price_desc" ? "price_desc" : "relevance",
  );
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page") ?? "1")));
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [products, setProducts] = useState<ReturnType<typeof normalizeB2CProduct>[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const c = searchParams.get("category") ?? "";
    const b = searchParams.get("brand") ?? "";
    const min = searchParams.get("minPrice") ?? "";
    const max = searchParams.get("maxPrice") ?? "";
    const stock = searchParams.get("availability") === "IN_STOCK";
    const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const currentSort = searchParams.get("sort") === "price_asc" ? "price_asc" : searchParams.get("sort") === "price_desc" ? "price_desc" : "relevance";
    setSearch(q); setCategory(c); setBrand(b); setMinPrice(min); setMaxPrice(max); setInStock(stock); setSort(currentSort); setPage(currentPage);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getProducts({
      search,
      categoryId: category || undefined,
      subcategoryId: undefined,
      brand: brand || undefined,
      supplierId: undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: undefined,
      verifiedSupplierOnly: false,
      discountOnly: false,
      inStockOnly: inStock,
      featuredOnly: false,
      bestsellerOnly: false,
      newArrivalOnly: false,
      sort: sort === "price_asc" ? "price_asc" : sort === "price_desc" ? "price_desc" : "relevance",
      page,
      pageSize: PAGE_SIZE,
    }).then((result) => {
      if (!active) return;
      setProducts(result.items.map(normalizeB2CProduct));
      setTotalItems(result.pagination.totalItems);
      setTotalPages(result.pagination.totalPages);
    }).catch((loadError) => {
      if (!active) return;
      setError(loadError instanceof HttpApiError ? loadError.message : "تعذر تحميل المنتجات.");
      setProducts([]); setTotalItems(0); setTotalPages(0);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [search, category, brand, minPrice, maxPrice, inStock, sort, page]);

  const brandOptions = useMemo(() => Array.from(new Set(products.map((item) => item.brand).filter(Boolean))), [products]);

  const updateUrl = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) value ? params.set(key, value) : params.delete(key);
    params.set("page", "1");
    router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setCategory(""); setBrand(""); setMinPrice(""); setMaxPrice(""); setInStock(false); setSort("relevance");
    router.replace(pathname, { scroll: false });
    setPage(1);
  };

  const selectedCategoryName = categories.find((item) => item.slug === category || String(item.id) === category)?.name;

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-label font-medium text-brand"><SlidersHorizontal className="h-3.5 w-3.5" /> ALI STORE</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">المنتجات</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">الكتالوج المنشور من الخادم، مع تحقق من السعر والمخزون قبل الإضافة للسلة.</p>
            <div className="mt-7 flex h-13 items-center rounded-2xl border border-neutral-200 bg-surface p-1.5 shadow-sm">
              <Search className="ms-3 h-5 w-5 text-neutral-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onKeyDown={(e) => e.key === "Enter" && updateUrl({ q: search.trim() || undefined })} type="search" placeholder="ابحث بالاسم أو SKU..." className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
              {search && <button type="button" onClick={() => { setSearch(""); updateUrl({ q: undefined }); }} aria-label="مسح البحث"><X className="h-4 w-4 text-neutral-400" /></button>}
              <button type="button" onClick={() => updateUrl({ q: search.trim() || undefined })} className="hidden h-10 rounded-xl bg-brand px-6 text-sm font-black text-white sm:block">بحث</button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold text-neutral-400">صفحة {page} من {Math.max(1, totalPages)}</span>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-xs font-black" onClick={() => document.getElementById("product-filters")?.classList.toggle("hidden")}><Filter className="h-4 w-4" /> الفلاتر</button>
          </div>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside id="product-filters" className="h-fit rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="text-sm font-black">الفلاتر</h2><button type="button" onClick={clearFilters} className="text-xs font-black text-brand">مسح الكل</button></div>

              <label className="mt-6 block text-xs font-black text-neutral-500" htmlFor="category">القسم</label>
              <select id="category" value={category} onChange={(e) => { setCategory(e.target.value); updateUrl({ category: e.target.value || undefined }); }} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm">
                <option value="">كل الأقسام</option>
                {categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>

              <label className="mt-5 block text-xs font-black text-neutral-500" htmlFor="brand">العلامة التجارية</label>
              <select id="brand" value={brand} onChange={(e) => { setBrand(e.target.value); updateUrl({ brand: e.target.value || undefined }); }} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm">
                <option value="">كل العلامات</option>
                {brandOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>

              <label className="mt-5 block text-xs font-black text-neutral-500" htmlFor="min">أقل سعر</label>
              <input id="min" type="number" min="0" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); updateUrl({ minPrice: e.target.value || undefined }); }} className="mt-2 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm" />

              <label className="mt-4 block text-xs font-black text-neutral-500" htmlFor="max">أعلى سعر</label>
              <input id="max" type="number" min="0" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); updateUrl({ maxPrice: e.target.value || undefined }); }} className="mt-2 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm" />

              <label className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-700">
                <span>متوفر فقط</span>
                <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); updateUrl({ availability: e.target.checked ? "IN_STOCK" : undefined }); }} className="h-5 w-5 accent-brand" />
              </label>

              <label className="mt-5 block text-xs font-black text-neutral-500" htmlFor="sort">الترتيب</label>
              <select id="sort" value={sort} onChange={(e) => { const value = e.target.value as typeof sort; setSort(value); updateUrl({ sort: value === "relevance" ? undefined : value }); }} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm">
                <option value="relevance">الأكثر صلة</option>
                <option value="price_asc">السعر: الأقل أولًا</option>
                <option value="price_desc">السعر: الأعلى أولًا</option>
              </select>
            </aside>

            <section className="min-w-0">
              {selectedCategoryName && <div className="mb-4 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-bold text-brand">القسم: {selectedCategoryName}</div>}
              {error && <div role="alert" className="mb-5 rounded-2xl border border-danger-100 bg-danger-surface p-5 text-sm font-bold text-danger-600">{error}</div>}

              {loading ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: PAGE_SIZE }).map((_, index) => <div key={index} className="aspect-[3/5] animate-pulse rounded-2xl bg-neutral-100" />)}</div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center">
                  <h2 className="text-xl font-black">لا توجد منتجات مطابقة</h2>
                  <p className="mt-2 text-sm text-neutral-500">غيّر الفلاتر أو وسّع البحث.</p>
                  <button type="button" onClick={clearFilters} className="mt-6 h-11 rounded-xl bg-brand px-6 text-sm font-black text-white">مسح الفلاتر</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">{products.map((product) => <B2CProductCard key={product.id} product={product} />)}</div>
              )}

              <ProductPagination page={page} totalPages={totalPages} onChange={(next) => { setPage(next); updateUrl({ page: String(next) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
