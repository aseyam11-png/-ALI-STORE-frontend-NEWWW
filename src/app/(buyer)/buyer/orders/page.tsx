"use client";

import Link from "next/link";
import { useEffect } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useOrderStore } from "@/stores/order-store";

function shipmentProgress(status: string) {
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

// Real data throughout — useOrderStore starts empty and is only ever
// populated by a real local checkout, never seeded with fake orders. Only
// the shell (now AccountWorkspace, was the legacy AppShell) and visual
// language (now tokens + Arabic, matching the rest of the account
// workspace) changed here — order data and progress logic are untouched.
export default function BuyerOrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const loadOrders = useOrderStore((state) => state.loadOrders);

  useEffect(() => {
    void loadOrders().catch(() => undefined);
  }, [loadOrders]);

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع كل طلب وحالة توصيله من مكان واحد."
    >
      {isLoading && orders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <p className="text-body-sm font-medium text-muted-foreground">
            جاري تحميل الطلبات...
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
            const progress = shipmentProgress(order.shipmentStatus);

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
                          {order.paymentStatus === "PAID"
                            ? "تم تأكيد الدفع"
                            : order.paymentStatus}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-label font-medium ${shipmentClass(
                            order.shipmentStatus,
                          )}`}
                        >
                          {SHIPMENT_LABEL_AR[order.shipmentStatus] ??
                            order.shipmentStatus}
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
                        amountUSD={order.grandTotal}
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
                          {order.carrier ?? "لم يتم تحديد شركة الشحن بعد"}
                        </p>

                        {order.trackingNumber && (
                          <p className="mt-2 font-mono text-body-sm font-medium text-foreground">
                            رقم التتبع:{" "}
                            <span dir="ltr">{order.trackingNumber}</span>
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
                          {order.estimatedDelivery}
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
