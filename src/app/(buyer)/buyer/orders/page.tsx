"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getOrders, type BackendOrder } from "@/features/orders/services/order.service";

function aggregateShipmentStatus(order: BackendOrder): string {
  if (order.status === "CANCELLED") return "CANCELLED";

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

function shipmentStatusLabel(status: ReturnType<typeof aggregateShipmentStatus>) {
  return {
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    IN_TRANSIT: "في الطريق",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  }[status] ?? status;
}

function statusLabel(status: BackendOrder["status"]) {
  return {
    PENDING: "بانتظار الدفع",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  }[status];
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
      description="تابع كل طلب وحالة توصيله من مكان واحد."
    >
      {session.status === "loading" ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center text-body-sm text-muted-foreground">
          جارٍ التحقق من الجلسة...
        </div>
      ) : session.status !== "authenticated" ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول لعرض طلباتك
          </h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            سجل الطلبات مرتبط بحسابك ولا يمكن عرضه قبل تسجيل الدخول.
          </p>
          <Link
            href="/login?next=/buyer/orders"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-6 text-body font-medium text-white hover:bg-brand-hover"
          >
            تسجيل الدخول
          </Link>
        </div>
      ) : loading ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center text-body-sm text-muted-foreground">
          جارٍ تحميل الطلبات...
        </div>
      ) : error ? (
        <div className="rounded-md border border-danger-100 bg-danger-surface p-10 text-center">
          <p className="text-body-sm font-medium text-danger-600">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            لا توجد طلبات حتى الآن
          </h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            طلباتك ستظهر هنا بعد إتمام الشراء.
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body font-medium text-white hover:bg-brand-hover"
          >
            ابدأ التسوق
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipmentStatus = aggregateShipmentStatus(order);
            const progress = progressFor(order);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-md border border-neutral-200 bg-surface"
              >
                <div className="border-b border-neutral-100 bg-neutral-50/60 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body-sm font-medium text-foreground">
                          طلب <span dir="ltr">#{order.id}</span>
                        </p>
                        <span className="rounded-full bg-info-surface px-2.5 py-1 text-label font-medium text-brand">
                          {statusLabel(order.status)}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-label font-medium text-muted-foreground">
                          {shipmentStatusLabel(shipmentStatus)}
                        </span>
                      </div>
                      <p className="mt-2 text-caption text-muted-foreground">
                        تاريخ الطلب:{" "}
                        <span dir="ltr">
                          {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                      </p>
                    </div>

                    <LocalizedPrice
                      amountUSD={Number(order.totalAmount)}
                      currency={order.currency}
                      className="text-h4 font-bold text-foreground"
                    />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-foreground">
                        تقدّم الطلب
                      </span>
                      <span className="text-body-sm font-medium text-brand">
                        {progress}%
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full rounded-full bg-brand transition-all duration-500 ease-brand" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand ring-1 ring-primary-100">
                        <Truck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-caption text-muted-foreground">
                          {order.shipments.length === 0
                            ? "لم يتم إنشاء شحنة بعد"
                            : `${order.shipments.length} شحنة مرتبطة بالطلب`}
                        </p>
                        {order.shipments.some((shipment) => shipment.trackingNumber) && (
                          <p className="mt-2 font-mono text-body-sm font-medium text-foreground">
                            يوجد رقم تتبع محدث لشحنة أو أكثر
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/buyer/orders/${order.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-foreground transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
                    >
                      التفاصيل
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                        <Package className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="max-w-xs truncate text-caption font-medium text-foreground">
                          {item.productName} — {item.quantity}
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