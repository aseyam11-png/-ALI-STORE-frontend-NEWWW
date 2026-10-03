import type {
  SearchFilters,
  SearchQuery,
} from "../types/search-query.types";

const VALID_SORTS = [
  "featured",
  "price-low",
  "price-high",
] as const;

type SearchSort = (typeof VALID_SORTS)[number];

function cleanList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function createSearchQuery(
  input: Partial<SearchQuery>,
): SearchQuery {
  const rawFilters = input.filters ?? {};

  const filters: SearchFilters = {
    brand: rawFilters.brand?.length
      ? cleanList(rawFilters.brand)
      : undefined,
    rating:
      rawFilters.rating !== undefined
        ? Math.max(
            0,
            Math.min(5, Number(rawFilters.rating)),
          )
        : undefined,
    availability: rawFilters.availability,
    shipping: rawFilters.shipping,
    discount: rawFilters.discount,
    attributes: rawFilters.attributes
      ? Object.fromEntries(
          Object.entries(rawFilters.attributes)
            .map(([key, values]) => [
              key,
              cleanList(values),
            ])
            .filter(([, values]) => values.length > 0),
        )
      : undefined,
  };

  const sort: SearchSort = VALID_SORTS.includes(
    input.sort as SearchSort,
  )
    ? (input.sort as SearchSort)
    : "featured";

  return {
    q: input.q?.trim() || undefined,
    category: input.category?.trim() || undefined,
    page: Math.max(
      1,
      Math.floor(Number(input.page ?? 1)),
    ),
    pageSize: Math.min(
      100,
      Math.max(
        1,
        Math.floor(Number(input.pageSize ?? 24)),
      ),
    ),
    sort,
    filters,
  };
}

export function searchQueryToParams(
  query: SearchQuery,
) {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.category) params.set("categorySlug", query.category);

  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));

  const sortMap: Record<SearchQuery["sort"], string> = {
    featured: "relevance",
    "price-low": "price_asc",
    "price-high": "price_desc",
  };
  params.set("sort", sortMap[query.sort]);

  if (query.filters.brand?.length) {
    params.set(
      "brandName",
      query.filters.brand[0],
    );
  }

  if (query.filters.availability) {
    params.set(
      "availability",
      query.filters.availability === "in-stock"
        ? "IN_STOCK"
        : "",
    );
  }

  return params;
}

export function searchQueryToApiPath(
  query: SearchQuery,
) {
  return "/api/v1/products?" + searchQueryToParams(query).toString();
}
