"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useId, useRef } from "react";
import { Eye, X } from "lucide-react";

import type { B2CProduct } from "@/features/products/types/b2c-product.types";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useTranslation } from "@/lib/i18n/dictionary";

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
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative grid max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-neutral-200 bg-surface shadow-modal md:grid-cols-2"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="إغلاق العرض السريع"
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
            عرض سريع
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
                التوفر
              </p>
              <p className={
                "mt-1 text-sm font-black " +
                (available ? "text-success-700" : "text-danger-700")
              }>
                {product.stockStatus === "unknown"
                  ? "جارٍ التحقق من التوفر"
                  : available
                    ? `${product.stock} ${t("available")}`
                    : t("outOfStock")}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                {t("sku")}
              </p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-neutral-700">
                {product.sku}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-neutral-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
              التوصيل
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
              عرض التفاصيل
            </Link>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={!available || addBusy}
              aria-busy={addBusy}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            >
              {addBusy ? t("adding") : t("addToCart")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
