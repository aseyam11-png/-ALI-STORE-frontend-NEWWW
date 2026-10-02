"use client";

import type { Route } from "next";

import Link from "next/link";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  Menu,
  PackageSearch,
  Sparkles,
  Store,
  X,
} from "lucide-react";

import { getTopLevelCategories } from "@/features/catalog/services/category.service";

const navigation: Array<{
  label: string;
  href: string;
  hot?: boolean;
}> = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Products",
    href: "/shop/products",
  },
  {
    label: "Deals",
    href: "/shop/deals",
    hot: true,
  },
] as const;

// Previously a fourth, independent, hardcoded category list — "Apparel",
// "Machinery", "Automotive" pointed at /shop/categories/* slugs that don't
// exist in any real category source, so 3 of these 6 links led to an
// empty/not-found category page for every visitor on every AppShell-based
// route. Now reads the canonical category service boundary (same one
// /shop/categories/[slug] uses), so the links are real. Labels stay in
// English (the source's `name` field) rather than mixing in Arabic
// category labels next to this nav's otherwise-English "Home/Products/
// Deals" — a full translation of AppShell's chrome is a separate, larger,
// deferred effort (see architecture report), not something to do halfway
// here.
const categories = getTopLevelCategories().map((category) => ({
  label: category.name,
  href: `/shop/categories/${category.slug}`,
}));

export function GlobalNavigation() {
  const pathname =
    usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setMobileOpen(false);
      }
    };

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileOpen]);

  const isActive = (
    href: string,
  ) => {
    if (href === "/") {
      return pathname ===
        "/";
    }

    return pathname ===
      href ||
      pathname.startsWith(
        `${href}/`,
      );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-40 border-b border-slate-200 bg-white"
    >

      <div className="mx-auto flex h-[50px] max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              true,
            )
          }
          className="me-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link
          href={(categories[0]?.href ?? "/shop/products") as Route}
          className="group flex h-full shrink-0 items-center gap-2 border-e border-slate-200 pe-5 text-xs font-black text-[#0F2747] transition hover:text-[#2563EB]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition group-hover:scale-105">
            <Store className="h-3.5 w-3.5" />
          </span>

          <span>
            Categories
          </span>

          <ChevronRight className="h-3.5 w-3.5 rotate-90 text-slate-400 transition group-hover:text-[#2563EB]" />
        </Link>

        <div className="hidden h-full items-center md:flex">

          {navigation.map(
            (item) => {
              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href as Route
                  }
                  className={`relative flex h-full items-center gap-2 px-4 text-xs font-bold transition ${
                    active
                      ? "text-[#2563EB]"
                      : "text-slate-600 hover:text-[#2563EB]"
                  }`}
                >

                  {item.label}

                  {item.hot && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black text-amber-700">
                      HOT
                    </span>
                  )}

                  {active && (
                    <motion.span
                      layoutId="global-nav-active"
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#2563EB]"
                    />
                  )}

                </Link>
              );
            },
          )}

        </div>

        <div className="ms-auto hidden items-center gap-5 lg:flex">

          <Link
            href="/shop/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F2747] px-3 py-1.5 text-[10px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#132F56]"
          >
            <PackageSearch className="h-3.5 w-3.5" />
            Browse products
          </Link>

        </div>

      </div>

      <div className="hidden border-t border-slate-100 bg-slate-50/70 lg:block">

        <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">

          <div className="flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Trending
          </div>

          {categories.map(
            (category) => (
              <Link
                key={
                  category.href
                }
                href={
                  category.href as Route
                }
                className="shrink-0 text-[11px] font-semibold text-slate-500 transition hover:text-[#2563EB]"
              >
                {
                  category.label
                }
              </Link>
            ),
          )}

        </div>

      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setMobileOpen(
                  false,
                )
              }
              className="fixed inset-0 top-0 z-50 bg-slate-950/35 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                duration: 0.3,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="fixed inset-y-0 start-0 z-[60] flex w-[min(88vw,380px)] flex-col overflow-y-auto bg-white shadow-2xl md:hidden"
            >

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div>
                  <p className="text-lg font-black text-[#0F2747]">
                    Ali<span className="text-[#2563EB]">Store</span>
                  </p>

                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Browse AliStore
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(
                      false,
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <div className="flex-1 p-4">

                <div className="rounded-2xl bg-slate-50 p-3">

                  <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Main navigation
                  </p>

                  <div className="grid gap-1">

                    {navigation.map(
                      (item) => (
                        <Link
                          key={
                            item.href
                          }
                          href={
                            item.href as Route
                          }
                          onClick={() =>
                            setMobileOpen(
                              false,
                            )
                          }
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-[#2563EB]"
                        >
                          <span>
                            {item.label}
                          </span>

                          {item.hot && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-black text-amber-700">
                              HOT
                            </span>
                          )}
                        </Link>
                      ),
                    )}

                  </div>

                </div>

                <div className="mt-5">

                  <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Popular categories
                  </p>

                  <div className="grid grid-cols-2 gap-2">

                    {categories.map(
                      (category) => (
                        <Link
                          key={
                            category.href
                          }
                          href={
                            category.href as Route
                          }
                          onClick={() =>
                            setMobileOpen(
                              false,
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
                        >
                          {
                            category.label
                          }
                        </Link>
                      ),
                    )}

                  </div>

                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">

                  <Link
                    href="/shop/products"
                    onClick={() =>
                      setMobileOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl bg-[#0F2747] px-3 py-3 text-sm font-bold text-white"
                  >
                    <PackageSearch className="h-4 w-4" />
                    Browse products
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

