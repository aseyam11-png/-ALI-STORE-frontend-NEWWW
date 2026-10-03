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
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-500">
            جارٍ تحميل الطلب...
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">Order not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || "This order is not available for your account."}
            </p>
            <Link
              href="/buyer/orders"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              My orders
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const shipment = order.shipments[0];

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/buyer/orders"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              My orders
            </Link>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Order
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A]">
                  #{order.id}
                </h1>
                <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                  {statusLabel(order.status)}
                </span>
              </div>

              <LocalizedPrice
                amountUSD={Number(order.totalAmount)}
                className="text-2xl font-black text-[#0F2747]"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[#2563EB]" />
                  <h2 className="text-lg font-black text-slate-900">Shipping</h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Status</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {shipment ? statusLabel(order.status) : "بانتظار إنشاء الشحنة"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Carrier</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {shipment?.carrier ?? "لم يتم التحديد بعد"}
                    </p>
                  </div>
                  {shipment?.trackingNumber && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Tracking</p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-700" dir="ltr">
                        {shipment.trackingNumber}
                      </p>
                    </div>
                  )}
                  {shipment?.estimatedDeliveryDate && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Estimated delivery</p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#2563EB]" />
                  <h2 className="text-lg font-black text-slate-900">Order items</h2>
                </div>

                <div className="mt-5 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">{item.productName}</p>
                        <p className="mt-1 text-xs text-slate-400">Quantity: {item.quantity}</p>
                      </div>
                      <LocalizedPrice
                        amountUSD={Number(item.subTotal)}
                        className="shrink-0 text-sm font-black text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#2563EB]" />
                  <h2 className="text-lg font-black text-slate-900">Delivery address</h2>
                </div>
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {order.shippingAddress}
                </p>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-black text-slate-900">Order summary</h2>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <LocalizedPrice amountUSD={Number(order.discountAmount)} className="font-bold text-emerald-600" />
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-4 text-base">
                  <span className="font-bold text-slate-500">Total</span>
                  <LocalizedPrice amountUSD={Number(order.totalAmount)} className="font-black text-[#0F2747]" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}