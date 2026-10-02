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

import {
  getProductById,
  getRelatedProducts,
} from "@/features/products/services/product.service";
import { normalizeB2CProduct } from "@/features/products/services/b2c-product.mapper";

import {
  getActiveRuleForCategory,
  pricingRulesSeed,
} from "@/features/pricing/data/pricing-rules.seed";

import {
  calculateSellingPrice,
} from "@/features/pricing/services/pricing.service";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productDetails = await getProductById(id);

  if (!productDetails) {
    return {
      title: "Product not found | AliStore",
    };
  }

  return {
    title: productDetails.seo.title,
    description: productDetails.seo.description,
    keywords: productDetails.seo.keywords,
    openGraph: {
      title: productDetails.seo.title,
      description: productDetails.seo.description,
      type: "website",
      images: productDetails.images[0]?.url
        ? [{ url: productDetails.images[0].url }]
        : undefined,
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

  const category =
    productDetails.category?.name ?? "General";

  // Supplier-cost -> AliStore selling-price markup. This is the real
  // dropshipping pricing mechanism (not a marketplace concept) — the
  // customer only ever sees the resulting AliStore selling price.
  //
  // Reads the plain seed module directly rather than the client-only
  // `usePricingRuleStore` Zustand hook: this is a Server Component (`async
  // function`), and a "use client" module's exports become RSC client
  // references when imported into server code — `usePricingRuleStore
  // .getState` was never a real function here, it crashed on every
  // request (see FE-034 in the forensic report). There is also no backend
  // to persist admin-edited rules to, so the server was always going to
  // compute pricing from this seed regardless of what an admin session's
  // client-side store state held.
  const pricingRule = getActiveRuleForCategory(
    pricingRulesSeed,
    category,
  );

  const supplierPrice =
    productDetails.price.amount;

  const sellingPrice =
    calculateSellingPrice(
      supplierPrice,
      "AUTOMATIC",
      pricingRule,
    );

  // Normalize once, here, through the canonical adapter — the AliStore
  // selling price then replaces the raw supplier price on the resulting
  // view model before anything customer-facing renders it. ProductInfo
  // (and anything else downstream) receives this already-normalized
  // value rather than normalizing it again itself.
  const product = {
    ...normalizeB2CProduct(productDetails),
    price: sellingPrice,
  };

  const primaryShippingMethod =
    productDetails.shippingMethods[0];

  const estimatedDelivery =
    primaryShippingMethod
      ? `${primaryShippingMethod.estimatedMinDays}-${primaryShippingMethod.estimatedMaxDays} business days`
      : "Delivery estimate available at checkout";

  const relatedProducts =
    await getRelatedProducts(
      productDetails.id,
      productDetails.category?.id,
      4,
    );

  return (
    <AppShell>
      <main className="min-h-screen bg-background">

        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">

          <ProductBreadcrumb
            category={category}
            productName={productDetails.name}
          />

          <section className="mt-4 rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-8">
            <ProductInfo
              product={product}
            />
          </section>

          <div className="mt-8">
            <ProductTrust
              estimatedDelivery={
                estimatedDelivery
              }
              returnPolicy={
                product.returnPolicy
              }
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

            <ProductDescription
              description={
                productDetails.description
              }
            />

            <ProductSpecifications
              specifications={productDetails.specifications.map(
                (specification) => ({
                  name: specification.label,
                  value: specification.value,
                }),
              )}
            />

          </div>

          <section className="mt-8">
            <ProductReviews
              rating={
                productDetails.rating
              }
              reviews={
                productDetails.reviewCount
              }
            />
          </section>

          <RelatedProducts
            products={relatedProducts}
          />

        </div>

      </main>
    </AppShell>
  );
}
