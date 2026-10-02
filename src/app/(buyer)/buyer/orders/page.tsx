"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { getServerOrders } from "@/features/orders/services/order-api.service";
import { useSession } from "@/features/auth/session";
import { formatSAR } from "@/features/localization/services/currency.service";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد انتظار الدفع",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export default function BuyerOrdersPage() {
  const session = useSession();

  const ordersQuery = useQuery({
    queryKey: ["orders", session.user?.id],
    queryFn: () => getServerOrders(0, 20),
    enabled: session.status === "authenticated",
    staleTime: 10_000,
  });

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع الطلبات وحالات الشحن من بيانات حسابك الحقيقية."
    >
      {session.status === "loading" || ordersQuery.isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <h2 className="text-lg font-bold text-danger-700">
            تعذر تحميل الطلبات
          </h2>
          <button
            type="button"
            onClick={() => void ordersQuery.refetch()}
            className="mt-5 rounded-xl bg-danger-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : ordersQuery.data?.content.length ? (
        <div className="space-y-4">
          {ordersQuery.data.content.map((order) => {
            const shipment = order.shipments[0];
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-surface p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">
                      رقم الطلب
                    </p>
                    <p className="mt-1 font-black text-foreground">
                      #{order.id}
                    </p>
                    <span className="mt-3 inline-flex rounded-full bg-info-surface px-3 py-1 text-xs font-bold text-brand">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>

                  <div className="text-end">
                    <p className="text-xs text-muted-foreground">الإجمالي</p>
                    <p className="mt-1 text-xl font-black text-foreground">
                      {formatSAR(Number(order.totalAmount))}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>{order.items.length} منتج</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("ar")}
                  </span>
                  {shipment && (
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-brand" />
                      {STATUS_LABELS[shipment.status] ?? shipment.status}
                    </span>
                  )}
                </div>

                <Link
                  href={"/buyer/orders/" + order.id}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-bold text-foreground hover:border-brand hover:text-brand"
                >
                  <Package className="h-4 w-4" />
                  عرض تفاصيل الطلب
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            لا توجد طلبات حتى الآن
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            عند إتمام أول طلب سيظهر هنا تلقائيًا.
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white"
          >
            ابدأ التسوق
          </Link>
        </div>
      )}
    </AccountWorkspace>
  );
}
