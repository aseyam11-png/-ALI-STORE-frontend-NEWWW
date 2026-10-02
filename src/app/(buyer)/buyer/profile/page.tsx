"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";

// Same honest boundary as the rest of the account workspace (see
// buyer/page.tsx): there is no auth/profile backend in this repository, so
// this never fabricates a name, email, or avatar. It exists so the
// AccountWorkspace "profile" tab (src/components/commerce/account/
// AccountWorkspace.tsx) links to a real page instead of a 404/type error,
// and is ready to hold a real edit form the day a real account backend
// exists.
export default function BuyerProfilePage() {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  return (
    <AccountWorkspace
      activeTab="profile"
      title="الملف الشخصي"
      description="إدارة اسمك ومعلومات التواصل الخاصة بحسابك."
    >
      <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
        <UserRound className="mx-auto h-9 w-9 text-neutral-300" />

        <h2 className="mt-4 text-h3 font-bold text-foreground">
          {isAuthenticated
            ? "لا توجد بيانات ملف شخصي بعد"
            : "سجّل الدخول لإدارة ملفك الشخصي"}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
          {isAuthenticated
            ? "تعديل الاسم والبريد الإلكتروني ورقم الهاتف سيكون متاحًا هنا فور ربط حساب حقيقي."
            : "بيانات الملف الشخصي مرتبطة بحسابك — سجّل الدخول أولًا للوصول إليها."}
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
