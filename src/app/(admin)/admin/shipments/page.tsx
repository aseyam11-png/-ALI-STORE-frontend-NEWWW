"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { UrlObject } from "url";
import { ArrowRight, Package, RefreshCcw, Search, Truck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminOrders } from "@/features/admin/orders/services/admin-order-api.service";
import type { BackendOrder } from "@/features/orders/services/order.service";

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setOrders((await getAdminOrders(0, 100)).content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shipments.");
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
        if (active) setError(err instanceof Error ? err.message : "Unable to load shipments.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const shipments = useMemo(
    () => orders.flatMap((order) => order.shipments.map((shipment) => ({ order, shipment }))),
    [orders],
  );

  const filtered = shipments.filter(({ order, shipment }) =>
    (String(order.id) + " " + (shipment.carrier ?? "") + " " + (shipment.trackingNumber ?? ""))
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">Shipment control</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Shipment records are loaded from real customer orders.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

          <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, carrier or tracking..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="button" onClick={() => void refresh()} aria-label="Refresh shipments" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading shipments...</div> :
              filtered.length === 0 ? <div className="p-12 text-center"><Package className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 text-sm font-bold text-slate-600">No shipments found.</p></div> :
              <div className="divide-y divide-slate-100">
                {filtered.map(({ order, shipment }) => (
                  <article key={String(order.id) + "-" + String(shipment.id)} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]"><Truck className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Order #{order.id}</p>
                          <p className="mt-1 text-xs text-slate-400">{shipment.carrier ?? "Carrier not assigned"}</p>
                          <p className="mt-2 font-mono text-xs text-slate-600">{shipment.trackingNumber ?? "Tracking not assigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#2563EB]">{shipment.status}</span>
                        <Link href={({ pathname: "/buyer/orders/[id]", query: { id: String(order.id) } } as UrlObject)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black">View order<ArrowRight className="h-3.5 w-3.5" /></Link>
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