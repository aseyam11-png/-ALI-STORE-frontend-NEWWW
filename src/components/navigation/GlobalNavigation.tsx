"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Menu,
  PackageSearch,
  Sparkles,
  Store,
  X,
} from "lucide-react";

import { getTopLevelCategories } from "@/features/catalog/services/category-api.service";

const navigation = [
  { label: "الرئيسية", href: "/" },
  { label: "المنتجات", href: "/shop/products" },
  { label: "العروض", href: "/shop/deals", badge: "جديد" },
  { label: "البحث بالصور", href: "/shop/visual-search", icon: Camera },
] as const;

export function GlobalNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getTopLevelCategories,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const categories = (categoriesQuery.data ?? []).map((category) => ({
    label: category.name,
    href: "/shop/categories/" + category.slug,
    id: category.id,
  }));

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="relative z-[var(--z-nav)] border-b border-neutral-200 bg-surface"
    >
      <div className="container-shell flex min-h-12 items-center">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="me-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-all duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:ring-4 focus-visible:ring-primary-100 md:hidden"
          aria-label="فتح قائمة المتجر"
          aria-expanded={mobileOpen}
          aria-controls="store-mobile-nav"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href={(categories[0]?.href ?? "/shop/products") as Route}
          className="group flex min-h-12 shrink-0 items-center gap-2 border-e border-neutral-200 pe-4 text-body-sm font-medium text-brand-ink transition-colors hover:text-brand sm:pe-6"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-brand transition-transform duration-200 ease-brand group-hover:scale-105">
            <Store className="h-4 w-4" />
          </span>
          <span>التصنيفات</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 group-hover:text-brand" />
        </Link>

        <div className="hidden h-12 items-center md:flex">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = "icon" in item ? item.icon : undefined;

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex min-h-12 items-center gap-2 px-4 text-body-sm font-medium transition-colors duration-200 ease-brand " +
                  (active ? "text-brand" : "text-neutral-600 hover:text-brand")
                }
              >
                {Icon ? (
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : null}
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-label font-medium text-primary-800">
                    {item.badge}
                  </span>
                ) : null}
                {active && (
                  <motion.span
                    layoutId="global-nav-active"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="ms-auto hidden items-center gap-2 lg:flex">
          <Link
            href="/shop/visual-search"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-3 text-caption font-medium text-neutral-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            ابحث بصورة
          </Link>
          <Link
            href="/shop/products"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-ink px-3 text-caption font-medium text-white transition hover:-translate-y-0.5 hover:bg-brand-ink-hover"
          >
            <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
            تصفح المنتجات
          </Link>
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-neutral-50/70">
        <div className="container-shell flex min-h-9 items-center gap-4 overflow-x-auto scroll-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex shrink-0 items-center gap-1.5 text-label font-medium text-neutral-400">
            <Sparkles className="h-3 w-3 text-brand" aria-hidden="true" />
            تصفح سريع
          </div>

          {categories.length > 0 ? (
            categories.map((category) => {
              const active =
                pathname === category.href ||
                pathname.startsWith(category.href + "/");
              return (
                <Link
                  key={category.id}
                  href={category.href as Route}
                  aria-current={active ? "page" : undefined}
                  className={
                    "shrink-0 rounded-full px-2.5 py-1 text-caption transition-colors duration-200 ease-brand " +
                    (active
                      ? "bg-surface font-medium text-brand shadow-sm"
                      : "font-medium text-neutral-500 hover:text-brand")
                  }
                >
                  {category.label}
                </Link>
              );
            })
          ) : (
            <span
              aria-busy={categoriesQuery.isPending}
              className="text-caption text-neutral-400"
            >
              {categoriesQuery.isPending
                ? "جاري تحميل التصنيفات…"
                : "التصنيفات غير متاحة حاليًا"}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="إغلاق قائمة المتجر"
              onClick={closeMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[var(--z-overlay)] bg-ink-950/45 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              id="store-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="قائمة المتجر"
              initial={{ x: "100%", opacity: 0.98 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 end-0 z-[var(--z-modal)] flex w-[min(90vw,390px)] flex-col overflow-y-auto bg-surface shadow-modal md:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <div>
                  <p className="text-h4 font-bold text-brand-ink">
                    Ali<span className="text-brand">Store</span>
                  </p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    كل ما تحتاجه في مكان واحد
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-foreground"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-4">
                <p className="mb-2 px-2 text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                  الرئيسية
                </p>
                <div className="grid gap-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    const Icon = "icon" in item ? item.icon : null;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        aria-current={active ? "page" : undefined}
                        className={
                          "flex min-h-11 items-center justify-between rounded-xl px-3 text-body-sm font-medium transition " +
                          (active
                            ? "bg-primary-50 text-brand"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-brand")
                        }
                      >
                        <span className="flex items-center gap-2">
                          {Icon ? (
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          ) : null}
                          {item.label}
                        </span>
                        {"badge" in item && item.badge ? (
                          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-label font-medium text-primary-800">
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-300" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <p className="mb-2 px-2 text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                    التصنيفات
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const active =
                        pathname === category.href ||
                        pathname.startsWith(category.href + "/");
                      return (
                        <Link
                          key={category.id}
                          href={category.href as Route}
                          onClick={closeMobile}
                          className={
                            "rounded-xl border px-3 py-3 text-caption font-medium transition " +
                            (active
                              ? "border-primary-100 bg-primary-50 text-brand"
                              : "border-neutral-200 bg-surface text-neutral-600 hover:border-primary-200 hover:bg-primary-50 hover:text-brand")
                          }
                        >
                          {category.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid gap-2 border-t border-neutral-100 pt-5">
                  <Link
                    href="/shop/visual-search"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-3 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    البحث بالصور
                  </Link>
                  <Link
                    href="/shop/products"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center gap-3 rounded-xl bg-brand-ink px-3 text-body-sm font-medium text-white transition hover:bg-brand-ink-hover"
                  >
                    <PackageSearch className="h-4 w-4" aria-hidden="true" />
                    تصفح كل المنتجات
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
