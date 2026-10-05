import { apiClient } from "@/lib/api/http-client";
import type { AutocompleteSuggestion } from "../types/autocomplete.types";

type BackendSuggestion = {
  type: AutocompleteSuggestion["type"] | "QUERY";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  score: number;
};

type BackendSuggestionsResponse = {
  query: string;
  suggestions: BackendSuggestion[];
};

export async function getSearchSuggestionsFromApi(
  query: string,
  limit = 8,
): Promise<AutocompleteSuggestion[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const params = new URLSearchParams({
    q: cleanQuery,
    limit: String(Math.min(12, Math.max(1, limit))),
  });

  const response = await apiClient.requestData<BackendSuggestionsResponse>(
    `/api/v1/search/suggestions?${params.toString()}`,
  );

  return response.suggestions
    .filter((item) => item.type !== "QUERY")
    .map((item) => ({
      id: item.id,
      type: item.type as AutocompleteSuggestion["type"],
      title: item.title,
      subtitle: item.subtitle,
      image: item.image,
      href: item.href,
      score: item.score,
    }));
}