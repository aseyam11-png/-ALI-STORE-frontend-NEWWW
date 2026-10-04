const STORAGE_KEY = "alistore.search-history";
const MAX_ITEMS = 8;

function normalize(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalize)
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  const normalized = normalize(query);
  if (!normalized || typeof window === "undefined") {
    return getSearchHistory();
  }

  const next = [
    normalized,
    ...getSearchHistory().filter(
      (item) => item.toLocaleLowerCase() !== normalized.toLocaleLowerCase(),
    ),
  ].slice(0, MAX_ITEMS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Search history is an optional UX enhancement; storage failures must not
    // block catalog search.
  }

  return next;
}

export function removeSearchHistory(query: string): string[] {
  const normalized = normalize(query);
  const next = getSearchHistory().filter(
    (item) => item.toLocaleLowerCase() !== normalized.toLocaleLowerCase(),
  );

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures; search itself remains available.
    }
  }

  return next;
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
