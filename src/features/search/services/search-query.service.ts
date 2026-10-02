import type {
  SearchFilters,
  SearchQuery,
} from "../types/search-query.types";

const VALID_SORTS = [
  "featured",
  "price-low",
  "price-high",
  "rating",
  "reviews",
  "discount",
] as const;

type SearchSort =
  (typeof VALID_SORTS)[number];

function cleanList(
  values: string[],
) {
  return Array.from(
    new Set(
      values
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

export function createSearchQuery(
  input: Partial<SearchQuery>,
): SearchQuery {
  const rawFilters =
    input.filters ?? {};

  const filters: SearchFilters = {
    brand:
      rawFilters.brand?.length
        ? cleanList(
            rawFilters.brand,
          )
        : undefined,

    rating:
      rawFilters.rating !==
        undefined
        ? Math.max(
            0,
            Math.min(
              5,
              Number(
                rawFilters.rating,
              ),
            ),
          )
        : undefined,

    availability:
      rawFilters.availability,

    shipping:
      rawFilters.shipping,

    discount:
      rawFilters.discount,

    attributes:
      rawFilters.attributes
        ? Object.fromEntries(
            Object.entries(
              rawFilters.attributes,
            )
              .map(
                ([
                  key,
                  values,
                ]) => [
                  key,
                  cleanList(
                    values,
                  ),
                ],
              )
              .filter(
                ([
                  ,
                  values,
                ]) =>
                  values.length >
                  0,
              ),
          )
        : undefined,
  };

  const sort: SearchSort =
    VALID_SORTS.includes(
      input.sort as SearchSort,
    )
      ? (input.sort as SearchSort)
      : "featured";

  return {
    q:
      input.q?.trim() ||
      undefined,

    category:
      input.category?.trim() ||
      undefined,

    page: Math.max(
      1,
      Math.floor(
        Number(
          input.page ?? 1,
        ),
      ),
    ),

    pageSize: Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          Number(
            input.pageSize ??
              24,
          ),
        ),
      ),
    ),

    sort,

    filters,
  };
}

export function searchQueryToParams(
  query: SearchQuery,
) {
  const params =
    new URLSearchParams();

  if (query.q) {
    params.set(
      "q",
      query.q,
    );
  }

  if (query.category) {
    params.set(
      "category",
      query.category,
    );
  }

  params.set(
    "page",
    String(query.page),
  );

  params.set(
    "pageSize",
    String(query.pageSize),
  );

  params.set(
    "sort",
    query.sort,
  );

  if (
    query.filters.brand?.length
  ) {
    params.set(
      "brand",
      query.filters.brand.join(
        ",",
      ),
    );
  }

  if (
    query.filters.rating !==
    undefined
  ) {
    params.set(
      "rating",
      String(
        query.filters.rating,
      ),
    );
  }

  if (
    query.filters.availability
  ) {
    params.set(
      "availability",
      query.filters.availability,
    );
  }

  if (
    query.filters.shipping
  ) {
    params.set(
      "shipping",
      query.filters.shipping,
    );
  }

  if (
    query.filters.discount
  ) {
    params.set(
      "discount",
      query.filters.discount,
    );
  }

  Object.entries(
    query.filters.attributes ??
      {},
  ).forEach(
    ([
      key,
      values,
    ]) => {
      if (values.length) {
        params.set(
          `attr_${key}`,
          values.join(","),
        );
      }
    },
  );

  return params;
}

export function searchQueryToApiPath(
  query: SearchQuery,
) {
  return `/api/search?${searchQueryToParams(
    query,
  ).toString()}`;
}

/*
  Future production request:

  GET /api/search?q=phone
      &category=electronics
      &brand=samsung,apple
      &rating=4
      &attr_storage=256,512
      &shipping=free
      &page=1
      &pageSize=24
      &sort=featured

  Next.js
      ↓
  Spring Boot
      ↓
  Search Service
      ↓
  Elasticsearch / Meilisearch
*/