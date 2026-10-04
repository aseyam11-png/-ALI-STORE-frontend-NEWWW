import Link from "next/link";
import {
  ShieldCheck,
  Globe2,
  Headphones,
} from "lucide-react";

import { LocaleCurrencySwitcher } from "@/components/localization/LocaleCurrencySwitcher";

export function TopBar() {
  return (
    <div className="bg-brand-ink text-neutral-200">
      <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-4 px-4 text-[11px] sm:px-6 lg:px-8">

        <div className="flex min-w-0 items-center gap-4">

          <span className="hidden items-center gap-1.5 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            معلومات المنتجات من ALI STORE
          </span>

          <span className="hidden items-center gap-1.5 md:flex">
            <Globe2 className="h-3.5 w-3.5 text-primary-300" />
            يتم تأكيد تفاصيل الشحن عند إتمام الطلب
          </span>

          <span className="truncate text-neutral-300">
            دفع آمن وحماية للحساب
          </span>

        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">

          <Link
            href="/support"
            className="hidden items-center gap-1.5 transition hover:text-neutral-0 sm:flex"
          >
            <Headphones className="h-3.5 w-3.5" />
            مركز المساعدة
          </Link>

          <LocaleCurrencySwitcher />

        </div>

      </div>
    </div>
  );
}