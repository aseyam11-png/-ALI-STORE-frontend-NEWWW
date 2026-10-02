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
  LocalizationProvider,
} from "../providers/LocalizationProvider";

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
    <LocalizationProvider>

      <div
        className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-100 selection:text-[#0F2747]"
        suppressHydrationWarning
      >

        <TopBar />

        <Header />

        <GlobalNavigation />

        <main className="min-w-0 overflow-x-clip">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        <Footer />

      </div>

    </LocalizationProvider>
  );
}
