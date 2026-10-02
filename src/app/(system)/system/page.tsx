"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  Globe2,
  LockKeyhole,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

const services = [
  {
    name: "Authentication & RBAC",
    description: "Identity, sessions and permissions",
    uptime: "99.99%",
    latency: "24ms",
  },
  {
    name: "Product Search",
    description: "Catalog indexing and search",
    uptime: "99.95%",
    latency: "42ms",
  },
  {
    name: "Payment Gateway",
    description: "Payment processing and settlement",
    uptime: "100%",
    latency: "110ms",
  },
  {
    name: "Order Processing",
    description: "Order and fulfillment pipeline",
    uptime: "99.91%",
    latency: "18ms",
  },
] as const;

export default function SystemPage() {
  const [maintenance, setMaintenance] =
    useState(false);

  return (
    <AdminShell>
    <main className="min-h-screen bg-[#F8FAFC]">

      <section className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                SYSTEM STATUS: HEALTHY
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                System administration
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor platform infrastructure, service health, security and
                feature configuration.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
              <Activity className="h-5 w-5 text-emerald-400" />

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Environment
                </p>

                <p className="mt-1 text-sm font-black">
                  Production ready
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Server className="h-5 w-5 text-[#2563EB]" />
            <p className="mt-5 text-3xl font-black text-slate-900">
              4
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Core services
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Zap className="h-5 w-5 text-amber-600" />
            <p className="mt-5 text-3xl font-black text-slate-900">
              48ms
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Average latency
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Database className="h-5 w-5 text-violet-600" />
            <p className="mt-5 text-3xl font-black text-slate-900">
              99.98%
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Platform availability
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-5 text-3xl font-black text-slate-900">
              Secure
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Current security state
            </p>
          </div>

        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-[#2563EB]" />

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Service health
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current health of connected platform services.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {service.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700">
                          {service.uptime}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Uptime
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700">
                          {service.latency}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Latency
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-[#2563EB]" />

                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Feature flags
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Manage platform capabilities.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">

                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-xs font-bold text-slate-800">
                      Maintenance mode
                    </span>

                    <span className="mt-1 block text-[10px] text-slate-400">
                      Temporarily restrict platform access
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(event) =>
                      setMaintenance(
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 accent-blue-600"
                  />
                </label>

              </div>

              {maintenance && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                  Maintenance mode is currently enabled.
                </div>
              )}

            </section>

            <section className="rounded-2xl bg-[#0F2747] p-6 text-white">
              <LockKeyhole className="h-6 w-6 text-blue-200" />

              <h2 className="mt-5 text-xl font-black">
                Security controls
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100/70">
                Authentication, role-based permissions and platform service
                monitoring are prepared for backend integration.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-[#0F2747] transition hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh status
              </button>
            </section>

          </aside>
        </div>
      </div>
    </main>
    </AdminShell>
  );
}