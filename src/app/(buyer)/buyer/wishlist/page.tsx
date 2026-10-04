"use client";

import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import {
  addBackendCartItem,
  mapBackendCartToLocal,
} from "@/features/cart/services/cart-api.service";
import { useSession } from "@/features/auth/session";
import {
  getMyWishlist,
  removeFromWishlist,
  type BackendWishlistItem,
} from "@/features/wishlist/services/wishlist-api.service";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const session = useSession();
  const localItems = useWishlistStore((state) => state.items);
  const removeLocalItem = useWishlistStore((state) => state.removeItem);
  const addLocalItem = useCartStore((state) => state.addItem);
  const replaceCartItems = useCartStore((state) => state.replaceItems);
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
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "تعذر تحميل المفضلة.",
          );
        }
      })
      .finally(() => {
        if (active) setServerLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.status]);

  const loading =
    session.status === "loading" ||
    (session.status === "authenticated" && serverLoading);

  const visibleItems = useMemo(
    () =>
      session.status === "authenticated"
        ? serverItems.map((item) => ({
            productId: String(item.productId),
            name: item.productName ?? "منتج",
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
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "تعذر حذف المنتج.",
        );
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
      <div className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-bold text-danger-700"
          >
            {error}
          </div>
        )}

        <section className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-label font-bold uppercase tracking-wide text-brand">
              قائمة محفوظة
            </p>
            <h2 className="mt-1 text-h4 font-bold text-foreground">
              {visibleItems.length} {visibleItems.length === 1 ? "منتج محفوظ" : "منتجات محفوظة"}
            </h2>
          </div>
          <Link
            href="/shop/products"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-neutral-200 px-4 text-body-sm font-bold text-foreground transition hover:border-primary-200 hover:text-brand"
          >
            متابعة التصفح
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </section>

        {loading ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised"
                aria-hidden="true"
              >
                <div className="aspect-square animate-pulse bg-neutral-100" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-100" />
                  <div className="h-5 w-24 animate-pulse rounded bg-neutral-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-neutral-100" />
                </div>
              </div>
            ))}
          </section>
        ) : visibleItems.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center shadow-raised sm:p-14">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-brand">
              <Heart className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-h3 font-bold text-foreground">
              المفضلة فارغة
            </h2>
            <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
              احفظ المنتجات التي تعجبك لتصل إليها بسرعة لاحقًا من أي جهاز بعد تسجيل الدخول.
            </p>
            <Link
              href="/shop/products"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover"
            >
              اكتشف المنتجات
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((product) => {
              const productId = product.productId;
              const image = product.imageUrl;
              const name = product.name;
              const price = product.price;

              return (
                <article
                  key={productId}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-raised transition-all duration-200 ease-brand hover:-translate-y-1 hover:border-neutral-300 hover:shadow-floating"
                >
                  <Link
                    href={("/shop/products/" + encodeURIComponent(productId)) as Route}
                    className="block"
                    aria-label={"عرض " + name}
                  >
                    <div className="media-frame relative aspect-[4/3] overflow-hidden bg-neutral-50">
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-contain p-7 transition-transform duration-300 ease-brand group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-300">
                          <Heart className="h-9 w-9" aria-hidden="true" />
                        </div>
                      )}
                      <span className="absolute start-3 top-3 rounded-full border border-neutral-200 bg-surface/90 px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm backdrop-blur">
                        محفوظ
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 sm:p-5">
                    {product.brandName && (
                      <p className="text-label font-bold uppercase tracking-wide text-brand">
                        {product.brandName}
                      </p>
                    )}

                    <Link
                      href={("/shop/products/" + encodeURIComponent(productId)) as Route}
                      className="block"
                    >
                      <h2 className="mt-1 line-clamp-2 min-h-[44px] text-body-sm font-bold leading-6 text-foreground transition-colors hover:text-brand">
                        {name}
                      </h2>
                    </Link>

                    {product.categoryName && (
                      <p className="mt-1 text-caption text-muted-foreground">
                        {product.categoryName}
                      </p>
                    )}

                    <LocalizedPrice
                      amountUSD={price}
                      currency={product.currency}
                      className="mt-3 text-h4 font-bold text-foreground"
                    />

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

                              const currentItems = useCartStore.getState().items;
                              const backend = await addBackendCartItem(numericId, 1);

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
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-caption font-bold text-white shadow-sm transition-all duration-200 ease-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                        {cartBusyId === productId
                          ? "جارٍ الإضافة..."
                          : "إضافة للسلة"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void remove(productId)}
                        aria-label={"إزالة " + name + " من المفضلة"}
                        title="إزالة من المفضلة"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:border-danger-100 hover:bg-danger-surface hover:text-danger-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AccountWorkspace>
  );
}
