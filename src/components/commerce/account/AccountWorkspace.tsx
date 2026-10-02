"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { useAuthStore } from "@/stores/auth-store";

const ACCOUNT_TABS = [
  { id: "overview", label: "نظرة عامة", href: "/buyer" },
  { id: "orders", label: "الطلبات", href: "/buyer/orders" },
  { id: "wishlist", label: "المفضلة", href: "/buyer/wishlist" },
  { id: "addresses", label: "العناوين", href: "/buyer/addresses" },
  { id: "profile", label: "الملف الشخصي", href: "/buyer/profile" },
  { id: "security", label: "الأمان", href: "/buyer/security" },
  { id: "support", label: "الدعم", href: "/buyer/support" },
] as const;

export type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];

interface AccountWorkspaceProps {
  activeTab: AccountTabId;
  title: string;
  description: string;
  children: ReactNode;
}

export function AccountWorkspace({
  activeTab,
  title,
  description,
  children,
}: AccountWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <CustomerShell>
        <main className="min-h-[60vh] bg-background">
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <p className="text-sm font-bold text-muted-foreground">جاري التحقق من الحساب...</p>
          </div>
        </main>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-10">
          <h1 className="text-h1 font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-body text-muted-foreground">{description}</p>

          <nav
            aria-label="أقسام الحساب"
            className="mt-8 flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {ACCOUNT_TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 border-b-2 px-4 py-3 text-body font-medium transition-colors duration-200 ease-brand ${active ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="bg-background">
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">{children}</div>
      </div>
    </CustomerShell>
  );
}
