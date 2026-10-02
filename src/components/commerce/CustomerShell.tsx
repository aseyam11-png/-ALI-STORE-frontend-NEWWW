import type { ReactNode } from "react";

import { HomeHeader } from "./HomeHeader";
import { HomeFooter } from "./HomeFooter";

// The one canonical ALI STORE customer shell — extracted from the Homepage
// rebuild's own composition (Header/Footer + tokens + RTL) rather than the
// legacy AppShell (TopBar/Header/GlobalNavigation/Footer, hardcoded-hex
// colors, still used by the 16+ pre-existing routes that already depend on
// it). Any *new* or *rebuilt* customer-facing page should compose with this
// shell; migrating AppShell's existing consumers is a separate, larger
// initiative and is intentionally out of scope here — this file makes the
// canonical choice real and reusable without touching any of them.
//
// Locale/dir sync (document.documentElement.lang/dir) is already applied
// once, app-wide, by <LocalizationProvider> in the root Providers — it must
// not be duplicated here.
export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeHeader />
      <main>{children}</main>
      <HomeFooter />
    </div>
  );
}
