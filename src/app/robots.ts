import { getSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";


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
