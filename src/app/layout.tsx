import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { AnalyticsScripts } from "@/components/ux/AnalyticsScripts";
import { RouteAnalytics } from "@/components/ux/RouteAnalytics";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

function getMetadataBase(): URL | undefined {
  const siteUrl = getSiteUrl();
  return siteUrl ? new URL(siteUrl) : undefined;
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "ALI STORE",
    template: "%s | ALI STORE",
  },
  description:
    "ALI STORE — متجر تجزئة مباشر للملابس والأحذية والساعات والإكسسوارات، مع أسعار ومخزون وطرق شحن مرتبطة بخدمات المتجر.",
  applicationName: "ALI STORE",
  openGraph: {
    siteName: "ALI STORE",
    locale: "ar",
    type: "website",
  },
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
