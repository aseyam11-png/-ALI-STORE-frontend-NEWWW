"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { getServerOrder } from "@/features/orders/services/order-api.service";
import { formatSAR } from "@/features/localization/services/currency.service";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد انتظار الدفع",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export default function BuyerOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const query = useQuery({
    queryKey: ["order", id],
    queryFn: () => getServerOrder(id),
    enabled: Boolean(id),
    staleTime: 5_000,
  });

  return (
    <AccountWorkspace
      activeTab="orders"
      title="تفاصيل الطلب"
      description="بيانات الطلب والشحن مأخوذة مباشرة من الخادم."
    >
      {query.isLoading ? (
        <div className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
      ) : query.isError || !query.data ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <h2 className="text-lg font-bold text-danger-700">
            الطلب غير موجود أو لا يمكنك الوصول إليه.
          </h2>
          <Link
            href="/buyer/orders"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            العودة للطلبات
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">رقم الطلب</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">
                  #{query.data.id}
                </h2>
                <span className="mt-3 inline-flex rounded-full bg-info-surface px-3 py-1 text-xs font-bold text-brand">
                  {STATUS_LABELS[query.data.status] ?? query.data.status}
                </span>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">الإجمالي</p>
                <p className="mt-1 text-2xl font-black text-foreground">
                  {formatSAR(Number(query.data.totalAmount))}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs text-muted-foreground">المنتجات</p>
                <p className="mt-1 font-bold">
                  {formatSAR(Number(query.data.subtotalAmount))}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs text-muted-foreground">الشحن</p>
                <p className="mt-1 font-bold">
                  {formatSAR(Number(query.data.shippingAmount))}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs text-muted-foreground">طريقة الشحن</p>
                <p className="mt-1 font-bold">
                  {query.data.shippingMethod === "EXPRESS" ? "سريع" : "عادي"}
                </p>
              </div>
            </div>

            {query.data.shippingAddress && (
              <div className="mt-4 rounded-xl border border-neutral-200 p-4">
                <p className="text-xs text-muted-foreground">عنوان الشحن</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {query.data.shippingAddress}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <h2 className="text-lg font-bold text-foreground">المنتجات</h2>
            <div className="mt-5 space-y-3">
              {query.data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      الكمية: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-foreground">
                    {formatSAR(Number(item.subTotal))}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <h2 className="text-lg font-bold text-foreground">الشحن والتتبع</h2>
            <div className="mt-5 space-y-4">
              {query.data.shipments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لم يتم إنشاء شحنة بعد.
                </p>
              ) : (
                query.data.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-brand" />
                      <div>
                        <p className="text-sm font-bold">
                          {STATUS_LABELS[shipment.status] ?? shipment.status}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {shipment.carrier ?? "شركة الشحن ستظهر عند التعيين"}
                          {shipment.trackingNumber
                            ? " · " + shipment.trackingNumber
                            : ""}
                        </p>
                      </div>
                    </div>
                    {shipment.estimatedDeliveryDate && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        الوصول المتوقع:{" "}
                        {new Date(
                          shipment.estimatedDeliveryDate,
                        ).toLocaleDateString("ar")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AccountWorkspace>
  );
}
