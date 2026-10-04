"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Minus, Plus, ShoppingCart, Zap } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { addBackendCartItem, mapBackendCartToLocal } from "@/features/cart/services/cart-api.service";
import { useSession } from "@/features/auth/session";
import { formatCurrency } from "@/features/localization/services/currency.service";
import type { B2CProduct, B2CProductVariant } from "@/features/products/types/b2c-product.types";
import { getVariantPrice, getVariantStock } from "@/features/products/services/variant.utils";

interface ProductActionsProps {
  product: B2CProduct;
  selectedVariant?: B2CProductVariant;
}

export function ProductActions({ product, selectedVariant }: ProductActionsProps) {
  const router = useRouter();
  const session = useSession();
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceItems = useCartStore((state) => state.replaceItems);

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] =
    useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);

  const price = getVariantPrice(product, selectedVariant);
  const stock = getVariantStock(product, selectedVariant);
  const available =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "low_stock";

  const subtotal = price * quantity;

  const increase = () => {
    if (quantity < stock) {
      setQuantity((current) => current + 1);
      setMessage("");
    }
  };

  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
    setMessage("");
  };

  const addToCart = async (): Promise<boolean> => {
    if (!available || busy) return false;

    setBusy(true);
    setMessage("");
    setMessageTone("success");

    try {
      const localLine = {
        productId: product.id,
        name: product.name,
        price,
        currency: product.currency,
        priceUnit: "unit",
        quantity,
        image: selectedVariant?.image ?? product.images[0]?.url,
        minOrderQuantity: 1,
      };

      if (session.status === "authenticated") {
        const numericId = Number(product.id);
        if (!Number.isInteger(numericId) || numericId < 1) {
          throw new Error("Invalid product id.");
        }

        const currentItems = useCartStore.getState().items;
        const backend = await addBackendCartItem(numericId, quantity);

        replaceItems(
          mapBackendCartToLocal(
            backend,
            [...currentItems, localLine],
          ),
        );
      } else {
        addLocalItem(localLine);
      }

      setMessage("Product added to cart.");
      setMessageTone("success");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add this product to the cart.",
      );
      setMessageTone("error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async () => {
    if (await addToCart()) {
      router.push("/shop/checkout");
    }
  };

  return (
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 pb-24 shadow-sm sm:p-6 sm:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black text-foreground">Quantity</p>
          <p className="mt-1 text-xs text-neutral-400">
            {product.stockStatus === "unknown"
              ? "Availability is being confirmed"
              : available
                ? stock + " available"
                : "This product is currently unavailable"}
          </p>
        </div>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={decrease}
            disabled={busy || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span
            className="flex h-11 min-w-16 items-center justify-center border-x border-neutral-200 px-4 text-sm font-black"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={increase}
            disabled={busy || !available || quantity >= stock}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-4">
        <span className="text-sm text-neutral-500">Estimated subtotal</span>
        <span className="text-2xl font-black text-foreground">
          {formatCurrency(subtotal, product.currency)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void addToCart()}
          disabled={busy || !available}
          aria-busy={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface text-sm font-black text-neutral-800 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <ShoppingCart className="h-4 w-4" />
          {busy
            ? "Adding..."
            : product.stockStatus === "unknown"
              ? "Checking availability"
              : "Add to cart"}
        </button>

        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={busy || !available}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <Zap className="h-4 w-4" />
          Buy now
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={
            "mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold " +
            (messageTone === "success"
              ? "bg-success-surface text-success-700"
              : "bg-danger-surface text-danger-700")
          }
        >
          {messageTone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-surface/95 px-3 pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl gap-2 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={() => void addToCart()}
            disabled={busy || !available}
            aria-busy={busy}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface text-sm font-black text-neutral-800 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ShoppingCart className="h-4 w-4" />
            {busy ? "Adding..." : "Add to cart"}
          </button>

          <button
            type="button"
            onClick={() => void handleBuyNow()}
            disabled={busy || !available}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <Zap className="h-4 w-4" />
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
