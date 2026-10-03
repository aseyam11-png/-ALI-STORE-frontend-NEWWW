import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول — ALI STORE",
  description: "سجّل الدخول إلى حسابك في ALI STORE.",
};

// Server Component shell; only the form itself needs to be a client
// island (input state, submit handling) — matches the rest of the
// customer experience's server-first composition.
export default function LoginPage() {
  return (
    <CustomerShell>
      <section className="bg-background">
        <div className="mx-auto flex max-w-[1600px] justify-center px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="w-full max-w-md">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
              <ShieldCheck className="h-3.5 w-3.5" />
              ALI STORE
            </div>

            <h1 className="mt-6 text-h1 font-bold tracking-tight text-foreground">
              تسجيل الدخول
            </h1>

            <p className="mt-2 text-body text-muted-foreground">
              أدخل بياناتك للوصول إلى حسابك.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>

            <p className="mt-8 text-center text-body-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-medium text-brand hover:text-brand-hover"
              >
                إنشاء حساب جديد
              </Link>
            </p>

            <p className="mt-3 text-center text-body-sm text-muted-foreground">
              تريد التسوق فقط؟{" "}
              <Link
                href="/shop/products"
                className="font-medium text-brand hover:text-brand-hover"
              >
                تصفّح المنتجات بدون تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
