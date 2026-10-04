import type { ReactNode } from "react";
import Link from "next/link";
import {
  Heart,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Package,
  UserRound,
} from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";

const ACCOUNT_TABS = [
  { id: "overview", label: "نظرة عامة", href: "/buyer", icon: UserRound },
  { id: "orders", label: "الطلبات", href: "/buyer/orders", icon: Package },
  { id: "wishlist", label: "المفضلة", href: "/buyer/wishlist", icon: Heart },
  { id: "addresses", label: "العناوين", href: "/buyer/addresses", icon: MapPin },
  { id: "profile", label: "الملف الشخصي", href: "/buyer/profile", icon: UserRound },
  { id: "security", label: "الأمان", href: "/buyer/security", icon: LockKeyhole },
  { id: "support", label: "الدعم", href: "/buyer/support", icon: MessageCircle },
] as const;

type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];
export type { AccountTabId };

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
  return (
    <CustomerShell>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="container-shell pt-7 sm:pt-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                مساحة حسابك
              </span>
              <h1 className="mt-3 text-h1 font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-body text-muted-foreground">
                {description}
              </p>
            </div>

            <Link
              href="/shop/products"
              className="hidden h-10 items-center rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand sm:inline-flex"
            >
              متابعة التسوق
            </Link>
          </div>

          <nav
            aria-label="أقسام الحساب"
            className="mt-7 flex gap-1 overflow-x-auto scroll-surface [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {ACCOUNT_TABS.map((tab) => {
              const active = tab.id === activeTab;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative flex min-h-12 shrink-0 items-center gap-2 rounded-t-xl px-4 text-body-sm font-medium transition-all duration-200 ease-brand " +
                    (active
                      ? "bg-primary-50 text-brand"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="bg-background">
        <div className="container-shell py-7 sm:py-8">{children}</div>
      </div>
    </CustomerShell>
  );
}
