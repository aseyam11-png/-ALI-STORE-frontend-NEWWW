import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ProductBreadcrumb } from "@/components/commerce/product/ProductBreadcrumb";
import { ProductDescription } from "@/components/commerce/product/ProductDescription";
import { ProductInfo } from "@/components/commerce/product/ProductInfo";
import { ProductReviews } from "@/components/commerce/product/ProductReviews";
import { ProductSpecifications } from "@/components/commerce/product/ProductSpecifications";
import { ProductTrust } from "@/components/commerce/product/ProductTrust";
import { RelatedProducts } from "@/components/commerce/product/RelatedProducts";
import { getProductById } from "@/features/products/services/product-api.service";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return { title: "Product not found | ALI STORE" };
  }

  try {
    const product = await getProductById(numericId);

    return {
      title: product.name + " | ALI STORE",
      description: product.description || "ALI STORE product",
      openGraph: {
        title: product.name + " | ALI STORE",
        description: product.description || "ALI STORE product",
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
      },
    };
  } catch {
    return { title: "Product not found | ALI STORE" };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    notFound();
  }

  let product;
  try {
    product = await getProductById(numericId);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <ProductBreadcrumb category={product.category} productName={product.name} />

          <section className="mt-4 rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-8">
            <ProductInfo product={product} />
          </section>

          <div className="mt-8">
            <ProductTrust
              estimatedDelivery={product.shipping.estimatedDelivery}
              returnPolicy={product.returnPolicy}
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <ProductDescription description={product.description || ""} />
            <ProductSpecifications specifications={[]} />
          </div>

          <section className="mt-8">
            <ProductReviews rating={product.rating} reviews={product.reviewCount} />
          </section>

          <RelatedProducts products={[]} />
        </div>
      </main>
    </AppShell>
  );
}
