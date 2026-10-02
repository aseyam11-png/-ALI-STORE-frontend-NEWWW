import type {
  ProductSubmission,
} from "@/features/product-moderation/types/product-moderation.types";

import type {
  PublishedCatalogProduct,
} from "../types/published-product.types";

export function submissionToPublishedProduct(
  submission: ProductSubmission,
): PublishedCatalogProduct | null {
  if (
    submission.status !==
    "PUBLISHED"
  ) {
    return null;
  }

  const variants =
    submission.variants.map(
      (variant) => ({
        id: variant.id,
        optionName:
          variant.optionName,
        optionValue:
          variant.optionValue,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        image:
          variant.image,
      }),
    );

  return {
    id:
      submission.productId ??
      `published-${submission.id}`,

    submissionId:
      submission.id,

    name:
      submission.productName,

    brand:
      submission.brand,

    category:
      submission.category,

    subcategory:
      submission.subcategory,

    sku:
      submission.sku,

    description:
      submission.description,

    price:
      submission.price,

    originalPrice:
      submission.discountPercentage >
      0
        ? submission.price /
          Math.max(
            0.01,
            1 -
              submission.discountPercentage /
                100,
          )
        : undefined,

    stock:
      submission.stock,

    discountPercentage:
      submission.discountPercentage,

    images:
      submission.images,

    shipping: {
      method:
        submission.shippingMethod,

      estimatedDelivery:
        submission.estimatedDelivery,

      free:
        submission.freeShipping,
    },

    variants,

    status:
      "PUBLISHED",

    publishedAt:
      submission.reviewedAt ??
      new Date().toISOString(),

    version:
      submission.version,
  };
}

export function getPublishedProducts(
  submissions: ProductSubmission[],
) {
  return submissions
    .filter(
      (submission) =>
        submission.status ===
        "PUBLISHED",
    )
    .map(
      submissionToPublishedProduct,
    )
    .filter(
      (
        product,
      ): product is PublishedCatalogProduct =>
        product !== null,
    );
}