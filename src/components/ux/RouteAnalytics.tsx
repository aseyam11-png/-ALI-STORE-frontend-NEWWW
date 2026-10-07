"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageView } from "@/lib/ux/analytics";

export function RouteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname, query);
  }, [pathname, query]);

  return null;
}
