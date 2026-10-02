import Link from "next/link";
import {
  ShieldCheck,
  Globe2,
  Headphones,
} from "lucide-react";

import { LocaleCurrencySwitcher } from "@/components/localization/LocaleCurrencySwitcher";

export function TopBar() {
  return (
    <div className="bg-[#0F2747] text-slate-200">
      <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-4 px-4 text-[11px] sm:px-6 lg:px-8">

        <div className="flex min-w-0 items-center gap-4">

          <span className="hidden items-center gap-1.5 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Every product checked by AliStore
          </span>

          <span className="hidden items-center gap-1.5 md:flex">
            <Globe2 className="h-3.5 w-3.5 text-blue-300" />
            Global shipping
          </span>

          <span className="truncate text-slate-300">
            Buyer protection & secure trade
          </span>

        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">

          <Link
            href="/support"
            className="hidden items-center gap-1.5 transition hover:text-white sm:flex"
          >
            <Headphones className="h-3.5 w-3.5" />
            Help Center
          </Link>

          <LocaleCurrencySwitcher />

        </div>

      </div>
    </div>
  );
}