import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

import { FlashDealsLazy } from "./FlashDealsLazy";

// The backend catalog does not expose promotion/discount fields yet.
// Do not manufacture discounts from the legacy mock catalog.
export function FlashDeals() {
  return null;
}
