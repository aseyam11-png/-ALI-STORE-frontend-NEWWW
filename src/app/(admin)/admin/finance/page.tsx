"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DollarSign, RefreshCcw, Wallet } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  collectCashOnDelivery,
  reconcilePayment,
} from "@/features/admin/payments/services/admin-payment-api.service";
import {
  getAdminPayments,
  type AdminPayment,
} from "@/features/admin/finance/services/admin-finance-api.service";

function paymentTone(status: AdminPayment["status"]) {
  if (status === "COMPLETED" || status === "REFUNDED") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

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
          setError(err instanceof Error ? err.message : "تعذر تحميل سجل المدفوعات.");
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
      setError(err instanceof Error ? err.message : "تعذر تحميل سجل المدفوعات.");
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
      setError(err instanceof Error ? err.message : "فشل إجراء المدفوعات.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="المدفوعات"
          title="المدفوعات والمالية"
          description="السجل المعروض هنا Server-backed، والإجراءات الحساسة تُنفذ عبر الخادم ولا تعتمد على الحالة المحلية في المتصفح."
          actions={
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              تحديث
            </button>
          }
        />

        <div className="container-shell py-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-body-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <AdminMetricCard icon={DollarSign} label="إجمالي قيمة المدفوعات" value={summary.gross.toFixed(2)} detail="من السجلات المحملة" />
            <AdminMetricCard icon={CheckCircle2} label="مكتملة" value={summary.completed.toFixed(2)} tone="success" />
            <AdminMetricCard icon={Clock3} label="تحتاج إجراء" value={summary.needsAction.toFixed(2)} tone="warning" />
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">
            <div className="flex flex-col gap-3 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-h3 font-bold text-foreground">سجل المدفوعات</h2>
                <p className="mt-1 text-caption text-muted-foreground">بيانات الدفع الفعلية التي أعادها الخادم.</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-caption font-medium text-neutral-600">
                {payments.length} سجل
              </span>
            </div>

            {loading ? (
              <div className="divide-y divide-neutral-100" aria-label="جاري تحميل المدفوعات">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="animate-pulse p-6">
                    <div className="h-4 w-1/3 rounded bg-neutral-100" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-14 text-center text-body-sm text-muted-foreground">لا توجد مدفوعات مسجلة.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <article key={payment.id} className="p-5 transition-colors hover:bg-neutral-50 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-body font-bold text-foreground">دفعة #{payment.id}</p>
                          <AdminStatusPill label={payment.status} tone={paymentTone(payment.status)} />
                        </div>
                        <p className="mt-1 text-caption text-muted-foreground">
                          طلب #{payment.orderId} · {payment.method}
                        </p>
                        {payment.transactionId ? (
                          <p className="mt-2 truncate font-mono text-label text-neutral-500">{payment.transactionId}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <LocalizedPrice
                          amountUSD={Number(payment.amount)}
                          className="text-body-lg font-bold text-foreground"
                        />

                        {payment.status === "REQUIRES_RECONCILIATION" ? (
                          <button
                            type="button"
                            disabled={busyId === payment.id}
                            onClick={() => void runAction(payment.id, () => reconcilePayment(payment.id))}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-body-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyId === payment.id ? "جارٍ التنفيذ…" : "مطابقة الدفع"}
                          </button>
                        ) : null}

                        {payment.method === "CASH_ON_DELIVERY" && payment.collectionStatus !== "COLLECTED" ? (
                          <button
                            type="button"
                            disabled={busyId === payment.id}
                            onClick={() => void runAction(payment.id, () => collectCashOnDelivery(payment.id))}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-success-100 bg-success-surface px-4 text-body-sm font-medium text-success-700 transition hover:border-success-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                            {busyId === payment.id ? "جارٍ التحصيل…" : "تحصيل COD"}
                          </button>
                        ) : null}
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
