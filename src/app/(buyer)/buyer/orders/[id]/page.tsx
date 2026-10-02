"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { getMyOrder } from "@/features/orders/services/order.service";
import type { BackendOrder } from "@/lib/api/contracts";
import { useLocalizationStore } from "@/stores/localization-store";

function shipmentFor(order: BackendOrder) {
  return [...order.shipments].sort((a, b) => {
    const rank = (status: string) =>
      ({
        PENDING: 0,
        SHIPPED: 2,
        IN_TRANSIT: 3,
        DELIVERED: 4,
        CANCELLED: -1,
      })[status] ?? 1;

    return rank(b.status) - rank(a.status);
  })[0];
}

function progressFor(order: BackendOrder) {
  const status = shipmentFor(order)?.status;

  switch (status) {
    case "SHIPPED":
      return 60;
    case "IN_TRANSIT":
      return 75;
    case "DELIVERED":
      return 100;
    case "PENDING":
      return 20;
    default:
      return order.status === "PROCESSING" ? 20 : 0;
  }
}

function timelineFor(order: BackendOrder) {
  const shipment = shipmentFor(order);
  const shipped =
    shipment?.status === "SHIPPED" ||
    shipment?.status === "IN_TRANSIT" ||
    shipment?.status === "DELIVERED";
  const inTransit =
    shipment?.status === "IN_TRANSIT" ||
    shipment?.status === "DELIVERED";
  const delivered =
    shipment?.status === "DELIVERED";
  const processing = [
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ].includes(order.status);

  return [
    {
      id: `${order.id}-received`,
      title: "Order received",
      description:
        "AliStore received your order.",
      timestamp: order.createdAt,
      completed: true,
    },
    {
      id: `${order.id}-processing`,
      title: "Processing",
      description:
        "The order is being prepared for fulfillment.",
      timestamp: order.createdAt,
      completed: processing,
    },
    {
      id: `${order.id}-shipped`,
      title: "Shipped",
      description:
        "The shipment was handed to the carrier.",
      timestamp:
        shipment?.shippedAt ??
        order.createdAt,
      completed: Boolean(shipped),
    },
    {
      id: `${order.id}-transit`,
      title: "In transit",
      description:
        "The package is moving through the carrier network.",
      timestamp:
        shipment?.shippedAt ??
        order.createdAt,
      completed: Boolean(inTransit),
    },
    {
      id: `${order.id}-delivered`,
      title: "Delivered",
      description:
        "The package was delivered successfully.",
      timestamp:
        shipment?.deliveredAt ??
        order.createdAt,
      completed: Boolean(delivered),
    },
  ];
}

function formatDate(
  value: string,
  locale: "ar" | "en",
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale === "ar"
      ? "ar-SA"
      : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
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
  const params =
    useParams<{
      id: string;
    }>();
  const orderId =
    params?.id ?? "";

  const locale =
    useLocalizationStore(
      (state) => state.locale,
    );

  const [order, setOrder] =
    useState<BackendOrder | null>(
      null,
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    void getMyOrder(orderId)
      .then((result) => {
        if (!cancelled) {
          setOrder(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Order could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading order…
            </p>
          </div>
        </main>
      </AppShell>
    );
  }

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
              {error || "This order could not be found."}
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

  const shipment =
    shipmentFor(order);
  const progress =
    progressFor(order);
  const timeline =
    timelineFor(order);

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
                  <span dir="ltr">{order.id}</span>
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Track your delivery from this page.
                </p>
              </div>

              <LocalizedPrice
                amountUSD={
                  Number(
                    order.totalAmount,
                  )
                }
                currency={
                  order.currency ??
                  "USD"
                }
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
                        {shipment?.carrier ??
                          "Carrier not assigned"}
                        {shipment?.trackingNumber
                          ? ` · ${shipment.trackingNumber}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                    {shipment?.status ??
                      order.status}
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
                      {timeline.length} tracking steps
                    </span>
                  </div>

                  <div className="mt-5">
                    {timeline.map(
                      (event, index) => (
                        <div
                          key={event.id}
                          className="relative flex gap-4"
                        >
                          {index <
                            timeline.length -
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
                                {formatDate(
                                  event.timestamp,
                                  locale,
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {event.description}
                            </p>

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
                        shipment?.carrier ??
                        "Not assigned"
                      }
                    />
                    <Info
                      label="Tracking"
                      value={
                        shipment?.trackingNumber ??
                        "Not assigned"
                      }
                    />
                    <Info
                      label="Delivery"
                      value={
                        shipment?.estimatedDeliveryDate
                          ? formatDate(
                              shipment.estimatedDeliveryDate,
                              locale,
                            )
                          : "To be confirmed after shipping"
                      }
                    />
                    <Info
                      label="Last updated"
                      value={formatDate(
                        shipment?.deliveredAt ??
                          shipment?.shippedAt ??
                          order.createdAt,
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
                      {order.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              {order.items.length > 0 && (
                <div className="border-t border-slate-100 p-5">
                  <h2 className="text-sm font-black text-slate-900">
                    Items
                  </h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <span className="min-w-0 truncate text-xs font-bold text-slate-700">
                            {item.productName}
                            {" × "}
                            {item.quantity}
                          </span>
                          <LocalizedPrice
                            amountUSD={
                              Number(
                                item.subTotal,
                              )
                            }
                            currency={
                              order.currency ??
                              "USD"
                            }
                            className="shrink-0 text-xs font-black text-slate-900"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
