"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

import { LocalizationProvider } from "../providers/LocalizationProvider";

const adminNav = [
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "المنتجات", href: "/admin/products", icon: Package },
  { label: "الطلبات والشحن", href: "/admin/orders", icon: ShoppingBag },
  { label: "التسعير", href: "/admin/pricing", icon: BarChart3 },
  { label: "المدفوعات", href: "/admin/finance", icon: CreditCard },
  { label: "التنفيذ", href: "/warehouse", icon: Boxes },
] as const;

interface AdminShellProps {
  children: ReactNode;
}

function AdminNavLinks({
  isActive,
  onNavigate,
  collapsed = false,
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
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
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={
              "group relative flex min-h-11 items-center rounded-xl text-body-sm font-medium transition-all duration-200 ease-brand " +
              (collapsed
                ? "justify-center px-2"
                : "gap-3 px-3") +
              " " +
              (active
                ? "bg-primary-50 text-brand"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-brand")
            }
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-brand"
              />
            )}
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href ||
        (pathname?.startsWith(`${href}/`) ?? false);

  useEffect(() => {
    if (!mobileNavOpen) return;

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

      if (focusable.length === 0) return;

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
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-ink-700 bg-ink-900 text-white shadow-floating">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="فتح قائمة الإدارة"
              aria-expanded={mobileNavOpen}
              aria-controls="admin-mobile-nav"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-200 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/admin" className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary-200">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-bold">
                Ali<span className="text-primary-300">Store</span>
              </span>
              <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-label font-medium text-primary-200 sm:inline-flex">
                Admin
              </span>
            </Link>

            <div className="ms-auto hidden items-center gap-2 md:flex">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-caption text-white/60">
                عمليات المتجر
              </span>
              <Link
                href="/"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-body-sm font-medium text-primary-200 transition hover:bg-white/10 hover:text-white"
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                المتجر
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1600px] items-start">
          <aside
            className={
              "sticky top-14 hidden h-[calc(100vh-56px)] shrink-0 border-e border-neutral-200 bg-surface transition-[width] duration-300 ease-brand md:block " +
              (collapsed ? "w-[76px]" : "w-60")
            }
          >
            <div className="flex h-full flex-col p-3">
              <div
                className={
                  "mb-4 flex items-center rounded-xl bg-neutral-50 p-2 " +
                  (collapsed ? "justify-center" : "justify-between gap-2")
                }
              >
                {!collapsed && (
                  <div className="min-w-0 px-1">
                    <p className="text-caption font-medium text-muted-foreground">
                      مساحة العمل
                    </p>
                    <p className="truncate text-body-sm font-bold text-foreground">
                      إدارة ALI STORE
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  aria-label={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
                  title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-surface hover:text-brand"
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-4.5 w-4.5" />
                  ) : (
                    <PanelLeftClose className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              {!collapsed && (
                <p className="mb-2 px-3 text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                  التشغيل
                </p>
              )}

              <AdminNavLinks isActive={isActive} collapsed={collapsed} />

              <div
                className={
                  "mt-auto border-t border-neutral-200 pt-3 " +
                  (collapsed ? "flex justify-center" : "")
                }
              >
                <Link
                  href="/"
                  title={collapsed ? "العودة للمتجر" : undefined}
                  aria-label={collapsed ? "العودة للمتجر" : undefined}
                  className={
                    "group flex min-h-11 items-center rounded-xl text-body-sm font-medium text-neutral-500 transition hover:bg-neutral-50 hover:text-brand " +
                    (collapsed ? "justify-center px-2" : "gap-3 px-3")
                  }
                >
                  {collapsed ? (
                    <ChevronLeft className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                  {!collapsed && <span>العودة للمتجر</span>}
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-[var(--z-modal)] md:hidden">
            <button
              type="button"
              aria-label="إغلاق قائمة الإدارة"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            />

            <div
              id="admin-mobile-nav"
              ref={menuPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="قائمة الإدارة"
              className="absolute inset-y-0 end-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto bg-surface shadow-modal"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    إدارة ALI STORE
                  </p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    تشغيل المتجر من مكان واحد
                  </p>
                </div>

                <button
                  ref={menuCloseRef}
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="إغلاق قائمة الإدارة"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-4">
                <p className="mb-2 px-3 text-label font-bold uppercase tracking-[0.16em] text-neutral-400">
                  التشغيل
                </p>
                <AdminNavLinks
                  isActive={isActive}
                  onNavigate={() => setMobileNavOpen(false)}
                />

                <Link
                  href="/"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-5 flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-3 text-body-sm font-medium text-neutral-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
                >
                  <Store className="h-4.5 w-4.5" aria-hidden="true" />
                  العودة للمتجر
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
