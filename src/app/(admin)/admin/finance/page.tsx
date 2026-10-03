"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DollarSign, RefreshCcw, Wallet } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  collectCashOnDelivery,
  reconcilePayment,
} from "@/features/admin/payments/services/admin-payment-api.service";
import {
  getAdminPayments,
  type AdminPayment,
} from "@/features/admin/finance/services/admin-finance-api.service";

export default function AdminFinancePage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getAdminPayments(0, 100)
      .then((page) => {
        if (active) setPayments(page.content);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load payment ledger.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const gross = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const completed = payments
      .filter((payment) => payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const needsAction = payments
      .filter(
        (payment) =>
          payment.status === "PENDING" ||
          payment.status === "REQUIRES_RECONCILIATION" ||
          payment.status === "REFUND_PENDING",
      )
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    return { gross, completed, needsAction };
  }, [payments]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const page = await getAdminPayments(0, 100);
      setPayments(page.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payment ledger.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(id: number, action: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Finance action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Payments &amp; finance
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Live payment ledger. Settlement actions are enforced by the backend; no client-side settlement state is trusted.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Metric icon={DollarSign} label="Gross payment value" value={summary.gross} />
            <Metric icon={CheckCircle2} label="Completed" value={summary.completed} />
            <Metric icon={Clock3} label="Needs action" value={summary.needsAction} />
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">Payment ledger</h2>
                <p className="mt-1 text-xs text-slate-400">Server-backed payment records</p>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">No payments recorded.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <article key={payment.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">
                            Payment #{payment.id}
                          </p>
                          <StatusPill status={payment.status} />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Order #{payment.orderId} · {payment.method}
                        </p>
                        {payment.transactionId && (
                          <p className="mt-2 font-mono text-xs text-slate-500">
                            {payment.transactionId}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <LocalizedPrice
                          amountUSD={Number(payment.amount)}
                          className="text-lg font-black text-[#0F2747]"
                        />

                        {payment.status === "REQUIRES_RECONCILIATION" && (
                          <button
                            type="button"
                            disabled={busyId === payment.id}
                            onClick={() =>
                              void runAction(payment.id, () => reconcilePayment(payment.id))
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-black text-white disabled:opacity-50"
                          >
                            Reconcile
                          </button>
                        )}

                        {payment.method === "CASH_ON_DELIVERY" &&
                          payment.collectionStatus !== "COLLECTED" && (
                            <button
                              type="button"
                              disabled={busyId === payment.id}
                              onClick={() =>
                                void runAction(
                                  payment.id,
                                  () => collectCashOnDelivery(payment.id),
                                )
                              }
                              className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-black text-emerald-700 disabled:opacity-50"
                            >
                              <Wallet className="h-4 w-4" />
                              Collect COD
                            </button>
                          )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
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
  icon: typeof Wallet;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-[#2563EB]" />
      </div>
      <LocalizedPrice
        amountUSD={value}
        className="mt-5 block text-2xl font-black text-[#0F172A]"
      />
    </div>
  );
}

function StatusPill({ status }: { status: AdminPayment["status"] }) {
  const tone =
    status === "COMPLETED" || status === "REFUNDED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "FAILED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span className={"rounded-full px-2.5 py-1 text-[10px] font-black " + tone}>
      {status}
    </span>
  );
}
