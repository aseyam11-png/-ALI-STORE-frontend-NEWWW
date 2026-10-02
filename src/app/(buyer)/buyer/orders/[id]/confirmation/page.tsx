"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getOrder, type BackendOrder } from "@/features/orders/services/order.service";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(orderId)
      .then(setOrder)
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل الطلب.");
      });
  }, [orderId]);

  if (!order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            {error ? (
              <p className="text-sm font-bold text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-slate-500">جارٍ تحميل الطلب...</p>
            )}
            <Link
              href="/buyer/orders"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              My orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-10 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              Order created
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Thank you for your order
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order <span dir="ltr">#{order.id}</span> is saved to your account.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#2563EB]" />
                <h2 className="text-lg font-black text-slate-900">Delivery address</h2>
              </div>
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {order.shippingAddress}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#2563EB]" />
                <h2 className="text-lg font-black text-slate-900">Order status</h2>
              </div>
              <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm font-black text-[#2563EB]">
                {order.status}
              </p>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-[#2563EB]" />
              <h2 className="text-lg font-black text-slate-900">Items</h2>
            </div>
            <div className="mt-5 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-bold text-slate-700">
                    {item.productName} × {item.quantity}
                  </span>
                  <LocalizedPrice amountUSD={Number(item.subTotal)} className="text-sm font-black text-slate-900" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="font-bold text-slate-500">Total</span>
              <LocalizedPrice amountUSD={Number(order.totalAmount)} className="text-xl font-black text-[#0F2747]" />
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/buyer/orders/${order.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              Track order
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
            >
              Continue shopping
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
