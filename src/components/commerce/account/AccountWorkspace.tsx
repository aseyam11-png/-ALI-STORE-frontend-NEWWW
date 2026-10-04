"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  href:
    | "/buyer"
    | "/buyer/profile"
    | "/buyer/security"
    | "/buyer/notifications"
    | "/buyer/orders"
    | "/buyer/wishlist"
    | "/buyer/addresses"
    | "/buyer/support";
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
        <div className="container-shell pt-6 sm:pt-8 lg:pt-10">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50 via-surface to-surface px-5 py-6 shadow-raised sm:px-7 sm:py-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-20 h-44 w-44 rounded-full bg-primary-100/60 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 start-1/3 h-36 w-36 rounded-full bg-neutral-100/80 blur-3xl"
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-surface/90 px-3 py-1.5 text-label font-bold text-brand shadow-sm">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  مساحة حسابك
                </div>

                <h1 className="mt-3 text-h1 font-bold tracking-tight text-foreground">
                  {title}
                </h1>

                <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                  {description}
                </p>
              </div>

              <Link
                href="/shop/products"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-bold text-foreground shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:border-primary-200 hover:text-brand sm:w-auto"
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                متابعة التسوق
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>

            <nav
              aria-label="أقسام الحساب"
              className="relative mt-6 flex gap-1 overflow-x-auto scroll-surface border-t border-neutral-200/80 pt-3 pb-1 lg:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                      "relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-caption font-bold transition-all duration-200 ease-brand " +
                      (active
                        ? "border-primary-100 bg-surface text-brand shadow-sm"
                        : "border-transparent text-muted-foreground hover:border-neutral-200 hover:bg-surface hover:text-foreground")
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                    {item.id === "wishlist" && wishlistCount > 0 ? (
                      <span className="rounded-full bg-discount px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      <div className="bg-background">
        <div className="container-shell py-6 sm:py-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
                <div className="border-b border-neutral-100 bg-gradient-to-br from-primary-50 via-surface to-surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-label font-bold uppercase tracking-wide text-brand">
                        ALI STORE
                      </p>
                      <p className="mt-1 text-body-sm font-bold text-foreground">
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
                                "group relative flex min-h-11 items-center gap-3 rounded-xl border px-3 text-body-sm font-bold transition-all duration-200 ease-brand " +
                                (active
                                  ? "border-primary-100 bg-primary-50 text-brand shadow-sm"
                                  : "border-transparent text-neutral-600 hover:border-neutral-100 hover:bg-neutral-50 hover:text-foreground")
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
                                <span className="rounded-full bg-discount px-2 py-0.5 text-[9px] font-bold leading-none text-white">
                                  {wishlistCount > 99 ? "99+" : wishlistCount}
                                </span>
                              ) : null}

                              {item.id === "orders" ? (
                                <ArrowLeft
                                  className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60 rtl:rotate-180"
                                  aria-hidden="true"
                                />
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
                      className="group flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-body-sm font-bold text-neutral-600 transition-all duration-200 ease-brand hover:border-neutral-100 hover:bg-neutral-50 hover:text-foreground"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 group-hover:bg-surface group-hover:text-brand">
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1">السلة</span>
                      {cartCount > 0 ? (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold leading-none text-white">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      ) : null}
                    </Link>

                    <Link
                      href="/shop/products"
                      className="group mt-1 flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-body-sm font-bold text-neutral-600 transition-all duration-200 ease-brand hover:border-neutral-100 hover:bg-neutral-50 hover:text-foreground"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 group-hover:bg-surface group-hover:text-brand">
                        <Store className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1">العودة للمتجر</span>
                      <ArrowLeft
                        className="h-3.5 w-3.5 opacity-50 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-success-100 bg-success-surface p-4">
                <div className="flex items-start gap-2.5">
                  <LockKeyhole
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-caption font-bold text-foreground">
                      حسابك في مكان واحد
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      الطلبات والمفضلة والعناوين والإشعارات والأمان منظمة داخل مساحة واحدة.
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
