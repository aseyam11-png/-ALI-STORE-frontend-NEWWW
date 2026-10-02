"use client";

import {
  Heart,
} from "lucide-react";

import {
  useWishlistStore,
} from "@/stores/wishlist-store";

import type {
  WishlistProduct,
} from "@/features/wishlist/types/wishlist.types";

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
  const toggleItem =
    useWishlistStore(
      (state) =>
        state.toggleItem,
    );

  const isInWishlist =
    useWishlistStore(
      (state) =>
        state.isInWishlist(
          product.id,
        ),
    );

  const iconSize =
    size === "sm"
      ? "h-4 w-4"
      : "h-5 w-5";

  const buttonSize =
    size === "sm"
      ? "h-9 w-9"
      : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={() =>
        toggleItem(product)
      }
      aria-label={
        isInWishlist
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={
        isInWishlist
      }
      title={
        isInWishlist
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`flex ${buttonSize} items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 ${
        isInWishlist
          ? "border-red-200 text-red-500"
          : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500"
      } ${className}`}
    >
      <Heart
        className={iconSize}
        fill={
          isInWishlist
            ? "currentColor"
            : "none"
        }
      />
    </button>
  );
}