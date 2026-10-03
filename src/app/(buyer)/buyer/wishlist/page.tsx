"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { useSession } from "@/features/auth/session";
import { getProductById } from "@/features/products/services/product.service";

import {
  useWishlistStore,
} from "@/stores/wishlist-store";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

import {
  useCartStore,
} from "@/stores/cart-store";

export default function WishlistPage() {
  const items =
    useWishlistStore(
      (state) =>
        state.items,
    );

  const toggleItem =
    useWishlistStore(
      (state) => state.toggleItem,
    );

  const productIds =
    useWishlistStore(
      (state) => state.productIds,
    );

  const session = useSession();

  useEffect(() => {
    if (session.status !== "authenticated") return;

    const hydrate = async () => {
      await useWishlistStore.getState().hydrateRemote();
      const state = useWishlistStore.getState();

      for (const productId of state.productIds) {
        if (state.items.some((item) => item.id === productId)) continue;

        const product = await getProductById(productId);
        if (!product) continue;

        state.addItem({
          id: product.id,
          name: product.name,
          price: product.price.amount,
          image: product.images[0]?.url,
          brand: product.brand?.name,
          category: product.category?.name,
          originalPrice: product.price.originalAmount,
          discountPercentage: product.price.discountPercentage,
          rating: product.rating,
          reviewCount: product.reviewCount,
        });
      }
    };

    void hydrate();
  }, [session.status]);

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F8FAFC]">

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 text-xs font-black text-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Continue shopping
            </Link>

            <div className="mt-5 flex items-end justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <Heart
                    className="h-6 w-6 text-red-500"
                    fill="currentColor"
                  />

                  <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">
                    Wishlist
                  </h1>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Products you saved for later.
                </p>

              </div>

              {productIds.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                  {productIds.length} saved
                </span>
              )}

            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">

          {items.length ===
          0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400">
                <Heart
                  className="h-8 w-8"
                  fill="currentColor"
                />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                Your wishlist is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Save products you like and come back to them later.
              </p>

              <Link
                href="/shop/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                Browse products
              </Link>

            </section>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {items.map(
                (product) => (
                  <article
                    key={
                      product.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    <Link
                      href={`/shop/products/${encodeURIComponent(
                        product.id,
                      )}`}
                      className="block"
                    >

                      <div className="relative flex aspect-square items-center justify-center bg-slate-50">

                        {product.image ? (
                          <Image
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-7"
                          />
                        ) : (
                          <Heart className="h-9 w-9 text-slate-300" />
                        )}

                      </div>

                    </Link>

                    <div className="p-4">

                      {product.brand && (
                        <p className="text-[10px] font-black text-[#2563EB]">
                          {
                            product.brand
                          }
                        </p>
                      )}

                      <Link
                        href={`/shop/products/${encodeURIComponent(
                          product.id,
                        )}`}
                      >
                        <h2 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-slate-900">
                          {
                            product.name
                          }
                        </h2>
                      </Link>

                      <div className="mt-3">

                        <LocalizedPrice
                          amountUSD={
                            product.price
                          }
                          className="text-xl font-black text-[#0F2747]"
                        />

                        {product.originalPrice &&
                          product.originalPrice >
                            product.price && (
                            <LocalizedPrice
                              amountUSD={
                                product.originalPrice
                              }
                              className="ms-2 text-xs font-bold text-slate-400 line-through"
                            />
                          )}

                      </div>

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              productId:
                                product.id,
                              name:
                                product.name,
                              price:
                                product.price,
                              priceUnit:
                                "unit",
                              quantity: 1,
                              image:
                                product.image,
                              minOrderQuantity: 1,
                            })
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-xs font-black text-white"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to cart
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void toggleItem(product);
                          }}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </div>

                  </article>
                ),
              )}

            </div>
          )}

        </div>
      </main>
    </AppShell>
  );
}