"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
  { name: "الأزياء", slug: "fashion" },
  { name: "الإكسسوارات", slug: "accessories" },
  { name: "الجمال والعناية", slug: "beauty-care" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-e border-neutral-200 bg-surface xl:block">
      <div className="sticky top-0 p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            ALI STORE
          </p>
          <h2 className="mt-1 text-lg font-black text-foreground">
            الأقسام
          </h2>
        </div>

        <nav className="space-y-1" aria-label="أقسام المنتجات">
          {categories.map((category) => {
            const href = "/shop/categories/" + category.slug;
            const active = pathname === href;

            return (
              <Link
                key={category.slug}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "block rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primary-100 " +
                  (active
                    ? "bg-primary-50 font-bold text-brand"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-brand")
                }
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
