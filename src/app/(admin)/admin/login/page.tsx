import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "دخول الإدارة — ALI STORE",
  description: "تسجيل دخول آمن إلى لوحة إدارة ALI STORE.",
};

export default function AdminLoginPage() {
  return (
    <AuthShell
      eyebrow="مساحة محمية"
      title="دخول الإدارة"
      description="هذه الصفحة مخصصة لحسابات إدارة المتجر فقط."
      focused
      formFooter={
        <div className="space-y-3 text-center text-body-sm text-muted-foreground">
          <p>
            أنت عميل؟{" "}
            <Link
              href="/login"
              className="font-medium text-brand hover:underline"
            >
              تسجيل دخول العملاء
            </Link>
          </p>
          <p>
            <Link href="/" className="font-medium text-brand hover:underline">
              العودة إلى المتجر
            </Link>
          </p>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-50" />
        }
      >
        <AdminLoginForm />
      </Suspense>
    </AuthShell>
  );
}
