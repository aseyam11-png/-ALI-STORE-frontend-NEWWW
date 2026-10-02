"use client";

import { useEffect, useState } from "react";
import { fetchProducts, type BackendProduct } from "@/features/products/services/product-api.service";

export function usePublishedCatalog() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchProducts({ page: 0, pageSize: 100 })
      .then((page) => {
        if (active) setProducts(page.content.filter((product) => product.status === "ACTIVE"));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { products, loading };
}
