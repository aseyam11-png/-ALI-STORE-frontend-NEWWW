"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  getWishlist,
  removeFromWishlist,
} from "@/features/wishlist/services/wishlist.service";
import { getProductById } from "@/features/products/services/product.service";
import {
  addCartItem,
} from "@/features/cart/services/cart.service";
import type { ProductDetails } from "@/features/products/types/product.types";

type WishlistViewItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  brand?: string;
  category?: string;
};

export default function WishlistPage() {
  const [
    items,
    setItems,
  ] = useState<WishlistViewItem[]>(
    [],
  );
  const [
    loading,
    setLoading,
  ] = useState(true);
  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const records =
          await getWishlist();

        const products =
          await Promise.all(
            records.map(
              (record) =>
                getProductById(
                  String(
                    record.productId,
                  ),
                ),
            ),
          );

        if (cancelled) return;

        setItems(
          products
            .filter(
              (
                product,
              ): product is ProductDetails =>
                product !== null,
            )
            .map((product) => ({
              id: product.id,
              name:
                product.name,
              price:
                product.price,
              currency:
                product.currency,
              image:
                product.images[0]
                  ?.url,
              brand:
                product.brand,
              category:
                product.category,
            })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load wishlist.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (
    productId: string,
  ) => {
    try {
      await removeFromWishlist(
        productId,
      );
      setItems((current) =>
        current.filter(
          (item) =>
            item.id !==
            productId,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove wishlist item.",
      );
    }
  };

  const addToCart = async (
    item: WishlistViewItem,
  ) => {
    try {
      await addCartItem(
        item.id,
        1,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add this product to cart.",
      );
    }
  };

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

              {items.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                  {items.length} saved
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-14 text-center">
              <p className="text-sm font-bold text-slate-500">
                Loading wishlist…
              </p>
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-danger-100 bg-danger-surface p-10 text-center">
              <Heart className="mx-auto h-9 w-9 text-danger-500" />
              <h2 className="mt-4 text-xl font-black text-danger-700">
                Unable to load wishlist
              </h2>
              <p className="mt-2 text-sm text-danger-600">
                {error}
              </p>
            </section>
          ) : items.length === 0 ? (
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
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-sm font-bold text-danger-700"
                >
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <article
                    key={product.id}
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
                            src={product.image}
                            alt={product.name}
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
                          {product.brand}
                        </p>
                      )}

                      <Link
                        href={`/shop/products/${encodeURIComponent(
                          product.id,
                        )}`}
                      >
                        <h2 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-slate-900">
                          {product.name}
                        </h2>
                      </Link>

                      <div className="mt-3">
                        <LocalizedPrice
                          amountUSD={
                            product.price
                          }
                          currency={
                            product.currency
                          }
                          className="text-xl font-black text-[#0F2747]"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void addToCart(
                              product,
                            );
                          }}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-xs font-black text-white"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to cart
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void remove(
                              product.id,
                            );
                          }}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
