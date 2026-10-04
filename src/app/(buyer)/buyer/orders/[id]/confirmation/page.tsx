"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Package,
  Tag,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  getBackendPaymentByOrderId,
  type BackendPayment,
} from "@/features/commerce/services/checkout-api.service";
import {
  getOrder,
  type BackendOrder,
} from "@/features/orders/services/order.service";

function paymentLabel(payment: BackendPayment | null): string {
  switch (payment?.status) {
    case "COMPLETED":
      return "تم تأكيد الدفع";
    case "PENDING":
      return "الدفع قيد الانتظار";
    case "FAILED":
      return "فشل الدفع";
    case "REFUND_PENDING":
      return "الاسترداد قيد المعالجة";
    case "REFUNDED":
      return "تم رد المبلغ";
    case "REQUIRES_RECONCILIATION":
      return "يتطلب تسوية";
    default:
      return "لم يتم تسجيل دفعة";
  }
}

function paymentClass(payment: BackendPayment | null): string {
  switch (payment?.status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "FAILED":
    case "REFUNDED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [payment, setPayment] = useState<BackendPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getOrder(orderId),
      getBackendPaymentByOrderId(orderId),
    ])
      .then(([nextOrder, nextPayment]) => {
        if (!active) return;
        setOrder(nextOrder);
        setPayment(nextPayment);
      })
      .catch((caughtError: unknown) => {
        if (!active) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "تعذر تحميل تأكيد الطلب.",
        );
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
        <main className="min-h-screen bg-[#F8FAFC] p-8">
          <div className="mx-auto h-96 max-w-[1200px] animate-pulse rounded-3xl bg-white" />
        </main>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#F8FAFC]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <h1 className="mt-5 text-2xl font-black text-slate-900">
              تعذر العثور على الطلب
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || "هذا الطلب غير متاح لحسابك."}
            </p>
            <Link
              href="/buyer/orders"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              طلباتي
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const paymentText = paymentLabel(payment);
  const paymentSucceeded = payment?.status === "COMPLETED";
  const codPending =
    payment?.method === "CASH_ON_DELIVERY" &&
    payment?.status === "PENDING";

  const paymentNeedsAttention =
    !paymentSucceeded && !codPending;

  const statusTitle =
    paymentSucceeded
      ? "Order confirmed"
      : codPending
        ? "Order confirmed — payment due on delivery"
        : "Order created — payment needs attention";

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
              <div
                className={
                  "flex h-14 w-14 items-center justify-center rounded-2xl " +
                  (paymentNeedsAttention
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-[#2563EB]")
                }
              >
                {paymentNeedsAttention ? (
                  <AlertCircle className="h-8 w-8" />
                ) : (
                  <CheckCircle2 className="h-8 w-8" />
                )}
              </div>
              <div>
                <p
                  className={
                    "text-[10px] font-black uppercase tracking-[0.18em] " +
                    (paymentNeedsAttention
                      ? "text-amber-700"
                      : "text-blue-600")
                  }
                >
                  {statusTitle}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">
                  Order #{order.id}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {paymentSucceeded
                    ? "Your order and payment have been confirmed by the server."
                    : codPending
                      ? "Your order is confirmed and payment is due on delivery."
                      : "Your order exists on the server and its payment status is shown below."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      Order number
                    </p>
                    <p className="mt-1 text-xl font-black text-[#0F2747]">
                      #{order.id}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black ${paymentClass(
                      payment,
                    )}`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {paymentText}
                  </span>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#2563EB]" />
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
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <LocalizedPrice
                        amountUSD={Number(item.subTotal)}
                        currency={order.currency}
                        className="shrink-0 text-xs font-black text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit space-y-5 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#2563EB]" />
                  <h2 className="text-lg font-black text-slate-900">
                    Payment summary
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Order total</span>
                    <LocalizedPrice
                      amountUSD={Number(order.totalAmount)}
                      currency={order.currency}
                      className="font-bold text-slate-800"
                    />
                  </div>

                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <Tag className="h-3.5 w-3.5" />
                        Coupon discount
                      </span>
                      <LocalizedPrice
                        amountUSD={-Number(order.discountAmount)}
                        currency={order.currency}
                        className="font-black text-emerald-600"
                      />
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-500">
                    Order lifecycle: {order.status}
                  </div>

                  <div
                    className={
                      "rounded-xl p-3 text-xs leading-5 " +
                      (paymentNeedsAttention
                        ? "border border-amber-200 bg-amber-50 text-amber-800"
                        : "bg-slate-50 text-slate-600")
                    }
                  >
                    {payment ? (
                      <>
                        <p>
                          Payment #{payment.id}: {payment.status}
                        </p>
                        {payment.status === "REQUIRES_RECONCILIATION" && (
                          <p className="mt-2 font-bold">
                            The server preserved this payment attempt for reconciliation.
                            Do not create a duplicate order.
                          </p>
                        )}
                        {payment.status === "FAILED" && (
                          <p className="mt-2 font-bold">
                            This payment attempt failed. The existing order remains
                            the authoritative checkout record.
                          </p>
                        )}
                      </>
                    ) : (
                      "No payment record is available for this order."
                    )}
                  </div>
                </div>
              </section>

              <Link
                href={`/buyer/orders/${order.id}`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white"
              >
                Track this order
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
