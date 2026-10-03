import type { Route } from "next";

import Link from "next/link";

import {
  ArrowUpRight,
  CreditCard,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["Products", "/shop/products"],
      [
        "Categories",
        "/",
      ],
      ["Deals", "/shop/deals"],
      [
        "Visual search",
        "/shop/visual-search",
      ],
    ],
  },

  {
    title: "Account",
    links: [
      ["My account", "/buyer"],
      ["My orders", "/buyer/orders"],
    ],
  },

  {
    title: "Support",
    links: [
      ["AI Support", "/support"],
      [
        "Buyer support",
        "/buyer/support",
      ],
      [
        "Shipping help",
        "/support",
      ],
      [
        "Buyer protection",
        "/support",
      ],
      [
        "Help center",
        "/support",
      ],
    ],
  },
] as const;

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Quality checked",
    text: "Every product is checked before it reaches you",
  },

  {
    icon: CreditCard,
    title: "Secure transactions",
    text: "Protected checkout and payment workflows",
  },

  {
    icon: Truck,
    title: "Delivery details",
    text: "Delivery cost and timing are confirmed during checkout",
  },

  {
    icon: Headphones,
    title: "Customer support",
    text: "Customer support information and account tools",
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">

      <div className="border-b border-slate-200">

        <div className="mx-auto grid max-w-[1440px] gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">

          {trustItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.title
                  }
                  className="group bg-white px-5 py-7 transition hover:bg-slate-50"
                >

                  <div className="flex items-start gap-3">

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] transition group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>

                    <div>
                      <p className="text-sm font-black text-[#0F2747]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.text}
                      </p>
                    </div>

                  </div>

                </div>
              );
            },
          )}

        </div>

      </div>

      <div className="bg-[#0B1830] text-white">

        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

            <div>

              <Link
                href="/"
                className="inline-flex items-center text-2xl font-black tracking-tight"
              >
                Ali
                <span className="text-blue-400">
                  Store
                </span>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                ALI STORE is a single-merchant online store. Product ordering,
                payment and fulfillment are coordinated through one storefront.
              </p>

              <div className="mt-6 space-y-3">

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Globe2 className="h-4 w-4 text-blue-400" />
                  Delivery details at checkout
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Headphones className="h-4 w-4 text-blue-400" />
                  Support through the Help Center
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Secure account and checkout
                </div>

              </div>

              <Link
                href="/shop/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#0F2747] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Browse the catalog
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

            </div>

            {footerGroups.map(
              (group) => (
                <div
                  key={
                    group.title
                  }
                >

                  <h3 className="text-sm font-black">
                    {group.title}
                  </h3>

                  <nav
                    aria-label={
                      group.title
                    }
                    className="mt-5 space-y-3"
                  >
                    {group.links.map(
                      ([
                        label,
                        href,
                      ]) => (
                        <Link
                          key={
                            href +
                            label
                          }
                          href={
                            href as Route
                          }
                          className="group/link flex items-center justify-between rounded-lg py-1 text-sm text-slate-400 transition hover:text-white"
                        >
                          <span>
                            {label}
                          </span>

                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover/link:opacity-100" />
                        </Link>
                      ),
                    )}
                  </nav>

                </div>
              ),
            )}

          </div>

          <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_auto] md:items-center">

            <div>

              <p className="text-sm font-black">
                Need help finding the right product?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Browse the catalog or open the support center.
              </p>

            </div>

            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-xs font-black text-white transition hover:bg-blue-500"
            >
              Open support
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <span>
              © 2026 AliStore
            </span>

            <div className="flex flex-wrap gap-5">

              <Link
                href="/support"
                className="transition hover:text-white"
              >
                Privacy
              </Link>

              <Link
                href="/support"
                className="transition hover:text-white"
              >
                Terms
              </Link>

              <Link
                href="/support"
                className="transition hover:text-white"
              >
                Help
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}
