import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage renders real catalog category shelves", async () => {
  const page = await readFile("src/app/page.tsx", "utf8");
  const shelves = await readFile(
    "src/components/commerce/HomeCategorySections.tsx",
    "utf8",
  );

  assert.match(page, /HomeCategorySections/);
  assert.match(shelves, /الملابس/);
  assert.match(shelves, /الساعات/);
  assert.match(shelves, /الإكسسوارات/);
  assert.match(shelves, /الأحذية/);
  const shelf = await readFile("src/components/commerce/HomeCategorySection.tsx", "utf8");
  assert.match(shelf, /getProducts\(/);
});
