"use client";

import type { Route } from "next";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMemo } from "react";

import {
  createSearchQuery,
  searchQueryToParams,
} from "../services/search-query.service";

export function useSearchQueryState() {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const query =
    useMemo(() => {
      const attributes: Record<
        string,
        string[]
      > = {};

      searchParams
        .forEach(
          (value, key) => {
            if (
              key.startsWith(
                "attr_",
              )
            ) {
              attributes[
                key.replace(
                  "attr_",
                  "",
                )
              ] = value
                .split(",")
                .filter(Boolean);
            }
          },
        );

      const brand =
        searchParams
          .get("brand")
          ?.split(",")
          .filter(Boolean);

      return createSearchQuery({
        q:
          searchParams.get(
            "q",
          ) ?? undefined,

        category:
          searchParams.get(
            "category",
          ) ?? undefined,

        page: Number(
          searchParams.get(
            "page",
          ) ?? 1,
        ),

        pageSize: Number(
          searchParams.get(
            "pageSize",
          ) ?? 12,
        ),

        sort:
          (searchParams.get(
            "sort",
          ) as
            | "featured"
            | "price-low"
            | "price-high"
            | "rating"
            | "reviews"
            | "discount"
            | null) ??
          "featured",

        filters: {
          brand,
          rating:
            searchParams.get(
              "rating",
            )
              ? Number(
                  searchParams.get(
                    "rating",
                  ),
                )
              : undefined,

          availability:
            searchParams.get(
              "availability",
            ) ===
            "in-stock"
              ? "in-stock"
              : undefined,

          shipping:
            searchParams.get(
              "shipping",
            ) === "free"
              ? "free"
              : undefined,

          discount:
            searchParams.get(
              "discount",
            ) === "sale"
              ? "sale"
              : undefined,

          attributes,
        },
      });
    }, [searchParams]);

  const updateQuery = (
    patch: Partial<
      typeof query
    >,
  ) => {
    const next =
      createSearchQuery({
        ...query,
        ...patch,
      });

    router.push(
      `${pathname}?${searchQueryToParams(
        next,
      ).toString()}` as Route,
    );
  };

  const resetQuery = () => {
    router.push(
      pathname as Route,
    );
  };

  return {
    query,
    updateQuery,
    resetQuery,
  };
}