"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useState } from "react";

import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { SessionProvider } from "@/features/auth/session";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <LocalizationProvider><SessionProvider>{children}</SessionProvider></LocalizationProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
