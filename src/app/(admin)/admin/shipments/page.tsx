"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Package,
  Search,
  Truck,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminBackendOrders } from "@/features/orders/services/order-api.service";

type AdminShipmentRow = {
  orderId: number;
  shipmentId: number | null;
  status: string;
  carrier: string;
  trackingNumber: string;
  eta: string;
};

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";
    case "SHIPPED":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-50 text-blue-700";
    case "PACKED":
      return "bg-purple-50 text-purple-700";
    case "CANCELLED":
    case "FULFILLMENT_FAILED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AdminShipmentsPage() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: () => getAdminBackendOrders(0, 100),
    staleTime: 15_000,
  });

  const shipments = useMemo<AdminShipmentRow[]>(() => {
    const orders = query.data?.content ?? [];

    return orders.flatMap((order) =>
      order.shipments.length > 0
        ? order.shipments.map((shipment) => ({
            orderId: order.id,
            shipmentId: shipment.id,
            status: shipment.status,
            carrier: shipment.carrier ?? "Carrier not assigned",
            trackingNumber: shipment.trackingNumber ?? "Tracking not assigned",
            eta: shipment.estimatedDeliveryDate ?? "Pending",
          }))
        : [
            {
              orderId: order.id,
              shipmentId: null,
              status: order.status,
              carrier: "No shipment assigned",
              trackingNumber: "Tracking not assigned",
              eta: "Pending",
            },
          ],
    );
  }, [query.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return shipments;

    return shipments.filter((shipment) =>
      [
        shipment.orderId,
        shipment.shipmentId ?? "",
        shipment.trackingNumber,
        shipment.carrier,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [shipments, search]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Shipment control
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Live shipment state from the backend fulfillment system.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-5 flex h-11 max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, shipment or tracking number..."
              aria-label="Search shipments"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {query.isPending ? (
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          ) : query.isError ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-bold text-red-700">
                تعذر تحميل الشحنات من الخادم.
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-black text-white"
              >
                إعادة المحاولة
              </button>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {filtered.map((shipment) => (
                  <div key={`${shipment.orderId}-${shipment.shipmentId ?? "none"}`} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                          <Truck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black text-slate-900">
                              Order #{shipment.orderId}
                            </p>
                            {shipment.shipmentId !== null && (
                              <span className="text-xs font-bold text-slate-400">
                                Shipment #{shipment.shipmentId}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(
                                shipment.status,
                              )}`}
                            >
                              {shipment.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {shipment.carrier}
                          </p>
                          <p className="mt-2 text-xs font-mono text-slate-600">
                            {shipment.trackingNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            ETA
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-700">
                            {shipment.eta}
                          </p>
                        </div>

                        <Link
                          href={`/buyer/orders/${shipment.orderId}`}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-50"
                        >
                          View order
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
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
