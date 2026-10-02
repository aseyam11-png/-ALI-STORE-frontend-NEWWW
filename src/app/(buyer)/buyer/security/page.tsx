"use client";

import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";

// Same honest boundary as buyer/profile/page.tsx and the rest of the
// account workspace — no password/session backend exists in this
// repository, so this never pretends a password can be changed or a
// session can be reviewed. Exists so the AccountWorkspace "security" tab
// links to a real page instead of a 404/type error.
export default function BuyerSecurityPage() {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  return (
    <AccountWorkspace
      activeTab="security"
      title="الأمان"
      description="كلمة المرور والجلسات النشطة على حسابك."
    >
      <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-neutral-300" />

        <h2 className="mt-4 text-h3 font-bold text-foreground">
          {isAuthenticated
            ? "لا توجد إعدادات أمان بعد"
            : "سجّل الدخول لإدارة إعدادات الأمان"}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
          {isAuthenticated
            ? "تغيير كلمة المرور ومراجعة الجلسات النشطة سيكون متاحًا هنا فور ربط حساب حقيقي."
            : "إعدادات الأمان مرتبطة بحسابك — سجّل الدخول أولًا للوصول إليها."}
        </p>

        {!isAuthenticated && (
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-body font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <LogIn className="me-2 h-4 w-4" />
            تسجيل الدخول
          </Link>
        )}
      </div>
    </AccountWorkspace>
  );
}
