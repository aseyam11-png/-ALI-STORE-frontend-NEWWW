"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
  Search,
  Warehouse,
} from "lucide-react";

const warehouses = [
  {
    name: "Primary Fulfillment Center",
    location: "Main logistics hub",
    capacity: 82,
    units: "45,200",
  },
  {
    name: "Regional Distribution Hub",
    location: "Central distribution",
    capacity: 64,
    units: "31,000",
  },
  {
    name: "Fast-Moving Goods Hub",
    location: "Regional delivery",
    capacity: 91,
    units: "18,500",
  },
] as const;

const alerts = [
  {
    product: "Hydraulic valve assembly",
    sku: "HYD-VALVE-02",
    current: 12,
    minimum: 50,
    warehouse: "Primary Fulfillment Center",
  },
  {
    product: "Three-phase electric motor",
    sku: "MOT-3P-100",
    current: 5,
    minimum: 20,
    warehouse: "Regional Distribution Hub",
  },
] as const;

const movements = [
  {
    type: "INBOUND",
    reference: "INB-2084",
    product: "Industrial drill kits",
    quantity: "+120",
    date: "Aug 14, 2026",
  },
  {
    type: "OUTBOUND",
    reference: "OUT-7712",
    product: "LED commercial panels",
    quantity: "-48",
    date: "Aug 14, 2026",
  },
  {
    type: "INBOUND",
    reference: "INB-2079",
    product: "Packaging cartons",
    quantity: "+1,500",
    date: "Aug 13, 2026",
  },
] as const;

export default function WarehousePage() {
  const [query, setQuery] = useState("");

  const filteredAlerts = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return alerts;
    }

    return alerts.filter(
      (item) =>
        item.product.toLowerCase().includes(value) ||
        item.sku.toLowerCase().includes(value) ||
        item.warehouse.toLowerCase().includes(value),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                Warehouse operations
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                Inventory control center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track stock, warehouse capacity and inventory movement across
                your network.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F2747] px-5 text-sm font-black text-white"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Record inbound shipment
            </button>
          </div>

        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Warehouse className="h-5 w-5 text-[#2563EB]" />
            <p className="mt-4 text-3xl font-black">3</p>
            <p className="mt-1 text-xs text-slate-400">Active warehouses</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Package className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-3xl font-black">94,700</p>
            <p className="mt-1 text-xs text-slate-400">Units in stock</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="mt-4 text-3xl font-black">2</p>
            <p className="mt-1 text-xs text-slate-400">Low-stock alerts</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <ClipboardList className="h-5 w-5 text-violet-600" />
            <p className="mt-4 text-3xl font-black">38</p>
            <p className="mt-1 text-xs text-slate-400">Open movements</p>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Warehouse network
            </p>

            <h2 className="mt-1 text-xl font-black">
              Capacity overview
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {warehouse.name}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {warehouse.location}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                    {warehouse.capacity}%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      warehouse.capacity >= 90
                        ? "bg-red-500"
                        : warehouse.capacity >= 75
                          ? "bg-amber-500"
                          : "bg-[#2563EB]"
                    }`}
                    style={{ width: `${warehouse.capacity}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stored units</span>
                  <span className="font-black text-slate-800">
                    {warehouse.units}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                  Inventory alerts
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Low stock
                </h2>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                <Search className="ms-3 h-4 w-4 text-slate-400" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search SKU or product..."
                  className="h-10 min-w-[230px] bg-transparent px-3 text-xs outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAlerts.map((item) => (
                <div
                  key={item.sku}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">
                        LOW STOCK
                      </span>

                      <span className="font-mono text-[10px] text-slate-400">
                        {item.sku}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-black text-slate-900">
                      {item.product}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.warehouse}
                    </p>
                  </div>

                  <div className="text-end">
                    <p className="text-xs text-slate-400">
                      Current / Minimum
                    </p>

                    <p className="mt-1 text-lg font-black text-red-600">
                      {item.current} / {item.minimum}
                    </p>

                    <button
                      type="button"
                      className="mt-2 text-xs font-black text-[#2563EB] hover:underline"
                    >
                      Reorder stock
                    </button>
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="p-10 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 text-sm font-black">
                    No matching alerts
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Movement log
              </p>

              <h2 className="mt-1 text-xl font-black">
                Recent movements
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {movements.map((movement) => (
                <div key={movement.reference} className="p-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${
                        movement.type === "INBOUND"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {movement.type === "INBOUND" ? (
                        <ArrowDownToLine className="h-3 w-3" />
                      ) : (
                        <ArrowUpFromLine className="h-3 w-3" />
                      )}
                      {movement.type}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {movement.date}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-black text-slate-900">
                    {movement.product}
                  </p>

                  <div className="mt-2 flex justify-between text-xs">
                    <span className="font-mono text-slate-400">
                      {movement.reference}
                    </span>

                    <span className="font-black text-slate-700">
                      {movement.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}