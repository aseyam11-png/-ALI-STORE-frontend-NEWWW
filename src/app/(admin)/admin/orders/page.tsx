"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Truck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { getAdminOrders, updateAdminOrderStatus } from "@/features/admin/orders/services/admin-order-api.service";
import type { BackendOrder } from "@/features/orders/services/order.service";

const statusOptions: BackendOrder["status"][] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function statusTone(status: BackendOrder["status"]) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "SHIPPED") return "brand" as const;
  return "warning" as const;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setOrders((await getAdminOrders(0, 100)).content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminOrders(0, 100)
      .then((page) => {
        if (active) setOrders(page.content);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل الطلبات.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function changeStatus(orderId: number, status: BackendOrder["status"]) {
    setError("");
    try {
      const updated = await updateAdminOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "رفض الخادم انتقال الطلب.");
    }
  }

  const summary = useMemo(() => ({
    total: orders.length,
    processing: orders.filter((order) => order.status === "PROCESSING").length,
    shipped: orders.filter((order) => order.status === "SHIPPED").length,
    needsAttention: orders.filter((order) => order.status === "CANCELLED").length,
  }), [orders]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="الطلبات"
          title="تشغيل الطلبات والشحن"
          description="تحديثات الحالة تمر عبر قواعد الـBackend. الواجهة هنا تتحكم في العرض فقط ولا تعتبر الحالة المحلية مصدر الحقيقة."
          actions={
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              تحديث
            </button>
          }
        />

        <div className="container-shell py-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard icon={Truck} label="إجمالي الطلبات" value={String(summary.total)} detail="الطلبات المعروضة من الخادم" />
            <AdminMetricCard icon={RefreshCcw} label="قيد المعالجة" value={String(summary.processing)} tone="warning" />
            <AdminMetricCard icon={Truck} label="تم الشحن" value={String(summary.shipped)} tone="brand" />
            <AdminMetricCard icon={Truck} label="يحتاج انتباه" value={String(summary.needsAttention)} tone="neutral" detail="الطلبات الملغاة" />
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-h3 font-bold text-foreground">الطلبات الحالية</h2>
                <p className="mt-1 text-caption text-muted-foreground">
                  {orders.length} طلب ضمن الصفحة الحالية
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingRows />
            ) : orders.length === 0 ? (
              <div className="px-6 py-16 text-center text-body-sm text-muted-foreground">
                لا توجد طلبات عملاء حاليًا.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <article key={order.id} className="p-5 transition-colors hover:bg-neutral-50 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-body font-bold text-foreground">طلب #{order.id}</p>
                          <AdminStatusPill label={order.status} tone={statusTone(order.status)} />
                        </div>
                        <p className="mt-2 text-caption text-muted-foreground">
                          {order.items.length} منتجات · {new Date(order.createdAt).toLocaleString("ar")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={status === order.status}
                            onClick={() => void changeStatus(order.id, status)}
                            className="min-h-9 rounded-lg border border-neutral-200 px-3 text-label font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                        <p className="text-body-sm font-medium text-foreground">الشحنات</p>
                      </div>

                      {order.shipments.length === 0 ? (
                        <p className="mt-2 text-caption text-muted-foreground">لم يتم إنشاء شحنة لهذا الطلب بعد.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {order.shipments.map((shipment) => (
                            <div key={shipment.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <AdminStatusPill label={shipment.status} tone="neutral" />
                                  <span className="text-caption font-medium text-foreground">
                                    {shipment.carrier ?? "لم يتم تعيين شركة نقل"}
                                  </span>
                                </div>
                                <p className="mt-1 truncate font-mono text-label text-muted-foreground">
                                  {shipment.trackingNumber ?? "لم يتم تعيين رقم تتبع"}
                                </p>
                              </div>
                              <p className="text-label text-muted-foreground">
                                {shipment.estimatedDeliveryDate
                                  ? `متوقع ${new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar")}`
                                  : "موعد التسليم غير متاح"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function LoadingRows() {
  return (
    <div aria-label="جاري تحميل الطلبات" className="divide-y divide-neutral-100">
      {[1, 2, 3].map((row) => (
        <div key={row} className="animate-pulse p-6">
          <div className="h-4 w-1/3 rounded bg-neutral-100" />
          <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
          <div className="mt-5 h-20 rounded-xl bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}
