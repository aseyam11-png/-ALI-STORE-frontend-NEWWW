import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("catalog URL sort is constrained to backend-supported values", async () => {
  const source = await readFile(
    "src/components/commerce/products/ProductsPageContent.tsx",
    "utf8",
  );

  assert.match(source, /function parseSort\(value: string \| null\): ProductSort/);
  assert.match(
    source,
    /case "price_asc":\s*case "price_desc":\s*case "relevance":\s*return value;/s,
  );
  assert.match(source, /default:\s*return "relevance";/s);
  assert.doesNotMatch(
    source,
    /params\.get\("sort"\) as ProductSort/,
  );
});

test("mobile catalog filters expose an explicit controlled region", async () => {
  const source = await readFile(
    "src/components/commerce/products/ProductsPageContent.tsx",
    "utf8",
  );

  assert.match(source, /aria-controls="catalog-filters"/);
  assert.match(source, /id="catalog-filters"/);
});
