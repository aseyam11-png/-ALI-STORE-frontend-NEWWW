"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  ChevronLeft,
  Heart,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useSession } from "@/features/auth/session";
import {
  getOrders,
  type BackendOrder,
} from "@/features/orders/services/order.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

function orderStatusLabel(status: BackendOrder["status"]) {
  return {
    PENDING: "بانتظار الدفع",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
    FULFILLMENT_FAILED: "تعذر التنفيذ",
  }[status];
}

function orderStatusClass(status: BackendOrder["status"]) {
  if (status === "DELIVERED") return "bg-success-surface text-success";
  if (status === "CANCELLED" || status === "FULFILLMENT_FAILED") {
    return "bg-danger-surface text-danger-600";
  }
  if (status === "PENDING") return "bg-warning-surface text-warning-700";
  return "bg-primary-50 text-brand";
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("ar-PS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}


function DashboardMetric({
  label,
  value,
  icon: Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: typeof Package;
  href: string;
  tone?: "neutral" | "brand" | "success";
}) {
  const iconTone =
    tone === "brand"
      ? "bg-primary-50 text-brand"
      : tone === "success"
        ? "bg-success-surface text-success"
        : "bg-neutral-100 text-neutral-600";

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-200 bg-surface p-5 transition-[transform,border-color,box-shadow] duration-200 ease-brand hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
            iconTone
          }
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>

        <ArrowUpLeft
          className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-brand"
          aria-hidden="true"
        />
      </div>

      <p className="mt-5 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-body-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof UserRound;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[92px] items-center gap-4 rounded-2xl border border-neutral-200 bg-surface p-4 transition-[transform,border-color,box-shadow] duration-200 ease-brand hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 transition-colors group-hover:bg-primary-50 group-hover:text-brand">
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-bold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-caption leading-5 text-muted-foreground">
          {description}
        </span>
      </span>

      <ChevronLeft
        className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:-translate-x-1 group-hover:text-brand"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function BuyerAccountPage() {
  const session = useSession();

  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated") {
      setOrdersLoading(false);
      return;
    }

    let active = true;
    setOrdersLoading(true);
    setOrdersError("");

    getOrders(0, 8)
      .then((page) => {
        if (!active) return;

        setOrdersTotal(page.totalElements);
        setOrders(
          [...page.content].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      })
      .catch((caughtError: unknown) => {
        if (!active) return;

        setOrdersError(
          caughtError instanceof Error
            ? caughtError.message
            : "تعذر تحميل ملخص الطلبات.",
        );
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.status]);

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);

  return (
    <AccountWorkspace
      activeTab="overview"
      title="حسابي"
      description="مركز واحد لإدارة طلباتك والمفضلة والعناوين وتفاصيل حسابك."
    >
      <div className="space-y-7">
        <section className="overflow-hidden rounded-2xl bg-brand-ink text-white shadow-raised">
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-base font-black ring-1 ring-white/15"
                  aria-hidden="true"
                >
                  {session.user ? (
                    (
                      (session.user.firstName?.[0] ?? "") +
                      (session.user.lastName?.[0] ?? "")
                    ).toUpperCase()
                  ) : (
                    <UserRound className="h-6 w-6" />
                  )}
                </span>

                <div className="min-w-0">
                  <p className="text-caption font-medium text-white/60">
                    {session.status === "authenticated"
                      ? "مرحبًا بعودتك"
                      : "حسابك في ALI STORE"}
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                    {session.status === "authenticated" && session.user
                      ? session.user.firstName + " " + session.user.lastName
                      : "سجّل الدخول لإدارة حسابك"}
                  </h2>

                  <p className="mt-1 truncate text-body-sm text-white/65">
                    {session.status === "authenticated" && session.user
                      ? session.user.email
                      : "الطلبات والمفضلة والعناوين في مكان واحد."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2.5">
                {session.status === "authenticated" ? (
                  <Link
                    href="/buyer/orders"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-body-sm font-bold text-brand-ink transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                  >
                    <Package className="h-4 w-4" aria-hidden="true" />
                    طلباتي
                  </Link>
                ) : (
                  <Link
                    href="/login?next=/buyer"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-body-sm font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    تسجيل الدخول
                  </Link>
                )}

                <Link
                  href="/shop/products"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-body-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        </section>

        {session.status === "loading" ? (
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy="true"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[142px] animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100"
              />
            ))}
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardMetric
              label="إجمالي الطلبات"
              value={ordersTotal}
              icon={Truck}
              href={
                session.status === "authenticated"
                  ? "/buyer/orders"
                  : "/login?next=/buyer/orders"
              }
              tone="success"
            />
            <DashboardMetric
              label="في المفضلة"
              value={wishlistCount}
              icon={Heart}
              href="/buyer/wishlist"
              tone="brand"
            />
            <DashboardMetric
              label="في السلة"
              value={cartCount}
              icon={ShoppingBag}
              href="/shop/cart"
            />
          </section>
        )}

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-caption font-medium text-brand">
                  آخر النشاط
                </p>
                <h2 className="mt-1 text-h3 font-black tracking-tight text-foreground">
                  أحدث طلباتك
                </h2>
              </div>

              <Link
                href={
                  session.status === "authenticated"
                    ? "/buyer/orders"
                    : "/login?next=/buyer/orders"
                }
                className="inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:text-brand-hover"
              >
                عرض الكل
                <ArrowLeft
                  className="h-4 w-4 rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {session.status === "loading" || ordersLoading ? (
              <div className="mt-5 space-y-3" aria-busy="true">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[82px] animate-pulse rounded-xl bg-neutral-100"
                  />
                ))}
              </div>
            ) : session.status !== "authenticated" ? (
              <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-7 text-center">
                <Package
                  className="mx-auto h-8 w-8 text-neutral-300"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-body font-bold text-foreground">
                  الطلبات تظهر بعد تسجيل الدخول
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-caption leading-5 text-muted-foreground">
                  لا نعرض بيانات تجريبية. بعد تسجيل الدخول ستظهر هنا طلبات حسابك الفعلية.
                </p>
                <Link
                  href="/login?next=/buyer"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-caption font-bold text-white hover:bg-brand-hover"
                >
                  تسجيل الدخول
                </Link>
              </div>
            ) : ordersError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-danger-100 bg-danger-surface p-5"
              >
                <p className="text-body-sm font-bold text-danger-700">
                  تعذر تحميل الطلبات
                </p>
                <p className="mt-1 text-caption leading-5 text-danger-600">
                  {ordersError}
                </p>
                <Link
                  href="/buyer/orders"
                  className="mt-4 inline-flex items-center gap-2 text-caption font-bold text-danger-700 underline underline-offset-4"
                >
                  فتح صفحة الطلبات
                  <ArrowLeft
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-7 text-center">
                <Package
                  className="mx-auto h-8 w-8 text-neutral-300"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-body font-bold text-foreground">
                  لا توجد طلبات حتى الآن
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-caption leading-5 text-muted-foreground">
                  عندما تنفذ أول طلب، سيظهر ملخصه هنا للرجوع السريع.
                </p>
                <Link
                  href="/shop/products"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-caption font-bold text-white hover:bg-brand-hover"
                >
                  ابدأ التسوق
                  <ArrowLeft
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={"/buyer/orders/" + order.id}
                    className="group flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 transition-colors group-hover:bg-primary-50 group-hover:text-brand">
                        <Package
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-body-sm font-bold text-foreground">
                            طلب <span dir="ltr">#{order.id}</span>
                          </p>
                          <span
                            className={
                              "rounded-full px-2.5 py-1 text-label font-bold " +
                              orderStatusClass(order.status)
                            }
                          >
                            {orderStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {formatOrderDate(order.createdAt)}
                          </span>
                          <span>
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "منتج" : "منتجات"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <LocalizedPrice
                        amountUSD={Number(order.totalAmount)}
                        currency={order.currency}
                        className="text-body font-black text-foreground"
                      />
                      <ChevronLeft
                        className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:-translate-x-1 group-hover:text-brand"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-7">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
              <div>
                <p className="text-caption font-medium text-brand">
                  وصول سريع
                </p>
                <h2 className="mt-1 text-h3 font-black tracking-tight text-foreground">
                  اختصارات الحساب
                </h2>
              </div>

              <div className="mt-5 grid gap-3">
                <QuickAction
                  href="/buyer/profile"
                  title="الملف الشخصي"
                  description="راجع بياناتك الأساسية وحالة الحساب."
                  icon={UserRound}
                />
                <QuickAction
                  href="/buyer/addresses"
                  title="العناوين"
                  description="إدارة عناوين التوصيل المستخدمة في الشراء."
                  icon={MapPin}
                />
                <QuickAction
                  href="/buyer/wishlist"
                  title="المفضلة"
                  description={
                    wishlistCount > 0
                      ? wishlistCount + " عنصر محفوظ للرجوع إليه."
                      : "المنتجات التي تريد الرجوع إليها لاحقًا."
                  }
                  icon={Heart}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-success-100 bg-success-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-success">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-body-sm font-black text-foreground">
                    معلومات موثوقة فقط
                  </h2>
                  <p className="mt-1 text-caption leading-5 text-muted-foreground">
                    هذه الصفحة لا تُنشئ مخزونًا أو خصومات أو شحنًا وهميًا؛ الملخص يعتمد على حالة الحساب والبيانات الفعلية المتاحة.
                  </p>
                </div>
              </div>

              <Link
                href={
                  session.status === "authenticated"
                    ? "/buyer/support"
                    : "/login?next=/buyer/support"
                }
                className="mt-5 inline-flex items-center gap-2 text-caption font-bold text-foreground hover:text-brand"
              >
                تحتاج مساعدة؟
                <ArrowLeft
                  className="h-4 w-4 rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AccountWorkspace>
  );
}
