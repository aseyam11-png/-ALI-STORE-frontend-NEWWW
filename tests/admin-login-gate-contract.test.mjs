import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin login submits the secondary password and an admin_login Turnstile token", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const widget = await read("src/components/auth/CloudflareTurnstile.tsx");
  const service = await read("src/features/auth/session.ts");

  assert.match(login, /adminGatePassword/);
  assert.match(login, /captchaToken/);
  assert.match(login, /CloudflareTurnstile/);
  assert.match(login, /adminGateEnabled/);
  assert.match(widget, /action: "admin_login"/);
  assert.match(widget, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.match(service, /export async function adminLogin\(credentials: \{/);
  assert.match(service, /adminGatePassword: string/);
  assert.match(service, /captchaToken: string/);
  assert.match(service, /"\/api\/v1\/auth\/admin\/login"/);
  const customerLogin = service.slice(
    service.indexOf("export async function login("),
    service.indexOf("export async function adminLogin("),
  );
  assert.doesNotMatch(customerLogin, /adminGatePassword|captchaToken/);
});

test("admin gate is opt-in in the UI and Google OAuth is disabled while selected", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");

  assert.match(login, /checked=\{adminGateEnabled\}/);
  assert.match(login, /const result = adminGateEnabled/);
  assert.match(login, /await adminLogin\(\{/);
  assert.match(login, /adminGatePassword,/);
  assert.match(login, /captchaToken,/);
  assert.match(login, /await login\(\{ email: normalizedEmail, password \}\)/);
  assert.match(login, /result\.role === "ROLE_ADMIN"/);
  assert.match(login, /disabled=\{submitting \|\| adminGateEnabled\}/);
});

test("administrator OTP verification and resend use ADMIN_LOGIN-purpose endpoints", async () => {
  const session = await read("src/features/auth/session.ts");
  const otp = await read("src/components/auth/EmailOtpForm.tsx");

  assert.match(session, /input\.purpose === "ADMIN_LOGIN"/);
  assert.match(session, /\/api\/v1\/auth\/admin\/email\/verify/);
  assert.match(session, /purpose === "ADMIN_LOGIN"/);
  assert.match(session, /\/api\/v1\/auth\/admin\/email\/resend/);
  assert.match(otp, /queryPurposeValue === "ADMIN_LOGIN"/);
  assert.match(otp, /verifyEmailCode\(\{ challengeId, code, purpose \}\)/);
  assert.match(otp, /resendEmailCode\(challengeId, purpose\)/);
});
