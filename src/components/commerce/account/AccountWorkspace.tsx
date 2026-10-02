import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/session";

// The one customer Account Workspace shell. Before this, /buyer,
// /buyer/orders, /buyer/wishlist and /buyer/addresses were four
// disconnected pages — two different shells (CustomerShell vs. the legacy
// AppShell), two different visual languages (tokenized Arabic vs.
// hardcoded-hex English), and no shared navigation between them. Every
// existing URL still works exactly as before (this is a shell/presentation
// change, not a routing change) — they now share one header, one tab bar,
// and one design language, so moving between them feels like one account
// experience instead of four separate apps.
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
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login?next=/buyer");
    }
  }, [router, session.status]);

  if (session.status !== "authenticated") {
    return (
      <CustomerShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">
          جارٍ التحقق من جلسة الحساب...
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-10">
          <h1 className="text-h1 font-bold tracking-tight text-foreground">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-body text-muted-foreground">
            {description}
          </p>

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
                  className={`shrink-0 border-b-2 px-4 py-3 text-body font-medium transition-colors duration-200 ease-brand ${
                    active
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="bg-background">
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
          {children}
        </div>
      </div>
    </CustomerShell>
  );
}
