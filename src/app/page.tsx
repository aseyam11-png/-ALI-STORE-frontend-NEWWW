import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/commerce/HomeHero";
import { HomepageCategoryExplorer } from "@/components/commerce/HomepageCategoryExplorer";
import { ProductDiscovery } from "@/components/commerce/ProductDiscovery";
import { FlashDeals } from "@/components/commerce/FlashDeals";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { AliAiPanel } from "@/components/commerce/AliAiPanel";

export const metadata: Metadata = {
  title: "ALI STORE — تسوّق مباشر من المصدر",
  description:
    "تصفّح الأقسام والمنتجات المختارة وعروض اليوم — كل منتج يُباع ويُشحن ويُضمن من ALI STORE مباشرة.",
  openGraph: {
    title: "ALI STORE — تسوّق مباشر من المصدر",
    description:
      "تصفّح الأقسام والمنتجات المختارة وعروض اليوم — كل منتج يُباع ويُشحن ويُضمن من ALI STORE مباشرة.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <AppShell>
      <HomeHero />
      <HomepageCategoryExplorer />
      <TrustStrip />
      <FlashDeals />
      <ProductDiscovery />
      <AliAiPanel mode="discover" />
    </AppShell>
  );
}
