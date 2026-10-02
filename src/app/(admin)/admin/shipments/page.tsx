"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Search, Truck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { apiClient } from "@/lib/api/http-client";
import type { BackendOrder, BackendOrderPage } from "@/features/orders/services/order-api.service";

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient.get<BackendOrderPage>("/admin/orders?page=0&size=50")
      .then((page) => setOrders(page.content))
      .catch((e) => setError(e instanceof Error ? e.message : "تعذر تحميل الشحنات."));
  }, []);

  const filtered = useMemo(
    () => orders.filter((order) =>
      `${order.id} ${order.shipments.map((s) => s.trackingNumber ?? "").join(" ")}`
        .toLowerCase().includes(query.trim().toLowerCase()),
    ),
    [orders, query],
  );

  return (
    <AdminShell>
      <div>
        <h1 className="text-3xl font-black">الشحنات</h1>
        <p className="mt-2 text-sm text-muted-foreground">الحالة والتتبع من الطلبات الفعلية.</p>
        <div className="mt-6 flex h-11 max-w-xl items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-3">
          <Search className="h-4 w-4 text-neutral-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="رقم الطلب أو رقم التتبع" />
        </div>
        {error && <div role="alert" className="mt-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-600">{error}</div>}
        <div className="mt-6 space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-brand" />
                <p className="text-sm font-black">طلب #{order.id}</p>
                <span className="rounded-full bg-info-surface px-2 py-1 text-[10px] font-black text-brand">{order.status}</span>
              </div>
              {order.shipments.length ? order.shipments.map((s) => (
                <div key={s.id} className="mt-3 rounded-xl bg-neutral-50 p-3">
                  <p className="text-xs font-black">{s.status}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.carrier ?? "غير محدد"} {s.trackingNumber ?? "—"}</p>
                </div>
              )) : <p className="mt-3 text-xs text-muted-foreground">لم تُنشأ شحنة بعد.</p>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-muted-foreground">
              <Package className="mx-auto mb-3 h-7 w-7 text-neutral-300" />
              لا توجد شحنات.
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
