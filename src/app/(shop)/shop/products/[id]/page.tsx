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
import { getProductById, getRelatedProducts } from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "المنتج غير موجود | ALI STORE" };
  }

  return {
    title: product.seo.title,
    description: product.seo.description,
    keywords: product.seo.keywords,
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      type: "website",
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const productDetails = await getProductById(id);

  if (!productDetails) {
    notFound();
  }

  const product = normalizeB2CProduct(productDetails);
  const relatedProducts = await getRelatedProducts(
    productDetails.id,
    productDetails.category?.id,
    4,
  );

  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <ProductBreadcrumb
            category={product.category}
            productName={product.name}
          />

          <section className="mt-4 rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-8">
            <ProductInfo product={product} />
          </section>

          <div className="mt-8">
            <ProductTrust
              estimatedDelivery="تحدد المدة والتكلفة عند اختيار الشحن"
              returnPolicy={product.returnPolicy}
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <ProductDescription description={productDetails.description} />
            <ProductSpecifications
              specifications={productDetails.specifications.map((item) => ({
                name: item.label,
                value: item.value,
              }))}
            />
          </div>

          <section className="mt-8">
            <ProductReviews rating={productDetails.rating} reviews={productDetails.reviewCount} />
          </section>

          <RelatedProducts products={relatedProducts} />
        </div>
      </main>
    </AppShell>
  );
}
