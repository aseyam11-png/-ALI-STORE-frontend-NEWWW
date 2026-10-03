"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { useSession } from "@/features/auth/session";
import {
  getBackendOrder,
  type BackendOrder,
} from "@/features/orders/services/order-api.service";
import {
  getBackendPaymentByOrderId,
  type PaymentStatus,
} from "@/features/payments/services/payment-api.service";

function aggregateShipmentStatus(order: BackendOrder): string {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (order.status === "FULFILLMENT_FAILED") return "FULFILLMENT_FAILED";

  const statuses = order.shipments.map((shipment) => shipment.status);
  if (statuses.length === 0) return order.status;
  if (statuses.every((status) => status === "DELIVERED")) return "DELIVERED";
  if (statuses.some((status) => status === "OUT_FOR_DELIVERY")) return "OUT_FOR_DELIVERY";
  if (statuses.some((status) => status === "IN_TRANSIT")) return "IN_TRANSIT";
  if (statuses.some((status) => status === "SHIPPED")) return "SHIPPED";
  if (statuses.some((status) => status === "PACKED")) return "PACKED";
  return "PROCESSING";
}

function progressFor(order: BackendOrder): number {
  switch (aggregateShipmentStatus(order)) {
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

function paymentLabel(status?: PaymentStatus | null): string {
  switch (status) {
    case "COMPLETED":
      return "تم تأكيد الدفع";
    case "PENDING":
      return "الدفع قيد الانتظار";
    case "FAILED":
      return "فشل الدفع";
    case "REFUND_PENDING":
      return "استرداد قيد المعالجة";
    case "REFUNDED":
      return "تم رد المبلغ";
    case "REQUIRES_RECONCILIATION":
      return "يتطلب تسوية";
    default:
      return "لم يتم تسجيل دفعة";
  }
}

export default function BuyerOrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const session = useSession();

  const orderQuery = useQuery({
    queryKey: ["buyer-order", orderId],
    queryFn: () => getBackendOrder(orderId),
    enabled: session.status === "authenticated" && Boolean(orderId),
    refetchInterval: 30_000,
  });

  const paymentQuery = useQuery({
    queryKey: ["buyer-payment", orderId],
    queryFn: () => getBackendPaymentByOrderId(orderId),
    enabled: session.status === "authenticated" && Boolean(orderId),
    retry: false,
    refetchInterval: 30_000,
  });

  if (session.status === "loading" || orderQuery.isPending) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC] p-8">
          <div className="mx-auto h-96 max-w-[1200px] animate-pulse rounded-3xl bg-white" />
        </main>
      </AppShell>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-[#2563EB]" />
              <h1 className="mt-5 text-3xl font-black text-[#0F172A]">
                سجّل الدخول لعرض الطلب
              </h1>
              <Link
                href="/login"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-black text-white"
              >
                تسجيل الدخول
              </Link>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Order not found
            </h1>
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

  const order = orderQuery.data;
  const shipmentStatus = aggregateShipmentStatus(order);
  const progress = progressFor(order);
  const payment = paymentQuery.data;

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
              </div>

              <LocalizedPrice
                amountUSD={Number(order.totalAmount)}
                currency={order.currency}
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
                        {order.shipments.length === 0
                          ? "No shipment assigned yet"
                          : `${order.shipments.length} shipment(s)`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {shipmentStatus}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                    {shipmentStatus}
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
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-7 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Shipments
                  </h2>

                  <div className="mt-5 space-y-4">
                    {order.shipments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                        Supplier fulfillment has not produced a shipment yet.
                      </div>
                    ) : (
                      order.shipments.map((shipment) => (
                        <article
                          key={shipment.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">
                                Shipment #{shipment.id}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {shipment.status}
                              </p>
                            </div>

                            <p className="text-[10px] font-mono text-slate-400">
                              {shipment.trackingNumber ?? "Tracking pending"}
                            </p>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Carrier
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-700">
                                {shipment.carrier ?? "Not assigned"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Estimated delivery
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-700">
                                {shipment.estimatedDeliveryDate ?? "Pending"}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <aside className="h-fit rounded-2xl bg-slate-50 p-5">
                  <h2 className="text-sm font-black text-slate-900">
                    Order details
                  </h2>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Payment
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {paymentLabel(payment?.status)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Coupon
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {order.couponCode ?? "None"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Discount
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        <LocalizedPrice
                          amountUSD={Number(order.discountAmount ?? 0)}
                          currency={order.currency}
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Shipping address
                      </p>
                      <p className="mt-1 text-xs leading-5 font-bold text-slate-700">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="border-t border-slate-100 p-5">
                <h2 className="text-sm font-black text-slate-900">
                  Items
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2"
                    >
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        {item.productName} × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
