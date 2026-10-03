import type { ReactNode } from "react";
import Link from "next/link";

import { CustomerShell } from "@/components/commerce/CustomerShell";

const ACCOUNT_TABS = [
  { id: "overview", label: "نظرة عامة", href: "/buyer" },
  { id: "orders", label: "الطلبات", href: "/buyer/orders" },
  { id: "wishlist", label: "المفضلة", href: "/buyer/wishlist" },
  { id: "addresses", label: "العناوين", href: "/buyer/addresses" },
  { id: "profile", label: "الملف الشخصي", href: "/buyer/profile" },
  { id: "security", label: "الأمان", href: "/buyer/security" },
  { id: "support", label: "الدعم", href: "/buyer/support" },
] as const;

type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];
export type { AccountTabId };

interface AccountWorkspaceProps {
  activeTab: AccountTabId;
  title: string;
  description: string;
  children: ReactNode;
}

export function AccountWorkspace({ activeTab, title, description, children }: AccountWorkspaceProps) {
  return (
    <CustomerShell>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8">
          <span className="text-label font-bold uppercase tracking-[0.16em] text-brand">My account</span>
          <h1 className="mt-2 text-h1 font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-body text-muted-foreground">{description}</p>

          <nav aria-label="أقسام الحساب" className="mt-7 flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {ACCOUNT_TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative shrink-0 rounded-t-xl px-4 py-3 text-body-sm font-medium transition-colors duration-200 ease-brand " +
                    (active
                      ? "bg-primary-50 text-brand"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800")
                  }
                >
                  {tab.label}
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="bg-background">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </CustomerShell>
  );
}
