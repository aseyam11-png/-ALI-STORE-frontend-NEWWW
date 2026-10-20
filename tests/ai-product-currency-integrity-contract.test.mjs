import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("AI product cards do not invent USD when catalog currency is absent or invalid", async () => {
  const source = await readFile("src/components/commerce/AliAiPanel.tsx", "utf8");

  assert.match(source, /function formatAiProductPrice\(/);
  assert.match(source, /Number\.isFinite\(amount\)/);
  assert.match(source, /!\/\^\[A-Z\]\{3\}\$\/\.test\(currency\)/);
  assert.match(source, /formatCurrency\(amount, currency\)/);
  assert.match(source, /السعر غير متاح/);
  assert.doesNotMatch(
    source,
    /formatCurrency\(Number\(product\.price\), product\.currency \|\| ["']USD["']\)/,
  );
});

test("Ask Ali product contract matches the backend DTO and fashion-store positioning", async () => {
  const service = await readFile("src/features/ai/services/ask-ali.service.ts", "utf8");
  const panel = await readFile("src/components/commerce/AliAiPanel.tsx", "utf8");

  assert.doesNotMatch(service, /sku\?:\s*string/);
  assert.doesNotMatch(panel, /product\.sku/);
  assert.match(panel, /ساعة أنيقة/);
  assert.match(panel, /حقيبة عملية/);
  assert.match(panel, /حذاء مريح/);
  assert.doesNotMatch(panel, /هاتف عملي بسعر أقل من 100 دولار/);
});
