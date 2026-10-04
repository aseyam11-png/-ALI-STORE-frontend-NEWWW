"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useId } from "react";
import { Eye, X } from "lucide-react";

import type { B2CProduct } from "@/features/products/types/b2c-product.types";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

interface ProductQuickViewProps {
  product: B2CProduct;
  open: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  addBusy: boolean;
}

export function ProductQuickView({
  product,
  open,
  onClose,
  onAddToCart,
  addBusy,
}: ProductQuickViewProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const available =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "low_stock";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative grid max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-neutral-200 bg-surface shadow-2xl md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm ring-1 ring-black/5 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex min-h-80 items-center justify-center bg-neutral-50 p-8">
          {product.images[0]?.url ? (
            <div className="relative h-[320px] w-full">
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-contain"
              />
            </div>
          ) : (
            <Eye className="h-10 w-10 text-neutral-300" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col p-7 sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">
            Quick view
          </p>

          {product.brand ? (
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
              {product.brand}
            </p>
          ) : null}

          <h2
            id={titleId}
            className="mt-2 text-2xl font-black leading-tight tracking-tight text-foreground"
          >
            {product.name}
          </h2>

          <div className="mt-5">
            <LocalizedPrice
              amountUSD={product.price}
              currency={product.currency}
              className="text-3xl font-black text-brand-ink"
            />
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="ms-2 text-sm font-bold text-neutral-400 line-through">
                <LocalizedPrice
                  amountUSD={product.originalPrice}
                  currency={product.currency}
                />
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                Availability
              </p>
              <p className={
                "mt-1 text-sm font-black " +
                (available ? "text-success-700" : "text-danger-700")
              }>
                {product.stockStatus === "unknown"
                  ? "Checking availability"
                  : available
                    ? product.stock + " available"
                    : "Out of stock"}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                SKU
              </p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-neutral-700">
                {product.sku}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-neutral-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
              Delivery
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {product.shipping.method}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {product.shipping.estimatedDelivery}
            </p>
          </div>

          <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
            <Link
              href={("/shop/products/" + encodeURIComponent(product.id)) as Route}
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-200 bg-surface px-5 text-sm font-black text-neutral-800 transition hover:border-primary-200 hover:bg-info-surface hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              View full details
            </Link>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={!available || addBusy}
              aria-busy={addBusy}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              {addBusy ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
