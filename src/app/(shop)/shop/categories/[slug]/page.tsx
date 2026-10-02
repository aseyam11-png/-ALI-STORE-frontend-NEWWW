import Link from "next/link";
import { ArrowRight, FolderTree, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getCatalogCategories, getCategoryBySlug } from "@/features/catalog/services/catalog-api.service";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCatalogCategories(),
  ]);

  if (!category) notFound();

  const children = categories.filter((item) => item.parentId === category.id);
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId)
    : undefined;

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <nav aria-label="Category breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="font-bold hover:text-brand">الرئيسية</Link>
              {parent && (
                <>
                  <span>/</span>
                  <Link href={"/shop/categories/" + parent.slug} className="font-bold hover:text-brand">
                    {parent.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="font-bold text-foreground">{category.name}</span>
            </nav>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-label font-medium text-brand">
                  <FolderTree className="h-3.5 w-3.5" />
                  القسم
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {category.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {category.description ?? "تصفح المنتجات المنشورة ضمن هذا القسم."}
                </p>
              </div>

              <Link
                href={"/shop/products?category=" + encodeURIComponent(category.slug)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
              >
                <ShoppingBag className="h-4 w-4" />
                عرض المنتجات
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {children.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-foreground">الأقسام الفرعية</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={"/shop/categories/" + child.slug}
                    className="group rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-brand">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:text-brand rtl:rotate-180" />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-foreground group-hover:text-brand">
                      {child.name}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {child.description ?? ""}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
              <ShoppingBag className="mx-auto h-9 w-9 text-neutral-300" />
              <h2 className="mt-4 text-xl font-bold text-foreground">جاهز للمنتجات المنشورة</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                ستظهر المنتجات المتاحة ضمن هذا القسم مباشرة من الكتالوج.
              </p>
              <Link
                href={"/shop/products?category=" + encodeURIComponent(String(category.id))}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white"
              >
                استعراض المنتجات
              </Link>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
