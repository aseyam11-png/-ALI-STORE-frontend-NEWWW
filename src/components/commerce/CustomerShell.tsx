import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { GlobalNavigation } from "@/components/navigation/GlobalNavigation";
import { PageTransition } from "@/components/motion/PageTransition";

export function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <GlobalNavigation />

      <div className="min-w-0 overflow-x-clip">
        <PageTransition>{children}</PageTransition>
      </div>

      <Footer />
    </div>
  );
}
