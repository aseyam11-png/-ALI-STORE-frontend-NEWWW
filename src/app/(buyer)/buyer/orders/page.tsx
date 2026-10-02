"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Package, Truck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getBackendOrders } from "@/features/orders/services/order-api.service";

function shipmentProgress(status: string) {
  switch (status) {
    case "PROCESSING": return 20;
    case "PACKED": return 40;
    case "SHIPPED": return 60;
    case "IN_TRANSIT": return 75;
    case "OUT_FOR_DELIVERY": return 90;
    case "DELIVERED": return 100;
    default: return 0;
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

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-success-surface text-success";
  if (status === "SHIPPED" || status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    return "bg-info-surface text-brand";
  }
  return "bg-warning-surface text-warning";
}

export default function BuyerOrdersPage() {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () => getBackendOrders(0, 50),
    staleTime: 15_000,
  });

  const orders = query.data?.content ?? [];

  return (
    <AccountWorkspace
      activeTab="orders"
      title="طلباتي"
      description="تابع كل طلب وحالة توصيله من مكان واحد."
    >
      {query.isPending ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center">
          <h2 className="text-lg font-black text-danger-700">تعذر تحميل الطلبات</h2>
          <p className="mt-2 text-sm text-danger-600">تحقق من جلسة الحساب واتصال الـBackend ثم أعد المحاولة.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <Package className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">لا توجد طلبات حتى الآن</h2>
          <p className="mt-2 text-body-sm text-muted-foreground">ستظهر طلباتك هنا بعد إتمام أول عملية شراء.</p>
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
            const shipment = order.shipments[0];
            const shipmentStatus = shipment?.status ?? order.status;
            const progress = shipmentProgress(shipmentStatus);

            return (
              <article key={order.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
                <div className="border-b border-neutral-100 p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground"><span dir="ltr">#{order.id}</span></p>

                        <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-2.5 py-1 text-label font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          {order.paymentStatus}
                        </span>

                        <span className={`rounded-full px-2.5 py-1 text-label font-medium ${statusClass(shipmentStatus)}`}>
                          {SHIPMENT_LABEL_AR[shipmentStatus] ?? shipmentStatus}
                        </span>
                      </div>

                      <p className="mt-2 text-caption text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-end">
                      <p className="text-caption text-muted-foreground">الإجمالي</p>
                      <LocalizedPrice amountUSD={Number(order.totalAmount)} className="mt-1 text-h4 font-bold text-foreground" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-foreground">تقدّم التوصيل</span>
                      <span className="text-body-sm font-medium text-brand">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-brand transition-all" style={{ width: progress + "%" }} />
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
                            رقم التتبع: <span dir="ltr">{shipment.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 xl:justify-end">
                      <div className="text-end">
                        <p className="text-label font-medium uppercase tracking-wide text-muted-foreground">التوصيل المتوقع</p>
                        <p className="mt-1 text-body-sm font-medium text-foreground">
                          {shipment?.estimatedDeliveryDate ?? "سيتم تحديده بعد تأكيد الشحن"}
                        </p>
                      </div>
                      <Link
                        href={`/buyer/orders/${order.id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-4 text-body-sm font-medium text-foreground hover:bg-neutral-100"
                      >
                        تتبّع
                        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2">
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
