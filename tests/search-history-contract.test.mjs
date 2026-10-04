import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("search history is client-only, bounded, persistent and deduplicated", async () => {
  const history = await read("src/features/search/services/search-history.service.ts");
  const autocomplete = await read("src/components/search/SmartAutocomplete.tsx");

  assert.match(history, /localStorage/);
  assert.match(history, /MAX_ITEMS = 8/);
  assert.match(history, /slice\(0, MAX_ITEMS\)/);
  assert.match(history, /toLocaleLowerCase\(\)/);
  assert.match(history, /clearSearchHistory/);

  assert.match(autocomplete, /getSearchHistory/);
  assert.match(autocomplete, /addSearchHistory/);
  assert.match(autocomplete, /removeSearchHistory/);
  assert.match(autocomplete, /عمليات البحث الأخيرة/);
});
