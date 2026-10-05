import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب — ALI STORE",
  description: "أنشئ حسابك في ALI STORE.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="ابدأ تجربتك"
      title="إنشاء حساب"
      description="أنشئ حسابك واحفظ طلباتك وعناوينك لتجربة شراء أسهل وأكثر تنظيمًا."
      formFooter={
        <p className="text-center text-body-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline-offset-4 hover:text-brand hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
