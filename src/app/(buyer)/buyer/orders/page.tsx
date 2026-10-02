"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { listMyOrders } from "@/features/orders/services/order.service";
import type { BackendOrder } from "@/lib/api/contracts";

function getShipment(order: BackendOrder) {
  return [...order.shipments].sort(
    (a, b) => {
      const rank = (status: string) =>
        ({
          PENDING: 0,
          SHIPPED: 2,
          IN_TRANSIT: 3,
          DELIVERED: 4,
          CANCELLED: -1,
        })[status] ?? 1;

      return rank(b.status) - rank(a.status);
    },
  )[0];
}

function shipmentProgress(order: BackendOrder) {
  const shipment = getShipment(order);

  switch (shipment?.status) {
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

function paymentLabel(order: BackendOrder) {
  switch (order.status) {
    case "CANCELLED":
      return "ملغى";
    case "PENDING":
      return "بانتظار التأكيد";
    default:
      return "تم تأكيد الدفع";
  }
}

function shipmentClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-success-surface text-success";

    case "IN_TRANSIT":
    case "SHIPPED":
      return "bg-info-surface text-brand";

    default:
      return "bg-warning-surface text-warning";
  }
}

const SHIPMENT_LABEL_AR: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد التجهيز",
  PACKED: "تم التغليف",
  SHIPPED: "تم الشحن",
  IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خارج للتوصيل",
  DELIVERED: "تم التوصيل",
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void listMyOrders(0, 50)
      .then((page) => {
        if (!cancelled) setOrders(page.content);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "تعذر تحميل الطلبات.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع كل طلب وحالة توصيله من مكان واحد."
    >
      {loading ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <p className="text-body-sm font-medium text-muted-foreground">
            جاري تحميل الطلبات…
          </p>
        </div>
      ) : error ? (
        <div className="rounded-md border border-danger-100 bg-danger-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-danger-500" />
          <h2 className="mt-4 text-h3 font-bold text-danger-700">
            تعذر تحميل الطلبات
          </h2>
          <p className="mt-2 text-body-sm text-danger-600">
            {error}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />

          <h2 className="mt-4 text-h3 font-bold text-foreground">
            لا توجد طلبات حتى الآن
          </h2>

          <p className="mt-2 text-body-sm text-muted-foreground">
            طلباتك المكتملة ستظهر هنا.
          </p>

          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover"
          >
            ابدأ التسوق
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipment = getShipment(order);
            const progress = shipmentProgress(order);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-md border border-neutral-200 bg-surface"
              >
                <div className="border-b border-neutral-100 p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body-sm font-medium text-foreground">
                          <span dir="ltr">{order.id}</span>
                        </p>

                        <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-2.5 py-1 text-label font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          {paymentLabel(order)}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-label font-medium ${shipmentClass(
                            shipment?.status ?? order.status,
                          )}`}
                        >
                          {shipment?.status === "IN_TRANSIT"
                            ? "في الطريق"
                            : shipment?.status === "DELIVERED"
                              ? "تم التوصيل"
                              : shipment?.status === "SHIPPED"
                                ? "تم الشحن"
                                : order.status === "CANCELLED"
                                  ? "ملغى"
                                  : "قيد المعالجة"}
                        </span>
                      </div>

                      <p className="mt-2 text-caption text-muted-foreground">
                        تاريخ الطلب:{" "}
                        <span dir="ltr">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="text-end">
                      <p className="text-caption text-muted-foreground">
                        إجمالي الطلب
                      </p>

                      <LocalizedPrice
                        amountUSD={order.totalAmount}
                        currency={order.currency ?? "USD"}
                        className="mt-1 text-h4 font-bold text-foreground"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-foreground">
                        تقدّم التوصيل
                      </span>

                      <span className="text-body-sm font-medium text-brand">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-brand">
                        <Truck className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-caption text-muted-foreground">
                          {shipment?.carrier ?? "لم يتم تحديد شركة الشحن بعد"}
                        </p>

                        {shipment?.trackingNumber && (
                          <p className="mt-2 font-mono text-body-sm font-medium text-foreground">
                            رقم التتبع:{" "}
                            <span dir="ltr">{shipment.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 xl:justify-end">
                      <div className="text-end">
                        <p className="text-label font-medium uppercase tracking-wide text-muted-foreground">
                          التوصيل المتوقع
                        </p>

                        <p className="mt-1 text-body-sm font-medium text-foreground">
                          {shipment?.estimatedDeliveryDate
                            ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA")
                            : "سيتم تحديد الموعد بعد الشحن"}
                        </p>
                      </div>

                      <Link
                        href={`/buyer/orders/${order.id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-4 text-body-sm font-medium text-foreground transition-colors duration-200 ease-brand hover:bg-neutral-100"
                      >
                        تتبّع
                        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2"
                      >
                        <Package className="h-3.5 w-3.5 text-neutral-400" />

                        <span className="max-w-xs truncate text-caption font-medium text-foreground">
                          {item.name} — {item.quantity}
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
