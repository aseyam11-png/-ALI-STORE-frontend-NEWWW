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
