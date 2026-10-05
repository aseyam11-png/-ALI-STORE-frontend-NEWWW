import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/commerce/HomeHero";
import { CategoryGrid } from "@/components/commerce/CategoryGrid";
import { ProductDiscovery } from "@/components/commerce/ProductDiscovery";
import { FlashDeals } from "@/components/commerce/FlashDeals";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { HomeCategorySections } from "@/components/commerce/HomeCategorySections";
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

// Composition layer only — every section is its own component, each reusing
// existing data/business logic (cart, wishlist, catalog, search) unchanged.
// No intro/splash gate: the homepage renders directly on mount. The hero is
// a static, real photograph (see HomeHero) — no 3D/canvas layer.
export default function HomePage() {
  return (
    <AppShell>
      <HomeHero />
      <TrustStrip />
      <CategoryGrid />
      <FlashDeals />
      <AliAiPanel mode="discover" />
      <ProductDiscovery />
      <HomeCategorySections />
    </AppShell>
  );
}






