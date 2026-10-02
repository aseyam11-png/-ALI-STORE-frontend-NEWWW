"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchProducts, type BackendProduct } from "@/features/products/services/product-api.service";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

export function SimilarProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    let active = true;
    void fetchProducts({ page: 0, pageSize: 6 })
      .then((page) => {
        if (active) setProducts(page.content.filter((item) => String(item.id) !== productId).slice(0, 4));
      })
      .catch(() => active && setProducts([]));
    return () => { active = false; };
  }, [productId]);

  if (!products.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">More to explore</p><h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">منتجات مشابهة</h2><p className="mt-1 text-sm text-muted-foreground">اقتراحات من الكتالوج المنشور الحالي.</p></div>
        <Link href="/shop/products" className="hidden items-center gap-1 text-xs font-black text-brand sm:inline-flex">تصفح الكل <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/shop/products/${product.id}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-square bg-neutral-50">
              {product.primaryImageUrl && <Image src={product.primaryImageUrl} alt={product.name} fill sizes="20vw" className="object-contain p-8 transition group-hover:scale-105" />}
            </div>
            <div className="p-4">
              <p className="text-[10px] font-black text-brand">{product.brandName ?? "ALI STORE"}</p>
              <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-black">{product.name}</h3>
              <div className="mt-3 flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning" /><span className="text-[10px] text-muted-foreground">متوفر من الخادم</span></div>
              <LocalizedPrice amountUSD={Number(product.price)} className="mt-3 block text-lg font-black" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
