import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب — ALI STORE",
  description: "أنشئ حسابك في ALI STORE.",
};

export default function RegisterPage() {
  return (
    <CustomerShell>
      <section className="bg-background">
        <div className="container-shell py-8 sm:py-12 lg:py-16">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-surface shadow-modal lg:grid-cols-[1.1fr_0.9fr]">
            <div className="order-2 p-5 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
              <div className="mx-auto w-full max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-label font-bold text-brand lg:hidden">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ALI STORE
                </span>

                <h1 className="mt-4 text-h1 font-bold tracking-tight text-foreground sm:mt-0">
                  إنشاء حساب
                </h1>

                <p className="mt-2 max-w-xl text-body leading-7 text-muted-foreground">
                  أنشئ حسابك مرة واحدة واحفظ طلباتك وعناوين التوصيل والمفضلة.
                </p>

                <div className="mt-7">
                  <RegisterForm />
                </div>

                <p className="mt-7 text-center text-body-sm text-muted-foreground">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="font-bold text-brand transition hover:text-brand-hover">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </div>

            <aside className="relative order-1 overflow-hidden bg-primary-50 p-7 lg:order-2 lg:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-16 -top-20 h-52 w-52 rounded-full bg-primary-100 blur-3xl"
              />

              <div className="relative flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-surface/80 px-3 py-1.5 text-label font-bold text-brand">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  تجربة حساب أبسط
                </span>

                <h2 className="mt-7 text-3xl font-bold leading-tight text-foreground xl:text-4xl">
                  جاهز لتجربة
                  <br />
                  تسوّق أكثر سلاسة؟
                </h2>

                <p className="mt-4 max-w-md text-body leading-7 text-muted-foreground">
                  اجمع تفاصيل حسابك في مساحة واحدة وارجع إلى ما تحتاجه بسرعة بدل إعادة إدخال بياناتك كل مرة.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: Package, title: "الطلبات", text: "الوصول إلى السجل والحالات المحدثة." },
                    { icon: MapPin, title: "العناوين", text: "حفظ عناوين التوصيل لاستخدامها في Checkout." },
                    { icon: Heart, title: "المفضلة", text: "احتفظ بالمنتجات للعودة إليها لاحقًا." },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-2xl border border-primary-100 bg-surface/80 p-4 shadow-sm backdrop-blur">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-body-sm font-bold text-foreground">{title}</p>
                          <p className="mt-1 text-caption leading-5 text-muted-foreground">{text}</p>
                        </div>
                        <CheckCircle2 className="ms-auto mt-1 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/shop/products"
                  className="mt-auto hidden items-center gap-2 pt-8 text-body-sm font-bold text-brand lg:inline-flex"
                >
                  الاستمرار بالتسوق كزائر
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
