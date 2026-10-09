"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/features/auth/session";

export function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = session.user?.role?.trim().toUpperCase().replace(/^ROLE_/, "");
  const isAdministrator = session.status === "authenticated" && role === "ADMIN";

  useEffect(() => {
    if (session.status === "unauthenticated") {
      const returnPath =
        pathname?.startsWith("/admin") || pathname?.startsWith("/warehouse")
          ? pathname
          : "/admin";
      router.replace("/login?next=" + encodeURIComponent(returnPath));
    }
  }, [pathname, router, session.status]);

  if (session.status === "loading") {
    return (
      <main
        className="grid min-h-screen place-items-center bg-background px-5"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-surface p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
          <div className="mt-4 h-3 w-full animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-neutral-100" />
          <p className="mt-5 text-xs text-neutral-500">جارٍ التحقق من صلاحيات الإدارة…</p>
        </div>
      </main>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <p role="status" className="text-sm text-neutral-500">يتم تحويلك إلى تسجيل الدخول…</p>
      </main>
    );
  }

  if (!isAdministrator) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
        <section
          className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-surface p-7 text-center"
          role="alert"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-danger-600">
            403 · Forbidden
          </p>
          <h1 className="mt-3 text-2xl font-black text-foreground">لا تملك صلاحية الوصول</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            هذه المساحة مخصصة لحسابات الإدارة فقط. لن يتم عرض محتوى صفحات الإدارة لهذا الحساب.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white"
          >
            العودة إلى المتجر
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
