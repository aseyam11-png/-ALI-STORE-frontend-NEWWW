import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin login is server-rendered without a blocking Suspense placeholder", async () => {
  const route = await read("src/app/(admin)/admin/login/page.tsx");
  const admin = await read("src/components/auth/AdminLoginForm.tsx");

  assert.ok(route.includes("searchParams: Promise"));
  assert.ok(route.includes("resolveSafeNextPath(requestedNextPath)"));
  assert.ok(route.includes("<AdminLoginForm nextPath={nextPath} />"));
  assert.doesNotMatch(route, /<Suspense|h-64 animate-pulse/);
  assert.ok(admin.includes("type AdminLoginFormProps"));
  assert.ok(admin.includes("nextPath: string"));
  assert.doesNotMatch(admin, /useSearchParams/);
});

test("admin login uses a dedicated credential form", async () => {
  const route = await read("src/app/(admin)/admin/login/page.tsx");
  const admin = await read("src/components/auth/AdminLoginForm.tsx");
  const customer = await read("src/components/auth/LoginForm.tsx");

  assert.ok(route.includes("AdminLoginForm"));
  assert.ok(admin.includes('label="البريد الإلكتروني لحساب الإدارة"'));
  assert.ok(admin.includes('label="كلمة المرور"'));
  assert.ok(admin.includes("adminLogin("));
  assert.ok(admin.includes("new TextEncoder().encode(adminGatePassword)"));
  assert.ok(admin.includes("encodedGatePassword.length"));
  assert.ok(admin.includes("adminGatePasswordBytes < 16"));
  assert.ok(admin.includes("adminGatePasswordBytes > 72"));
  assert.doesNotMatch(
    customer,
    /adminGatePassword|CloudflareTurnstile|adminGateEnabled/,
  );
});

test("admin login accepts only internal admin return paths", async () => {
  const route = await read("src/app/(admin)/admin/login/page.tsx");
  const admin = await read("src/components/auth/AdminLoginForm.tsx");

  assert.ok(admin.includes("adminGatePassword,"));
  assert.ok(admin.includes("captchaToken,"));
  assert.ok(admin.includes('purpose: "ADMIN_LOGIN"'));
  assert.ok(route.includes('path === "/admin"'));
  assert.ok(route.includes('path.startsWith("/admin/")'));
  assert.ok(route.includes('path === "/warehouse"'));
  assert.ok(route.includes('path.startsWith("/warehouse/")'));
  assert.ok(route.includes('value.includes("\\\\")'));
  assert.ok(admin.includes("/verify-email?"));
});

test("focused auth shell stays centered and responsive on narrow screens", async () => {
  const shell = await read("src/components/auth/AuthShell.tsx");

  assert.ok(shell.includes("mx-auto w-full max-w-xl"));
  assert.ok(shell.includes("w-full overflow-hidden"));
  assert.ok(shell.includes("p-4 shadow-floating sm:p-7 lg:p-8"));
  assert.ok(shell.includes("min-w-0 w-full"));
});

test("admin OTP rejects customer and external return paths", async () => {
  const otp = await read("src/components/auth/EmailOtpForm.tsx");

  assert.ok(otp.includes("!isAdministrativePath(value)"));
  assert.ok(otp.includes('value.startsWith("//")'));
  assert.ok(otp.includes('value.includes("\\\\")'));
  assert.ok(
    otp.includes(
      'return purpose === "ADMIN_LOGIN" ? "/admin" : "/buyer/profile"',
    ),
  );
});
