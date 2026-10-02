"use client";

import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { useSession } from "@/features/auth/session";
import { getServerWishlist, removeServerWishlistItem } from "@/features/wishlist/services/wishlist-api.service";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { formatSAR } from "@/features/localization/services/currency.service";

export default function WishlistPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const replaceItems = useWishlistStore((state) => state.replaceItems);
  const localItems = useWishlistStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const wishlistQuery = useQuery({
    queryKey: ["server-wishlist", session.user?.id],
    queryFn: getServerWishlist,
    enabled: session.status === "authenticated",
    staleTime: 15_000,
  });

  const removeMutation = useMutation({
    mutationFn: removeServerWishlistItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["server-wishlist"] });
    },
  });

  const serverItems = wishlistQuery.data ?? [];

  const hydratedItems = serverItems
    .filter((item) => item.productName && item.price !== undefined)
    .map((item) => ({
      id: String(item.productId),
      name: item.productName!,
      price: Number(item.price),
      image: item.imageUrl,
      brand: item.brandName,
      category: item.categoryName,
      originalPrice:
        item.discountPercentage && Number(item.discountPercentage) > 0
          ? Number(
              (
                Number(item.price) /
                Math.max(0.01, 1 - Number(item.discountPercentage) / 100)
              ).toFixed(2),
            )
          : undefined,
      discountPercentage:
        item.discountPercentage && Number(item.discountPercentage) > 0
          ? Number(item.discountPercentage)
          : undefined,
      rating: 0,
      reviewCount: 0,
    }));

  useEffect(() => {
    if (session.status !== "authenticated" || !wishlistQuery.isSuccess) {
      return;
    }

    const localIds = new Set(localItems.map((item) => item.id));
    const missing = hydratedItems.some((item) => !localIds.has(item.id));

    if (missing || localItems.length !== hydratedItems.length) {
      replaceItems(hydratedItems);
    }
  }, [
    hydratedItems,
    localItems,
    replaceItems,
    session.status,
    wishlistQuery.isSuccess,
  ]);

  const items =
    session.status === "authenticated" && wishlistQuery.isSuccess
      ? hydratedItems
      : localItems;

  return (
    <AccountWorkspace
      activeTab="wishlist"
      title="المفضلة"
      description="محفوظة لحسابك وتبقى متاحة بعد تسجيل الدخول من أي جهاز."
    >
      <Link
        href="/shop/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        متابعة التسوق
      </Link>

      {session.status === "authenticated" && wishlistQuery.isLoading ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[3/5] animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-dashed border-neutral-300 bg-surface p-14 text-center">
          <Heart className="mx-auto h-9 w-9 text-neutral-300" />
          <h2 className="mt-5 text-xl font-bold text-foreground">المفضلة فارغة</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            احفظ المنتجات التي تريد الرجوع إليها لاحقًا.
          </p>
          <Link
            href="/shop/products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            تصفح المنتجات
          </Link>
        </section>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm"
            >
              <Link href={"/shop/products/" + product.id} className="block">
                <div className="relative aspect-square bg-neutral-50">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-7"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-9 w-9 text-neutral-300" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                {product.brand && (
                  <p className="text-[10px] font-bold text-brand">{product.brand}</p>
                )}
                <Link href={"/shop/products/" + product.id}>
                  <h2 className="mt-1 line-clamp-2 min-h-[42px] text-sm font-bold text-foreground">
                    {product.name}
                  </h2>
                </Link>

                <p className="mt-3 text-xl font-black text-foreground">
                  {formatSAR(Number(product.price))}
                </p>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: Number(product.price),
                        priceUnit: "piece",
                        quantity: 1,
                        image: product.image,
                        minOrderQuantity: 1,
                        shippingMethod: "STANDARD",
                        estimatedDelivery: "تظهر بعد اختيار الشحن",
                      })
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand text-xs font-bold text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    أضف للسلة
                  </button>

                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(product.id)}
                    disabled={removeMutation.isPending}
                    aria-label={"إزالة " + product.name + " من المفضلة"}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-surface disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountWorkspace>
  );
}
