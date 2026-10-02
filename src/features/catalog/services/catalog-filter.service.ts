import type { B2CProduct } from "@/features/products/types/b2c-product.types";

export interface CatalogFilterState {
  search: string;

  brand: string;

  rating: string;

  minPrice: string;
  maxPrice: string;

  selected: Record<
    string,
    string[]
  >;

  freeShipping: boolean;
  inStock: boolean;
  dealsOnly: boolean;
}

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase();
}

export function filterCatalogProducts(
  products: B2CProduct[],
  state: CatalogFilterState,
) {
  const query =
    normalize(state.search);

  return products.filter(
    (product) => {
      const searchableText = [
        product.name,
        product.brand,
        product.category,
        product.subcategory ?? "",
        ...(product.tags ?? []),
        ...product.variants.map(
          (variant) =>
            `${variant.name} ${variant.value}`,
        ),
      ]
        .join(" ")
        .toLocaleLowerCase();

      if (
        query &&
        !searchableText.includes(
          query,
        )
      ) {
        return false;
      }

      if (
        state.brand &&
        state.brand !== "all" &&
        normalize(
          product.brand,
        ) !== normalize(state.brand)
      ) {
        return false;
      }

      if (
        state.rating !== "all" &&
        product.rating <
          Number(state.rating)
      ) {
        return false;
      }

      if (
        state.minPrice &&
        product.price <
          Number(state.minPrice)
      ) {
        return false;
      }

      if (
        state.maxPrice &&
        product.price >
          Number(state.maxPrice)
      ) {
        return false;
      }

      if (
        state.freeShipping &&
        !product.shipping.free
      ) {
        return false;
      }

      if (
        state.inStock &&
        product.stock <= 0
      ) {
        return false;
      }

      if (
        state.dealsOnly &&
        !(
          product.discountPercentage &&
          product.discountPercentage > 0
        )
      ) {
        return false;
      }

      for (const [
        filterId,
        values,
      ] of Object.entries(
        state.selected,
      )) {
        if (!values.length) {
          continue;
        }

        const productValues =
          getProductFilterValues(
            product,
            filterId,
          );

        const matches =
          values.some(
            (value) =>
              productValues.includes(
                normalize(value),
              ),
          );

        if (!matches) {
          return false;
        }
      }

      return true;
    },
  );
}

function getProductFilterValues(
  product: B2CProduct,
  filterId: string,
): string[] {
  const values = new Set<string>();

  switch (filterId) {
    case "brand":
      values.add(
        normalize(product.brand),
      );
      break;

    case "rating":
      values.add(
        String(
          Math.floor(
            product.rating,
          ),
        ),
      );
      break;

    case "size":
    case "color":
    case "storage":
    case "ram":
    case "material":
    case "gender":
    case "platform":
    case "skin-type":
      for (const variant of product.variants) {
        if (
          normalize(
            variant.name,
          ) ===
          normalize(filterId) ||
          normalize(
            variant.type,
          ) ===
          normalize(filterId)
        ) {
          values.add(
            normalize(
              variant.value,
            ),
          );
        }

        if (
          variant.attributes
            ?.[
              filterId
            ]
        ) {
          values.add(
            normalize(
              variant.attributes[
                filterId
              ],
            ),
          );
        }
      }
      break;

    default:
      break;
  }

  return Array.from(values);
}

export function sortCatalogProducts(
  products: B2CProduct[],
  sort: string,
) {
  return [...products].sort(
    (a, b) => {
      switch (sort) {
        case "price-low":
          return (
            a.price -
            b.price
          );

        case "price-high":
          return (
            b.price -
            a.price
          );

        case "rating":
          return (
            b.rating -
            a.rating
          );

        case "reviews":
          return (
            b.reviewCount -
            a.reviewCount
          );

        case "discount":
          return (
            (b.discountPercentage ??
              0) -
            (a.discountPercentage ??
              0)
          );

        case "newest":
          return (
            Number(b.featured) -
            Number(a.featured)
          );

        default:
          return (
            Number(b.featured) -
            Number(a.featured)
          );
      }
    },
  );
}