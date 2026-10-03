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
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;

    const syncCart = async () => {
      setSyncing(true);
      setError("");

      try {
        const localItems = useCartStore.getState().items;
        const backend = await getBackendCart();

        if (!active) return;

        if (backend.items.length === 0 && localItems.length > 0) {
          const migrated = await replaceBackendCart(localItems);
          if (!active) return;
          replaceItems(mapBackendCartToLocal(migrated, localItems));
        } else {
          replaceItems(mapBackendCartToLocal(backend, localItems));
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
  }, [session.status, replaceItems]);

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
      const nextItems = useCartStore.getState().items.map(
        (candidate) =>
          candidate.productId === productId &&
          candidate.variantId === variantId
            ? { ...candidate, quantity: safeQuantity }
            : candidate,
      );
      replaceItems(nextItems);
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
      replaceItems(
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
      replaceItems(
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
      replaceItems(
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
    if (session.status !== "authenticated") {
      replaceItems([]);
      return;
    }

    setSyncing(true);
    setError("");

    try {
      const backend = await clearBackendCart();
      replaceItems(
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
      <main className="min-h-screen bg-[#F8FAFC]">
        {error && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700"
          >
            {error}
          </div>
        )}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563EB]">
              Shopping cart
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Your cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review your items and continue to checkout when you&apos;re ready.
            </p>

          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          {items.length === 0 ? (
            <div className="space-y-6">

              <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <ShoppingBag className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  Your cart is empty
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Discover products from our catalog and add them to your
                  cart.
                </p>

                <Link
                  href="/shop/products"
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-black text-white"
                >
                  Browse products
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </section>

              <RecommendationSection
                type="TRENDING"
                title="Trending products"
                description="Popular products customers are exploring right now."
              />

            </div>
          ) : (
            <div className="space-y-7">

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">
                السلة متزامنة مع الخادم. تكلفة الشحن النهائية تؤكد عند إنشاء الطلب.
              </div>

              <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

                <section className="space-y-5">

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {itemCount} item
                        {itemCount !== 1
                          ? "s"
                          : ""}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        In your cart
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleClear()}
                      disabled={syncing}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear cart
                    </button>

                  </div>

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

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

                                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">

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
                                    <ShoppingBag className="h-7 w-7 text-slate-300" />
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <Link
                                    href={`/shop/products/${encodeURIComponent(item.productId)}`}
                                    className="text-sm font-black text-slate-900 hover:text-[#2563EB]"
                                  >
                                    {
                                      item.name
                                    }
                                  </Link>

                                  {item.variantLabel && (
                                    <p className="mt-1 text-xs font-semibold text-[#2563EB]">
                                      {
                                        item.variantLabel
                                      }
                                    </p>
                                  )}

                                  <p className="mt-2 text-lg font-black text-[#0F2747]">
                                    <LocalizedPrice
                                      amountUSD={item.price}
                                      currency={item.currency}
                                    />
                                  </p>

                                  <div className="mt-4 flex items-center gap-3">

                                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">

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
                                        className="flex h-10 w-10 items-center justify-center text-slate-600 disabled:opacity-40"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>

                                      <span className="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 text-sm font-black">
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
                                        className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>

                                    </div>

                                  </div>

                                </div>

                                <div className="flex items-end justify-between gap-5 sm:flex-col sm:items-end">

                                  <p className="text-xl font-black text-[#0F2747]">
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
                                    className="text-xs font-bold text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>

                                </div>

                              </div>

                            </article>
                          );
                        },
                      )}

                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Truck className="h-4 w-4 text-emerald-600" />
                        Shipping is calculated and confirmed at checkout.
                      </div>
                    </div>
                  </section>

                  <RecommendationSection
                    type="FREQUENTLY_BOUGHT_TOGETHER"
                    title="Frequently bought together"
                    description="Complete your purchase with products customers often add."
                  />

                </section>

                <aside className="h-fit space-y-5 xl:sticky xl:top-24">

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-black text-slate-900">
                      Order summary
                    </h2>

                    <div className="mt-6 space-y-4">

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Items
                        </span>

                        <span className="font-bold">
                          {itemCount}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-bold">
                          <LocalizedPrice amountUSD={subtotal} currency={items[0]?.currency} />
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="font-bold">
                          Confirmed at checkout
                        </span>
                      </div>

                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">

                      <div className="flex items-end justify-between">
                        <span className="font-bold text-slate-500">
                          Total
                        </span>

                        <span className="text-3xl font-black text-[#0F2747]">
                          <LocalizedPrice
                            amountUSD={subtotal}
                            currency={items[0]?.currency}
                          />
                        </span>
                      </div>

                    </div>

                    <Link
                      href="/shop/checkout"
                      className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white"
                    >
                      Continue to checkout
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                  </div>

                  <RecommendationSection
                    type="BASED_ON_BROWSING"
                    title="Recommended for you"
                    description="Suggestions based on products you may like."
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
