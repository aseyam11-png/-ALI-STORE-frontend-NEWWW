export type AnalyticsProperties = Record<string, unknown>;

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_brand?: string;
  coupon?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    posthog?: {
      capture?: (event: string, properties?: AnalyticsProperties) => void;
      identify?: (distinctId: string, properties?: AnalyticsProperties) => void;
      reset?: () => void;
    };
  }
}

function isEnabled() {
  return (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_UX_ANALYTICS_ENABLED === "true"
  );
}

export function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  if (!isEnabled()) return;

  window.posthog?.capture?.(eventName, properties);
  window.gtag?.("event", eventName, properties);
}

export function trackPageView(pathname: string, search = "") {
  if (!isEnabled()) return;

  const pageLocation =
    typeof window !== "undefined"
      ? window.location.origin + pathname + (search ? "?" + search : "")
      : pathname;

  window.posthog?.capture?.("$pageview", {
    $current_url: pageLocation,
    path: pathname,
  });

  window.gtag?.("event", "page_view", {
    page_path: pathname,
    page_location: pageLocation,
  });

  window.clarity?.("set", "route", pathname);
}

export function trackEcommerceEvent(
  eventName: string,
  params: {
    currency?: string;
    value?: number;
    items?: EcommerceItem[];
    [key: string]: unknown;
  } = {},
) {
  trackEvent(eventName, params);
}

export function identifyUser(
  userId: string,
  properties: AnalyticsProperties = {},
) {
  if (!isEnabled() || !userId) return;
  window.posthog?.identify?.(userId, properties);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  window.posthog?.reset?.();
}
