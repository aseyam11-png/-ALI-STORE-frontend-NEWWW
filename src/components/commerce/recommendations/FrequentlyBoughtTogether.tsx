"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchProducts, type BackendProduct } from "@/features/products/services/product-api.service";
import { useCartStore } from "@/stores/cart-store";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

export function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let active = true;
    void fetchProducts({ page: 0, pageSize: 4 })
      .then((page) => {
        if (active) setProducts(page.content.filter((item) => String(item.id) !== productId).slice(0, 3));
      })
      .catch(() => active && setProducts([]));
    return () => { active = false; };
  }, [productId]);

  if (!products.length) return null;

  const total = products.reduce((sum, product) => sum + Number(product.price), 0);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-brand" /><div><h2 className="text-lg font-black">منتجات قد تناسب طلبك</h2><p className="mt-1 text-xs text-muted-foreground">مقترحات من الكتالوج الحالي.</p></div></div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border border-neutral-200 p-3">
            <Link href={`/shop/products/${product.id}`}>
              <div className="relative aspect-square rounded-lg bg-neutral-50">
                {product.primaryImageUrl && <Image src={product.primaryImageUrl} alt={product.name} fill sizes="20vw" className="object-contain p-5" />}
              </div>
              <p className="mt-3 line-clamp-2 text-xs font-black">{product.name}</p>
              <LocalizedPrice amountUSD={Number(product.price)} className="mt-2 block text-sm font-black" />
            </Link>
            <button type="button" onClick={() => addItem({ productId: String(product.id), name: product.name, price: Number(product.price), priceUnit: "piece", quantity: 1, image: product.primaryImageUrl ?? undefined, minOrderQuantity: 1 })} className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-[10px] font-black text-white"><Plus className="h-3.5 w-3.5" /> أضف للسلة</button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="text-xs font-bold text-muted-foreground">إجمالي المقترحات</span>
        <LocalizedPrice amountUSD={total} className="text-xl font-black" />
        <span className="inline-flex items-center gap-1 rounded-xl bg-success-surface px-3 py-2 text-[10px] font-black text-success"><Check className="h-3.5 w-3.5" /> من الكتالوج</span>
      </div>
    </section>
  );
}
