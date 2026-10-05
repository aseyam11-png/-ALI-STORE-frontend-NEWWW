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
      description="أدخل رمز التحقق الذي أرسلناه إلى بريدك لإكمال تسجيل الدخول أو إنشاء الحساب بأمان."
      formFooter={
        <p className="text-center text-body-sm text-muted-foreground">
          تريد البدء من جديد؟{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
          >
            العودة لتسجيل الدخول
          </Link>
        </p>
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
