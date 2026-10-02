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
  Truck,
  Users,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

// Every one of these previously showed a hardcoded number ("$184.6K",
// "+14.8%", "97.4%", "7 items need review"...) with no real data source at
// all — this dashboard has no backend to compute any of them from yet.
// Rather than delete the intended dashboard shape, each card now says so
// honestly instead of showing fabricated production-looking numbers. See
// the architecture report's "DO NOT FAKE BACKEND" finding.
const metrics = [
  {
    label: "GMV",
    icon: BarChart3,
    color: "bg-blue-50 text-[#2563EB]",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Customers",
    icon: Users,
    color: "bg-violet-50 text-violet-700",
  },
  {
    label: "Low stock",
    icon: Boxes,
    color: "bg-amber-50 text-amber-700",
  },
] as const;

const management = [
  {
    href: "/admin/products",
    title: "Products",
    description: "Catalog moderation and listing review.",
    icon: Package,
  },
  {
    href: "/admin/reviews",
    title: "Reviews",
    description: "Moderate customer product reviews.",
    icon: Star,
  },
  {
    href: "/admin/pricing",
    title: "Pricing",
    description: "Manage automatic pricing rules.",
    icon: BarChart3,
  },
  {
    href: "/admin/shipments",
    title: "Shipments",
    description: "Track delivery status across every order.",
    icon: Truck,
  },
  {
    href: "/admin/finance",
    title: "Payments",
    description: "Store payments, revenue and transactions.",
    icon: CreditCard,
  },
  {
    href: "/admin/support",
    title: "Support",
    description: "Respond to customer support conversations.",
    icon: LifeBuoy,
  },
  {
    href: "/warehouse",
    title: "Warehouse",
    description: "Inventory and logistics operations.",
    icon: Boxes,
  },
] as const;

export default function AdminPage() {
  return (
    <AdminShell>
    <main className="min-h-screen bg-[#F8FAFC]">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
                Platform administration
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                Admin control center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor store performance, customers, commerce and
                operational workflows.
              </p>
            </div>

          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs text-slate-400">
                  {metric.label}
                </p>

                <p className="mt-1 text-lg font-black text-slate-300">
                  —
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Not connected yet
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

          <section>

            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Platform modules
              </p>

              <h2 className="mt-1 text-xl font-black">
                Management
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {management.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-[#2563EB]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]" />
                    </div>

                    <h3 className="mt-5 text-sm font-black text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>

          </section>

          <aside className="space-y-5">

            {/* Every figure below was previously a hardcoded percentage
                (97.4%, 99.3%, 96.8%) with no real source. There is no
                backend yet to compute supplier verification rate, payment
                success rate, or fulfillment rate from, so this panel says
                that honestly instead of showing invented numbers. */}
            <section className="rounded-2xl bg-[#0F2747] p-6 text-white">
              <ShieldCheck className="h-6 w-6 text-blue-200" />

              <h2 className="mt-5 text-xl font-black">
                Platform trust
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100/70">
                Commerce and trust indicators will appear here once these
                are backed by real order, payment and supplier data.
              </p>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-100/60">
                    Verified suppliers
                  </span>
                  <span className="font-bold text-blue-100/40">
                    Not available
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-blue-100/60">
                    Payment success
                  </span>
                  <span className="font-bold text-blue-100/40">
                    Not available
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-blue-100/60">
                    Order fulfillment
                  </span>
                  <span className="font-bold text-blue-100/40">
                    Not available
                  </span>
                </div>
              </div>
            </section>

            {/* Previously claimed a specific fabricated count ("7 items
                need administrator review") with no real review queue
                behind it. This is a real empty state, not an invented
                zero — there is simply no queue connected yet. */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5 text-slate-400" />

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Review queue
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Not connected to a live queue yet.
                  </p>
                </div>
              </div>
            </section>

          </aside>

        </div>
      </div>
    </main>
    </AdminShell>
  );
}