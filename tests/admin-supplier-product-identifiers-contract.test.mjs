import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const apiService = await readFile("src/features/admin/products/services/admin-product-api.service.ts", "utf8");
const catalogPage = await readFile("src/app/(admin)/admin/products/page.tsx", "utf8");
const detailPage = await readFile("src/app/(admin)/admin/products/[id]/page.tsx", "utf8");

test("admin product response models supplier identifier separately from store and supplier SKU", () => {
  assert.match(apiService, /supplierProductId\?: string \| null/);
  assert.match(apiService, /supplierSku\?: string \| null/);
  assert.match(apiService, /sku: string/);
});

test("admin catalog searches by and displays database and supplier product identifiers", () => {
  assert.match(catalogPage, /product\.supplierProductId/);
  assert.match(catalogPage, /معرّف المنتج لدى المورد/);
  assert.match(catalogPage, /رقم قاعدة البيانات/);
  assert.match(catalogPage, /SKU المورد/);
});

test("Arabic product detail separates store SKU, database ID, and supplier product ID", () => {
  assert.match(detailPage, /رمز المنتج في ALI STORE \(SKU\)/);
  assert.match(detailPage, /رقم المنتج في قاعدة البيانات/);
  assert.match(detailPage, /معرّف المنتج لدى المورد/);
  assert.match(detailPage, /تكلفة التوريد/);
});
