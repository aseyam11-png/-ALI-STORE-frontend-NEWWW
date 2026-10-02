"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Tag,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

import { useOrderStore } from "@/stores/order-store";

export default function OrderConfirmationPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const orderId =
    params?.id ?? "";

  const orders =
    useOrderStore(
      (state) =>
        state.orders,
    );

  const order =
    orders.find(
      (item) =>
        item.id ===
        orderId,
    );

  if (!order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">

            <Package className="mx-auto h-9 w-9 text-slate-300" />

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We could not find this order in the current session.
            </p>

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

          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/buyer/orders"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              My orders
            </Link>

            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  Order confirmed
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">
                  Thank you for your order
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Your order has been created successfully.
                </p>
              </div>

            </div>

          </div>

        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">

            <div className="space-y-6">

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Order number
                    </p>

                    <p className="mt-1 text-xl font-black text-[#0F2747]">
                      {order.id}
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Payment recorded
                  </span>

                </div>

              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <MapPin className="h-5 w-5 text-[#2563EB]" />

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Delivery address
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Address used for this order.
                    </p>
                  </div>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <p className="text-sm font-black text-slate-900">
                    {order.address.fullName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {order.address.phone}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {order.address.address}
                    {order.address.city
                      ? `, ${order.address.city}`
                      : ""}
                    {order.address.country
                      ? `, ${order.address.country}`
                      : ""}
                  </p>

                  {order.address.postalCode && (
                    <p className="mt-1 text-xs text-slate-400">
                      Postal code:{" "}
                      {order.address.postalCode}
                    </p>
                  )}

                </div>

              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <Truck className="h-5 w-5 text-[#2563EB]" />

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Order items
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {order.items.length} product
                      {order.items.length !== 1 ? "s" : ""} in this order.
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-2">

                  {order.items.map(
                    (item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                      >

                        <div className="min-w-0">

                          <p className="truncate text-xs font-bold text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Qty:{" "}
                            {item.quantity}
                          </p>

                        </div>

                        <LocalizedPrice
                          amountUSD={
                            item.price *
                            item.quantity
                          }
                          className="shrink-0 text-xs font-black text-slate-700"
                        />

                      </div>
                    ),
                  )}

                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs">

                  <span className="text-slate-400">
                    {order.shippingMethod}
                  </span>

                  <span className="font-bold text-[#2563EB]">
                    {order.estimatedDelivery}
                  </span>

                </div>

              </section>

            </div>

            <aside className="h-fit space-y-5 lg:sticky lg:top-24">

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <Package className="h-5 w-5 text-[#2563EB]" />

                  <h2 className="text-lg font-black text-slate-900">
                    Payment summary
                  </h2>

                </div>

                <div className="mt-5 space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <LocalizedPrice
                      amountUSD={
                        order.subtotal
                      }
                      className="font-bold text-slate-800"
                    />

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Shipping
                    </span>

                    <LocalizedPrice
                      amountUSD={
                        order.shippingCost
                      }
                      className="font-bold text-slate-800"
                    />

                  </div>

                  {"couponDiscount" in order &&
                    Number(
                      order.couponDiscount ??
                        0,
                    ) > 0 && (
                      <div className="flex justify-between text-sm">

                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <Tag className="h-3.5 w-3.5" />
                          Coupon
                        </span>

                        <LocalizedPrice
                          amountUSD={
                            -Number(
                              order.couponDiscount,
                            )
                          }
                          className="font-black text-emerald-600"
                        />

                      </div>
                    )}

                  <div className="border-t border-slate-100 pt-4">

                    <div className="flex items-end justify-between">

                      <span className="text-sm font-bold text-slate-500">
                        Total
                      </span>

                      <LocalizedPrice
                        amountUSD={
                          order.grandTotal
                        }
                        className="text-2xl font-black text-[#0F2747]"
                      />

                    </div>

                  </div>

                </div>

                <div className="mt-5 rounded-xl bg-emerald-50 p-3">

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />

                    <span className="text-xs font-black text-emerald-700">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-5 text-emerald-700/70">
                    Payment is processed securely.
                  </p>

                </div>

              </section>

              <section className="rounded-2xl bg-[#0F2747] p-5 text-white">

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200/60">
                  What happens next
                </p>

                <div className="mt-4 space-y-4">

                  <Step
                    number="1"
                    text="Your order is received and prepared for shipment."
                  />

                  <Step
                    number="2"
                    text="Your package is handed to the carrier."
                  />

                  <Step
                    number="3"
                    text="You can track delivery from your order page."
                  />

                </div>

              </section>

              <div className="flex flex-col gap-2">

                <Link
                  href={`/buyer/orders/${order.id}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white"
                >
                  Track this order
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/shop/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
                >
                  Continue shopping
                </Link>

              </div>

            </aside>

          </div>

        </div>
      </main>
    </AppShell>
  );
}

function Step({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">
        {number}
      </span>

      <p className="text-xs leading-5 text-blue-100/70">
        {text}
      </p>

    </div>
  );
}
