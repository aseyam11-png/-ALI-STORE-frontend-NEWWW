import type { Metadata } from "next";
import Link from "next/link";

import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "دخول الإدارة — ALI STORE",
  description: "تسجيل دخول آمن إلى لوحة إدارة ALI STORE.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function isAdministrativePath(path: string): boolean {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/warehouse" ||
    path.startsWith("/warehouse/")
  );
}

function resolveSafeNextPath(value: string | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    !isAdministrativePath(value)
  ) {
    return "/admin";
  }

  return value;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const requestedNextPath = Array.isArray(params.next)
    ? params.next[0]
    : params.next;
  const nextPath = resolveSafeNextPath(requestedNextPath);

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
      <AdminLoginForm nextPath={nextPath} />
    </AuthShell>
  );
}
