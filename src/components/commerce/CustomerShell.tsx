import type { ReactNode } from "react";

import { HomeHeader } from "./HomeHeader";
import { HomeFooter } from "./HomeFooter";
import { TopBar } from "@/components/layout/TopBar";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";

export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <HomeHeader />
      <GlobalNavigation />
      <main>{children}</main>
      <HomeFooter />
    </div>
  );
}
