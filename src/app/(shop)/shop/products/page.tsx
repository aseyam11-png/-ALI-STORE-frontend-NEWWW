import { Suspense } from "react";

import { ProductsPageContent } from "@/components/commerce/products/ProductsPageContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-8">
          <div className="mx-auto h-96 max-w-[1440px] animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
