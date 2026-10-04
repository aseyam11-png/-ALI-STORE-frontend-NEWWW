import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Package,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول — ALI STORE",
  description: "سجّل الدخول إلى حسابك في ALI STORE.",
};

export default function LoginPage() {
  return (
    <CustomerShell>
      <section className="bg-background">
        <div className="container-shell py-8 sm:py-12 lg:py-16">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-surface shadow-modal lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative hidden overflow-hidden bg-ink-900 p-8 text-text-inverse lg:flex lg:flex-col lg:justify-between xl:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-20 -top-16 h-56 w-56 rounded-full bg-primary-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -start-20 h-64 w-64 rounded-full bg-primary-300/10 blur-3xl"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-label font-bold text-primary-300">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ALI STORE
                </span>

                <h2 className="mt-7 text-3xl font-bold leading-tight text-white xl:text-4xl">
                  كل مشترياتك،
                  <br />
                  في مساحة واحدة.
                </h2>
                <p className="mt-4 max-w-md text-body leading-7 text-ink-200">
                  سجّل الدخول للوصول إلى الطلبات والعناوين والمفضلة، مع تجربة متسقة على الجوال والكمبيوتر.
                </p>
              </div>

              <div className="relative mt-10 space-y-3">
                {[
                  { icon: Package, text: "متابعة حالة الطلب والشحن" },
                  { icon: Heart, text: "حفظ المنتجات التي تهمك" },
                  { icon: ShoppingCart, text: "سلة متزامنة للحساب" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-800/80 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-700 text-primary-300">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-body-sm font-bold text-ink-100">{text}</span>
                    <CheckCircle2 className="ms-auto h-4 w-4 text-success-500" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </aside>

            <div className="p-5 sm:p-8 lg:p-10 xl:p-12">
              <div className="mx-auto w-full max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-label font-bold text-brand lg:hidden">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ALI STORE
                </span>

                <h1 className="mt-4 text-h1 font-bold tracking-tight text-foreground sm:mt-0">
                  تسجيل الدخول
                </h1>

                <p className="mt-2 text-body leading-7 text-muted-foreground">
                  أدخل بياناتك للوصول إلى حسابك ومتابعة تجربة الشراء.
                </p>

                <div className="mt-7">
                  <Suspense
                    fallback={
                      <div className="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" />
                    }
                  >
                    <LoginForm />
                  </Suspense>
                </div>

                <p className="mt-7 text-center text-body-sm text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <Link href="/register" className="font-bold text-brand transition hover:text-brand-hover">
                    إنشاء حساب جديد
                  </Link>
                </p>

                <Link
                  href="/shop/products"
                  className="mt-3 flex items-center justify-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-brand"
                >
                  تصفّح المنتجات بدون تسجيل الدخول
                  <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
