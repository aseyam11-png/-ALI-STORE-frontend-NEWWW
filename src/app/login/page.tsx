import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول — ALI STORE",
  description: "سجّل الدخول إلى حسابك في ALI STORE.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="الوصول إلى حسابك"
      title="تسجيل الدخول"
      description="سجّل الدخول للوصول إلى طلباتك وعناوينك وإشعاراتك ومتابعة تجربتك في ALI STORE."
      formFooter={
        <div className="space-y-3 text-center text-body-sm text-muted-foreground">
          <p>
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </p>
          <p>
            هل أنت مدير المتجر؟{" "}
            <Link
              href="/admin/login"
              className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
            >
              دخول الإدارة
            </Link>
          </p>
          <p>
            تريد التسوق فقط؟{" "}
            <Link
              href="/shop/products"
              className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
            >
              تصفّح المنتجات
            </Link>
          </p>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
