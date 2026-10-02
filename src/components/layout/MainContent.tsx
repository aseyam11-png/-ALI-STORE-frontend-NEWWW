import type { ReactNode } from "react";

import { Breadcrumbs } from "../navigation/Breadcrumbs";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mt-6">
          {children}
        </div>
      </div>
    </main>
  );
}