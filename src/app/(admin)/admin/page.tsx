"use client";

import Link from "next/link";
import {
  ArrowLeft,
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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const management = [
  {
    href: "/admin/products",
    title: "المنتجات",
    description: "إدارة الكتالوج الحي والبيانات القادمة من المورد.",
    icon: Package,
  },
  {
    href: "/admin/orders",
    title: "الطلبات والشحن",
    description: "متابعة انتقالات الطلبات وحالة الشحن ضمن مسار واحد.",
    icon: ShoppingBag,
  },
  {
    href: "/admin/pricing",
    title: "التسعير",
    description: "إدارة قواعد هامش الربح التي يملكها المتجر.",
    icon: BarChart3,
  },
  {
    href: "/admin/finance",
    title: "المدفوعات",
    description: "مراجعة سجل المدفوعات وتنفيذ الإجراءات المسموح بها.",
    icon: CreditCard,
  },
  {
    href: "/warehouse",
    title: "التنفيذ",
    description: "الوصول إلى مساحة عمليات التنفيذ والشحن المعتمدة.",
    icon: Boxes,
  },
] as const;

export default function AdminPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-background">
        <AdminPageHeader
          eyebrow="مركز الإدارة"
          title="إدارة ALI STORE"
          description="مساحة تشغيل موحدة للكتالوج والطلبات والتسعير والمدفوعات، مع الاعتماد على بيانات وخدمات الخادم دون اختلاق حالات غير موجودة."
        />

        <div className="container-shell py-8">
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                  التشغيل
                </p>
                <h2 className="mt-1 text-h2 font-bold text-foreground">
                  المسارات الأساسية
                </h2>
              </div>
              <span className="text-caption text-muted-foreground">
                كل بطاقة تفتح المسار التشغيلي المرتبط بها
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {management.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="interactive-lift group rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition-colors duration-200 group-hover:bg-primary-50 group-hover:text-brand">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowLeft className="h-4 w-4 text-neutral-300 transition group-hover:-translate-x-1 group-hover:text-brand" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-body-lg font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-body-sm leading-6 text-muted-foreground">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:p-6">
            <div className="max-w-3xl">
              <p className="text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                شفافية التشغيل
              </p>
              <h2 className="mt-1 text-h2 font-bold text-foreground">
                المزايا غير المتاحة تبقى واضحة
              </h2>
              <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                لا يتم اختلاق مؤشرات أو محادثات أو مراقبة نظام من واجهة الإدارة. أي وظيفة غير مدعومة بعقد Backend حقيقي تظهر كحالة واضحة بدل بيانات وهمية.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatusCard icon={Star} title="مراجعة التقييمات" description="تظهر APIs الخاصة بتقييمات العملاء، لكن لا توجد حاليًا طابور Moderation إداري حقيقي." />
              <StatusCard icon={LifeBuoy} title="الدعم" description="لا توجد محادثات دعم محفوظة على الخادم يمكن للواجهة عرضها كبيانات حقيقية." />
              <StatusCard icon={ShieldCheck} title="المراقبة" description="المراقبة التشغيلية تحتاج endpoint فعليًا للـuptime والـlatency وحالات الصيانة." />
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
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors duration-200 hover:border-neutral-300 hover:bg-surface">
      <Icon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
      <h3 className="mt-4 text-body-sm font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-caption leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}
