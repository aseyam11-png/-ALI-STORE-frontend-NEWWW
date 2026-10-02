"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useSession } from "@/features/auth/session";
import {
  getMyWishlist,
  removeFromWishlist,
  type BackendWishlistItem,
} from "@/features/wishlist/services/wishlist-api.service";

export default function WishlistPage() {
  const session = useSession();
  const localItems = useWishlistStore((state) => state.items);
  const removeLocalItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);

  const [serverItems, setServerItems] = useState<BackendWishlistItem[]>([]);
  const [serverLoading, setServerLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (session.status !== "authenticated") {
      return () => {
        active = false;
      };
    }

    getMyWishlist()
      .then((items) => {
        if (active) setServerItems(items);
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "تعذر تحميل المفضلة.");
        }
      })
      .finally(() => {
        if (active) setServerLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.status]);

  const loading = session.status === "authenticating" || (session.status === "authenticated" && serverLoading);

  const visibleItems = useMemo(
    () =>
      session.status === "authenticated"
        ? serverItems.map((item) => ({
            productId: String(item.productId),
            name: item.productName ?? "Product",
            price: Number(item.price ?? 0),
            imageUrl: item.imageUrl ?? undefined,
            brandName: item.brandName ?? undefined,
            categoryName: item.categoryName ?? undefined,
            originalPrice: undefined,
          }))
        : localItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.image,
            brandName: item.brand,
            categoryName: item.category,
            originalPrice: item.originalPrice,
          })),
    [localItems, serverItems, session.status],
  );

  const remove = async (productId: string) => {
    setError("");

    if (session.status === "authenticated") {
      try {
        await removeFromWishlist(productId);
        setServerItems((items) =>
          items.filter((item) => String(item.productId) !== productId),
        );
        removeLocalItem(productId);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "تعذر حذف المنتج.");
      }
      return;
    }

    removeLocalItem(productId);
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
                  <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
                  <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Wishlist</h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {session.status === "authenticated"
                    ? "Saved products are loaded from your account."
                    : "Products saved locally on this device."}
                </p>
              </div>

              {visibleItems.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                  {visibleItems.length} saved
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              جارٍ تحميل المفضلة...
            </div>
          ) : visibleItems.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400">
                <Heart className="h-8 w-8" fill="currentColor" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-900">Your wishlist is empty</h2>
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
              {visibleItems.map((product) => {
                const productId = product.productId;
                const image = product.imageUrl;
                const name = product.name;
                const price = product.price;

                return (
                  <article key={productId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Link href={`/shop/products/${encodeURIComponent(productId)}`} className="block">
                      <div className="relative flex aspect-square items-center justify-center bg-slate-50">
                        {image ? (
                          <Image
                            src={image}
                            alt={name}
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
                      {product.brandName && (
                        <p className="text-[10px] font-black text-[#2563EB]">{product.brandName}</p>
                      )}

                      <Link href={`/shop/products/${encodeURIComponent(productId)}`}>
                        <h2 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-slate-900">
                          {name}
                        </h2>
                      </Link>

                      <LocalizedPrice amountUSD={price} className="mt-3 text-xl font-black text-[#0F2747]" />

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              productId,
                              name,
                              price,
                              priceUnit: "unit",
                              quantity: 1,
                              image,
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
                          onClick={() => void remove(productId)}
                          aria-label={`Remove ${name} from wishlist`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
