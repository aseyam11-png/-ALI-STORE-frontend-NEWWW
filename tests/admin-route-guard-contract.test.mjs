import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile("src/app/(admin)/layout.tsx", "utf8");
const guard = await readFile("src/components/admin/AdminRouteGuard.tsx", "utf8");

test("admin route group is guarded before rendering administrative pages", () => {
  assert.match(layout, /AdminRouteGuard/);
  assert.match(layout, /return <AdminRouteGuard>{children}<\\/AdminRouteGuard>/);
});

test("admin guard redirects anonymous users and restricts pages to ADMIN role", () => {
  assert.match(guard, /session\\.status === "unauthenticated"/);
  assert.match(guard, /router\\.replace\\("\\/login\\?next="/);
  assert.match(guard, /role === "ADMIN"/);
  assert.match(guard, /403 · Forbidden/);
  assert.match(guard, /return children/);
});
