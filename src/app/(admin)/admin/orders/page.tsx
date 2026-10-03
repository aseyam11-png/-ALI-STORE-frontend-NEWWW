"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminOrders, updateAdminOrderStatus } from "@/features/admin/orders/services/admin-order-api.service";
import type { BackendOrder } from "@/features/orders/services/order.service";

const statusOptions: BackendOrder["status"][] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FULFILLMENT_FAILED",
];

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
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function changeStatus(orderId: number, status: BackendOrder["status"]) {
    setError("");
    try {
      const updated = await updateAdminOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order transition rejected by server.");
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Order operations</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Manage customer orders through backend transition rules.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

          <div className="mb-5 flex justify-end">
            <button type="button" onClick={() => void refresh()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black">
              <RefreshCcw className="h-4 w-4" />Refresh
            </button>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading orders...</div> :
              orders.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No customer orders.</div> :
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <article key={order.id} className="p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">Order #{order.id}</p>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#2563EB]">{order.status}</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{order.items.length} items · {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={status === order.status}
                            onClick={() => void changeStatus(order.id, status)}
                            className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-[10px] font-black disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}