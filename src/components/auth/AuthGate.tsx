"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/features/auth/session";

interface AuthGateProps {
  children: ReactNode;
  requiredRole?: string;
}

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login?next=" + encodeURIComponent(pathname ?? "/"));
      return;
    }

    if (session.status === "authenticated" && requiredRole && session.user?.role !== requiredRole) {
      router.replace("/buyer");
    }
  }, [pathname, requiredRole, router, session.status, session.user?.role]);

  if (session.status !== "authenticated") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="rounded-xl border border-neutral-200 bg-surface px-6 py-8 text-center" aria-live="polite">
          <p className="text-sm font-bold text-foreground">جارٍ التحقق من الحساب…</p>
        </div>
      </main>
    );
  }

  if (requiredRole && session.user?.role !== requiredRole) return null;
  return <>{children}</>;
}