"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Truck, PackageCheck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/features/admin/orders/services/admin-order-api.service";

const STATUS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خارج للتوصيل",
  DELIVERED: "تم التوصيل",
};

export default function AdminShipmentsPage() {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => getAdminOrders(0, 100),
    staleTime: 10_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateAdminOrderStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const orders = query.data?.content ?? [];

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">
                  <Truck className="h-3.5 w-3.5" />
                  Fulfillment
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                  إدارة الشحنات
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  حالات الشحن تُحفظ على الطلب في Backend ولا تعتمد على state محلي.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          {query.isPending ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
            ))}</div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm font-bold text-red-600">
              تعذر تحميل الشحنات. تحقق من صلاحيات ADMIN واتصال الـBackend.
            </div>
          ) : (
            <section className="space-y-4">
              {orders.map((order) => {
                const shipment = order.shipments[0];
                const current = shipment?.status ?? order.status;

                return (
                  <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          {shipment ? <Truck className="h-5 w-5" /> : <PackageCheck className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900">طلب #{order.id}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {shipment?.carrier ?? "بانتظار شركة الشحن"}
                            {shipment?.trackingNumber ? " · " + shipment.trackingNumber : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {order.items.map((item) => (
                              <span key={item.id} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                {item.productName} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-700">
                          {STATUS_LABEL[current] ?? current}
                        </span>

                        <select
                          value={current}
                          disabled={mutation.isPending}
                          onChange={(event) =>
                            mutation.mutate({ id: order.id, status: event.target.value })
                          }
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold"
                          aria-label={"تحديث حالة الطلب " + order.id}
                        >
                          {STATUS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </article>
                );
              })}

              {orders.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                  لا توجد طلبات.
                </div>
              )}

              {mutation.isError && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600">
                  {mutation.error instanceof Error ? mutation.error.message : "فشل تحديث الحالة"}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
