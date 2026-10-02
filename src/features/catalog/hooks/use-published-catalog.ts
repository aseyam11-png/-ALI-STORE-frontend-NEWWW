"use client";

import { useMemo } from "react";

import {
  useProductModerationStore,
} from "@/stores/product-moderation-store";

import {
  getPublishedProducts,
} from "../services/published-catalog.service";

export function usePublishedCatalog() {
  const submissions =
    useProductModerationStore(
      (state) =>
        state.submissions,
    );

  return useMemo(
    () =>
      getPublishedProducts(
        submissions,
      ),
    [submissions],
  );
}