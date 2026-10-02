"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  getAdminOrders,
  updateShipmentStatus,
} from "@/features/admin/services/admin-commerce.service";
import type { BackendOrder } from "@/features/orders/services/order.service";

const STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function WarehousePage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getAdminOrders(0, 100)
      .then((page) => {
        if (active) setOrders(page.content);
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر تحميل طلبات التنفيذ.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const shipments = useMemo(
    () =>
      orders.flatMap((order) =>
        order.shipments.map((shipment) => ({ order, shipment })),
      ).filter(({ order, shipment }) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return true;
        return [
          String(order.id),
          shipment.trackingNumber ?? "",
          shipment.carrier ?? "",
          ...order.items.map((item) => item.productName),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      }),
    [orders, query],
  );

  const summary = useMemo(() => {
    return shipments.reduce(
      (result, item) => {
        result.total += 1;
        if (item.shipment.status === "DELIVERED") result.delivered += 1;
        else if (item.shipment.status === "CANCELLED") result.cancelled += 1;
        else if (item.shipment.status === "PENDING") result.pending += 1;
        else result.inFlight += 1;
        return result;
      },
      { total: 0, delivered: 0, cancelled: 0, pending: 0, inFlight: 0 },
    );
  }, [shipments]);

  const changeStatus = async (
    shipmentId: number,
    status: typeof STATUSES[number],
  ) => {
    setUpdatingId(shipmentId);
    setError("");

    try {
      await updateShipmentStatus(shipmentId, status);
      setOrders((current) =>
        current.map((order) => ({
          ...order,
          shipments: order.shipments.map((shipment) =>
            shipment.id === shipmentId
              ? { ...shipment, status }
              : shipment,
          ),
        })),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحديث حالة التنفيذ.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Fulfillment operations
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Fulfillment queue
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Operational view of customer orders and their supplier-fulfillment shipments.
              Inventory is not represented as an internal warehouse unless the backend has an authoritative record for it.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={Package} label="Shipments" value={summary.total} />
            <Metric icon={Clock3} label="Pending" value={summary.pending} />
            <Metric icon={Truck} label="In progress" value={summary.inFlight} />
            <Metric icon={CheckCircle2} label="Delivered" value={summary.delivered} />
          </section>

          <div className="mt-7 flex h-11 max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order, product, tracking or carrier..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              جارٍ تحميل طابور التنفيذ...
            </div>
          ) : (
            <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Shipment queue</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {summary.total} shipment records loaded from backend.
                    </p>
                  </div>
                  {summary.cancelled > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-700">
                      <XCircle className="h-3.5 w-3.5" />
                      {summary.cancelled} cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {shipments.map(({ order, shipment }) => (
                  <article key={shipment.id} className="p-5">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">
                            Order #{order.id}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                            {shipment.status}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {shipment.carrier ?? "Carrier not assigned"}
                          {shipment.trackingNumber
                            ? " · " + shipment.trackingNumber
                            : " · Tracking not assigned"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items.slice(0, 4).map((item) => (
                            <span
                              key={item.id}
                              className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
                            >
                              {item.productName} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <select
                        value={shipment.status}
                        disabled={updatingId === shipment.id}
                        aria-label={"Update shipment " + shipment.id}
                        onChange={(event) =>
                          void changeStatus(
                            shipment.id,
                            event.target.value as typeof STATUSES[number],
                          )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black outline-none"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}

                {shipments.length === 0 && (
                  <div className="p-12 text-center text-sm text-slate-500">
                    لا توجد شحنات مطابقة حاليًا.
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-[#2563EB]" />
      <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
