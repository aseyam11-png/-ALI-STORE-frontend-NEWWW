"use client";

import Link from "next/link";
import { LogIn, Mail, Phone, UserRound } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";

export default function BuyerProfilePage() {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <AccountWorkspace
        activeTab="profile"
        title="الملف الشخصي"
        description="إدارة معلومات التواصل المرتبطة بجلسة حسابك."
      >
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <UserRound className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول للوصول إلى ملفك الشخصي
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
            بيانات الاسم والبريد والهاتف تُقرأ من جلسة حسابك الحالية.
          </p>
          <Link
            href="/login?next=/buyer/profile"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-body font-medium text-white"
          >
            <LogIn className="me-2 h-4 w-4" />
            تسجيل الدخول
          </Link>
        </div>
      </AccountWorkspace>
    );
  }

  const user = session.user;

  return (
    <AccountWorkspace
      activeTab="profile"
      title="الملف الشخصي"
      description="معلومات الحساب التي تم التحقق منها في جلسة ALI STORE الحالية."
    >
      <section className="rounded-md border border-neutral-200 bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-brand">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              الحساب النشط
            </p>
          </div>
        </div>

        <dl className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-neutral-200 p-4">
            <dt className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              البريد الإلكتروني
            </dt>
            <dd className="mt-2 break-all text-body font-medium text-foreground">
              {user.email}
            </dd>
          </div>

          <div className="rounded-md border border-neutral-200 p-4">
            <dt className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
              <Phone className="h-4 w-4" />
              رقم الهاتف
            </dt>
            <dd className="mt-2 text-body font-medium text-foreground">
              {user.phoneNumber || "غير متوفر في الجلسة الحالية"}
            </dd>
          </div>
        </dl>
      </section>
    </AccountWorkspace>
  );
}
