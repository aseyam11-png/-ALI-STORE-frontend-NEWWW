"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Search, Truck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminOrders,
  updateShipmentStatus,
} from "@/features/admin/services/admin-commerce.service";
import type { BackendOrder } from "@/features/orders/services/order.service";

const SHIPMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const page = await getAdminOrders();
      setOrders(page.content);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل الشحنات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const shipments = useMemo(
    () =>
      orders.flatMap((order) =>
        order.shipments.map((shipment) => ({
          order,
          shipment,
        })),
      ).filter(({ order, shipment }) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return [String(order.id), shipment.trackingNumber ?? "", shipment.carrier ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }),
    [orders, search],
  );

  const changeStatus = async (
    shipmentId: number,
    status: typeof SHIPMENT_STATUSES[number],
  ) => {
    setUpdatingId(shipmentId);
    setError("");
    try {
      await updateShipmentStatus(shipmentId, status);
      await load();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تعذر تحديث حالة الشحنة.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Shipment control</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage supplier fulfillment shipments from the backend.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex h-11 max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, tracking or carrier..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              جارٍ تحميل الشحنات...
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {shipments.map(({ order, shipment }) => (
                  <article key={shipment.id} className="p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black text-slate-900">
                              Order #{order.id}
                            </p>
                            <span className={"rounded-full px-2.5 py-1 text-[10px] font-black " + statusClass(shipment.status)}>
                              {shipment.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {shipment.carrier ?? "Carrier not assigned"}
                          </p>
                          <p className="mt-1 font-mono text-xs text-slate-600">
                            {shipment.trackingNumber ?? "Tracking not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          aria-label={"Update shipment " + shipment.id}
                          value={shipment.status}
                          disabled={updatingId === shipment.id}
                          onChange={(event) =>
                            void changeStatus(
                              shipment.id,
                              event.target.value as typeof SHIPMENT_STATUSES[number],
                            )
                          }
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none"
                        >
                          {SHIPMENT_STATUSES.map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </article>
                ))}

                {shipments.length === 0 && (
                  <div className="p-12 text-center">
                    <Package className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-4 text-sm font-bold text-slate-600">
                      No shipments found.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
