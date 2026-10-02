"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useOrderStore } from "@/stores/order-store";
import { useLocalizationStore } from "@/stores/localization-store";

function progressFor(status: string) {
  switch (status) {
    case "PROCESSING":
      return 20;
    case "PACKED":
      return 40;
    case "SHIPPED":
      return 60;
    case "IN_TRANSIT":
      return 75;
    case "OUT_FOR_DELIVERY":
      return 90;
    case "DELIVERED":
      return 100;
    default:
      return 0;
  }
}

function formatTrackingDate(timestamp: string, locale: "en" | "ar") {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

export default function BuyerOrderTrackingPage() {
  const params = useParams<{
    id: string;
  }>();

  const orderId = params?.id ?? "";

  const order = useOrderStore(
    (state) =>
      state.getOrder(orderId),
  );

  const locale = useLocalizationStore(
    (state) => state.locale,
  );

  if (!order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />

            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This order does not exist in the current session.
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

  const progress = progressFor(order.shipmentStatus);

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
                  {order.id}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Track your delivery from this page.
                </p>
              </div>

              <LocalizedPrice
                amountUSD={order.grandTotal}
                className="text-2xl font-black text-[#0F2747]"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="space-y-7">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <Truck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {order.carrier ??
                          "Carrier not assigned"}

                        {order.trackingNumber &&
                          ` · ${order.trackingNumber}`}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                    {order.shipmentStatus}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">
                      Delivery progress
                    </span>

                    <span className="text-xs font-black text-[#2563EB]">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-7 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900">
                      Delivery timeline
                    </h2>

                    <span className="text-[10px] font-bold text-slate-400">
                      {order.events.length} tracking events
                    </span>
                  </div>

                  <div className="mt-5">
                    {order.events.map(
                      (
                        event,
                        index,
                      ) => (
                        <div
                          key={event.id}
                          className="relative flex gap-4"
                        >
                          {index <
                            order.events.length -
                              1 && (
                            <div className="absolute start-4 top-8 h-full w-px bg-slate-200" />
                          )}

                          <div
                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              event.completed
                                ? "bg-[#2563EB] text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {event.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Clock3 className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 pb-7">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-black text-slate-800">
                                {event.title}
                              </p>

                              <span className="text-[10px] font-bold text-slate-400">
                                {formatTrackingDate(
                                  event.timestamp,
                                  locale,
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {event.description}
                            </p>

                            {event.location && (
                              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}

                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-black ${
                                event.completed
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {event.completed
                                ? "Completed"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <aside className="h-fit rounded-2xl bg-slate-50 p-5">
                  <h2 className="text-sm font-black text-slate-900">
                    Order details
                  </h2>

                  <div className="mt-4 space-y-3">
                    <Info
                      label="Carrier"
                      value={
                        order.carrier ??
                        "Not assigned"
                      }
                    />

                    <Info
                      label="Tracking"
                      value={
                        order.trackingNumber ??
                        "Not assigned"
                      }
                    />

                    <Info
                      label="Shipping method"
                      value={
                        order.shippingMethod
                      }
                    />

                    <Info
                      label="Estimated delivery"
                      value={
                        order.estimatedDelivery
                      }
                    />

                    <Info
                      label="Last updated"
                      value={formatTrackingDate(
                        order.updatedAt,
                        locale,
                      )}
                    />
                  </div>
                </aside>
              </div>

              <div className="border-t border-slate-100 p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />

                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Delivery address
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {order.address.address},{" "}
                      {order.address.city},{" "}
                      {order.address.country}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
