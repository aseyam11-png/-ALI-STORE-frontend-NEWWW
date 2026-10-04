"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Package, Truck } from "lucide-react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getOrder, type BackendOrder } from "@/features/orders/services/order.service";

function statusLabel(status: BackendOrder["status"]) {
  return {
    PENDING: "بانتظار الدفع",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
    FULFILLMENT_FAILED: "فشل تنفيذ الطلب",
  }[status];
}

function aggregateShipmentStatus(order: BackendOrder): string {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (order.status === "FULFILLMENT_FAILED") return "FULFILLMENT_FAILED";

  const statuses = order.shipments.map((shipment) => shipment.status);
  if (statuses.length === 0) return order.status;
  if (statuses.every((status) => status === "DELIVERED")) return "DELIVERED";
  if (statuses.some((status) => status === "IN_TRANSIT")) return "IN_TRANSIT";
  if (statuses.some((status) => status === "SHIPPED")) return "SHIPPED";
  return "PROCESSING";
}

export default function BuyerOrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getOrder(orderId)
      .then((nextOrder) => {
        if (active) setOrder(nextOrder);
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر تحميل الطلب.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-neutral-500">
            جارٍ تحميل الطلب...
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-300" />
            <h1 className="mt-4 text-2xl font-black text-foreground">الطلب غير موجود</h1>
            <p className="mt-2 text-sm text-neutral-500">
              {error || "This order is not available for your account."}
            </p>
            <Link
              href="/buyer/orders"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-black text-white"
            >طلباتي</Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/buyer/orders"
              className="inline-flex items-center gap-2 text-xs font-black text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />طلباتي</Link>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                  Order
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                  #{order.id}
                </h1>
                <span className="mt-2 inline-flex rounded-full bg-info-surface px-3 py-1.5 text-[10px] font-black text-brand">
                  {statusLabel(order.status)}
                </span>
              </div>

              <LocalizedPrice
                amountUSD={Number(order.totalAmount)}
                currency={order.currency}
                className="text-2xl font-black text-brand-ink"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-brand" />
                    <h2 className="text-lg font-black text-foreground">الشحن</h2>
                  </div>
                  <span className="rounded-full bg-info-surface px-3 py-1 text-[10px] font-black text-brand">
                    {aggregateShipmentStatus(order)}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {order.shipments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">
                      لم يتم إنشاء شحنة بعد.
                    </div>
                  ) : (
                    order.shipments.map((shipment) => (
                      <article
                        key={shipment.id}
                        className="rounded-xl border border-neutral-200 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-black text-foreground">
                              Shipment #{shipment.id}
                            </p>
                            <p className="mt-1 text-xs font-bold text-neutral-500">
                              {shipment.status}
                            </p>
                          </div>
                          <p className="font-mono text-[10px] text-neutral-500" dir="ltr">
                            {shipment.trackingNumber ?? "Tracking pending"}
                          </p>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                              Carrier
                            </p>
                            <p className="mt-1 text-xs font-bold text-neutral-700">
                              {shipment.carrier ?? "لم يتم التحديد بعد"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                              Estimated delivery
                            </p>
                            <p className="mt-1 text-xs font-bold text-neutral-700">
                              {shipment.estimatedDeliveryDate
                                ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA")
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">Order items</h2>
                </div>

                <div className="mt-5 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-neutral-800">{item.productName}</p>
                        <p className="mt-1 text-xs text-neutral-400">Quantity: {item.quantity}</p>
                      </div>
                      <LocalizedPrice
                        amountUSD={Number(item.subTotal)}
                        currency={order.currency}
                        className="shrink-0 text-sm font-black text-neutral-800"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">Delivery address</h2>
                </div>
                <p className="mt-5 rounded-xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                  {order.shippingAddress}
                </p>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-black text-foreground">Order summary</h2>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Discount</span>
                  <LocalizedPrice amountUSD={Number(order.discountAmount)} currency={order.currency} className="font-bold text-success-600" />
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-4 text-base">
                  <span className="font-bold text-neutral-500">Total</span>
                  <LocalizedPrice amountUSD={Number(order.totalAmount)} currency={order.currency} className="font-black text-brand-ink" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}