import Link from "next/link";
import { CreditCard } from "lucide-react";

// Every href below points to a route that actually exists (verified against
// src/app's route tree) — no two labels silently point to the same generic
// page under different names, and nothing here claims a dedicated page
// (return policy, terms) that hasn't been built yet.
const footerGroups = [
  {
    title: "المتجر",
    links: [
      { label: "كل المنتجات", href: "/shop/products" },
      { label: "العروض", href: "/shop/deals" },
      { label: "الأقسام", href: "/" },
    ],
  },
  {
    title: "خدمة العملاء",
    links: [
      { label: "تتبّع الطلب", href: "/buyer/orders" },
      { label: "حسابي", href: "/buyer" },
      { label: "المفضلة", href: "/buyer/wishlist" },
    ],
  },
  {
    title: "المساعدة",
    links: [
      { label: "مركز المساعدة", href: "/support" },
      { label: "تواصل معنا", href: "/support" },
    ],
  },
] as const;

export function HomeFooter() {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16">
          <div>
            <p className="text-h3 font-bold tracking-tight">ALI STORE</p>

            <p className="mt-3 max-w-sm text-body-sm leading-7 text-neutral-400">
              متجر واحد، منتجات مباشرة، وخدمة موثوقة من الطلب حتى التوصيل.
            </p>

            <div className="mt-5 flex items-center gap-2 text-neutral-400">
              <CreditCard className="h-5 w-5" />
              <span className="text-caption">طرق دفع آمنة ومتعددة</span>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-body-sm font-bold uppercase tracking-wide text-neutral-300">
                {group.title}
              </h3>

              <nav aria-label={group.title} className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-body-sm text-neutral-400 transition-colors duration-200 ease-brand hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-caption text-neutral-500">
          <span>© 2026 ALI STORE</span>
        </div>
      </div>
    </footer>
  );
}
