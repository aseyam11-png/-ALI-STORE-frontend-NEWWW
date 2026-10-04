"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Heart,
  MessageCircle,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import { SmartAutocomplete } from "@/components/search/SmartAutocomplete";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const query = value.trim();
    router.push(
      query
        ? ("/shop/products?q=" + encodeURIComponent(query)) as Route
        : ("/shop/products" as Route),
    );
  };

  return (
    <div className="relative">
      <SmartAutocomplete
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        className="w-full"
        placeholder={
          mobile
            ? "ابحث باسم المنتج أو القسم…"
            : "ابحث عن منتج، علامة أو تصنيف…"
        }
      />
    </div>
  );
}

function ActionButton({
  href,
  label,
  active = false,
  children,
}: {
  href: Route;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={
        "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ease-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 " +
        (active
          ? "border-primary-100 bg-primary-50 text-brand"
          : "border-transparent text-neutral-500 hover:border-neutral-200 hover:bg-surface hover:text-brand")
      }
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-neutral-200/80 bg-surface/95 shadow-raised backdrop-blur-xl">
      <div className="container-shell">
        <div className="flex min-h-[74px] items-center gap-2.5 lg:gap-5">
          <Link
            href="/"
            aria-label="الصفحة الرئيسية لـ AliStore"
            className="group shrink-0"
          >
            <div className="flex items-center gap-1">
              <motion.span
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold tracking-tight text-brand-ink sm:text-2xl"
              >
                Ali
              </motion.span>
              <span className="text-xl font-bold tracking-tight text-brand sm:text-2xl">
                Store
              </span>
            </div>
            <div className="mt-0.5 hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <p className="text-label font-medium uppercase tracking-[0.12em] text-neutral-400">
                تسوّق بسهولة • معلومات مباشرة
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="rounded-2xl">
              <HeaderSearch />
            </div>
          </div>

          <div className="ms-auto flex items-center gap-0.5 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-1">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-all duration-200 ease-brand hover:bg-surface hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 lg:hidden"
              aria-label="فتح البحث"
              aria-expanded={mobileSearchOpen}
              aria-controls="header-mobile-search"
            >
              <Search className="h-5 w-5" />
            </button>

            <span className="hidden h-6 w-px bg-neutral-200 lg:block" />

            <span className="hidden sm:inline-flex">
              <ActionButton
                href="/shop/visual-search"
                label="البحث بالصور"
                active={pathname.startsWith("/shop/visual-search")}
              >
                <Camera className="h-4 w-4" />
              </ActionButton>
            </span>

            <span className="hidden sm:inline-flex">
              <ActionButton
                href="/buyer/support"
                label="الدعم والرسائل"
                active={pathname.startsWith("/buyer/support")}
              >
                <MessageCircle className="h-4 w-4" />
              </ActionButton>
            </span>

            <span className="inline-flex">
              <NotificationBell />
            </span>

            <span className="inline-flex">
              <ActionButton
                href="/buyer/wishlist"
                label="المفضلة"
                active={pathname.startsWith("/buyer/wishlist")}
              >
                <Heart className="h-4 w-4" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-discount px-1 text-label font-bold text-white"
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </ActionButton>
            </span>

            <ActionButton
              href="/shop/cart"
              label={"السلة تحتوي على " + cartCount + " منتج"}
              active={pathname.startsWith("/shop/cart") || pathname.startsWith("/shop/checkout")}
            >
              <ShoppingCart className="h-4 w-4" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-label font-bold text-white"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionButton>

            <Link
              href="/buyer"
              aria-current={pathname.startsWith("/buyer") ? "page" : undefined}
              className={
                "hidden items-center gap-2 rounded-xl px-2 py-1.5 text-neutral-700 transition-all duration-200 ease-brand md:flex " +
                (pathname.startsWith("/buyer")
                  ? "bg-primary-50 text-brand"
                  : "hover:bg-surface hover:text-brand")
              }
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-brand ring-1 ring-primary-100">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden xl:block">
                <span className="block text-label font-medium text-neutral-400">
                  حسابي
                </span>
                <span className="block text-body-sm font-medium">
                  الملف الشخصي
                </span>
              </span>
            </Link>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.div
              id="header-mobile-search"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="border-t border-neutral-100 py-3">
                <HeaderSearch mobile />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
