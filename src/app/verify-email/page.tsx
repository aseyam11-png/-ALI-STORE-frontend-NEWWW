import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";

export const metadata: Metadata = {
  title: "تأكيد البريد الإلكتروني — ALI STORE",
  description: "أكد بريدك الإلكتروني لإكمال المصادقة في ALI STORE.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow="خطوة أمان"
      title="تأكيد البريد الإلكتروني"
      description="أدخل رمز التحقق الذي أرسلناه إلى بريدك لإكمال العملية. إذا كان لديك حساب بالفعل أو لم يصلك رمز الاستعادة، يمكنك العودة لتسجيل الدخول أو استعادة كلمة المرور."
      formFooter={
        <div className="space-y-3 text-center text-body-sm text-muted-foreground">
          <p>
            تريد البدء من جديد؟{" "}
            <Link
              href="/login"
              className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
            >
              العودة لتسجيل الدخول
            </Link>
          </p>
          <p>
            تحتاج إلى إعادة تعيين كلمة المرور؟{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
            >
              استعادة كلمة المرور
            </Link>
          </p>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" />
        }
      >
        <EmailOtpForm />
      </Suspense>
    </AuthShell>
  );
}
