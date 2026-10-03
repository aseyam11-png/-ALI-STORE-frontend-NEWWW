"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CreditCard,
  LifeBuoy,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

const management = [
  {
    href: "/admin/products",
    title: "Products",
    description: "Manage the live B2C catalog and supplier-backed listings.",
    icon: Package,
  },
  {
    href: "/admin/orders",
    title: "Orders & shipments",
    description: "Handle order transitions and shipment visibility in one workflow.",
    icon: ShoppingBag,
  },
  {
    href: "/admin/pricing",
    title: "Pricing",
    description: "Manage store-owned automatic pricing rules.",
    icon: BarChart3,
  },
  {
    href: "/admin/finance",
    title: "Payments",
    description: "Review the live payment ledger and settlement actions.",
    icon: CreditCard,
  },
  {
    href: "/warehouse",
    title: "Fulfillment",
    description: "Open the canonical fulfillment operations surface.",
    icon: Boxes,
  },
] as const;

export default function AdminPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
              Platform administration
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Admin control center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Core store operations are grouped here. Small or unavailable operational surfaces no longer consume standalone pages.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <section>
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Core modules
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Management</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {management.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-[#2563EB]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]" />
                    </div>
                    <h3 className="mt-5 text-sm font-black text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Consolidated operations
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Status & unavailable modules
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                These are intentionally shown as status cards until their real backend contracts exist.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <StatusCard
                icon={Star}
                title="Review moderation"
                description="Customer review APIs exist, but an admin moderation queue is not exposed by the backend."
              />
              <StatusCard
                icon={LifeBuoy}
                title="Support"
                description="There is no persisted support conversation API, so the frontend does not invent conversations."
              />
              <StatusCard
                icon={ShieldCheck}
                title="System monitoring"
                description="Uptime, latency and maintenance controls require a real operational monitoring endpoint."
              />
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function StatusCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Star;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-slate-500" />
      <h3 className="mt-4 text-sm font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
