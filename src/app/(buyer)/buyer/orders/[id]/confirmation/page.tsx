"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  getBackendPaymentByOrderId,
  type BackendPayment,
} from "@/features/commerce/services/checkout-api.service";
import { getOrder, type BackendOrder } from "@/features/orders/services/order.service";

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
      return "الدفع قيد المراجعة";
    default:
      return "لم يتم تسجيل دفعة";
  }
}

function paymentTone(payment: BackendPayment | null): string {
  switch (payment?.status) {
    case "COMPLETED":
    case "REFUNDED":
      return "border-success-100 bg-success-surface text-success-700";
    case "FAILED":
      return "border-danger-100 bg-danger-surface text-danger-700";
    default:
      return "border-warning-100 bg-warning-surface text-warning-700";
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
      <AccountWorkspace
        activeTab="orders"
        title="تأكيد الطلب"
        description="جارٍ تحميل حالة طلبك."
      >
        <div className="space-y-5">
          <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      </AccountWorkspace>
    );
  }

  if (error || !order) {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="تأكيد الطلب"
        description="تعذر تحميل معلومات الطلب."
      >
        <section className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-danger-600" aria-hidden="true" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            تعذر تحميل تأكيد الطلب
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-body-sm leading-6 text-muted-foreground">
            {error || "هذا الطلب غير متاح لحسابك حاليًا."}
          </p>
          <Link
            href="/buyer/orders"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-medium text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            العودة إلى طلباتي
          </Link>
        </section>
      </AccountWorkspace>
    );
  }

  const paymentSucceeded = payment?.status === "COMPLETED";
  const codPending =
    payment?.method === "CASH_ON_DELIVERY" &&
    payment?.status === "PENDING";
  const paymentNeedsAttention = !paymentSucceeded && !codPending;
  const statusDescription = paymentSucceeded
    ? "تم تأكيد الطلب والدفع من الخادم."
    : codPending
      ? "تم إنشاء الطلب وسيتم الدفع عند الاستلام."
      : "تم إنشاء الطلب، وتظهر حالة الدفع الحالية أدناه.";

  return (
    <AccountWorkspace
      activeTab="orders"
      title="تأكيد الطلب"
      description="ملخص واضح لطلبك وحالة الدفع والخطوة التالية."
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className={
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl " +
                (paymentNeedsAttention
                  ? "bg-warning-surface text-warning-700"
                  : "bg-success-surface text-success-700")
              }
            >
              {paymentNeedsAttention ? (
                <AlertCircle className="h-7 w-7" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <span className="text-label font-medium text-brand">
                رقم الطلب
              </span>
              <h2 className="mt-1 text-h2 font-bold tracking-tight text-foreground">
                #{order.id}
              </h2>
              <p className="mt-3 text-body leading-7 text-muted-foreground">
                {statusDescription}
              </p>
            </div>

            <span
              className={
                "ms-auto shrink-0 rounded-full border px-3 py-1.5 text-caption font-bold " +
                paymentTone(payment)
              }
            >
              {paymentLabel(payment)}
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="text-h3 font-bold text-foreground">المنتجات</h2>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {order.items.length} منتج في هذا الطلب.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body-sm font-bold text-foreground">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        الكمية: {item.quantity}
                      </p>
                    </div>
                    <LocalizedPrice
                      amountUSD={Number(item.subTotal)}
                      currency={order.currency}
                      className="shrink-0 text-body-sm font-bold text-foreground"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="text-h3 font-bold text-foreground">الخطوة التالية</h2>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {paymentNeedsAttention
                      ? "راجع حالة الدفع قبل إنشاء أي محاولة جديدة."
                      : "يمكنك تتبع طلبك أو العودة إلى التسوق."}
                  </p>
                </div>
              </div>

              {payment?.status === "FAILED" ? (
                <div className="mt-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm leading-6 text-danger-700">
                  تعذر إتمام محاولة الدفع الحالية. احتفظ بهذا الطلب ولا تنشئ طلبًا مكررًا.
                </div>
              ) : null}

              {payment?.status === "REQUIRES_RECONCILIATION" ? (
                <div className="mt-5 rounded-xl border border-warning-100 bg-warning-surface p-4 text-body-sm leading-6 text-warning-700">
                  حالة الدفع قيد المراجعة. احتفظ بهذا الطلب حتى يتم تحديث الحالة.
                </div>
              ) : null}
            </section>
          </div>

          <aside className="h-fit space-y-5 xl:sticky xl:top-24">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-brand" aria-hidden="true" />
                <h2 className="text-h3 font-bold text-foreground">ملخص الدفع</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">إجمالي الطلب</span>
                  <LocalizedPrice
                    amountUSD={Number(order.totalAmount)}
                    currency={order.currency}
                    className="font-bold text-foreground"
                  />
                </div>

                {Number(order.discountAmount) > 0 ? (
                  <div className="flex justify-between text-body-sm">
                    <span className="inline-flex items-center gap-1.5 text-success-700">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                      الخصم
                    </span>
                    <LocalizedPrice
                      amountUSD={-Number(order.discountAmount)}
                      currency={order.currency}
                      className="font-bold text-success-700"
                    />
                  </div>
                ) : null}

                <div className="border-t border-neutral-100 pt-4">
                  <p className="text-label font-medium text-neutral-400">الحالة</p>
                  <p className="mt-1 text-body-sm font-bold text-foreground">
                    {paymentLabel(payment)}
                  </p>
                </div>
              </div>
            </section>

            <Link
              href={`/buyer/orders/${order.id}`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-body-sm font-medium text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              تتبع الطلب
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>

            <Link
              href="/shop/products"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-surface text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              متابعة التسوق
            </Link>
          </aside>
        </div>
      </div>
    </AccountWorkspace>
  );
}
