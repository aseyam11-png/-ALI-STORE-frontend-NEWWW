import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
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

export const metadata: Metadata = {
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
      className={ibmPlexSansArabic.variable}
    >
      <body>
        <Providers>
          {children}
        </Providers>
        <AnalyticsScripts />
        <RouteAnalytics />
      </body>
    </html>
  );
}
