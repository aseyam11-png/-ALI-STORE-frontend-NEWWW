import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("autocomplete adds bounded typo tolerance without replacing exact search", async () => {
  const source = await readFile(
    "src/features/search/services/autocomplete.service.ts",
    "utf8",
  );

  assert.match(source, /function editDistance/);
  assert.match(source, /function fuzzyTextScore/);
  assert.match(source, /normalizedQuery\.length < 3/);
  assert.match(source, /Math\.floor\(normalizedQuery\.length \/ 4\)/);
  assert.match(source, /response\.items\.length > 0/);
  assert.match(source, /search: ""/);
  assert.match(source, /pageSize: 100/);
  assert.match(source, /productSuggestions\(fuzzyCandidates/);
});

test("autocomplete fuzzy fallback remains catalog-backed and does not expose supplier fields", async () => {
  const source = await readFile(
    "src/features/search/services/autocomplete.service.ts",
    "utf8",
  );

  assert.doesNotMatch(source, /supplierCost|supplierSku|supplierId/);
  assert.match(source, /getProducts\(/);
});
