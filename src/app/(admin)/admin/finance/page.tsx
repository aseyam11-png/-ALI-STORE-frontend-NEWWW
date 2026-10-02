"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, DollarSign, XCircle } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { getAdminPayments, type AdminPayment } from "@/features/admin/services/admin-commerce.service";

function statusClass(status: AdminPayment["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "FAILED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AdminFinancePage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminPayments()
      .then((page) => setPayments(page.content))
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل المدفوعات.");
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    return payments.reduce(
      (result, payment) => {
        if (payment.status === "COMPLETED") result.completed += Number(payment.amount);
        if (payment.status === "PENDING") result.pending += Number(payment.amount);
        if (payment.status === "FAILED") result.failed += Number(payment.amount);
        return result;
      },
      { completed: 0, pending: 0, failed: 0 },
    );
  }, [payments]);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Payments
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Read-only payment ledger from the backend. Settlement actions are not fabricated in the frontend.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard icon={CheckCircle2} label="Completed" value={summary.completed} />
            <SummaryCard icon={Clock3} label="Pending" value={summary.pending} />
            <SummaryCard icon={XCircle} label="Failed" value={summary.failed} />
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[#2563EB]" />
                <div>
                  <h2 className="text-lg font-black text-slate-900">Payment attempts</h2>
                  <p className="mt-1 text-xs text-slate-400">Every record below comes from the payment domain.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">جارٍ تحميل المدفوعات...</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <article key={payment.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">PAY-{payment.id}</span>
                          <span className={"rounded-full px-2.5 py-1 text-[10px] font-black " + statusClass(payment.status)}>
                            {payment.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Order #{payment.orderId} · {payment.method}
                        </p>
                        {payment.transactionId && (
                          <p className="mt-1 font-mono text-[10px] text-slate-400">
                            {payment.transactionId}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Amount</p>
                          <LocalizedPrice amountUSD={Number(payment.amount)} className="mt-1 text-lg font-black text-[#0F2747]" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Created</p>
                          <p className="mt-1 text-xs font-bold text-slate-600">
                            {new Date(payment.createdAt).toLocaleString("en-US")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {payments.length === 0 && (
                  <div className="p-12 text-center text-sm text-slate-500">
                    No payment records found.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-[#2563EB]" />
      </div>
      <LocalizedPrice amountUSD={value} className="mt-4 text-2xl font-black text-[#0F172A]" />
    </div>
  );
}
