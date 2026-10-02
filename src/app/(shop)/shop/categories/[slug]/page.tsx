import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderTree, ShoppingBag } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { fetchCategories, type BackendCategory } from "@/features/products/services/product-api.service";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let categories: BackendCategory[] = [];
  try {
    categories = await fetchCategories();
  } catch {
    return <AppShell><main className="min-h-[60vh] flex items-center justify-center"><p className="text-sm font-bold text-muted-foreground">تعذر تحميل الأقسام من الخادم.</p></main></AppShell>;
  }

  const category = categories.find((item) => item.active && item.slug === slug);
  if (!category) notFound();

  const children = categories.filter((item) => item.active && item.parentId === category.id);

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 lg:px-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-[11px] font-black text-brand"><FolderTree className="h-3.5 w-3.5" /> القسم</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{category.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description ?? "استعرض منتجات هذا القسم."}</p>
            <Link href={`/shop/products?category=${encodeURIComponent(category.slug)}`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white">
              <ShoppingBag className="h-4 w-4" /> عرض المنتجات <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {children.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <Link key={child.id} href={`/shop/categories/${child.slug}`} className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand"><FolderTree className="h-5 w-5" /></div>
                  <h2 className="mt-5 text-base font-black">{child.name}</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{child.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-neutral-300" />
              <h2 className="mt-4 text-xl font-black">منتجات القسم</h2>
              <p className="mt-2 text-sm text-muted-foreground">الكتالوج المنشور هو مصدر الحقيقة للمنتجات.</p>
              <Link href={`/shop/products?category=${encodeURIComponent(category.slug)}`} className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-black text-white">عرض المنتجات</Link>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
