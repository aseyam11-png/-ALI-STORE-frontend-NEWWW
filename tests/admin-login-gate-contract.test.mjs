import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin login is dedicated and does not reuse the customer credential form", async () => {
  const route = await read("src/app/(admin)/admin/login/page.tsx");
  const adminForm = await read("src/components/auth/AdminLoginForm.tsx");
  const customerForm = await read("src/components/auth/LoginForm.tsx");

  assert.match(route, /AdminLoginForm/);
  assert.match(adminForm, /label="البريد الإلكتروني لحساب الإدارة"/);
  assert.match(adminForm, /label="كلمة المرور"/);
  assert.match(adminForm, /adminLogin\(/);
  assert.doesNotMatch(customerForm, /adminGatePassword|CloudflareTurnstile|adminGateEnabled/);
});

test("admin form routes only to an internal administrative destination after OTP", async () => {
  const adminForm = await read("src/components/auth/AdminLoginForm.tsx");
  assert.match(adminForm, /purpose: "ADMIN_LOGIN"/);
  assert.match(adminForm, /value\.startsWith\("\/warehouse"\)/);
  assert.match(adminForm, /\/verify-email\?/);
});
