import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Ask Ali product cards never invent currency or display invalid prices", async () => {
  const source = await readFile("src/components/commerce/AliAiPanel.tsx", "utf8");

  assert.match(source, /function formatAiProductPrice\(/);
  assert.match(source, /Number\.isFinite\(amount\)/);
  assert.match(source, /product\.currency !== "SAR"/);
  assert.match(source, /formatCurrency\(amount, "SAR"\)/);
  assert.match(source, /السعر غير متاح/);
  assert.doesNotMatch(source, /product\.currency \|\| ["']USD["']/);
  assert.doesNotMatch(source, /formatCurrency\(Number\(product\.price\),/);
});

test("Ask Ali product type matches the backend DTO and prompts fit ALI STORE", async () => {
  const service = await readFile("src/features/ai/services/ask-ali.service.ts", "utf8");
  const panel = await readFile("src/components/commerce/AliAiPanel.tsx", "utf8");

  assert.doesNotMatch(service, /sku\?:\s*string/);
  assert.doesNotMatch(panel, /product\.sku/);
  assert.match(panel, /ساعة أنيقة/);
  assert.match(panel, /حقيبة عملية/);
  assert.match(panel, /حذاء مريح/);
  assert.doesNotMatch(panel, /هاتف عملي بسعر أقل من 100 دولار/);
});
