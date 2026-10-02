"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTopLevelCategories } from "@/features/catalog/services/category.service";
import { CATEGORY_LABEL_AR } from "@/features/categories/data/category-labels.ar";

export function Sidebar() {
  const pathname = usePathname();
  const categories = getTopLevelCategories();

  return (
    <aside className="hidden w-60 shrink-0 border-e border-slate-200 bg-white xl:block">
      <div className="sticky top-0 p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">ALI STORE</p>
          <h2 className="mt-1 text-lg font-black text-[#0F172A]">تسوّق حسب القسم</h2>
        </div>

        <nav className="space-y-1" aria-label="Product categories">
          {categories.map((category) => {
            const href = "/shop/categories/" + category.slug;
            const active = pathname === href;

            return (
              <Link
                key={category.slug}
                href={href}
                className={
                  "block rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-4 focus-visible:ring-blue-100 " +
                  (active
                    ? "bg-blue-50 font-bold text-[#2563EB]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#2563EB]")
                }
                aria-current={active ? "page" : undefined}
              >
                {CATEGORY_LABEL_AR[category.slug] ?? category.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
