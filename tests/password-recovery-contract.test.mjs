import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("password recovery client uses the backend challenge handle and OTP contract", async () => {
  const session = await read("src/features/auth/session.ts");
  const form = await read("src/components/auth/ForgotPasswordForm.tsx");
  const page = await read("src/app/forgot-password/page.tsx");

  assert.match(session, /\/api\/v1\/auth\/password\/forgot/);
  assert.match(session, /\/api\/v1\/auth\/password\/reset/);
  assert.match(session, /challengeId:\s*string/);
  assert.match(form, /challenge\.challengeId/);
  assert.match(form, /code\.trim\(\)/);
  assert.match(form, /window\.location\.assign\(\"\/login\?passwordReset=1\"\)/);
  assert.match(form, /إذا كان البريد مرتبطًا بحساب/);
  assert.match(page, /<ForgotPasswordForm \/>/);
});

test("security area uses authenticated password change and forces a new sign-in", async () => {
  const session = await read("src/features/auth/session.ts");
  const form = await read("src/components/auth/ChangePasswordForm.tsx");
  const page = await read("src/app/(buyer)/buyer/security/page.tsx");

  assert.match(session, /\/api\/v1\/auth\/password\/change/);
  assert.match(session, /alistore:logout/);
  assert.match(form, /changePassword\(\{ currentPassword, newPassword \}\)/);
  assert.match(form, /newPassword !== confirmPassword/);
  assert.match(page, /<ChangePasswordForm \/>/);
});

test("login page exposes password recovery and feedback after password change/reset", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");

  assert.match(login, /href=\"\/forgot-password\"/);
  assert.match(login, /passwordReset/);
  assert.match(login, /passwordChanged/);
});
