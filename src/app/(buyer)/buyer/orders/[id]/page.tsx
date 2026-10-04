"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin, Package, Truck } from "lucide-react";
import { useParams } from "next/navigation";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getOrder, type BackendOrder, type BackendShipment } from "@/features/orders/services/order.service";

function orderStatusLabel(status: BackendOrder["status"]) {
  switch (status) {
    case "PENDING":
      return "بانتظار الدفع";
    case "PROCESSING":
      return "قيد التجهيز";
    case "SHIPPED":
      return "تم الشحن";
    case "DELIVERED":
      return "تم التوصيل";
    case "CANCELLED":
      return "ملغي";
    case "FULFILLMENT_FAILED":
      return "تعذر تنفيذ الطلب";
  }
}

function shipmentStatusLabel(status: BackendShipment["status"]) {
  switch (status) {
    case "PENDING":
      return "بانتظار التنفيذ";
    case "PROCESSING":
      return "قيد التجهيز";
    case "SHIPPED":
      return "تم الشحن";
    case "IN_TRANSIT":
      return "في الطريق";
    case "DELIVERED":
      return "تم التوصيل";
    case "CANCELLED":
      return "ملغي";
  }
}

type TrackingStep = {
  label: string;
  complete: boolean;
  current: boolean;
};

function getTrackingSteps(order: BackendOrder): TrackingStep[] {
  const hasInTransit = order.shipments.some(
    (shipment) => shipment.status === "IN_TRANSIT",
  );
  const sequence = ["PENDING", "PROCESSING", "SHIPPED", "IN_TRANSIT", "DELIVERED"] as const;

  const activeKey =
    hasInTransit
      ? "IN_TRANSIT"
      : order.status === "PENDING" ||
          order.status === "PROCESSING" ||
          order.status === "SHIPPED" ||
          order.status === "DELIVERED"
        ? order.status
        : undefined;

  let activeIndex = activeKey
    ? sequence.indexOf(activeKey)
    : -1;

  if (activeIndex < 0 && order.status === "CANCELLED") activeIndex = 0;
  if (activeIndex < 0 && order.status === "FULFILLMENT_FAILED") activeIndex = 1;

  return [
    "تم استلام الطلب",
    "قيد التجهيز",
    "تم الشحن",
    "في الطريق",
    "تم التوصيل",
  ].map((label, index) => ({
    label,
    complete: activeIndex > index || order.status === "DELIVERED",
    current: activeIndex === index && order.status !== "CANCELLED" && order.status !== "FULFILLMENT_FAILED",
  }));
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
      <AccountWorkspace
        activeTab="orders"
        title="تفاصيل الطلب"
        description="جارٍ تحميل تفاصيل طلبك من الخادم."
      >
        <div className="space-y-5">
          <div className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      </AccountWorkspace>
    );
  }

  if (error || !order) {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="تفاصيل الطلب"
        description="تعذر الوصول إلى هذا الطلب."
      >
        <section className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <Package className="mx-auto h-8 w-8 text-danger-600" aria-hidden="true" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            تعذر العثور على الطلب
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

  const trackingSteps = getTrackingSteps(order);
  const failed = order.status === "CANCELLED" || order.status === "FULFILLMENT_FAILED";

  return (
    <AccountWorkspace
      activeTab="orders"
      title={`طلب #${order.id}`}
      description="تابع حالة طلبك وشحنتك وراجع تفاصيل المنتجات والدفع."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-brand hover:text-brand-hover"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            العودة إلى الطلبات
          </Link>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-caption font-bold text-brand">
            {orderStatusLabel(order.status)}
          </span>
        </div>

        {failed ? (
          <section className="rounded-2xl border border-danger-100 bg-danger-surface p-5">
            <p className="text-body-sm font-bold text-danger-700">
              {order.status === "CANCELLED"
                ? "تم إلغاء هذا الطلب."
                : "تعذر تنفيذ هذا الطلب. راجع الدعم عند الحاجة."}
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label font-medium text-neutral-400">حالة الطلب</p>
                <h2 className="mt-1 text-h3 font-bold text-foreground">
                  {orderStatusLabel(order.status)}
                </h2>
              </div>
              <Truck className="h-6 w-6 text-brand" aria-hidden="true" />
            </div>

            <div className="mt-7 overflow-x-auto px-1 pb-2 scroll-surface">
              <div className="grid min-w-[680px] grid-cols-5 gap-2 sm:min-w-0">
              {trackingSteps.map((step, index) => (
                <div key={step.label} className="min-w-0">
                  <div className="flex items-center">
                    <span
                      className={
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-bold " +
                        (step.complete || step.current
                          ? "bg-brand text-white"
                          : "bg-neutral-100 text-neutral-400")
                      }
                      aria-current={step.current ? "step" : undefined}
                    >
                      {step.complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                    </span>
                    {index < trackingSteps.length - 1 ? (
                      <span
                        className={
                          "mx-2 hidden h-px flex-1 sm:block " +
                          (step.complete ? "bg-brand" : "bg-neutral-200")
                        }
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <p
                    className={
                      "mt-2 text-label leading-4 " +
                      (step.current ? "font-bold text-brand" : "text-neutral-500")
                    }
                  >
                    {step.label}
                  </p>
                </div>
              ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="text-h3 font-bold text-foreground">الشحن والتتبع</h2>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    تظهر بيانات الشحنة الفعلية عندما يوفرها النظام.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.shipments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-body-sm text-muted-foreground">
                    لم يتم إنشاء شحنة بعد.
                  </div>
                ) : (
                  order.shipments.map((shipment) => (
                    <article
                      key={shipment.id}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-body-sm font-bold text-foreground">
                            الشحنة #{shipment.id}
                          </p>
                          <p className="mt-1 text-caption font-medium text-brand">
                            {shipmentStatusLabel(shipment.status)}
                          </p>
                        </div>
                        {shipment.trackingNumber ? (
                          <p className="font-mono text-caption text-neutral-500" dir="ltr">
                            {shipment.trackingNumber}
                          </p>
                        ) : (
                          <span className="text-caption text-neutral-400">
                            رقم التتبع غير متاح بعد
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-label font-medium text-neutral-400">شركة التوصيل</p>
                          <p className="mt-1 text-body-sm font-medium text-foreground">
                            {shipment.carrier ?? "لم يتم تحديدها بعد"}
                          </p>
                        </div>
                        <div>
                          <p className="text-label font-medium text-neutral-400">موعد التوصيل المتوقع</p>
                          <p className="mt-1 text-body-sm font-medium text-foreground">
                            {shipment.estimatedDeliveryDate
                              ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-PS")
                              : "سيظهر عند توفره"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-brand" aria-hidden="true" />
                <h2 className="text-h3 font-bold text-foreground">المنتجات</h2>
              </div>

              <div className="mt-5 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4"
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
                <MapPin className="h-5 w-5 text-brand" aria-hidden="true" />
                <h2 className="text-h3 font-bold text-foreground">عنوان التوصيل</h2>
              </div>
              <p className="mt-5 rounded-xl bg-neutral-50 p-4 text-body-sm leading-7 text-neutral-700">
                {order.shippingAddress}
              </p>
            </section>
          </div>

          <aside className="h-fit space-y-5 xl:sticky xl:top-24">
            <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">
              <h2 className="text-h3 font-bold text-foreground">ملخص الطلب</h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 text-body-sm">
                  <span className="text-muted-foreground">الخصم</span>
                  <LocalizedPrice
                    amountUSD={Number(order.discountAmount)}
                    currency={order.currency}
                    className="font-bold text-success-700"
                  />
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
                  <span className="text-body-sm font-bold text-neutral-500">الإجمالي</span>
                  <LocalizedPrice
                    amountUSD={Number(order.totalAmount)}
                    currency={order.currency}
                    className="text-2xl font-bold text-brand-ink"
                  />
                </div>
              </div>
            </section>

            <Link
              href={`/buyer/orders/${order.id}/confirmation`}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              عرض تأكيد الطلب
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </AccountWorkspace>
  );
}
