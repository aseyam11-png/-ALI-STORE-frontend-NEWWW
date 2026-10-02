"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/features/products/services/product-api.service";
import { B2CProductCard } from "@/components/commerce/B2CProductCard";

export function ProductDiscovery() {
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof getProducts>>["content"]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getProducts({
      page: 0,
      pageSize: 8,
      sort: "relevance",
    })
      .then((response) => {
        if (active) setProducts(response.content);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
            اكتشف المنتجات
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[0.82] animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <h2 className="text-h2 font-bold tracking-tight text-foreground lg:text-h1">
          اكتشف المنتجات
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {products.map((product) => (
            <B2CProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
