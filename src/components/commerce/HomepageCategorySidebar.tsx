import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  Footprints,
  Gem,
  Shirt,
  Watch,
  type LucideIcon,
} from "lucide-react";

export interface HomepageCategoryOption {
  key: "clothing" | "shoes" | "watches" | "accessories";
  title: string;
  description: string;
  href?: Route;
  available: boolean;
  Icon: LucideIcon;
}

const DEFAULT_OPTIONS: HomepageCategoryOption[] = [
  {
    key: "clothing",
    title: "الملابس",
    description: "رجال، نساء، وأطفال",
    available: false,
    Icon: Shirt,
  },
  {
    key: "shoes",
    title: "الأحذية",
    description: "يومي، رياضي، ورسمي",
    available: false,
    Icon: Footprints,
  },
  {
    key: "watches",
    title: "الساعات",
    description: "تصاميم مختارة",
    available: false,
    Icon: Watch,
  },
  {
    key: "accessories",
    title: "الإكسسوارات",
    description: "حقائب، مجوهرات ونظارات",
    available: false,
    Icon: Gem,
  },
];

interface HomepageCategorySidebarProps {
  options?: HomepageCategoryOption[];
  className?: string;
}

export function HomepageCategorySidebar({
  options = DEFAULT_OPTIONS,
  className = "",
}: HomepageCategorySidebarProps) {
  return (
    <aside
      aria-labelledby="homepage-category-sidebar-title"
      className={
        "rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-3 shadow-raised backdrop-blur-md " +
        className
      }
    >
      <div className="px-2 pb-3">
        <p className="text-label font-medium uppercase tracking-[0.14em] text-primary-200/80">
          Quick Shop
        </p>
        <h2
          id="homepage-category-sidebar-title"
          className="mt-1.5 text-h4 font-bold text-white"
        >
          تسوّق حسب القسم
        </h2>
        <p className="mt-1.5 text-caption leading-5 text-white/55">
          ابدأ من القسم الأقرب لما تبحث عنه.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {options.map((option) => {
          const Icon = option.Icon;

          const content = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-primary-200 ring-1 ring-white/10">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-medium text-white">
                  {option.title}
                </span>
                <span className="mt-0.5 block truncate text-label text-white/50">
                  {option.available ? option.description : "غير متاح حاليًا"}
                </span>
              </span>

              <ArrowLeft
                className="h-4 w-4 shrink-0 text-white/35 transition-transform duration-200 ease-brand group-hover:-translate-x-0.5 group-hover:text-primary-200 rtl:rotate-180"
                aria-hidden="true"
              />
            </>
          );

          if (!option.available || !option.href) {
            return (
              <div
                key={option.key}
                aria-disabled="true"
                className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2.5 opacity-65"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={option.key}
              href={option.href}
              className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2.5 transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/30"
            >
              {content}
            </Link>
          );
        })}
      </div>

      <Link
        href="/shop/products"
        className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-3 text-caption font-medium text-white/75 transition-all duration-200 ease-brand hover:bg-white/[0.13] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100/30"
      >
        مشاهدة جميع المنتجات
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
      </Link>
    </aside>
  );
}
