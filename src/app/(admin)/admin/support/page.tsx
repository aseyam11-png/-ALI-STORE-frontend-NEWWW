import {
  AlertTriangle,
  Headphones,
  ShieldCheck,
} from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminSupportPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-label font-medium uppercase tracking-[0.18em] text-danger-600">
              Administration
            </p>
            <h1 className="mt-3 text-h1 font-bold tracking-tight text-foreground">
              Support operations
            </h1>
            <p className="mt-2 max-w-2xl text-body leading-7 text-muted-foreground">
              إدارة الدعم المباشر غير مفعلة لأن النظام لا يملك عقد Support
              persisted في الـBackend حاليًا.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-body font-bold text-amber-900">
                  لا توجد محادثات دعم فعلية للعرض
                </h2>
                <p className="mt-2 text-body-sm leading-6 text-amber-800">
                  تم منع عرض بيانات محادثات تجريبية أو تغيير حالتها محليًا.
                  عند إضافة Support API حقيقي يمكن إعادة ربط هذه الشاشة به
                  مع الحفاظ على صلاحيات الإدارة وبيانات الطلبات.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-surface p-5">
              <Headphones className="h-5 w-5 text-brand" />
              <h2 className="mt-4 text-body font-bold text-foreground">
                Customer support
              </h2>
              <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                لا يتم إنشاء أو تخزين محادثة محليًا.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-surface p-5">
              <ShieldCheck className="h-5 w-5 text-success" />
              <h2 className="mt-4 text-body font-bold text-foreground">
                Data integrity
              </h2>
              <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                لا يتم عرض customer/order/shipment IDs تجريبية.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
