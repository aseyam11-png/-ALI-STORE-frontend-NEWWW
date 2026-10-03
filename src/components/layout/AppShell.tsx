import type {
  ReactNode,
} from "react";

import {
  Header,
} from "./Header";

import {
  TopBar,
} from "./TopBar";

import {
  Footer,
} from "./Footer";

import {
  GlobalNavigation,
} from "../navigation/GlobalNavigation";

import {
  PageTransition,
} from "@/components/motion/PageTransition";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({
  children,
}: AppShellProps) {
  return (
    <div
        className="min-h-screen bg-background text-foreground selection:bg-primary-100 selection:text-brand-ink"
        suppressHydrationWarning
      >

        <TopBar />

        <Header />

        <GlobalNavigation />

        <div className="min-w-0 overflow-x-clip">
          <PageTransition>
            {children}
          </PageTransition>
        </div>

        <Footer />

      </div>

    </LocalizationProvider>
  );
}
