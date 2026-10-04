"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingCart, Zap } from "lucide-react";

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

  const [quantity, setالكمية] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const price = getVariantPrice(product, selectedVariant);
  const stock = getVariantStock(product, selectedVariant);
  const متوفر =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "low_stock";

  const subtotal = price * quantity;

  const increase = () => {
    if (quantity < stock) {
      setالكمية((current) => current + 1);
      setMessage("");
    }
  };

  const decrease = () => {
    setالكمية((current) => Math.max(1, current - 1));
    setMessage("");
  };

  const addToCart = async (): Promise<boolean> => {
    if (!available || busy) return false;

    setBusy(true);
    setMessage("");

    try {
      const localLine = {
        productId: product.id,
        name: product.name,
        price,
        currency: product.currency,
        priceUnit: "unit",
        quantity,
        image: selectedVariant?.image ?? product.images[0]?.url,
        minOrderالكمية: 1,
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

      setMessage("تمت إضافة المنتج إلى السلة.");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر إضافة المنتج إلى السلة.",
      );
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
    <div className="mt-7 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">الكمية</p>
          <p className="mt-1 text-xs text-neutral-400">
            {product.stockStatus === "unknown"
              ? "جارٍ التحقق من التوفر"
              : متوفر
                ? stock + " متوفر"
                : "المنتج غير متوفر حاليًا"}
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
            className="flex h-11 min-w-16 items-center justify-center border-x border-neutral-200 px-4 text-sm font-bold"
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
        <span className="text-sm text-neutral-500">المجموع التقديري</span>
        <span className="text-2xl font-bold text-foreground">
          {formatCurrency(subtotal, product.currency)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void addToCart()}
          disabled={busy || !available}
          aria-busy={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-surface text-sm font-bold text-neutral-800 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <ShoppingCart className="h-4 w-4" />
          {busy
            ? "جارٍ الإضافة…"
            : product.stockStatus === "unknown"
              ? "جارٍ التحقق من التوفر"
              : "أضف للسلة"}
        </button>

        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={busy || !available}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <Zap className="h-4 w-4" />
          اشترِ الآن
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl bg-success-surface px-4 py-3 text-sm font-semibold text-success-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}
    </div>
  );
}
