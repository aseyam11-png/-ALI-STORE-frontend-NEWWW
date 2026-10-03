import Link from "next/link";
import {
  CreditCard,
  Headphones,
  MapPin,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const actions = [
  {
    href: "/buyer/orders",
    title: "الطلبات",
    description: "راجع حالة الطلبات والشحنات المرتبطة بحسابك.",
    icon: Package,
  },
  {
    href: "/shop/checkout",
    title: "الدفع وCheckout",
    description: "أعد فتح Checkout لمراجعة السلة والعنوان ووسيلة الدفع.",
    icon: CreditCard,
  },
  {
    href: "/buyer/addresses",
    title: "العناوين",
    description: "أدر عناوين التوصيل المحفوظة في حسابك.",
    icon: MapPin,
  },
  {
    href: "/buyer/profile",
    title: "الحساب",
    description: "راجع معلومات الجلسة الأساسية المرتبطة بحسابك.",
    icon: UserRound,
  },
] as const;

export function SupportCenterContent() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info-surface text-brand">
            <Headphones className="h-5 w-5" />
          </div>

          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
              ALI STORE support
            </p>
            <h2 className="mt-2 text-h2 font-bold tracking-tight text-foreground">
              مركز المساعدة
            </h2>
            <p className="mt-2 max-w-2xl text-body leading-7 text-muted-foreground">
              استخدم المسارات المرتبطة ببيانات حسابك وطلباتك الفعلية للوصول إلى المعلومات المطلوبة.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-body font-bold text-amber-900">
              المحادثة المباشرة غير متصلة حاليًا
            </h2>
            <p className="mt-1 text-body-sm leading-6 text-amber-800">
              لا يتم عرض محادثات تجريبية أو إنشاء طلب دعم وهمي. عندما يتوفر عقد Support حقيقي في الـBackend يمكن ربط هذه الواجهة به دون تغيير بيانات الطلبات أو الحسابات.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-neutral-200 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-brand transition group-hover:bg-info-surface">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body font-bold text-foreground">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-surface p-5">
        <p className="text-caption font-medium text-muted-foreground">
          للدعم المرتبط بطلب محدد، ابدأ من صفحة الطلب نفسها حتى تبقى حالة الطلب والشحنة مرتبطة بالبيانات التي يعيدها الخادم.
        </p>
      </section>
    </div>
  );
}
