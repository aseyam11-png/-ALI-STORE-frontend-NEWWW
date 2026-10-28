import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور — ALI STORE",
  description: "استعد الوصول إلى حسابك في ALI STORE عبر التحقق من البريد الإلكتروني.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      focused
      eyebrow="استعادة الوصول"
      title="نسيت كلمة المرور؟"
      description="تحقق من بريدك الإلكتروني واختر كلمة مرور جديدة للعودة إلى حسابك بأمان."
      formFooter={
        <p className="text-center text-body-sm text-muted-foreground">
          تذكّرت كلمة المرور؟{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
