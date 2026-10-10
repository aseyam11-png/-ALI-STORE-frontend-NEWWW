import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage composes one fashion hero and one live category explorer", async () => {
  const page = await readFile("src/app/page.tsx", "utf8");
  assert.match(page, /<HomeHero\s*\/>/);
  assert.match(page, /<HomepageCategoryExplorer\s*\/>/);
  assert.match(page, /<ProductDiscovery\s*\/>/);
  assert.doesNotMatch(page, /<CategoryGrid\s*\/>/);
  assert.doesNotMatch(page, /<HomeCategorySections\s*\/>/);
});

test("fashion hero contains the four editorial retail themes", async () => {
  const imagery = await readFile("src/components/commerce/home-imagery.ts", "utf8");
  for (const id of ["watches", "clothing", "shoes", "accessories"]) {
    assert.ok(imagery.includes(`id: "${id}"`), `missing hero slide: ${id}`);
  }
  assert.match(imagery, /getCategoryNavImage/);
  assert.doesNotMatch(imagery, /photo-1542291026-7eec264c27ff/);
});

test("hero autoplay has reduced-motion and manual-control support", async () => {
  const hero = await readFile("src/components/commerce/HomeHero.tsx", "utf8");
  assert.match(hero, /useEmblaCarousel/);
  assert.match(hero, /prefers-reduced-motion/);
  assert.match(hero, /3000/);
  assert.match(hero, /aria-label/);
});

test("homepage category explorer uses live catalog services", async () => {
  const explorer = await readFile("src/components/commerce/HomepageCategoryExplorer.tsx", "utf8");
  assert.match(explorer, /getTopLevelCategories/);
  assert.match(explorer, /getProducts/);
  assert.match(explorer, /B2CProductCard/);
});

test("homepage category rail localizes known category slugs and keeps a safe API-name fallback", async () => {
  const hero = await read("src/components/commerce/HomeHero.tsx");
  const labels = await read("src/features/categories/data/category-labels.ar.ts");

  assert.match(hero, /CATEGORY_LABEL_AR\[category\.slug\]\s*\?\?\s*category\.name/);
  assert.match(labels, /clothing:\s*"الملابس"/);
  assert.match(labels, /shoes:\s*"الأحذية"/);
  assert.match(labels, /watches:\s*"الساعات"/);
  assert.match(labels, /accessories:\s*"الإكسسوارات"/);
});
