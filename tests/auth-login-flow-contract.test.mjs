import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("customer login remains separate from the administrator login screen", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const session = await read("src/features/auth/session.ts");
  const admin = await read("src/components/auth/AdminLoginForm.tsx");

  assert.match(login, /login\(\{ email: normalizedEmail, password \}\)/);
  assert.doesNotMatch(login, /adminGatePassword|CloudflareTurnstile|adminGateEnabled/);
  assert.match(session, /"\/api\/v1\/auth\/login"/);
  assert.match(admin, /adminLogin\(/);
  assert.match(session, /"\/api\/v1\/auth\/admin\/login"/);
});

test("administrator login continues to a dedicated six-digit OTP challenge", async () => {
  const admin = await read("src/components/auth/AdminLoginForm.tsx");
  const otp = await read("src/components/auth/EmailOtpForm.tsx");
  const session = await read("src/features/auth/session.ts");

  assert.match(admin, /purpose: "ADMIN_LOGIN"/);
  assert.match(admin, /\/verify-email\?/);
  assert.match(otp, /purpose === "ADMIN_LOGIN"/);
  assert.match(otp, /verifyAdminLoginCode/);
  assert.match(otp, /resendAdminLoginCode/);
  assert.match(session, /"\/api\/v1\/auth\/admin\/email\/verify"/);
  assert.match(session, /"\/api\/v1\/auth\/admin\/email\/resend"/);
});

test("OTP verification preserves a safe internal next destination", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const otp = await read("src/components/auth/EmailOtpForm.tsx");

  assert.match(login, /resolveSafeNextPath/);
  assert.match(login, /searchParams\.get\("next"\)/);
  assert.match(otp, /resolveSafeNextPath/);
  assert.match(otp, /router\.replace\(nextPath\)/);
  assert.match(otp, /value\.startsWith\("\/\/"\)/);
});
