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
  processBackendPayment,
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
      return "الدفع يحتاج مراجعة";
    default:
      return "لم يتم تسجيل دفعة";
  }
}

function paymentClass(payment: BackendPayment | null): string {
  switch (payment?.status) {
    case "COMPLETED":
      return "bg-success-surface text-success-700";
    case "FAILED":
    case "REFUNDED":
      return "bg-danger-surface text-danger-700";
    default:
      return "bg-warning-surface text-warning-700";
  }
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [payment, setPayment] = useState<BackendPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryBusy, setRetryBusy] = useState(false);
  const [retryError, setRetryError] = useState("");

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

  useEffect(() => {
    if (!payment || payment.status !== "PENDING" || payment.method === "CASH_ON_DELIVERY") {
      return;
    }

    let active = true;
    let attempts = 0;

    const poll = window.setInterval(async () => {
      attempts += 1;
      if (attempts > 15 || !active) {
        window.clearInterval(poll);
        return;
      }

      try {
        const nextPayment = await getBackendPaymentByOrderId(orderId);
        if (!active || !nextPayment) return;
        setPayment(nextPayment);

        if (nextPayment.status === "COMPLETED") {
          const nextOrder = await getOrder(orderId);
          if (!active) return;
          setOrder(nextOrder);
          window.clearInterval(poll);
        }
      } catch {
        // Keep the last server-confirmed state visible while the webhook settles.
      }
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, [orderId, payment?.status, payment?.method]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background p-8">
          <div className="mx-auto h-96 max-w-[1200px] animate-pulse rounded-3xl bg-surface" />
        </main>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <Package className="mx-auto h-9 w-9 text-neutral-300" />
            <h1 className="mt-5 text-2xl font-black text-foreground">
              تعذر العثور على الطلب
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {error || "هذا الطلب غير متاح لحسابك."}
            </p>
            <Link
              href="/buyer/orders"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white"
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

  const canRetryPayment =
    payment?.status === "FAILED" &&
    payment.method !== "CASH_ON_DELIVERY";

  const retryPayment = async () => {
    if (!payment || !order || !canRetryPayment || retryBusy) {
      return;
    }

    setRetryBusy(true);
    setRetryError("");

    try {
      const nextPayment = await processBackendPayment({
        orderId: order.id,
        amount: Number(order.totalAmount),
        method: payment.method,
      });

      setPayment(nextPayment);

      if (nextPayment.status === "COMPLETED") {
        const nextOrder = await getOrder(String(order.id));
        setOrder(nextOrder);
      }
    } catch (caughtError) {
      setRetryError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر إعادة محاولة الدفع.",
      );
    } finally {
      setRetryBusy(false);
    }
  };

  const statusTitle =
    paymentSucceeded
      ? "Order confirmed"
      : codPending
        ? "Order confirmed — payment due on delivery"
        : "Order created — payment needs attention";

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/buyer/orders"
              className="inline-flex items-center gap-2 text-xs font-black text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              My orders
            </Link>

            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div
                className={
                  "flex h-14 w-14 items-center justify-center rounded-2xl " +
                  (paymentNeedsAttention
                    ? "bg-warning-surface text-warning-700"
                    : "bg-info-surface text-brand")
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
                      ? "text-warning-700"
                      : "text-brand")
                  }
                >
                  {statusTitle}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                  Order #{order.id}
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
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
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                      Order number
                    </p>
                    <p className="mt-1 text-xl font-black text-brand-ink">
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

              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-brand" />
                  <div>
                    <h2 className="text-lg font-black text-foreground">
                      Order items
                    </h2>
                    <p className="mt-1 text-xs text-neutral-400">
                      {order.items.length} product
                      {order.items.length !== 1 ? "s" : ""} in this order.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-neutral-800">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-[10px] text-neutral-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <LocalizedPrice
                        amountUSD={Number(item.subTotal)}
                        currency={order.currency}
                        className="shrink-0 text-xs font-black text-neutral-700"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit space-y-5 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-black text-foreground">
                    Payment summary
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Order total</span>
                    <LocalizedPrice
                      amountUSD={Number(order.totalAmount)}
                      currency={order.currency}
                      className="font-bold text-neutral-800"
                    />
                  </div>

                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="inline-flex items-center gap-1 font-bold text-success-600">
                        <Tag className="h-3.5 w-3.5" />
                        Coupon discount
                      </span>
                      <LocalizedPrice
                        amountUSD={-Number(order.discountAmount)}
                        currency={order.currency}
                        className="font-black text-success-600"
                      />
                    </div>
                  )}

                  <div
                    className={
                      "rounded-xl p-3 text-xs leading-5 " +
                      (paymentNeedsAttention
                        ? "border border-warning-100 bg-warning-surface text-warning-800"
                        : "bg-neutral-50 text-neutral-600")
                    }
                  >
                    {payment ? (
                      paymentNeedsAttention ? (
                        <>
                          <p className="font-bold">
                            تعذر تأكيد الدفع في هذه المحاولة.
                          </p>
                          <p className="mt-2">
                            طلبك محفوظ لدينا. لا تنشئ طلبًا ثانيًا، وراجع حالة الطلب من صفحة طلباتك.
                          </p>
                          {canRetryPayment ? (
                            <button
                              type="button"
                              onClick={() => void retryPayment()}
                              disabled={retryBusy}
                              aria-busy={retryBusy}
                              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand px-4 text-xs font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                            >
                              {retryBusy ? "جارٍ إعادة المحاولة…" : "إعادة محاولة الدفع"}
                            </button>
                          ) : null}
                          {retryError ? (
                            <p role="alert" className="mt-2 text-[11px] font-bold text-danger-700">
                              {retryError}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p>تم حفظ حالة الدفع المرتبطة بهذا الطلب على الخادم.</p>
                      )
                    ) : (
                      "لا توجد معلومات دفع متاحة لهذا الطلب حاليًا."
                    )}
                  </div>
                </div>
              </section>

              <Link
                href={`/buyer/orders/${order.id}`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white"
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
