"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        ? "/shop/products?q=" + encodeURIComponent(query)
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
    </div>
  );
}

function ActionButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-neutral-500 transition-all duration-200 ease-brand hover:border-primary-100 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
    >
      {children}
    </Link>
  );
}

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-neutral-200/80 bg-surface/95 shadow-raised backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center gap-3 lg:gap-6">
          <Link href="/" aria-label="AliStore home" className="group shrink-0">
            <div className="flex items-center gap-1.5">
              <motion.span
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-black tracking-tight text-brand-ink sm:text-2xl"
              >
                Ali
              </motion.span>
              <span className="text-xl font-black tracking-tight text-brand sm:text-2xl">
                Store
              </span>
            </div>
            <div className="mt-1 hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">
                Direct From AliStore
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <HeaderSearch />
          </div>

          <div className="ms-auto flex items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-1">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-all duration-200 ease-brand hover:bg-surface hover:text-brand lg:hidden"
              aria-label="Open search"
              aria-expanded={mobileSearchOpen}
              aria-controls="header-mobile-search"
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden h-6 w-px bg-neutral-200 lg:block" />

            <span className="hidden lg:inline-flex">
              <ActionButton href="/shop/visual-search" label="Search by image">
                <Camera className="h-4 w-4" />
              </ActionButton>
            </span>

            <span className="hidden sm:inline-flex">
              <ActionButton href="/buyer/support" label="Messages">
                <MessageCircle className="h-4 w-4" />
              </ActionButton>
            </span>

            <span className="inline-flex">
              <NotificationBell />
            </span>

            <span className="hidden sm:inline-flex">
              <ActionButton href="/buyer/wishlist" label="Wishlist">
                <Heart className="h-4 w-4" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-discount px-1 text-[8px] font-black text-white"
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </ActionButton>
            </span>

            <ActionButton
              href="/shop/cart"
              label={"Shopping cart with " + cartCount + " items"}
            >
              <ShoppingCart className="h-4 w-4" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-black text-white"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionButton>

            <Link
              href="/buyer"
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-neutral-700 transition-all duration-200 ease-brand hover:bg-surface hover:text-brand md:flex"
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
              id="header-mobile-search"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="border-t border-neutral-100 pb-4 pt-3">
                <HeaderSearch mobile />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
