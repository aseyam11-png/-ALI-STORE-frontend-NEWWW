"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { useSession } from "@/features/auth/session";
import { getMyWishlist } from "@/features/wishlist/services/wishlist-api.service";
import { getMyNotifications } from "@/features/notifications/services/notification-api.service";
import { getBackendCart, mapBackendCartToLocal, replaceBackendCart } from "@/features/cart/services/cart-api.service";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useCartStore } from "@/stores/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const replaceWishlist = useWishlistStore((state) => state.replaceItems);
  const replaceNotifications = useNotificationStore(
    (state) => state.replaceNotifications,
  );
  const replaceCart = useCartStore((state) => state.replaceItems);

  useEffect(() => {
    if (session.status !== "authenticated") {
      replaceNotifications([]);
      return;
    }

    let active = true;

    void getMyNotifications()
      .then((items) => {
        if (!active) return;

        replaceNotifications(
          items.map((item) => ({
            id: String(item.id),
            customerId: String(item.userId),
            type: "SYSTEM" as const,
            title: item.title,
            message: item.message,
            createdAt: item.createdAt,
            read: item.isRead,
          })),
        );
      })
      .catch(() => {
        if (active) replaceNotifications([]);
      });

    return () => {
      active = false;
    };
  }, [replaceNotifications, session.status]);

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
            currency: item.currency ?? undefined,
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

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    const hydrateCart = async () => {
      try {
        const localItems = useCartStore.getState().items;
        const backend = await getBackendCart();

        if (!active) return;

        if (backend.items.length === 0 && localItems.length > 0) {
          const migrated = await replaceBackendCart(
            localItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          );
          if (!active) return;
          replaceCart(mapBackendCartToLocal(migrated, localItems));
          return;
        }

        replaceCart(mapBackendCartToLocal(backend, localItems));
      } catch {
        // Preserve the local UI on transient hydration failure.
      }
    };

    void hydrateCart();

    return () => {
      active = false;
    };
  }, [replaceCart, session.status]);

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
