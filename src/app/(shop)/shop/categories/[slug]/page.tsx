import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FolderTree,
  ShoppingBag,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { CategoryTree } from "@/components/commerce/category/CategoryTree";
import {
  getCategories,
  getCategoryPathFromTree,
} from "@/features/catalog/services/category-api.service";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories
    .flatMap(function flatten(node): typeof categories {
      return [node, ...node.children.flatMap(flatten)];
    })
    .find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const path = getCategoryPathFromTree(
    categories,
    slug,
  );

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <nav
              aria-label="Category breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
            >
              <Link
                href="/"
                className="font-bold hover:text-[#2563EB]"
              >
                Home
              </Link>

              {path.map((item, index) => (
                <span
                  key={item.id}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="h-3 w-3" />
                  {index === path.length - 1 ? (
                    <span className="font-bold text-slate-700">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={"/shop/categories/" + encodeURIComponent(item.slug)}
                      className="font-bold hover:text-[#2563EB]"
                    >
                      {item.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                  <FolderTree className="h-3.5 w-3.5" />
                  Category
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {category.description}
                  </p>
                )}
              </div>

              <Link
                href={"/shop/products?category=" + encodeURIComponent(category.slug)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop this category
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Browse
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Categories
                </h2>
              </div>

              <CategoryTree categories={categories} />
            </aside>

            <section>
              {category.children.length > 0 ? (
                <>
                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Explore
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Shop by subcategory
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={"/shop/categories/" + encodeURIComponent(child.slug)}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#2563EB]">
                            <FolderTree className="h-5 w-5" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]" />
                        </div>

                        <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-[#2563EB]">
                          {child.name}
                        </h3>

                        {child.description && (
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            {child.description}
                          </p>
                        )}

                        <div className="mt-5 text-xs font-black text-[#2563EB]">
                          Explore category
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <h2 className="mt-5 text-xl font-black text-slate-900">
                    Products in {category.name}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Browse the live catalog for this category.
                  </p>

                  <Link
                    href={"/shop/products?category=" + encodeURIComponent(category.slug)}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
                  >
                    View products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
