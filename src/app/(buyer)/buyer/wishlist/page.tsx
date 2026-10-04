"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { useCartStore } from "@/stores/cart-store";
import {
  addBackendCartItem,
  mapBackendCartToLocal,
} from "@/features/cart/services/cart-api.service";
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
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceCartItems = useCartStore(
    (state) => state.replaceItems,
  );
  const [cartBusyId, setCartBusyId] = useState<string | null>(null);

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

  const loading = session.status === "loading" || (session.status === "authenticated" && serverLoading);

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
            currency: item.currency ?? undefined,
          }))
        : localItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.image,
            brandName: item.brand,
            categoryName: item.category,
            originalPrice: item.originalPrice,
            currency: item.currency,
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
    <AccountWorkspace
      activeTab="wishlist"
      title="المفضلة"
      description="احتفظ بالمنتجات التي تهمك وارجع إليها أو أضفها إلى السلة عندما تكون جاهزًا للشراء."
    >
        <div className="min-w-0">
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-danger-100 bg-danger-surface p-4 text-sm font-bold text-danger-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-surface p-12 text-center text-sm text-neutral-500">
              جارٍ تحميل المفضلة...
            </div>
          ) : visibleItems.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-surface text-danger-400">
                <Heart className="h-8 w-8" fill="currentColor" />
              </div>
              <h2 className="mt-5 text-xl font-black text-foreground">قائمة المفضلة فارغة</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                احفظ المنتجات التي تعجبك وارجع إليها لاحقًا.
              </p>
              <Link
                href="/shop/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                تصفح المنتجات
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
                  <article key={productId} className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm">
                    <Link href={`/shop/products/${encodeURIComponent(productId)}`} className="block">
                      <div className="relative flex aspect-square items-center justify-center bg-neutral-50">
                        {image ? (
                          <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-7"
                          />
                        ) : (
                          <Heart className="h-9 w-9 text-neutral-300" />
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      {product.brandName && (
                        <p className="text-[10px] font-black text-brand">{product.brandName}</p>
                      )}

                      <Link href={`/shop/products/${encodeURIComponent(productId)}`}>
                        <h2 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-foreground">
                          {name}
                        </h2>
                      </Link>

                      <LocalizedPrice amountUSD={price} currency={product.currency} className="mt-3 text-xl font-black text-brand-ink" />

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                        <button
                          type="button"
                          disabled={cartBusyId === productId}
                          onClick={async () => {
                            if (cartBusyId === productId) return;

                            setError("");
                            setCartBusyId(productId);

                            const localLine = {
                              productId,
                              name,
                              price,
                              currency: product.currency,
                              priceUnit: "unit",
                              quantity: 1,
                              image,
                              minOrderQuantity: 1,
                            };

                            try {
                              if (session.status === "authenticated") {
                                const numericId = Number(productId);
                                if (!Number.isInteger(numericId) || numericId < 1) {
                                  throw new Error("Invalid product id.");
                                }

                                const currentItems =
                                  useCartStore.getState().items;
                                const backend = await addBackendCartItem(
                                  numericId,
                                  1,
                                );

                                replaceCartItems(
                                  mapBackendCartToLocal(
                                    backend,
                                    [...currentItems, localLine],
                                  ),
                                );
                              } else {
                                addLocalItem(localLine);
                              }
                            } catch (caughtError) {
                              setError(
                                caughtError instanceof Error
                                  ? caughtError.message
                                  : "تعذر إضافة المنتج إلى السلة.",
                              );
                            } finally {
                              setCartBusyId(null);
                            }
                          }}
                          aria-busy={cartBusyId === productId}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {cartBusyId === productId
                            ? "جارٍ الإضافة..."
                            : "أضف إلى السلة"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void remove(productId)}
                          aria-label={`إزالة ${name} من المفضلة`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-surface"
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
    </AccountWorkspace>
  );
}
