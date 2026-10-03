"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { useSession } from "@/features/auth/session";
import { getMyWishlist } from "@/features/wishlist/services/wishlist-api.service";
import { useWishlistStore } from "@/stores/wishlist-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const replaceWishlist = useWishlistStore((state) => state.replaceItems);

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    void getMyWishlist()
      .then((items) => {
        if (!active) return;

        replaceWishlist(
          items.map((item) => ({
            id: String(item.productId),
            name: item.productName ?? "Product",
            price: Number(item.price ?? 0),
            image: item.imageUrl ?? undefined,
            brand: item.brandName ?? undefined,
            category: item.categoryName ?? undefined,
          })),
        );
      })
      .catch(() => {
        // Keep the client state untouched on transient wishlist hydration
        // failures; successful product mutations still update the local UI.
      });

    return () => {
      active = false;
    };
  }, [replaceWishlist, session.status]);

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
        <LocalizationProvider>{children}</LocalizationProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
