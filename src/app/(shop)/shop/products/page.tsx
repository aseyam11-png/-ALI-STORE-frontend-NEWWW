"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";
import { ProductPagination } from "@/components/commerce/products/ProductPagination";
import { getBrands, getCategories, getProducts } from "@/features/products/services/product-api.service";

type Option = { id: number; name: string; slug?: string };

const SORT_OPTIONS = [
  { value: "relevance", label: "الأكثر صلة" },
  { value: "price_asc", label: "السعر: من الأقل للأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى للأقل" },
] as const;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const brandParam = searchParams.get("brand") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const sort = SORT_OPTIONS.some((item) => item.value === searchParams.get("sort"))
    ? (searchParams.get("sort") as (typeof SORT_OPTIONS)[number]["value"])
    : "relevance";
  const availabilityParam = searchParams.get("availability") === "IN_STOCK";

  const [query, setQuery] = useState(q);
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categoryId, setCategoryId] = useState<number>();
  const [brandId, setBrandId] = useState<number>();
  const [data, setData] = useState<Awaited<ReturnType<typeof getProducts>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => setQuery(q), [q]);

  useEffect(() => {
    void Promise.all([getCategories(), getBrands()])
      .then(([nextCategories, nextBrands]) => {
        setCategories(
          nextCategories
            .filter((item) => item.active)
            .map((item) => ({ id: item.id, name: item.name, slug: item.slug })),
        );
        setBrands(nextBrands.map((item) => ({ id: item.id, name: item.name })));

        const matchedCategory = nextCategories.find(
          (item) => item.slug === categoryParam || String(item.id) === categoryParam,
        );
        const matchedBrand = nextBrands.find(
          (item) => item.name.toLowerCase() === brandParam.toLowerCase() ||
            String(item.id) === brandParam,
        );

        setCategoryId(matchedCategory?.id);
        setBrandId(matchedBrand?.id);
      })
      .catch(() => undefined);
  }, [categoryParam, brandParam]);

  useEffect(() => {
    setLoading(true);
    setError("");

    void getProducts({
      q: q || undefined,
      category: categoryId,
      brand: brandId,
      availability: availabilityParam ? "IN_STOCK" : undefined,
      sort,
      page: page - 1,
      pageSize: 12,
    })
      .then(setData)
      .catch((requestError) => {
        setData(null);
        setError(requestError instanceof Error ? requestError.message : "تعذر تحميل المنتجات.");
      })
      .finally(() => setLoading(false));
  }, [q, categoryId, brandId, availabilityParam, sort, page]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set("page", "1");
    router.push("/shop/products?" + next.toString());
  };

  const results = useMemo(() => data?.content ?? [], [data]);

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-[11px] font-black text-brand">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              كتالوج ALI STORE
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">المنتجات</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              الكتالوج والأسعار والتوفر تُقرأ من الـbackend المركزي.
            </p>

            <form
              className="mt-7 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                updateParams({ q: query.trim() || undefined });
              }}
            >
              <div className="flex h-12 flex-1 items-center rounded-xl border border-neutral-200 bg-surface px-3 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-primary-100">
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث باسم المنتج أو SKU..."
                  aria-label="بحث المنتجات"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(""); updateParams({ q: undefined }); }} aria-label="مسح البحث"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="h-12 rounded-xl bg-brand px-6 text-sm font-black text-white">بحث</button>
            </form>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black">الفلاتر</h2>
                <button type="button" onClick={() => router.push("/shop/products")} className="text-xs font-black text-brand hover:underline">
                  مسح الكل
                </button>
              </div>

              <label htmlFor="category" className="mt-6 block text-xs font-black text-neutral-500">القسم</label>
              <select id="category" value={categoryId ?? ""} onChange={(event) => {
                const selected = categories.find((item) => String(item.id) === event.target.value);
                updateParams({ category: selected?.slug });
              }} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm">
                <option value="">كل الأقسام</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>

              <label htmlFor="brand" className="mt-5 block text-xs font-black text-neutral-500">العلامة التجارية</label>
              <select id="brand" value={brandId ?? ""} onChange={(event) => {
                const selected = brands.find((item) => String(item.id) === event.target.value);
                updateParams({ brand: selected?.name });
              }} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-surface px-3 text-sm">
                <option value="">كل العلامات</option>
                {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>

              <label className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
                <span>متوفر فقط</span>
                <input type="checkbox" checked={availabilityParam}
                  onChange={(event) => updateParams({ availability: event.target.checked ? "IN_STOCK" : undefined })}
                  className="h-5 w-5 accent-brand"
                />
              </label>
            </aside>

            <section>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  {loading ? "جاري تحميل الكتالوج..." : error || ((data?.totalElements ?? 0) + " منتج")}
                </p>

                <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}
                  className="h-10 rounded-xl border border-neutral-200 bg-surface px-3 text-sm" aria-label="ترتيب المنتجات">
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[0.82] animate-pulse rounded-2xl bg-neutral-100" />)}
                </div>
              ) : error ? (
                <div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-700">{error}</div>
              ) : results.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center">
                  <h2 className="text-xl font-black">لا توجد نتائج</h2>
                  <p className="mt-2 text-sm text-muted-foreground">جرّب إزالة بعض الفلاتر أو البحث بكلمة أخرى.</p>
                  <Link href="/shop/products" className="mt-6 inline-flex h-10 items-center rounded-xl bg-brand px-5 text-sm font-black text-white">عرض الكل</Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {results.map((product) => <B2CProductCard key={product.id} product={product} />)}
                  </div>
                  <ProductPagination
                    page={page}
                    totalPages={data?.totalPages ?? 0}
                    onChange={(nextPage) => updateParams({ page: String(nextPage) })}
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
