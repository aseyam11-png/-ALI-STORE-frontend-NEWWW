"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { logout, useSession } from "@/features/auth/session";

export default function BuyerSecurityPage() {
  const session = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await logout();
      router.replace("/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تسجيل الخروج.",
      );
      setBusy(false);
    }
  };

  if (session.status !== "authenticated") {
    return (
      <AccountWorkspace
        activeTab="security"
        title="الأمان"
        description="حماية جلسة حسابك وتسجيل الخروج الآمن."
      >
        <div className="rounded-md border border-neutral-200 bg-surface p-10 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول لإدارة أمان الحساب
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
            لا نعرض إعدادات أمان غير مدعومة. استخدم جلسة الحساب الحقيقية لتسجيل الدخول والخروج.
          </p>
          <Link
            href="/login?next=/buyer/security"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-body font-medium text-white"
          >
            <LogIn className="me-2 h-4 w-4" />
            تسجيل الدخول
          </Link>
        </div>
      </AccountWorkspace>
    );
  }

  return (
    <AccountWorkspace
      activeTab="security"
      title="الأمان"
      description="حالة جلسة الحساب وإجراء تسجيل الخروج الآمن."
    >
      <section className="rounded-md border border-success-100 bg-success-surface p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-surface text-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-body font-bold text-foreground">
              الجلسة الحالية موثقة
            </h2>
            <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
              المصادقة تتم عبر جلسة ALI STORE الآمنة. لا يتم عرض رموز الجلسة أو الأسرار داخل الواجهة.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="mt-5 rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
          {error}
        </div>
      )}

      <section className="mt-5 rounded-md border border-neutral-200 bg-surface p-6">
        <h2 className="text-body font-bold text-foreground">
          تسجيل الخروج
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          أنهِ الجلسة الحالية من خلال الخادم قبل مغادرة الحساب.
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={busy}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-danger-200 px-5 text-body-sm font-bold text-danger-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {busy ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
        </button>
      </section>
    </AccountWorkspace>
  );
}
