import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

export function CustomerShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
