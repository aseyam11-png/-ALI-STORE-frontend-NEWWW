import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin order view uses admin-only customer and store product details", async () => {
  const api = await read("src/features/admin/orders/services/admin-order-api.service.ts");
  const page = await read("src/app/(admin)/admin/orders/page.tsx");

  assert.match(api, /customerName/);
  assert.match(api, /customerEmail/);
  assert.match(api, /customerPhone/);
  assert.match(api, /productId/);
  assert.match(api, /productSku/);
  assert.match(api, /\/api\/v1\/admin\/orders/);

  assert.match(page, /إدارة الطلبات/);
  assert.match(page, /طلب العميل|بيانات العميل/);
  assert.match(page, /رقم المنتج/);
  assert.match(page, /رمز المنتج/);
  assert.match(page, /statusLabels/);
  assert.match(page, /getWhatsAppUrl/);
  assert.match(page, /wa\.me/);
});

test("admin order UI only offers backend-supported next status transitions", async () => {
  const page = await read("src/app/(admin)/admin/orders/page.tsx");

  assert.match(page, /PENDING:\s*\["PROCESSING", "CANCELLED"\]/);
  assert.match(page, /PROCESSING:\s*\["SHIPPED", "CANCELLED"\]/);
  assert.match(page, /SHIPPED:\s*\["DELIVERED"\]/);
  assert.match(page, /DELIVERED:\s*\[\]/);
  assert.match(page, /CANCELLED:\s*\[\]/);
});
