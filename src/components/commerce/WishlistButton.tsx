"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { useWishlistStore } from "@/stores/wishlist-store";
import type { WishlistProduct } from "@/features/wishlist/types/wishlist.types";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/features/wishlist/services/wishlist-api.service";
import { getSession } from "@/features/auth/session";

interface WishlistButtonProps {
  product: WishlistProduct;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({
  product,
  size = "md",
  className = "",
}: WishlistButtonProps) {
  const toggleLocal = useWishlistStore(
    (state) => state.toggleItem,
  );
  const isInWishlist = useWishlistStore(
    (state) => state.isInWishlist(product.id),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      if (session) {
        if (isInWishlist) {
          await removeFromWishlist(product.id);
        } else {
          await addToWishlist(product.id);
        }
      }

      toggleLocal(product);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update wishlist.",
      );
    } finally {
      setBusy(false);
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <span className={"relative inline-flex " + className}>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        aria-busy={busy}
        aria-label={
          isInWishlist
            ? "Remove " + product.name + " from wishlist"
            : "Add " + product.name + " to wishlist"
        }
        aria-pressed={isInWishlist}
        title={
          error ||
          (isInWishlist
            ? "Remove from wishlist"
            : "Add to wishlist")
        }
        className={
          "flex " +
          buttonSize +
          " items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 " +
          (isInWishlist
            ? "border-danger-100 text-danger-600"
            : "border-neutral-200 text-neutral-500 hover:border-danger-100 hover:text-danger-600")
        }
      >
        <Heart
          className={iconSize}
          fill={isInWishlist ? "currentColor" : "none"}
        />
      </button>
      {error && (
        <span role="status" className="sr-only">
          {error}
        </span>
      )}
    </span>
  );
}
