import type { MetadataRoute } from "next";

function getSiteUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercelHost ? "https://" + vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "") : undefined;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/warehouse",
        "/buyer",
        "/buyer/",
        "/shop/cart",
        "/shop/checkout",
        "/login",
        "/register",
        "/verify-email",
        "/api/",
        "/system",
      ],
    },
    ...(siteUrl ? { sitemap: siteUrl + "/sitemap.xml" } : {}),
  };
}
