import Link from "next/link";
import { HelpCircle, Headphones, Package, ShieldCheck, Truck } from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";

const faqs = [
  {
    icon: Package,
    title: "أين أجد حالة طلبي؟",
    body: "بعد تسجيل الدخول، افتح الطلبات لمشاهدة الحالة والشحنة ورقم التتبع عند توفره.",
  },
  {
    icon: Truck,
    title: "كيف يتم الشحن؟",
    body: "يتم حساب تكلفة ومدة الشحن من الخادم حسب طريقة الشحن والطلب قبل التأكيد.",
  },
  {
    icon: ShieldCheck,
    title: "هل الدفع والطلب آمنان؟",
    body: "السعر النهائي والتحقق من المخزون والطلب يتم على الخادم، ولا نعتمد على قيمة يرسلها المتصفح وحدها.",
  },
  {
    icon: HelpCircle,
    title: "أحتاج مساعدة إضافية",
    body: "افتح محادثة دعم محفوظة على حسابك وسيتمكن فريق الدعم من متابعة الموضوع من نفس المحادثة.",
  },
];

export default function SupportPage() {
  return (
    <CustomerShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-brand">
              <Headphones className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              مركز المساعدة
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              إجابات سريعة ونقطة دعم واحدة محفوظة على حسابك.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => {
              const Icon = faq.icon;
              return (
                <article key={faq.title} className="rounded-2xl border border-neutral-200 bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{faq.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.body}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-6">
            <h2 className="text-lg font-bold text-foreground">تواصل مع الدعم</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              تحتاج إلى متابعة مشكلة محددة؟ سجّل الدخول وافتح محادثة دعم محفوظة على حسابك.
            </p>
            <Link
              href="/buyer/support"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              فتح الدعم
            </Link>
          </div>
        </section>
      </main>
    </CustomerShell>
  );
}
