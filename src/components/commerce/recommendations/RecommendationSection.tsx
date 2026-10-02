"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { fetchProducts, type BackendProduct } from "@/features/products/services/product-api.service";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationSectionProps {
  type: string;
  title: string;
  description: string;
}

export function RecommendationSection({ title, description }: RecommendationSectionProps) {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    let active = true;
    void fetchProducts({ page: 0, pageSize: 4 })
      .then((page) => {
        if (active) setProducts(page.content);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => { active = false; };
  }, []);

  if (!products.length) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1.5 text-[10px] font-black text-brand">
            <Sparkles className="h-3.5 w-3.5" /> مقترحات
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <Link href="/shop/products" className="inline-flex items-center gap-1 text-xs font-black text-brand">
          استكشف <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <RecommendationCard
            key={product.id}
            product={{
              id: String(product.id),
              name: product.name,
              price: Number(product.price),
              stock: product.availability === "IN_STOCK" ? 1 : 0,
              image: product.primaryImageUrl ?? undefined,
              brand: product.brandName ?? "ALI STORE",
              category: product.categoryName ?? "General",
              rating: 0,
              reviewCount: 0,
              shipping: "التوصيل يُحدد عند التنفيذ",
              currency: product.currency ?? "SAR",
            }}
          />
        ))}
      </div>
    </section>
  );
}
