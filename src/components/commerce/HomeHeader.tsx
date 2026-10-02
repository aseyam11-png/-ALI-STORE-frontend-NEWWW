"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Menu,
  Search as SearchIcon,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { HomeSearchBar } from "./HomeSearchBar";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const MENU_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "كل المنتجات", href: "/shop/products" },
  { label: "العروض", href: "/shop/deals" },
] as const;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-discount px-1 text-[10px] font-medium text-white">
      <span dir="ltr">{count > 99 ? "99+" : count}</span>
    </span>
  );
}

export function HomeHeader() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const wishlistCount = useWishlistStore((state) => state.items.length);

  // Mobile menu drawer accessibility: same contract as ui/dialog.tsx
  // (initial focus, Escape-to-close, Tab-trapped focus, scroll lock, focus
  // restored to the trigger) — kept local rather than reusing <Dialog> since
  // this is an off-canvas slide-in panel, not a centered modal, and the two
  // shouldn't be forced into one visual shape.
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuPanelRef.current) {
        return;
      }

      const focusable = menuPanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const trigger = menuTriggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-neutral-200 bg-surface">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-10">
        <button
          ref={menuTriggerRef}
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="فتح القائمة"
          aria-expanded={mobileMenuOpen}
          aria-controls="home-mobile-menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-neutral-600 hover:bg-neutral-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          aria-label="ALI STORE — الصفحة الرئيسية"
          className="shrink-0 text-h3 font-bold tracking-tight text-foreground"
        >
          ALI <span className="text-brand">STORE</span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block lg:max-w-2xl">
          <HomeSearchBar />
        </div>

        <button
          type="button"
          onClick={() => setMobileSearchOpen((current) => !current)}
          aria-label="بحث"
          aria-expanded={mobileSearchOpen}
          aria-controls="home-mobile-search"
          className="ms-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-neutral-600 hover:bg-neutral-100 md:hidden"
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        <nav
          aria-label="حسابي"
          className="hidden shrink-0 items-center gap-1 md:flex"
        >
          <Link
            href="/buyer/wishlist"
            aria-label="المفضلة"
            title="المفضلة"
            className="relative flex h-11 w-11 items-center justify-center rounded-sm text-neutral-600 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-brand"
          >
            <Heart className="h-5 w-5" />
            <CountBadge count={wishlistCount} />
          </Link>

          <Link
            href="/buyer"
            aria-label="حسابي"
            title="حسابي"
            className="flex h-11 w-11 items-center justify-center rounded-sm text-neutral-600 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-brand"
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            href="/shop/cart"
            aria-label={`السلة، ${cartCount} منتج`}
            title="السلة"
            className="relative flex h-11 w-11 items-center justify-center rounded-sm text-neutral-600 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-brand"
          >
            <ShoppingCart className="h-5 w-5" />
            <CountBadge count={cartCount} />
          </Link>
        </nav>

        <Link
          href="/shop/cart"
          aria-label={`السلة، ${cartCount} منتج`}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-neutral-600 hover:bg-neutral-100 md:hidden"
        >
          <ShoppingCart className="h-5 w-5" />
          <CountBadge count={cartCount} />
        </Link>
      </div>

      {mobileSearchOpen && (
        <div
          id="home-mobile-search"
          className="border-t border-neutral-100 px-4 py-3 md:hidden"
        >
          <HomeSearchBar />
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[var(--z-overlay)] md:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-ink-950/50"
          />

          <div
            id="home-mobile-menu"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="القائمة الرئيسية"
            className="absolute inset-y-0 start-0 flex w-[min(84vw,360px)] flex-col bg-surface shadow-modal"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <span className="text-h4 font-bold tracking-tight text-foreground">
                ALI <span className="text-brand">STORE</span>
              </span>

              <button
                ref={menuCloseRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="إغلاق القائمة"
                className="flex h-11 w-11 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="التنقل" className="flex flex-col gap-1 p-4">
              {MENU_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-sm px-3 py-3 text-body font-medium text-foreground hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-neutral-100" />

              <Link
                href="/buyer/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-sm px-3 py-3 text-body font-medium text-foreground hover:bg-neutral-100"
              >
                <Heart className="h-4 w-4" />
                المفضلة
              </Link>

              <Link
                href="/buyer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-sm px-3 py-3 text-body font-medium text-foreground hover:bg-neutral-100"
              >
                <User className="h-4 w-4" />
                حسابي
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
