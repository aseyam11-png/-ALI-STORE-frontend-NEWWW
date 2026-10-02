"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { FreeShippingProgress } from "@/components/commerce/cart/FreeShippingProgress";
import { RecommendationSection } from "@/components/commerce/recommendations/RecommendationSection";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/features/auth/session";
import {
  getCart,
  mapCartItem,
  removeCartItem,
  updateCartItem,
  clearServerCart,
  syncLocalCart,
} from "@/features/cart/services/cart.service";

export default function CartPage() {
  const items = useCartStore(
    (state) => state.items,
  );

  const setItems = useCartStore(
    (state) => state.setItems,
  );

  const { status: sessionStatus } =
    useSession();

  const [syncing, setSyncing] =
    useState(false);
  const [syncError, setSyncError] =
    useState("");

  const shipping =
    useCartStore
      .getState()
      .getShippingInfo();

  const removeItem = useCartStore(
    (state) => state.removeItem,
  );

  const updateQuantity =
    useCartStore(
      (state) => state.updateQuantity,
    );

  const clearCart = useCartStore(
    (state) => state.clearCart,
  );

  useEffect(() => {
    if (
      sessionStatus !==
      "authenticated"
    ) {
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      setSyncing(true);
      setSyncError("");

      try {
        const localItems =
          useCartStore.getState().items;

        const serverCart =
          localItems.length > 0
            ? await syncLocalCart(
                localItems,
              )
            : await getCart();

        if (!cancelled) {
          setItems(
            serverCart.items.map(
              mapCartItem,
            ),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Unable to synchronize your cart.",
          );
        }
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    sessionStatus,
    setItems,
  ]);

  const handleQuantity = async (
    item: (typeof items)[number],
    quantity: number,
  ) => {
    if (quantity < 1) return;

    if (item.serverItemId) {
      try {
        const cart =
          await updateCartItem(
            item.serverItemId,
            item.productId,
            quantity,
          );
        setItems(
          cart.items.map(
            mapCartItem,
          ),
        );
      } catch (error) {
        setSyncError(
          error instanceof Error
            ? error.message
            : "Unable to update the cart.",
        );
      }
      return;
    }

    updateQuantity(
      item.productId,
      quantity,
    );
  };

  const handleRemove = async (
    item: (typeof items)[number],
  ) => {
    if (item.serverItemId) {
      try {
        const cart =
          await removeCartItem(
            item.serverItemId,
          );
        setItems(
          cart.items.map(
            mapCartItem,
          ),
        );
      } catch (error) {
        setSyncError(
          error instanceof Error
            ? error.message
            : "Unable to remove the item.",
        );
      }
      return;
    }

    removeItem(item.productId);
  };

  const handleClear = async () => {
    try {
      if (
        sessionStatus ===
        "authenticated"
      ) {
        const cart =
          await clearServerCart();
        setItems(
          cart.items.map(
            mapCartItem,
          ),
        );
      } else {
        clearCart();
      }
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "Unable to clear the cart.",
      );
    }
  };

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0,
  );

  const grandTotal =
    subtotal + shipping.cost;

  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

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
              {syncError && (
                <div
                  role="alert"
                  className="rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-bold text-danger-700"
                >
                  {syncError}
                </div>
              )}

              <FreeShippingProgress
                subtotal={subtotal}
                threshold={75}
              />

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
                      onClick={() => {
                        void handleClear();
                      }}
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
                                      currency={item.currency ?? "USD"}
                                    />
                                  </p>

                                  <div className="mt-4 flex items-center gap-3">

                                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">

                                      <button
                                        type="button"
                                        onClick={() => {
                                          void handleQuantity(
                                            item,
                                            item.quantity - 1,
                                          );
                                        }}
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
                                        onClick={() => {
                                          void handleQuantity(
                                            item,
                                            item.quantity + 1,
                                          );
                                        }}
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
                                    />
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void handleRemove(item);
                                    }}
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

                    {shipping.cost >= 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Truck className="h-4 w-4 text-emerald-600" />

                            {shipping.method}

                            {shipping.estimatedDelivery && (
                              <>
                                <span className="text-slate-300">
                                  ·
                                </span>

                                <Clock3 className="h-4 w-4 text-[#2563EB]" />

                                {
                                  shipping.estimatedDelivery
                                }
                              </>
                            )}
                          </div>

                          <p className="text-sm font-black text-slate-900">
                            Shipping:{" "}
                            {shipping.cost === 0 ? (
                              "Free"
                            ) : (
                              <LocalizedPrice
                                amountUSD={shipping.cost}
                                className="font-black text-slate-900"
                              />
                            )}
                          </p>

                        </div>

                      </div>
                    )}

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
                          <LocalizedPrice amountUSD={subtotal} />
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="font-bold">
                          {shipping.cost === 0 ? (
                            "FREE"
                          ) : (
                            <LocalizedPrice amountUSD={shipping.cost} />
                          )}
                        </span>
                      </div>

                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">

                      <div className="flex items-end justify-between">
                        <span className="font-bold text-slate-500">
                          Total
                        </span>

                        <span className="text-3xl font-black text-[#0F2747]">
                          <LocalizedPrice amountUSD={grandTotal} />
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
