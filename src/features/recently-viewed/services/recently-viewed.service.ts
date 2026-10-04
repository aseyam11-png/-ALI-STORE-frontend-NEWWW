export type RecentlyViewedItem = {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  currency: string;
  viewedAt: string;
};

const STORAGE_KEY = "alistore.recently-viewed";
const MAX_ITEMS = 12;

let snapshot: RecentlyViewedItem[] = [];
const listeners = new Set<() => void>();

function normalizeItem(item: RecentlyViewedItem): RecentlyViewedItem {
  return {
    ...item,
    id: String(item.id),
    name: item.name.trim(),
    price: Number.isFinite(item.price) ? item.price : 0,
    currency: item.currency || "USD",
    viewedAt: item.viewedAt || new Date(0).toISOString(),
  };
}

function readStorage(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is RecentlyViewedItem => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Partial<RecentlyViewedItem>;
        return (
          typeof candidate.id === "string" &&
          typeof candidate.name === "string" &&
          typeof candidate.price === "number"
        );
      })
      .map(normalizeItem)
      .filter((item) => item.name.length > 0)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function syncSnapshot() {
  snapshot = readStorage();
}

function notify() {
  syncSnapshot();
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  syncSnapshot();
  window.addEventListener("storage", notify);
}

export function subscribeRecentlyViewed(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRecentlyViewed() {
  return snapshot;
}

function persist(next: RecentlyViewedItem[]) {
  snapshot = next.slice(0, MAX_ITEMS);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Recently viewed is optional UX state; storage failure must not block shopping.
    }
  }

  listeners.forEach((listener) => listener());
  return snapshot;
}

export function recordRecentlyViewed(
  item: Omit<RecentlyViewedItem, "viewedAt">,
) {
  const normalized = normalizeItem({
    ...item,
    viewedAt: new Date().toISOString(),
  });

  const next = [
    normalized,
    ...snapshot.filter((current) => current.id !== normalized.id),
  ];

  return persist(next);
}

export function removeRecentlyViewed(id: string) {
  return persist(snapshot.filter((item) => item.id !== id));
}

export function clearRecentlyViewed() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  snapshot = [];
  listeners.forEach((listener) => listener());
}
