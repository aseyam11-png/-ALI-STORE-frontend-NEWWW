import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const apiService = await readFile("src/features/admin/products/services/admin-product-api.service.ts", "utf8");
const catalogPage = await readFile("src/app/(admin)/admin/products/page.tsx", "utf8");
const detailPage = await readFile("src/app/(admin)/admin/products/[id]/page.tsx", "utf8");

test("admin product response models supplier identifier separately from SKU", () => {
  assert.match(apiService, /supplierProductId\?: string \| null/);
  assert.match(apiService, /supplierSku\?: string \| null/);
});

test("admin catalog searches by and displays supplier product identifiers", () => {
  assert.match(catalogPage, /product\.supplierProductId/);
  assert.match(catalogPage, /معرّف المنتج لدى المورد/);
  assert.match(catalogPage, /رقم قاعدة البيانات/);
});

test("product detail distinguishes store SKU, database ID, and supplier product ID", () => {
  assert.match(detailPage, /label="Store SKU"/);
  assert.match(detailPage, /label="Database product ID"/);
  assert.match(detailPage, /label="Supplier product ID"/);
});
