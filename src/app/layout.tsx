import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { AnalyticsScripts } from "@/components/ux/AnalyticsScripts";
import { RouteAnalytics } from "@/components/ux/RouteAnalytics";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

function getMetadataBase(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate = configured || (vercelHost ? "https://" + vercelHost.replace(/^https?:\\/\\//, "") : undefined);
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || process.env.NODE_ENV !== "production"
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "AliStore",
  description:
    "AliStore — shop direct. Every product sold, shipped and stood behind by AliStore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={ibmPlexSansArabic.variable}
    >
      <body>
        <Providers>{children}</Providers>
        <AnalyticsScripts />
        <Suspense fallback={null}>
          <RouteAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
