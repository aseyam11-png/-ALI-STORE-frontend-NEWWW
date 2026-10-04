"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useSession } from "@/features/auth/session";
import {
  getOrders,
  type BackendOrder,
} from "@/features/orders/services/order.service";

function aggregateShipmentStatus(order: BackendOrder): string {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (order.status === "FULFILLMENT_FAILED") return "FULFILLMENT_FAILED";

  const statuses = order.shipments.map((shipment) => shipment.status);
  if (statuses.length === 0) return order.status;
  if (statuses.every((status) => status === "DELIVERED")) return "DELIVERED";
  if (statuses.some((status) => status === "IN_TRANSIT")) return "IN_TRANSIT";
  if (statuses.some((status) => status === "SHIPPED")) return "SHIPPED";
  return "PROCESSING";
}

function progressFor(order: BackendOrder) {
  switch (aggregateShipmentStatus(order)) {
    case "PROCESSING":
      return 20;
    case "SHIPPED":
      return 60;
    case "IN_TRANSIT":
      return 75;
    case "DELIVERED":
      return 100;
    default:
      return 0;
  }
}

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

function shipmentStatusLabel(status: string) {
  return {
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    IN_TRANSIT: "قيد التوصيل",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
    FULFILLMENT_FAILED: "فشل التنفيذ",
    PENDING: "بانتظار المعالجة",
  }[status] ?? status;
}

function statusTone(status: BackendOrder["status"]) {
  if (status === "DELIVERED") {
    return "border-success-100 bg-success-surface text-success";
  }
  if (status === "CANCELLED" || status === "FULFILLMENT_FAILED") {
    return "border-danger-100 bg-danger-surface text-danger-700";
  }
  return "border-primary-100 bg-primary-50 text-brand";
}

export default function BuyerOrdersPage() {
  const session = useSession();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    let active = true;

    getOrders()
      .then((page) => {
        if (active) setOrders(page.content);
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر تحميل الطلبات.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.status]);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع الطلبات وحالات الشحن والمبالغ من مساحة حسابك."
    >
      {session.status === "loading" ? (
        <section
          className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised sm:p-8"
          aria-busy="true"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded-lg bg-neutral-100" />
            <div className="h-3 w-64 rounded-lg bg-neutral-100" />
            <div className="h-28 rounded-2xl bg-neutral-100" />
          </div>
        </section>
      ) : session.status !== "authenticated" ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-brand">
            <Package className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول لعرض طلباتك
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            سجل الطلبات مرتبط بحسابك ولا يمكن عرضه قبل تسجيل الدخول.
          </p>
          <Link
            href="/login?next=/buyer/orders"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            تسجيل الدخول
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </section>
      ) : loading ? (
        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised sm:p-8" aria-busy="true">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-neutral-100 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-neutral-100" />
                    <div className="h-3 w-48 rounded bg-neutral-100" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-neutral-100" />
                </div>
                <div className="mt-5 h-2 rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        </section>
      ) : error ? (
        <section
          className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center"
          role="alert"
        >
          <p className="text-body-sm font-bold text-danger-700">{error}</p>
          <p className="mt-2 text-caption text-danger-600/80">
            تعذر جلب سجل الطلبات من الخادم حاليًا.
          </p>
        </section>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center shadow-raised sm:p-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-brand">
            <Package className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-h3 font-bold text-foreground">
            لا توجد طلبات حتى الآن
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            عند إتمام شراء حقيقي سيظهر الطلب هنا مع حالته وتفاصيل الشحن.
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            ابدأ التسوق
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const shipmentStatus = aggregateShipmentStatus(order);
            const progress = progressFor(order);

            return (
              <article
                key={order.id}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised transition-all duration-200 ease-brand hover:border-neutral-300 hover:shadow-floating"
              >
                <div className="border-b border-neutral-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body-sm font-bold text-foreground">
                          طلب <span dir="ltr">#{order.id}</span>
                        </p>

                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-label font-bold " +
                            statusTone(order.status)
                          }
                        >
                          {statusLabel(order.status)}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-label font-bold text-muted-foreground">
                          <Truck className="h-3 w-3" aria-hidden="true" />
                          {shipmentStatusLabel(shipmentStatus)}
                        </span>
                      </div>

                      <p className="mt-2 text-caption text-muted-foreground">
                        تاريخ الطلب:{" "}
                        <span dir="ltr">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ar-PS",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-50 px-3 py-2 sm:text-end">
                      <p className="text-label font-bold text-muted-foreground">الإجمالي</p>
                      <LocalizedPrice
                        amountUSD={Number(order.totalAmount)}
                        currency={order.currency}
                        className="mt-0.5 text-h4 font-bold text-foreground"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-body-sm font-bold text-foreground">
                        <Clock3 className="h-4 w-4 text-brand" aria-hidden="true" />
                        تقدّم الطلب
                      </div>
                      <span className="text-body-sm font-bold text-brand">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500 ease-brand"
                        style={{ width: progress + "%" }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                      <span>تجهيز</span>
                      <span>شحن</span>
                      <span>توصيل</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
                        <Truck className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-caption font-bold text-muted-foreground">
                          {order.shipments.length === 0
                            ? "لم يتم إنشاء شحنة بعد"
                            : order.shipments.length === 1
                              ? "شحنة واحدة مرتبطة بالطلب"
                              : order.shipments.length + " شحنات مرتبطة بالطلب"}
                        </p>
                        {order.shipments.some((shipment) => shipment.trackingNumber) && (
                          <p className="mt-1 text-body-sm font-bold text-foreground">
                            رقم تتبع متاح لشحنة أو أكثر
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={"/buyer/orders/" + order.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-body-sm font-bold text-foreground transition-all duration-200 ease-brand hover:border-primary-200 hover:text-brand"
                    >
                      التفاصيل
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-5 flex gap-2 overflow-x-auto scroll-surface pb-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex min-w-0 shrink-0 items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                        <span className="max-w-[220px] truncate text-caption font-bold text-foreground">
                          {item.productName}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AccountWorkspace>
  );
}
