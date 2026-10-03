"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useSession } from "@/features/auth/session";
import {
  getBackendOrders,
  type BackendOrder,
} from "@/features/orders/services/order-api.service";

function aggregateShipmentStatus(order: BackendOrder): string {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (order.status === "FULFILLMENT_FAILED") return "FULFILLMENT_FAILED";

  const statuses = order.shipments.map((shipment) => shipment.status);
  if (statuses.length === 0) return order.status;

  if (statuses.every((status) => status === "DELIVERED")) return "DELIVERED";
  if (statuses.some((status) => status === "OUT_FOR_DELIVERY")) {
    return "OUT_FOR_DELIVERY";
  }
  if (statuses.some((status) => status === "IN_TRANSIT")) return "IN_TRANSIT";
  if (statuses.some((status) => status === "SHIPPED")) return "SHIPPED";
  if (statuses.some((status) => status === "PACKED")) return "PACKED";
  return "PROCESSING";
}

function shipmentProgress(order: BackendOrder): number {
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

const STATUS_LABEL_AR: Record<string, string> = {
  PENDING: "بانتظار الدفع",
  PROCESSING: "قيد التجهيز",
  PACKED: "تم التغليف",
  SHIPPED: "تم الشحن",
  IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خارج للتوصيل",
  DELIVERED: "تم التوصيل",
  FULFILLMENT_FAILED: "تعذر تنفيذ الشحن",
  CANCELLED: "ملغى",
};

function statusClass(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-success-surface text-success";
    case "FULFILLMENT_FAILED":
    case "CANCELLED":
      return "bg-danger-surface text-danger-600";
    case "SHIPPED":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return "bg-info-surface text-brand";
    default:
      return "bg-warning-surface text-warning";
  }
}

export default function BuyerOrdersPage() {
  const session = useSession();

  const query = useQuery({
    queryKey: ["buyer-orders", session.user?.id],
    queryFn: () => getBackendOrders(0, 50),
    enabled: session.status === "authenticated",
    staleTime: 30_000,
  });

  if (session.status === "loading") {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="طلباتي"
        description="تابع كل طلب وحالة توصيله من مكان واحد."
      >
        <div className="h-72 animate-pulse rounded-md bg-neutral-100" />
      </AccountWorkspace>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="طلباتي"
        description="تابع كل طلب وحالة توصيله من مكان واحد."
      >
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <h2 className="text-h3 font-bold text-foreground">
            سجّل الدخول لعرض طلباتك
          </h2>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body font-medium text-white"
          >
            تسجيل الدخول
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </AccountWorkspace>
    );
  }

  if (query.isPending) {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="طلباتي"
        description="تابع كل طلب وحالة توصيله من مكان واحد."
      >
        <div className="h-72 animate-pulse rounded-md bg-neutral-100" />
      </AccountWorkspace>
    );
  }

  if (query.isError) {
    return (
      <AccountWorkspace
        activeTab="orders"
        title="طلباتي"
        description="تابع كل طلب وحالة توصيله من مكان واحد."
      >
        <div className="rounded-md border border-danger-100 bg-danger-surface p-8 text-center">
          <p className="text-body-sm font-medium text-danger-600">
            تعذر تحميل الطلبات من الخادم.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-brand px-4 text-body-sm font-medium text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      </AccountWorkspace>
    );
  }

  const orders = query.data?.content ?? [];

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع كل طلب وحالة توصيله من مكان واحد."
    >
      {orders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            لا توجد طلبات حتى الآن
          </h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            عند إنشاء طلب حقيقي سيظهر هنا تلقائيًا.
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body font-medium text-white"
          >
            ابدأ التسوق
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipmentStatus = aggregateShipmentStatus(order);
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
                          <span dir="ltr">#{order.id}</span>
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label font-medium ${statusClass(
                            shipmentStatus,
                          )}`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {STATUS_LABEL_AR[shipmentStatus] ?? shipmentStatus}
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
                        amountUSD={Number(order.totalAmount)}
                        currency={order.currency}
                        className="mt-1 text-h4 font-bold text-foreground"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-foreground">
                        تقدّم الشحن
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
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-brand">
                        <Truck className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-caption text-muted-foreground">
                          {order.shipments.length === 0
                            ? "لم يتم إنشاء شحنة بعد"
                            : `${order.shipments.length} شحنة مرتبطة بالطلب`}
                        </p>

                        {order.shipments.some(
                          (shipment) =>
                            shipment.trackingNumber,
                        ) && (
                          <p className="mt-2 text-body-sm font-medium text-foreground">
                            يوجد رقم تتبع محدث لشحنة واحدة أو أكثر
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/buyer/orders/${order.id}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 text-body-sm font-medium text-foreground hover:bg-neutral-100"
                    >
                      تتبّع الطلب
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.id}`}
                        className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2"
                      >
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
