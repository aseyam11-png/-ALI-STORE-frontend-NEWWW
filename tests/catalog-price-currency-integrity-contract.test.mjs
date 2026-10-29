import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("catalog rejects invalid prices instead of displaying zero", async () => {
  const source = await readFile(
    "src/features/products/services/product.service.ts",
    "utf8",
  );

  assert.match(source, /function parseMoney\(/);
  assert.match(source, /value === null/);
  assert.match(source, /value === undefined/);
  assert.match(source, /value\.trim\(\) === ""/);
  assert.match(source, /!Number\.isFinite\(amount\) \|\| amount < 0/);
  assert.match(source, /throw new Error\("Invalid monetary value from product API\."\)/);
  assert.doesNotMatch(source, /return Number\.isFinite\(amount\) \? amount : 0/);
});

test("catalog enforces SAR-only currency instead of defaulting to USD", async () => {
  const source = await readFile(
    "src/features/products/services/product.service.ts",
    "utf8",
  );

  assert.match(source, /function requireCurrency\(/);
  assert.match(source, /normalized !== "SAR"/);
  assert.match(source, /const currency = requireCurrency\(product\.currency\)/);
  assert.match(source, /currency,\s*unit: "piece"/);
  assert.doesNotMatch(source, /currency:\s*product\.currency\s*\|\|\s*["']USD["']/);
});
