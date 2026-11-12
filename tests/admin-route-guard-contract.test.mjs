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
  assert.match(
    guard,
    /router\\.replace\\(\\s*\\(\\s*"\\/admin\\/login\\?next="\\s*\\+\\s*encodeURIComponent\\(returnPath\\)\\s*\\)\\s+as Route\\s*,?\\s*\\)/,
  );
  assert.ok(guard.includes('role === "ADMIN"'));
  assert.ok(guard.includes("403 · Forbidden"));
  assert.ok(guard.includes("return children"));
});
