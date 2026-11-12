import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test(
  "admin login is dedicated and does not reuse the customer credential form",
  async () => {
    const route = await read("src/app/(admin)/admin/login/page.tsx");
    const adminForm = await read("src/components/auth/AdminLoginForm.tsx");
    const customerForm = await read("src/components/auth/LoginForm.tsx");

    assert.match(route, /AdminLoginForm/);
    assert.match(adminForm, /label="البريد الإلكتروني لحساب الإدارة"/);
    assert.match(adminForm, /label="كلمة المرور"/);
    assert.match(adminForm, /adminLogin\(/);
    assert.doesNotMatch(
      customerForm,
      /adminGatePassword|CloudflareTurnstile|adminGateEnabled/,
    );
  },
);

test(
  "admin form routes only to exact internal administrative path segments",
  async () => {
    const adminForm = await read("src/components/auth/AdminLoginForm.tsx");
    assert.match(adminForm, /adminGatePassword,/);
    assert.match(adminForm, /captchaToken,/);
    assert.match(adminForm, /purpose: "ADMIN_LOGIN"/);
    assert.match(adminForm, /path === "\/admin"/);
    assert.match(adminForm, /path\.startsWith\("\/admin\/"\)/);
    assert.match(adminForm, /path === "\/warehouse"/);
    assert.match(adminForm, /path\.startsWith\("\/warehouse\/"\)/);
    assert.match(adminForm, /value\.includes\("\\\\"\)/);
    assert.match(adminForm, /\/verify-email\?/);
  },
);

test(
  "admin OTP cannot redirect to customer or lookalike external paths",
  async () => {
    const otpForm = await read("src/components/auth/EmailOtpForm.tsx");
    assert.match(
      otpForm,
      /purpose === "ADMIN_LOGIN" && !isAdministrativePath\(value\)/,
    );
    assert.match(otpForm, /value\.startsWith\("\/\/"\)/);
    assert.match(otpForm, /value\.includes\("\\\\"\)/);
    assert.match(
      otpForm,
      /return purpose === "ADMIN_LOGIN" \? "\/admin" : "\/buyer\/profile"/,
    );
  },
);
