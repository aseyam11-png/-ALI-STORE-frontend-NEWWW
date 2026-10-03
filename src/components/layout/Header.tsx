"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Camera,
  ChevronDown,
  Heart,
  MessageCircle,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import { SmartAutocomplete } from "@/components/search/SmartAutocomplete";

import {
  NotificationBell,
} from "@/components/notifications/NotificationBell";

import {
  useCartStore,
} from "@/stores/cart-store";

import {
  useWishlistStore,
} from "@/stores/wishlist-store";

function HeaderSearch({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const router = useRouter();

  const [
    value,
    setValue,
  ] = useState("");

  // Same route target as before, just client-side navigation instead of a
  // full page reload — matches how the Homepage's own search bar already
  // submits, without changing what URL either one lands on.
  const handleSubmit = () => {
    const query =
      value.trim();

    router.push(
      query
        ? `/shop/products?q=${encodeURIComponent(query)}`
        : "/shop/products",
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
            ? "Search products or categories..."
            : "Search products, brands or categories..."
        }
      />

      <div className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 text-slate-300 sm:flex">
        <Search className="h-4 w-4" />
      </div>

    </div>
  );
}

export function Header() {
  const [
    mobileSearchOpen,
    setMobileSearchOpen,
  ] = useState(false);

  const cartCount =
    useCartStore(
      (state) =>
        state.items.reduce(
          (total, item) =>
            total +
            item.quantity,
          0,
        ),
    );

  const wishlistCount =
    useWishlistStore(
      (state) =>
        state.items.length,
    );

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-surface/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-2xl">

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        <div className="flex min-h-[74px] items-center gap-3 lg:gap-6">

          <Link
            href="/"
            aria-label="AliStore home"
            className="group shrink-0"
          >
            <div className="flex items-center gap-1.5">

              <motion.span
                whileHover={{
                  scale: 1.03,
                }}
                className="text-xl font-black tracking-tight text-brand-ink sm:text-2xl"
              >
                Ali
              </motion.span>

              <span className="text-xl font-black tracking-tight text-brand sm:text-2xl">
                Store
              </span>

            </div>

            <div className="mt-0.5 hidden items-center gap-2 sm:flex">

              <span className="h-1.5 w-1.5 rounded-full bg-success" />

              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">
                Direct From AliStore
              </p>

            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <HeaderSearch />
          </div>

          <div className="ms-auto flex items-center gap-1 sm:gap-1.5">

            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen(
                  (value) => !value,
                )
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-primary-50 hover:text-brand lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/shop/visual-search"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-primary-50 hover:text-brand lg:inline-flex"
              aria-label="Search by image"
              title="Search by image"
            >
              <Camera className="h-5 w-5" />
            </Link>

            <Link
              href="/buyer/support"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-primary-50 hover:text-brand sm:inline-flex"
              aria-label="Messages"
              title="Messages"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>

            <NotificationBell />

            <Link
              href="/buyer/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-primary-50 hover:text-brand sm:inline-flex"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />

              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{
                      scale: 0.5,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-discount-500 px-1 text-[8px] font-black text-white"
                  >
                    {wishlistCount > 99
                      ? "99+"
                      : wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link
              href="/shop/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-primary-50 hover:text-brand"
              aria-label={`Shopping cart with ${cartCount} items`}
              title="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{
                      scale: 0.5,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-black text-white"
                  >
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link
              href="/buyer"
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-slate-700 transition hover:bg-neutral-100 md:flex"
            >

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-brand ring-1 ring-primary-100">
                <User className="h-4 w-4" />
              </span>

              <span className="hidden xl:block">
                <span className="block text-[10px] font-medium text-neutral-400">
                  Welcome back
                </span>

                <span className="flex items-center gap-1 text-sm font-black">
                  Account
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </span>
              </span>

            </Link>

          </div>

        </div>

        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden lg:hidden"
            >
              <div className="pb-3 pt-1">
                <HeaderSearch mobile />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </header>
  );
}
