"use client";

import { useEffect, useRef } from "react";

import { useSession } from "@/features/auth/session";
import {
  getCart,
  mapCartItem,
} from "@/features/cart/services/cart.service";
import { getWishlist } from "@/features/wishlist/services/wishlist.service";
import { getProductById } from "@/features/products/services/product.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export function CustomerRuntime() {
  const { status } =
    useSession();

  const wasAuthenticated =
    useRef(false);

  const setCartItems =
    useCartStore(
      (state) => state.setItems,
    );

  const setWishlistItems =
    useWishlistStore(
      (state) => state.setItems,
    );

  useEffect(() => {
    if (
      status ===
      "unauthenticated"
    ) {
      if (
        wasAuthenticated.current
      ) {
        useCartStore
          .getState()
          .clearCart();

        useWishlistStore
          .getState()
          .clearWishlist();
      }

      wasAuthenticated.current =
        false;

      return;
    }

    if (
      status !==
      "authenticated"
    ) {
      return;
    }

    wasAuthenticated.current =
      true;

    let cancelled = false;

    void getCart()
      .then((cart) => {
        if (!cancelled) {
          setCartItems(
            cart.items.map(
              mapCartItem,
            ),
          );
        }
      })
      .catch(() => undefined);

    void getWishlist()
      .then(async (records) => {
        const products =
          await Promise.all(
            records.map(
              (record) =>
                getProductById(
                  String(
                    record.productId,
                  ),
                ),
            ),
          );

        if (cancelled) {
          return;
        }

        setWishlistItems(
          products
            .filter(
              (
                product,
              ): product is NonNullable<
                typeof product
              > =>
                product !== null,
            )
            .map(
              (product) => ({
                id: product.id,
                name: product.name,
                price: product.price.amount,
                currency: product.price.currency,
                image:
                  product.images[0]?.url,
                brand:
                  product.brand?.name,
                category:
                  product.category?.name,
                rating:
                  product.rating,
                reviewCount:
                  product.reviewCount,
              }),
            ),
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    status,
    setCartItems,
    setWishlistItems,
  ]);

  return null;
}
