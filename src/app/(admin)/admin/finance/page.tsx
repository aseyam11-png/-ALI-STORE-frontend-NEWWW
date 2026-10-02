"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Clock3,
  DollarSign,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

type FinanceSummary = {
  grossSales: number | string;
  fulfillmentCosts: number | string;
  processingFees: number | string;
  adjustments: number | string;
  profit: number | string;
  pending: number | string;
  available: number | string;
  paid: number | string;
  netRevenue: number | string;
};

export default function AdminFinancePage() {
  const query = useQuery({
    queryKey: ["admin", "finance", "summary"],
    queryFn: async () => {
      const response = await apiClient.request<ApiResponse<FinanceSummary>>(
        "/api/v1/admin/finance/summary",
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 10_000,
  });

  const summary = query.data;

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                  Administration
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                  المدفوعات والمالية
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  الأرقام تُحسب من الطلبات والمدفوعات المحفوظة في Backend، وليست من بيانات تجريبية محلية.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {query.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : query.isError || !summary ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <p className="text-sm font-bold text-red-600">
                {query.error instanceof Error
                  ? query.error.message
                  : "تعذر تحميل الملخص المالي"}
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-black text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <AdminFinanceCard icon={DollarSign} label="المبيعات" value={Number(summary.grossSales)} />
                <AdminFinanceCard icon={ShieldCheck} label="رسوم المعالجة" value={Number(summary.processingFees)} />
                <AdminFinanceCard icon={PackageCheck} label="تكلفة التنفيذ" value={Number(summary.fulfillmentCosts)} />
                <AdminFinanceCard icon={TrendingUp} label="الربح" value={Number(summary.profit)} />
                <AdminFinanceCard icon={Clock3} label="قيد الانتظار" value={Number(summary.pending)} />
                <AdminFinanceCard icon={Wallet} label="المدفوع" value={Number(summary.paid)} />
              </section>

              <section className="mt-6 rounded-2xl bg-[#0F2747] p-6 text-white">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">مصدر مالي موثوق</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100/70">
                      الأرباح والتكاليف تُقرأ من سجلات الدفع والطلب الحالية. لا توجد معاملات مالية وهمية داخل الصفحة.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">صافي الإيراد</p>
                    <LocalizedPrice amountUSD={Number(summary.netRevenue)} className="mt-2 text-2xl font-black text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400">المتاح</p>
                    <LocalizedPrice amountUSD={Number(summary.available)} className="mt-2 text-2xl font-black text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400">التعديلات</p>
                    <LocalizedPrice amountUSD={Number(summary.adjustments)} className="mt-2 text-2xl font-black text-slate-900" />
                  </div>
                </div>
              </section>
            </>
          )}
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
        <p className="text-xs font-black text-slate-400">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#2563EB]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <LocalizedPrice amountUSD={value} className="mt-5 block text-2xl font-black text-[#0F172A]" />
    </div>
  );
}
