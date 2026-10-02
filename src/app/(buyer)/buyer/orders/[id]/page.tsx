"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getMyOrder, type BackendOrder } from "@/features/orders/services/order-api.service";

const shipmentLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  IN_TRANSIT: "في الطريق",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export default function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then(({ id }) => {
      const orderId = Number(id);
      if (!Number.isInteger(orderId) || orderId < 1) {
        setError("رقم الطلب غير صالح.");
        setLoading(false);
        return;
      }

      return getMyOrder(orderId)
        .then(setOrder)
        .catch((requestError) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "تعذر تحميل الطلب.",
          );
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="تفاصيل الطلب"
      description="حالة الطلب والشحن من المصدر الحقيقي."
    >
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-surface p-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : error || !order ? (
        <div role="alert" className="rounded-2xl border border-danger-100 bg-danger-surface p-6 text-sm font-bold text-danger-700">
          {error || "الطلب غير موجود."}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">رقم الطلب</p>
                <h2 className="mt-1 text-2xl font-black" dir="ltr">#{order.id}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
              <span className="rounded-full bg-info-surface px-3 py-1 text-xs font-black text-brand">
                {order.status}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <h2 className="text-lg font-black">المنتجات</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <LocalizedPrice amountUSD={item.subTotal} currency="USD" className="font-black" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <h2 className="text-lg font-black">الشحن</h2>
            {order.shipments?.length ? (
              <div className="mt-5 space-y-4">
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="rounded-xl bg-neutral-50 p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-brand" />
                      <span className="text-sm font-black">
                        {shipmentLabels[shipment.status] ?? shipment.status}
                      </span>
                    </div>
                    {shipment.trackingNumber && (
                      <p className="mt-3 text-sm" dir="ltr">
                        Tracking: {shipment.trackingNumber}
                      </p>
                    )}
                    {shipment.carrier && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        الناقل: {shipment.carrier}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">لم يبدأ شحن الطلب بعد.</p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <LocalizedPrice amountUSD={order.totalAmount} currency="USD" className="text-2xl font-black" />
            </div>
            <Link href="/buyer/orders" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              العودة للطلبات
            </Link>
          </section>
        </div>
      )}
    </AccountWorkspace>
  );
}
