"use client";

import {
  CheckCircle2,
  Clock3,
  DollarSign,
  LockKeyhole,
  ShieldCheck,
  Wallet,
  TrendingUp,
  PackageCheck,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

import {
  useStoreFinanceStore,
} from "@/stores/store-finance-store";

function statusClass(
  status: string,
) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "AVAILABLE":
      return "bg-blue-50 text-blue-700";

    case "ON_HOLD":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AdminFinancePage() {
  const transactions =
    useStoreFinanceStore(
      (state) =>
        state.transactions,
    );

  const updateStatus =
    useStoreFinanceStore(
      (state) =>
        state.updateStatus,
    );

  const summary =
    useStoreFinanceStore(
      (state) =>
        state.getSummary(),
    );

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Payments &amp; store finance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review store revenue and control payment settlement status.
            </p>

          </div>

        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">

            <AdminFinanceCard
              icon={DollarSign}
              label="Gross sales"
              value={
                summary.grossSales
              }
            />

            <AdminFinanceCard
              icon={ShieldCheck}
              label="Processing fees"
              value={
                summary.processingFees
              }
            />

            <AdminFinanceCard
              icon={PackageCheck}
              label="Fulfillment cost"
              value={
                summary.fulfillmentCosts
              }
            />

            <AdminFinanceCard
              icon={TrendingUp}
              label="Store profit"
              value={
                summary.profit
              }
            />

            <AdminFinanceCard
              icon={Clock3}
              label="Pending settlement"
              value={
                summary.pending
              }
            />

            <AdminFinanceCard
              icon={Wallet}
              label="Already paid out"
              value={
                summary.paid
              }
            />

          </section>

          <section className="mt-6 rounded-2xl bg-[#0F2747] p-6 text-white">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Payment settlement
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100/70">
                  Customer payment is captured by the payment processor, then
                  settled to the store after fees, refunds and adjustments.
                </p>
              </div>

            </div>

          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">

              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#2563EB]" />

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Payment settlement queue
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Finance operations control the final settlement state.
                  </p>
                </div>
              </div>

            </div>

            <div className="divide-y divide-slate-100">

              {transactions.map(
                (transaction) => (
                  <div
                    key={
                      transaction.id
                    }
                    className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-sm font-black text-slate-900">
                          {
                            transaction.id
                          }
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(
                            transaction.status,
                          )}`}
                        >
                          {
                            transaction.status
                          }
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Order{" "}
                        {
                          transaction.orderId
                        }
                      </p>

                      {transaction.note && (
                        <p className="mt-2 max-w-2xl text-xs text-slate-500">
                          {
                            transaction.note
                          }
                        </p>
                      )}

                    </div>

                    <div className="flex flex-wrap items-center gap-6">

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Gross
                        </p>

                        <LocalizedPrice
                          amountUSD={
                            transaction.grossAmount
                          }
                          className="mt-1 text-sm font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Processing fee
                        </p>

                        <LocalizedPrice
                          amountUSD={
                            transaction.processingFee
                          }
                          className="mt-1 text-sm font-bold text-red-600"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Net
                        </p>

                        <LocalizedPrice
                          amountUSD={
                            transaction.netAmount
                          }
                          className="mt-1 text-sm font-black text-[#0F2747]"
                        />
                      </div>

                      <div className="flex gap-2">

                        {transaction.status ===
                          "AVAILABLE" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                transaction.id,
                                "PAID",
                              )
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark paid
                          </button>
                        )}

                        {transaction.status ===
                          "PENDING" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                transaction.id,
                                "AVAILABLE",
                              )
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black text-[#2563EB]"
                          >
                            Release funds
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                ),
              )}

            </div>

          </section>

        </div>
      </main>
    </AdminShell>
  );
}

function AdminFinanceCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-black text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#2563EB]">
          <Icon className="h-4 w-4" />
        </div>

      </div>

      <LocalizedPrice
        amountUSD={value}
        className="mt-5 block text-2xl font-black text-[#0F172A]"
      />

    </div>
  );
}
