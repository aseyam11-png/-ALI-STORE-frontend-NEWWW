import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile("src/app/(admin)/layout.tsx", "utf8");
const guard = await readFile(
  "src/components/admin/AdminRouteGuard.tsx",
  "utf8",
);

test("admin route group stays guarded while the dedicated admin login route is public", () => {
  assert.ok(layout.includes("AdminRouteGuard"));
  assert.ok(
    layout.includes("return <AdminRouteGuard>{children}</AdminRouteGuard>"),
  );
  assert.ok(guard.includes('pathname === "/admin/login"'));
  assert.ok(guard.includes("if (isAdminLoginPage) return children"));
});

test("anonymous users entering admin routes are redirected to the admin login page", () => {
  assert.ok(guard.includes('session.status === "unauthenticated"'));
  assert.ok(guard.includes("router.replace("));
  assert.ok(
    guard.includes(
      '("/admin/login?next=" + encodeURIComponent(returnPath)) as Route',
    ),
  );
  assert.ok(guard.includes('role === "ADMIN"'));
  assert.ok(guard.includes("403 · Forbidden"));
  assert.ok(guard.includes("return children"));
});
