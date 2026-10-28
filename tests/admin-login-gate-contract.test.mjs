import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin login submits second password and a server-verified Turnstile token", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const widget = await read("src/components/auth/CloudflareTurnstile.tsx");
  const service = await read("src/features/auth/session.ts");

  assert.match(login, /adminGatePassword/);
  assert.match(login, /captchaToken/);
  assert.match(login, /CloudflareTurnstile/);
  assert.match(login, /adminGateEnabled/);
  assert.match(widget, /action:\s*"admin_login"/);
  assert.match(widget, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.match(service, /adminGatePassword\?: string/);
  assert.match(service, /captchaToken\?: string/);
});

test("admin login gate is opt-in for the UI and does not force CAPTCHA on customers", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");

  assert.match(login, /checked={adminGateEnabled}/);
  assert.match(login, /adminGateEnabled \? \{ adminGatePassword, captchaToken \} : \{\}/);
  assert.match(login, /result\.role === "ROLE_ADMIN"/);
});
