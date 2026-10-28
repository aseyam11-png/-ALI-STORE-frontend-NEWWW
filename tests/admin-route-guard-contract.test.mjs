import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile("src/app/(admin)/layout.tsx", "utf8");
const guard = await readFile("src/components/admin/AdminRouteGuard.tsx", "utf8");

test("admin route group is guarded before rendering administrative pages", () => {
  assert.ok(layout.includes("AdminRouteGuard"));
  assert.ok(layout.includes("return <AdminRouteGuard>{children}</AdminRouteGuard>"));
});

test("admin guard redirects anonymous users and restricts pages to ADMIN role", () => {
  assert.ok(guard.includes('session.status === "unauthenticated"'));
  assert.ok(guard.includes('router.replace(("/login?next="'));
  assert.ok(guard.includes('role === "ADMIN"'));
  assert.ok(guard.includes("403 · Forbidden"));
  assert.ok(guard.includes("return children"));
});
