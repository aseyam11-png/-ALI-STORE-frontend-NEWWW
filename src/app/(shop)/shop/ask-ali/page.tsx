import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { AliAiPanel } from "@/components/commerce/AliAiPanel";

export const metadata: Metadata = {
  title: "Ask Ali | ALI STORE",
  description: "اسأل Ali STORE عن المنتجات المناسبة من الكتالوج الحالي.",
};

export default function AskAliPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <AliAiPanel mode="ask" />
      </main>
    </AppShell>
  );
}