"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  LogIn,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function BuyerAccountPage() {
  const session = useSession();

  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const isAuthenticated = session.status === "authenticated";
  const firstName = session.user?.firstName?.trim();

  return (
    <AccountWorkspace
      activeTab="overview"
      title={isAuthenticated && firstName ? "أهلًا " + firstName : "حسابي"}
      description={
        isAuthenticated
          ? "إدارة حسابك وطلباتك والمفضلة والسلة من مساحة واحدة."
          : "تسوّق واحفظ المفضلة والسلة، ثم سجّل الدخول للوصول إلى طلباتك."
      }
    >
      <div className="space-y-6">
        {!isAuthenticated && (
          <section className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-surface to-surface p-6 shadow-raised sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-primary-100/70 blur-3xl"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-label font-bold uppercase tracking-wide text-brand">
                    دخول آمن
                  </p>
                  <h2 className="mt-1 text-h3 font-bold text-foreground">
                    سجّل الدخول لتستفيد من مساحة حسابك
                  </h2>
                  <p className="mt-2 max-w-2xl text-body-sm leading-6 text-muted-foreground">
                    احفظ عناوينك وتابع طلباتك ووصل إلى المفضلة من أي جهاز.
                  </p>
                </div>
              </div>

              <Link
                href="/login?next=/buyer"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                تسجيل الدخول
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {isAuthenticated && (
          <section className="rounded-2xl border border-success-100 bg-success-surface p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-success shadow-sm">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-body-sm font-bold text-foreground">جلسة حساب نشطة</p>
                <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                  معلوماتك والطلبات تُقرأ من حسابك الحقيقي، بدون بيانات تجريبية.
                </p>
              </div>
            </div>
          </section>
        )}

        <section
          aria-label="ملخص الحساب"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <Link
            href="/buyer/wishlist"
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised transition-all duration-200 ease-brand hover:-translate-y-1 hover:border-primary-200 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <Heart className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowLeft
                className="h-4 w-4 text-neutral-300 transition-transform group-hover:-translate-x-1 rtl:rotate-180"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-h2 font-bold tracking-tight text-foreground">
              {wishlistCount}
            </p>
            <p className="mt-1 text-body-sm font-medium text-muted-foreground">
              عنصر في المفضلة
            </p>
          </Link>

          <Link
            href="/shop/cart"
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised transition-all duration-200 ease-brand hover:-translate-y-1 hover:border-primary-200 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowLeft
                className="h-4 w-4 text-neutral-300 transition-transform group-hover:-translate-x-1 rtl:rotate-180"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-h2 font-bold tracking-tight text-foreground">
              {cartCount}
            </p>
            <p className="mt-1 text-body-sm font-medium text-muted-foreground">
              عنصر في السلة
            </p>
          </Link>

          <Link
            href="/shop/products"
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised transition-all duration-200 ease-brand hover:-translate-y-1 hover:border-primary-200 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:col-span-2 xl:col-span-1"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-brand">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowLeft
                className="h-4 w-4 text-neutral-300 transition-transform group-hover:-translate-x-1 rtl:rotate-180"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-h4 font-bold text-foreground">
              تصفّح المنتجات
            </p>
            <p className="mt-1 text-body-sm font-medium text-muted-foreground">
              اكتشف الكتالوج الكامل
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Package className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-label font-bold uppercase tracking-wide text-brand">
                  طلباتك
                </p>
                <h2 className="mt-1 text-h3 font-bold text-foreground">
                  تابع مشترياتك من مكان واحد
                </h2>
                <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                  {isAuthenticated
                    ? "عرض سجل الطلبات والحالات المؤكدة من الخادم."
                    : "سجّل الدخول لعرض سجل طلباتك."}
                </p>
              </div>
            </div>

            <Link
              href={
                isAuthenticated ? "/buyer/orders" : "/login?next=/buyer/orders"
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-body-sm font-bold text-foreground transition hover:border-primary-200 hover:text-brand"
            >
              {isAuthenticated ? "عرض الطلبات" : "تسجيل الدخول"}
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <Link
          href="/shop/products"
          className="flex items-center justify-between gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 text-text-inverse shadow-raised transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-ink-800 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-700 text-primary-300">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-body-sm font-bold">جاهز للخطوة التالية؟</p>
              <p className="mt-1 text-caption text-ink-200">
                اكتشف المنتجات والعروض الحالية.
              </p>
            </div>
          </div>
          <ArrowLeft className="h-4 w-4 text-ink-200 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </AccountWorkspace>
  );
}
