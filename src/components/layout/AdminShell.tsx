"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/features/auth/session";

import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Star,
  Truck,
  X,
} from "lucide-react";

import { LocalizationProvider } from "../providers/LocalizationProvider";

const adminNav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: BarChart3,
  },
  {
    label: "Shipments",
    href: "/admin/shipments",
    icon: Truck,
  },
  {
    label: "Payments",
    href: "/admin/finance",
    icon: CreditCard,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    label: "Settings",
    href: "/system",
    icon: Settings,
  },
] as const;

interface AdminShellProps {
  children: ReactNode;
}

function AdminNavLinks({
  isActive,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      {adminNav.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-blue-50 text-[#2563EB]"
                : "text-slate-600 hover:bg-slate-50 hover:text-[#2563EB]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href ||
        (pathname?.startsWith(`${href}/`) ?? false);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/admin")}`);
    } else if (
      session.status === "authenticated" &&
      session.user?.role !== "ADMIN"
    ) {
      router.replace("/buyer");
    }
  }, [pathname, router, session.status, session.user?.role]);

  if (session.status !== "authenticated" || session.user?.role !== "ADMIN") {
    return (
      <LocalizationProvider>
        <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
          <p className="text-sm font-bold text-slate-500">
            Checking administrator access...
          </p>
        </main>
      </LocalizationProvider>
    );
  }

  // Same accessible-drawer contract already established for the customer
  // header's mobile menu (HomeHeader.tsx): initial focus, Escape-to-close,
  // Tab-trapped focus, scroll lock, focus restored to the trigger on close.
  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuPanelRef.current) {
        return;
      }

      const focusable = menuPanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const trigger = menuTriggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [mobileNavOpen]);

  return (
    <LocalizationProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

        <header className="border-b border-slate-800 bg-[#0F172A] text-white">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="فتح قائمة الإدارة"
              aria-expanded={mobileNavOpen}
              aria-controls="admin-mobile-nav"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-200 hover:bg-white/10 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-black"
            >
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Ali<span className="text-blue-400">Store</span>
              <span className="ms-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-200">
                Admin
              </span>
            </Link>

            <Link
              href="/"
              className="text-xs font-bold text-blue-200 transition hover:text-white"
            >
              Exit to store
            </Link>

          </div>
        </header>

        <div className="mx-auto flex max-w-[1440px] items-start">

          <nav
            aria-label="Admin navigation"
            className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-e border-slate-200 bg-white p-4 md:block"
          >
            <AdminNavLinks isActive={isActive} />
          </nav>

          <main className="min-w-0 flex-1 overflow-x-clip">
            {children}
          </main>

        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              type="button"
              aria-label="إغلاق قائمة الإدارة"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-slate-950/50"
            />

            <div
              id="admin-mobile-nav"
              ref={menuPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="قائمة الإدارة"
              className="absolute inset-y-0 start-0 flex w-[min(84vw,320px)] flex-col overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <span className="flex items-center gap-2 text-sm font-black text-[#0F172A]">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                  Admin
                </span>

                <button
                  ref={menuCloseRef}
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="إغلاق قائمة الإدارة"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                <AdminNavLinks
                  isActive={isActive}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </LocalizationProvider>
  );
}
