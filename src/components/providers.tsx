"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { useSession } from "@/features/auth/session";
import { getMyWishlist, addToWishlist } from "@/features/wishlist/services/wishlist-api.service";
import {
  clearGuestWishlist,
  readGuestWishlist,
  writeGuestWishlist,
} from "@/features/wishlist/services/guest-wishlist-storage";
import { getMyNotifications } from "@/features/notifications/services/notification-api.service";
import {
  getBackendCart,
  mapBackendCartToLocal,
  mergeCartLines,
  replaceBackendCart,
} from "@/features/cart/services/cart-api.service";
import {
  clearGuestCart,
  readGuestCart,
  writeGuestCart,
} from "@/features/cart/services/guest-cart-storage";
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
    const handleLogout = () => {
      // Never carry authenticated client state into a guest session.
      replaceCart([]);
      replaceWishlist([]);
      replaceNotifications([]);
    };

    window.addEventListener("alistore:logout", handleLogout);

    return () => {
      window.removeEventListener("alistore:logout", handleLogout);
    };
  }, [
    replaceCart,
    replaceNotifications,
    replaceWishlist,
  ]);

  useEffect(() => {
    if (session.status === "loading") return;

    if (session.status === "unauthenticated") {
      replaceCart(readGuestCart());
      replaceWishlist(readGuestWishlist());
      replaceNotifications([]);
    }
  }, [
    replaceCart,
    replaceNotifications,
    replaceWishlist,
    session.status,
  ]);

  useEffect(() => {
    if (session.status !== "unauthenticated") return;

    const unsubscribe = useCartStore.subscribe((state) => {
      writeGuestCart(state.items);
    });

    writeGuestCart(useCartStore.getState().items);

    return unsubscribe;
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "unauthenticated") return;

    const unsubscribe = useWishlistStore.subscribe((state) => {
      writeGuestWishlist(state.items);
    });

    writeGuestWishlist(useWishlistStore.getState().items);

    return unsubscribe;
  }, [session.status]);

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

    const hydrateWishlist = async () => {
      try {
        const guestItems = readGuestWishlist();
        const backendItems = await getMyWishlist();

        if (!active) return;

        const backendIds = new Set(
          backendItems.map((item) => String(item.productId)),
        );
        const missingGuestItems = guestItems.filter(
          (item) => !backendIds.has(item.id),
        );

        if (missingGuestItems.length > 0) {
          await Promise.all(
            missingGuestItems.map((item) => addToWishlist(item.id)),
          );

          if (!active) return;

          const refreshed = await getMyWishlist();
          if (!active) return;

          replaceWishlist(
            refreshed.map((item) => ({
              id: String(item.productId),
              name: item.productName ?? "Product",
              price: Number(item.price ?? 0),
              image: item.imageUrl ?? undefined,
              brand: item.brandName ?? undefined,
              category: item.categoryName ?? undefined,
              currency: item.currency ?? undefined,
            })),
          );
        } else {
          replaceWishlist(
            backendItems.map((item) => ({
              id: String(item.productId),
              name: item.productName ?? "Product",
              price: Number(item.price ?? 0),
              image: item.imageUrl ?? undefined,
              brand: item.brandName ?? undefined,
              category: item.categoryName ?? undefined,
              currency: item.currency ?? undefined,
            })),
          );
        }

        if (active) clearGuestWishlist();
      } catch {
        // Keep the guest wishlist so a later authenticated hydration can retry.
      }
    };

    void hydrateWishlist();

    return () => {
      active = false;
    };
  }, [replaceWishlist, session.status]);

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    const hydrateCart = async () => {
      try {
        const guestItems = readGuestCart();
        const currentLocalItems = useCartStore.getState().items;
        const localItems = guestItems.length > 0 ? guestItems : currentLocalItems;
        const backend = await getBackendCart();

        if (!active) return;

        if (localItems.length > 0) {
          const merged = mergeCartLines(backend, localItems);
          const migrated = await replaceBackendCart(merged);

          if (!active) return;

          replaceCart(mapBackendCartToLocal(migrated, localItems));
          clearGuestCart();
          return;
        }

        replaceCart(mapBackendCartToLocal(backend));
      } catch {
        // Preserve the local UI and guest storage on transient migration failure.
      }
    };

    void hydrateCart();

    return () => {
      active = false;
    };
  }, [replaceCart, session.status, session.user?.id]);

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
