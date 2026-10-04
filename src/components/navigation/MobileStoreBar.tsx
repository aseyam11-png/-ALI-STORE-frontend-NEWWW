"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, Camera } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const items = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/shop/products", label: "المنتجات", icon: Search },
  { href: "/shop/visual-search", label: "بحث بالصورة", icon: Camera },
  { href: "/buyer/wishlist", label: "المفضلة", icon: Heart, count: "wishlist" },
  { href: "/shop/cart", label: "السلة", icon: ShoppingBag, count: "cart" },
] as const;

export function MobileStoreBar() {
  const pathname = usePathname();
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="تنقل المتجر على الهاتف"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-neutral-200 bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-floating backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const count =
            item.count === "cart"
              ? cartCount
              : item.count === "wishlist"
                ? wishlistCount
                : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-label transition-colors " +
                (active
                  ? "text-brand"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-brand")
              }
            >
              <span className={active ? "relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50" : "relative flex h-8 w-8 items-center justify-center rounded-xl"}>
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{item.label}</span>
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-7 bottom-1 h-0.5 rounded-full bg-brand"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
