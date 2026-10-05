import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

test("Smart Search 2.0 uses the backend suggestion contract before the legacy fallback", async () => {
  const autocomplete = await read("src/features/search/services/autocomplete.service.ts");
  const api = await read("src/features/search/services/search-suggestions-api.service.ts");

  assert.match(autocomplete, /getSearchSuggestionsFromApi/);
  assert.match(autocomplete, /backendSuggestions/);
  assert.match(api, /\/api\/v1\/search\/suggestions/);
  assert.match(api, /limit/);
});

test("Ask Ali is a first-class customer route and remains honest about AI availability", async () => {
  const pageExists = await exists("src/app/(shop)/shop/ask-ali/page.tsx");
  const panel = await read("src/components/commerce/AliAiPanel.tsx");
  const service = await read("src/features/ai/services/ask-ali.service.ts");
  const header = await read("src/components/layout/Header.tsx");

  assert.equal(pageExists, true);
  assert.match(panel, /askAli/);
  assert.match(panel, /discoverWithAli/);
  assert.match(panel, /خدمة Ask Ali غير متاحة/);
  assert.match(service, /\/api\/v1\/ai\/ask/);
  assert.match(service, /\/api\/v1\/ai\/discover/);
  assert.match(header, /\/shop\/ask-ali/);
  assert.match(header, /Sparkles/);
});

test("AI Discovery is present on the storefront without leaking internal supplier metadata", async () => {
  const home = await read("src/app/page.tsx");
  const panel = await read("src/components/commerce/AliAiPanel.tsx");
  const service = await read("src/features/ai/services/ask-ali.service.ts");

  assert.match(home, /<AliAiPanel mode="discover" \/>/);
  assert.match(panel, /AI Discovery/);
  assert.match(panel, /معلومات الكتالوج فقط/);
  assert.doesNotMatch(service, /supplierCost|supplierSku|supplierId/);
  assert.doesNotMatch(panel, /supplierCost|supplierSku|supplierId/);
});

test("AI results are rendered only as catalog product cards with real availability and price", async () => {
  const panel = await read("src/components/commerce/AliAiPanel.tsx");

  assert.match(panel, /primaryImageUrl/);
  assert.match(panel, /availableQuantity/);
  assert.match(panel, /formatCurrency/);
  assert.match(panel, /\/shop\/products\//);
  assert.doesNotMatch(panel, /rating:\s*5|discount:\s*50|MOCK_/i);
});