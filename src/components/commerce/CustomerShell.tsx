import type { ReactNode } from "react";

import { CustomerRuntime } from "./CustomerRuntime";
import { HomeHeader } from "./HomeHeader";
import { HomeFooter } from "./HomeFooter";

// Canonical customer shell. CustomerRuntime hydrates authenticated cart and
// wishlist state from the backend so headers/cards/pages observe one source.
export function CustomerShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerRuntime />
      <HomeHeader />
      <main>{children}</main>
      <HomeFooter />
    </div>
  );
}
