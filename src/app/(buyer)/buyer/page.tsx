"use client";

import Link from "next/link";
import {
  Heart,
  LogIn,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

// The account overview is intentionally derived from the authenticated
// session plus the real persisted wishlist/cart state. Order history is linked
// to its backend-backed page rather than being fabricated here.
export default function BuyerAccountPage() {
  const session = useSession();

  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const wishlistCount = useWishlistStore((state) => state.items.length);

  const isAuthenticated = session.status === "authenticated";

  return (
    <AccountWorkspace
      activeTab="overview"
      title="حسابي"
      description="تسوّق واستعرض المفضلة والسلة — سجّل الدخول للوصول إلى طلباتك."
    >
          {!isAuthenticated && (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-md border border-neutral-200 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-neutral-500">
                  <LogIn className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-body font-medium text-foreground">
                    لم تسجّل الدخول
                  </p>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    سجّل الدخول لعرض طلباتك ومعلومات حسابك.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-brand px-6 text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/buyer/wishlist"
              className="group rounded-md border border-neutral-200 bg-surface p-5 transition-colors duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-brand transition-colors duration-200 ease-brand group-hover:bg-primary-100">
                <Heart className="h-5 w-5" />
              </span>
              <p className="mt-4 text-h3 font-bold text-foreground">
                {wishlistCount}
              </p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                عنصر في المفضلة
              </p>
            </Link>

            <Link
              href="/shop/cart"
              className="group rounded-md border border-neutral-200 bg-surface p-5 transition-colors duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-brand transition-colors duration-200 ease-brand group-hover:bg-primary-100">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <p className="mt-4 text-h3 font-bold text-foreground">
                {cartCount}
              </p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                عنصر في السلة
              </p>
            </Link>

            <Link
              href="/shop/products"
              className="group rounded-md border border-neutral-200 bg-surface p-5 transition-colors duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-brand transition-colors duration-200 ease-brand group-hover:bg-primary-100">
                <Search className="h-5 w-5" />
              </span>
              <p className="mt-4 text-body font-medium text-foreground">
                تصفّح المنتجات
              </p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                اكتشف الكتالوج الكامل
              </p>
            </Link>
          </div>

          <Link
            href={isAuthenticated ? "/buyer/orders" : "/login?next=/buyer/orders"}
            className="mt-10 block rounded-md border border-neutral-200 bg-surface p-6 transition-colors duration-200 hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-neutral-100 text-neutral-500">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <p className="text-body font-medium text-foreground">
                  الطلبات
                </p>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {isAuthenticated
                    ? "عرض سجل الطلبات والحالات المؤكدة من الخادم."
                    : "سجّل الدخول لعرض سجل طلباتك."}
                </p>
              </div>
            </div>
          </Link>

          <div className="mt-6 flex items-center gap-3 text-body-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
            بياناتك وطلباتك محمية — لا نعرض إلا المعلومات الحقيقية لحسابك.
          </div>
    </AccountWorkspace>
  );
}
