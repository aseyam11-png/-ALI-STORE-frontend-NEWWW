"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Package,
  ShoppingCart,
  Store,
  UserRound,
} from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

type AccountNavItem = {
  id:
    | "overview"
    | "profile"
    | "security"
    | "notifications"
    | "orders"
    | "wishlist"
    | "addresses"
    | "support";
  label: string;
  href: string;
  icon: typeof UserRound;
};

type AccountNavGroup = {
  label: string;
  items: AccountNavItem[];
};

const ACCOUNT_NAV_GROUPS: AccountNavGroup[] = [
  {
    label: "حسابي",
    items: [
      { id: "overview", label: "نظرة عامة", href: "/buyer", icon: UserRound },
      { id: "profile", label: "الملف الشخصي", href: "/buyer/profile", icon: UserRound },
      { id: "security", label: "الأمان", href: "/buyer/security", icon: LockKeyhole },
      { id: "notifications", label: "الإشعارات", href: "/buyer/notifications", icon: Bell },
    ],
  },
  {
    label: "التسوق والطلبات",
    items: [
      { id: "orders", label: "طلباتي", href: "/buyer/orders", icon: Package },
      { id: "wishlist", label: "المفضلة", href: "/buyer/wishlist", icon: Heart },
      { id: "addresses", label: "العناوين", href: "/buyer/addresses", icon: MapPin },
    ],
  },
  {
    label: "المساعدة",
    items: [
      { id: "support", label: "الدعم", href: "/buyer/support", icon: MessageCircle },
    ],
  },
];

type AccountTabId = AccountNavItem["id"];
export type { AccountTabId };

interface AccountWorkspaceProps {
  activeTab: AccountTabId;
  title: string;
  description: string;
  children: ReactNode;
}

export function AccountWorkspace({
  activeTab,
  title,
  description,
  children,
}: AccountWorkspaceProps) {
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);

  return (
    <CustomerShell>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="container-shell pt-7 sm:pt-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                مساحة حسابك
              </span>
              <h1 className="mt-3 text-h1 font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                {description}
              </p>
            </div>

            <Link
              href="/shop/products"
              className="hidden h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand sm:inline-flex"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              متابعة التسوق
            </Link>
          </div>

          <nav
            aria-label="أقسام الحساب"
            className="mt-7 flex gap-1 overflow-x-auto scroll-surface border-t border-neutral-100 pt-2 pb-1 lg:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {ACCOUNT_NAV_GROUPS.flatMap((group) => group.items).map((item) => {
              const active = item.id === activeTab;
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-caption font-medium transition-all duration-200 ease-brand " +
                    (active
                      ? "bg-primary-50 text-brand"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {item.id === "wishlist" && wishlistCount > 0 ? (
                    <span className="rounded-full bg-discount px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="bg-background">
        <div className="container-shell py-7 sm:py-8">
          <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
                <div className="border-b border-neutral-100 bg-gradient-to-br from-primary-50 via-surface to-surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-label font-medium text-brand">
                        ALI STORE
                      </p>
                      <p className="mt-0.5 text-body-sm font-bold text-foreground">
                        مركز حسابك
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  {ACCOUNT_NAV_GROUPS.map((group) => (
                    <div key={group.label} className="mb-4 last:mb-0">
                      <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">
                        {group.label}
                      </p>

                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const active = item.id === activeTab;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={
                                "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-sm font-medium transition-all duration-200 ease-brand " +
                                (active
                                  ? "bg-primary-50 text-brand shadow-sm"
                                  : "text-neutral-600 hover:bg-neutral-50 hover:text-foreground")
                              }
                            >
                              {active ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-brand"
                                />
                              ) : null}

                              <span
                                className={
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors " +
                                  (active
                                    ? "bg-surface text-brand"
                                    : "bg-neutral-50 text-neutral-500 group-hover:bg-surface group-hover:text-brand")
                                }
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>

                              <span className="min-w-0 flex-1 truncate">
                                {item.label}
                              </span>

                              {item.id === "wishlist" && wishlistCount > 0 ? (
                                <span className="rounded-full bg-discount px-2 py-0.5 text-[9px] font-bold text-white">
                                  {wishlistCount > 99 ? "99+" : wishlistCount}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <Link
                      href="/shop/cart"
                      className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-foreground"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 group-hover:bg-surface group-hover:text-brand">
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1">السلة</span>
                      {cartCount > 0 ? (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold text-white">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      ) : null}
                    </Link>

                    <Link
                      href="/shop/products"
                      className="group mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-foreground"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 group-hover:bg-surface group-hover:text-brand">
                        <Store className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>العودة للمتجر</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-success-100 bg-success-surface p-4">
                <div className="flex items-start gap-2.5">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <p className="text-caption font-bold text-foreground">
                      تجربة حساب موحدة
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      الطلبات، المفضلة، العناوين، الإشعارات والأمان كلها من مكان واحد.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
