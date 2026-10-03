import {
  Activity,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Server,
  ShieldCheck,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

const controls = [
  {
    title: "Authentication & RBAC",
    description: "المصادقة والصلاحيات يتم فرضها على مستوى الخادم.",
    status: "مربوط بالـBackend",
    icon: ShieldCheck,
  },
  {
    title: "Catalog API",
    description: "المنتجات والفئات تُقرأ من واجهات الكتالوج الحية.",
    status: "مربوط بالـBackend",
    icon: Server,
  },
  {
    title: "Payment ledger",
    description: "سجل الدفع والـreconciliation يداران بواسطة الـBackend.",
    status: "مربوط بالـBackend",
    icon: Activity,
  },
  {
    title: "Operational monitoring",
    description: "لا توجد خدمة Monitoring/metrics موصولة بهذه الواجهة حاليًا.",
    status: "غير متصل",
    icon: Globe2,
  },
];

export default function SystemPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="bg-[#0F172A] text-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-black text-amber-200">
              مراقبة التشغيل غير موصولة
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              إدارة النظام
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              تعرض هذه الصفحة حدود التكامل الفعلية بدل أرقام صحة أو زمن استجابة غير
              مقروءة من مصدر مراقبة حقيقي.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-[#2563EB]" />
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    حالة التكامل
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    لا يتم عرض مؤشرات تشغيلية إلا عند وجود مصدر حقيقي لها.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {controls.map((control) => {
                const Icon = control.icon;
                const unavailable = control.status === "غير متصل";

                return (
                  <div key={control.title} className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={
                            "flex h-10 w-10 items-center justify-center rounded-xl " +
                            (unavailable
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700")
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {control.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {control.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black " +
                          (unavailable
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700")
                        }
                      >
                        {!unavailable && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {control.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-black text-blue-950">
              تنبيه تشغيلي
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-900/70">
              لا يوجد في الـFrontend حاليًا endpoint لمؤشرات uptime أو latency أو
              maintenance mode. لذلك تم منع الواجهة من عرض أرقام وهمية أو تبديلات
              محلية توحي بأنها تغيّر حالة النظام فعليًا.
            </p>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
