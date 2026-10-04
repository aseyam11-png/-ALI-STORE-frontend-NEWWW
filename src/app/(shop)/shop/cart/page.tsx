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
  const items = useCartStore(
    (state) => state.items,
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0,
  );

  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
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
        const localالمنتجات = useCartStore.getState().items;
        const backend = await getBackendCart();

        if (!active) return;

        if (backend.items.length === 0 && localالمنتجات.length > 0) {
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
    const item = useCartStore.getState().items.find(
      (candidate) =>
        candidate.productId === productId &&
        candidate.variantId === variantId,
    );

    if (!item) return;

    const safeQuantity = Math.max(
      1,
      Math.floor(quantity),
    );

    if (session.status !== "authenticated") {
      const nextالمنتجات = useCartStore.getState().items.map(
        (candidate) =>
          candidate.productId === productId &&
          candidate.variantId === variantId
            ? { ...candidate, quantity: safeQuantity }
            : candidate,
      );
      replaceالمنتجات(nextالمنتجات);
      return;
    }

    if (!item.backendItemId) {
      setError("Cart item identity is missing. Refresh the cart and try again.");
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await updateBackendCartItem(
        item.backendItemId,
        safeQuantity,
        Number(productId),
      );
      replaceالمنتجات(
        mapBackendCartToLocal(
          backend,
          useCartStore.getState().items,
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

  const handleRemove = async (
    productId: string,
    variantId: string | undefined,
  ) => {
    const item = useCartStore.getState().items.find(
      (candidate) =>
        candidate.productId === productId &&
        candidate.variantId === variantId,
    );

    if (!item) return;

    if (session.status !== "authenticated") {
      replaceالمنتجات(
        useCartStore.getState().items.filter(
          (candidate) =>
            !(
              candidate.productId === productId &&
              candidate.variantId === variantId
            ),
        ),
      );
      return;
    }

    if (!item.backendItemId) {
      setError("Cart item identity is missing. Refresh the cart and try again.");
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await removeBackendCartItem(
        item.backendItemId,
      );
      replaceالمنتجات(
        mapBackendCartToLocal(
          backend,
          useCartStore.getState().items,
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
    const confirmed =
      typeof window === "undefined" ||
      window.confirm("هل أنت متأكد من حذف جميع المنتجات من السلة؟");

    if (!confirmed) return;

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
          useCartStore.getState().items,
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
          <div className="container-shell py-8 sm:py-10">

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
              سلة التسوق
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
              سلتك
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              راجع المنتجات ثم انتقل إلى إتمام الطلب عندما تكون مستعدًا.
            </p>

          </div>
        </section>

        <div className="container-shell py-7 sm:py-8">

          {items.length === 0 ? (
            <div className="space-y-6">

              <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
                  <ShoppingBag className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-foreground">
                  سلتك is empty
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  تصفح الكتالوج وأضف المنتجات التي تريدها إلى سلتك.
                </p>

                <Link
                  href="/shop/products"
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--color-primary-500)] px-6 text-sm font-medium text-white"
                >تصفح المنتجات<ArrowRight className="h-4 w-4" />
                </Link>

              </section>

              <RecommendationSection
                type="TRENDING"
                title="منتجات رائجة"
                description="منتجات يكتشفها العملاء حاليًا من الكتالوج."
              />

            </div>
          ) : (
            <div className="space-y-7">

              <div className="rounded-xl border border-primary-100 bg-info-surface px-4 py-3 text-xs font-semibold text-primary-800">
                السلة متزامنة مع الخادم. تكلفة الشحن النهائية تؤكد عند إنشاء الطلب.
              </div>

              <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

                <section className="space-y-5">

                  <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">

                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {itemCount} {itemCount === 1 ? "منتج" : "منتجات"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        في السلة
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleClear()}
                      disabled={syncing}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-danger transition hover:bg-danger-surface"
                    >
                      <Trash2 className="h-4 w-4" />
                      إفراغ السلة
                    </button>

                  </div>

                  <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised">

                    <div className="divide-y divide-slate-100">

                      {items.map(
                        (item) => {
                          const itemTotal =
                            item.price *
                            item.quantity;

                          return (
                            <article
                              key={`${item.productId}-${item.variantId ?? "default"}`}
                              className="p-5"
                            >

                              <div className="flex flex-col gap-4 sm:flex-row">

                                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">

                                  {item.image ? (
                                    <Image
                                      src={
                                        item.image
                                      }
                                      alt={
                                        item.name
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
                                    href={`/shop/products/${encodeURIComponent(item.productId)}`}
                                    className="text-sm font-bold text-foreground hover:text-brand"
                                  >
                                    {
                                      item.name
                                    }
                                  </Link>

                                  {item.variantLabel && (
                                    <p className="mt-1 text-xs font-semibold text-brand">
                                      {
                                        item.variantLabel
                                      }
                                    </p>
                                  )}

                                  <p className="mt-2 text-lg font-bold text-brand-ink">
                                    <LocalizedPrice
                                      amountUSD={item.price}
                                      currency={item.currency}
                                    />
                                  </p>

                                  <div className="mt-4 flex items-center gap-3">

                                    <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.productId,
                                            item.variantId,
                                            item.quantity - 1,
                                          )
                                        }
                                        disabled={
                                          item.quantity <=
                                          1
                                        }
                                        className="flex h-10 w-10 items-center justify-center text-neutral-600 disabled:opacity-40"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>

                                      <span className="flex h-10 min-w-12 items-center justify-center border-x border-neutral-200 px-3 text-sm font-bold">
                                        {
                                          item.quantity
                                        }
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.productId,
                                            item.variantId,
                                            item.quantity + 1,
                                          )
                                        }
                                        className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>

                                    </div>

                                  </div>

                                </div>

                                <div className="flex items-end justify-between gap-5 sm:flex-col sm:items-end">

                                  <p className="text-xl font-bold text-brand-ink">
                                    <LocalizedPrice
                                      amountUSD={itemTotal}
                                      currency={item.currency}
                                    />
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemove(
                                        item.productId,
                                        item.variantId,
                                      )
                                    }
                                    className="text-xs font-bold text-danger hover:underline"
                                  >إزالة</button>

                                </div>

                              </div>

                            </article>
                          );
                        },
                      )}

                    </div>

                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                        <Truck className="h-4 w-4 text-success-600" />يتم احتساب الشحن وتأكيده عند إتمام الطلب.</div>
                    </div>
                  </section>

                  <RecommendationSection
                    type="FREQUENTLY_BOUGHT_TOGETHER"
                    title="يُضاف مع هذه المنتجات"
                    description="اكتشف منتجات يضيفها العملاء عادةً مع مشترياتهم."
                  />

                </section>

                <aside className="h-fit space-y-5 xl:sticky xl:top-28">

                  <div className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised">

                    <h2 className="text-lg font-bold text-foreground">
                      ملخص الطلب
                    </h2>

                    <div className="mt-6 space-y-4">

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          المنتجات
                        </span>

                        <span className="font-bold">
                          {itemCount}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          المجموع الفرعي
                        </span>

                        <span className="font-bold">
                          <LocalizedPrice amountUSD={subtotal} currency={items[0]?.currency} />
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">
                          الشحن
                        </span>

                        <span className="font-bold">
                          يُحدد عند إتمام الطلب
                        </span>
                      </div>

                    </div>

                    <div className="mt-6 border-t border-neutral-100 pt-5">

                      <div className="flex items-end justify-between">
                        <span className="font-bold text-neutral-500">
                          المجموع الفرعي
                        </span>

                        <span className="text-3xl font-bold text-brand-ink">
                          <LocalizedPrice
                            amountUSD={subtotal}
                            currency={items[0]?.currency}
                          />
                        </span>
                      </div>

                    </div>

                    <Link
                      href="/shop/checkout"
                      className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-500)] text-sm font-medium text-white"
                    >
                      متابعة إلى إتمام الطلب
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                  </div>

                  <RecommendationSection
                    type="BASED_ON_BROWSING"
                    title="موصى به لك"
                    description="اقتراحات مبنية على المنتجات التي قد تهمك."
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