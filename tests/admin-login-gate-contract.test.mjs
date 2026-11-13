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


test("Tailwind container widths do not inherit the compact spacing scale", async () => {
  const css = await read("src/app/globals.css");

  const containerWidths = [
    ["3xs", "16rem"],
    ["2xs", "18rem"],
    ["xs", "20rem"],
    ["sm", "24rem"],
    ["md", "28rem"],
    ["lg", "32rem"],
    ["xl", "36rem"],
    ["2xl", "42rem"],
    ["3xl", "48rem"],
    ["4xl", "56rem"],
    ["5xl", "64rem"],
    ["6xl", "72rem"],
    ["7xl", "80rem"],
  ];

  for (const [size, width] of containerWidths) {
    assert.ok(
      css.includes(`--container-${size}: ${width};`),
      `missing Tailwind container width token: ${size}`,
    );
  }

  // max-width named utilities must explicitly use the independent container scale.
  for (const [size] of containerWidths) {
    assert.ok(
      css.includes(`.max-w-${size} { max-width: var(--container-${size}); }`),
      `max-w-${size} must resolve through the container scale`,
    );
  }

  // Spacing remains compact; the fix must not enlarge margins, padding, or gaps.
  assert.ok(css.includes("--spacing-lg: 2rem;"));
  assert.ok(css.includes("--spacing-xl: 3rem;"));
});


test("admin Turnstile diagnostics expose actionable Cloudflare error codes", async () => {
  const widget = await read("src/components/auth/CloudflareTurnstile.tsx");

  assert.ok(widget.includes('"error-callback"?: (errorCode: string) => boolean | void'));
  assert.ok(widget.includes('"error-callback": (rawCode) =>'));
  assert.ok(widget.includes('return false;'));
  assert.ok(widget.includes('code === "110200"'));
  assert.ok(widget.includes('code === "200500"'));
  assert.ok(widget.includes('code.startsWith("300") || code.startsWith("600")'));
  assert.ok(widget.includes("Turnstile error:"));
  assert.ok(widget.includes("challenges.cloudflare.com"));
});
