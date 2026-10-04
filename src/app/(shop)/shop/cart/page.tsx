"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { RecommendationSection } from "@/components/commerce/recommendations/RecommendationSection";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/features/auth/session";
import {
  getBackendCart,
  updateBackendCartItem,
  removeBackendCartItem,
  clearBackendCart,
  mapBackendCartToLocal,
  replaceBackendCart,
} from "@/features/cart/services/cart-api.service";

export default function CartPage() {
  const منتجs = useCartStore(
    (state) => state.منتجs,
  );

  const subtotal = منتجs.reduce(
    (total, منتج) =>
      total +
      منتج.price * منتج.quantity,
    0,
  );

  const منتجCount = منتجs.reduce(
    (total, منتج) =>
      total + منتج.quantity,
    0,
  );

  const session = useSession();
  const replaceالمنتجات = useCartStore((state) => state.replaceالمنتجات);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    const syncCart = async () => {
      setSyncing(true);
      setError("");

      try {
        const localالمنتجات = useCartStore.getState().منتجs;
        const backend = await getBackendCart();

        if (!active) return;

        if (backend.منتجs.length === 0 && localالمنتجات.length > 0) {
          const migrated = await replaceBackendCart(localالمنتجات);
          if (!active) return;
          replaceالمنتجات(mapBackendCartToLocal(migrated, localالمنتجات));
        } else {
          replaceالمنتجات(mapBackendCartToLocal(backend, localالمنتجات));
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر مزامنة السلة مع الخادم.",
          );
        }
      } finally {
        if (active) setSyncing(false);
      }
    };

    void syncCart();

    return () => {
      active = false;
    };
  }, [session.status, replaceالمنتجات]);

  const handleQuantityChange = async (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => {
    const منتج = useCartStore.getState().منتجs.find(
      (candidate) =>
        candidate.productId === productId &&
        candidate.variantId === variantId,
    );

    if (!منتج) return;

    const safeQuantity = Math.max(
      1,
      Math.floor(quantity),
    );

    if (session.status !== "authenticated") {
      const nextالمنتجات = useCartStore.getState().منتجs.map(
        (candidate) =>
          candidate.productId === productId &&
          candidate.variantId === variantId
            ? { ...candidate, quantity: safeQuantity }
            : candidate,
      );
      replaceالمنتجات(nextالمنتجات);
      return;
    }

    if (!منتج.backendItemId) {
      setError("Cart منتج identity is missing. Refresh the cart and try again.");
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await updateBackendCartItem(
        منتج.backendItemId,
        safeQuantity,
        Number(productId),
      );
      replaceالمنتجات(
        mapBackendCartToLocal(
          backend,
          useCartStore.getState().منتجs,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحديث السلة.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleإزالة = async (
    productId: string,
    variantId: string | undefined,
  ) => {
    const منتج = useCartStore.getState().منتجs.find(
      (candidate) =>
        candidate.productId === productId &&
        candidate.variantId === variantId,
    );

    if (!منتج) return;

    if (session.status !== "authenticated") {
      replaceالمنتجات(
        useCartStore.getState().منتجs.filter(
          (candidate) =>
            !(
              candidate.productId === productId &&
              candidate.variantId === variantId
            ),
        ),
      );
      return;
    }

    if (!منتج.backendItemId) {
      setError("Cart منتج identity is missing. Refresh the cart and try again.");
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await removeBackendCartItem(
        منتج.backendItemId,
      );
      replaceالمنتجات(
        mapBackendCartToLocal(
          backend,
          useCartStore.getState().منتجs,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر حذف المنتج من السلة.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleClear = async () => {
    if (session.status !== "authenticated") {
      replaceالمنتجات([]);
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await clearBackendCart();
      replaceالمنتجات(
        mapBackendCartToLocal(
          backend,
          useCartStore.getState().منتجs,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر إفراغ السلة.",
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        {error && (
          <div
            role="alert"
            className="border-b border-danger-100 bg-danger-surface px-4 py-3 text-center text-sm font-bold text-danger-700"
          >
            {error}
          </div>
        )}

        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand">
              Shopping cart
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-ink sm:text-4xl">
              Your cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Review your منتجs and continue to checkout when you&apos;re ready.
            </p>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {منتجs.length === 0 ? (
            <div className="space-y-6">

              <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">

                <div className="mx-auto flex h-16 w-16 منتجs-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
                  <ShoppingBag className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-2xl font-black text-foreground">
                  سلتك فارغة
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  Discover products from our catalog and add them to your
                  cart.
                </p>

                <Link
                  href="/shop/products"
                  className="mt-6 inline-flex h-11 منتجs-center gap-2 rounded-xl bg-[var(--color-primary-500)] px-6 text-sm font-medium text-white"
                >
                  تصفح المنتجات
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </section>

              <RecommendationSection
                type="TRENDING"
                title="المنتجات الرائجة"
                description="Popular products customers are exploring right now."
              />

            </div>
          ) : (
            <div className="space-y-7">

              <div className="rounded-xl border border-primary-100 bg-info-surface px-4 py-3 text-xs font-semibold text-primary-800">
                السلة متزامنة مع الخادم. تكلفة الشحن النهائية تؤكد عند إنشاء الطلب.
              </div>

              <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

                <section className="space-y-5">

                  <div className="flex منتجs-center justify-between rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">

                    <div>
                      <p className="text-sm font-black text-foreground">
                        {منتجCount} منتج
                        {منتجCount !== 1
                          ? "s"
                          : ""}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        في سلتك
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleClear()}
                      disabled={syncing}
                      className="inline-flex منتجs-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-danger transition hover:bg-danger-surface"
                    >
                      <Trash2 className="h-4 w-4" />
                      تفريغ السلة
                    </button>

                  </div>

                  <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm">

                    <div className="divide-y divide-slate-100">

                      {منتجs.map(
                        (منتج) => {
                          const منتجTotal =
                            منتج.price *
                            منتج.quantity;

                          return (
                            <article
                              key={`${منتج.productId}-${منتج.variantId ?? "default"}`}
                              className="p-5"
                            >

                              <div className="flex flex-col gap-4 sm:flex-row">

                                <div className="relative flex h-28 w-28 shrink-0 منتجs-center justify-center overflow-hidden rounded-xl bg-neutral-50">

                                  {منتج.image ? (
                                    <Image
                                      src={
                                        منتج.image
                                      }
                                      alt={
                                        منتج.name
                                      }
                                      fill
                                      sizes="112px"
                                      className="object-contain p-3"
                                    />
                                  ) : (
                                    <ShoppingBag className="h-7 w-7 text-neutral-300" />
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <Link
                                    href={`/shop/products/${encodeURIComponent(منتج.productId)}`}
                                    className="text-sm font-black text-foreground hover:text-brand"
                                  >
                                    {
                                      منتج.name
                                    }
                                  </Link>

                                  {منتج.variantLabel && (
                                    <p className="mt-1 text-xs font-semibold text-brand">
                                      {
                                        منتج.variantLabel
                                      }
                                    </p>
                                  )}

                                  <p className="mt-2 text-lg font-black text-brand-ink">
                                    <LocalizedPrice
                                      amountUSD={منتج.price}
                                      currency={منتج.currency}
                                    />
                                  </p>

                                  <div className="mt-4 flex منتجs-center gap-3">

                                    <div className="flex منتجs-center overflow-hidden rounded-xl border border-neutral-200">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            منتج.productId,
                                            منتج.variantId,
                                            منتج.quantity - 1,
                                          )
                                        }
                                        disabled={
                                          منتج.quantity <=
                                          1
                                        }
                                        className="flex h-10 w-10 منتجs-center justify-center text-neutral-600 disabled:opacity-40"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>

                                      <span className="flex h-10 min-w-12 منتجs-center justify-center border-x border-neutral-200 px-3 text-sm font-black">
                                        {
                                          منتج.quantity
                                        }
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            منتج.productId,
                                            منتج.variantId,
                                            منتج.quantity + 1,
                                          )
                                        }
                                        className="flex h-10 w-10 منتجs-center justify-center text-neutral-600 hover:bg-neutral-50"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>

                                    </div>

                                  </div>

                                </div>

                                <div className="flex منتجs-end justify-between gap-5 sm:flex-col sm:منتجs-end">

                                  <p className="text-xl font-black text-brand-ink">
                                    <LocalizedPrice
                                      amountUSD={منتجTotal}
                                      currency={منتج.currency}
                                    />
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleإزالة(
                                        منتج.productId,
                                        منتج.variantId,
                                      )
                                    }
                                    className="text-xs font-bold text-danger hover:underline"
                                  >
                                    إزالة
                                  </button>

                                </div>

                              </div>

                            </article>
                          );
                        },
                      )}

                    </div>

                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                      <div className="flex منتجs-center gap-2 text-xs font-semibold text-neutral-500">
                        <Truck className="h-4 w-4 text-success-600" />
                        تُحسب تكلفة الشحن وتُؤكد عند إتمام الطلب.
                      </div>
                    </div>
                  </section>

                  <RecommendationSection
                    type="FREQUENTLY_BOUGHT_TOGETHER"
                    title="يُشترى معه غالبًا"
                    description="أكمل مشترياتك بمنتجات يضيفها العملاء غالبًا."
                  />

                </section>

                <aside className="h-fit space-y-5 xl:sticky xl:top-24">

                  <div className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm">

                    <h2 className="text-lg font-black text-foreground">
                      ملخص الطلب
                    </h2>

                    <div className="mt-6 space-y-4">

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          المنتجات
                        </span>

                        <span className="font-bold">
                          {منتجCount}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          المجموع الفرعي
                        </span>

                        <span className="font-bold">
                          <LocalizedPrice amountUSD={subtotal} currency={منتجs[0]?.currency} />
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          الشحن
                        </span>

                        <span className="font-bold">
                          يُؤكد عند الدفع
                        </span>
                      </div>

                    </div>

                    <div className="mt-6 border-t border-neutral-100 pt-5">

                      <div className="flex منتجs-end justify-between">
                        <span className="font-bold text-neutral-500">
                          المجموع الفرعي
                        </span>

                        <span className="text-3xl font-black text-brand-ink">
                          <LocalizedPrice
                            amountUSD={subtotal}
                            currency={منتجs[0]?.currency}
                          />
                        </span>
                      </div>

                    </div>

                    <Link
                      href="/shop/checkout"
                      className="mt-6 flex h-12 منتجs-center justify-center gap-2 rounded-xl bg-[var(--color-primary-500)] text-sm font-medium text-white"
                    >
                      المتابعة إلى الدفع
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                  </div>

                  <RecommendationSection
                    type="BASED_ON_BROWSING"
                    title="مقترح لك"
                    description="اقتراحات بناءً على المنتجات التي قد تهمك."
                  />

                </aside>

              </div>
            </div>
          )}

        </div>
      </main>
    </AppShell>
  );
}