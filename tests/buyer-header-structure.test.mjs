import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile(
  "src/components/commerce/account/AccountWorkspace.tsx",
  "utf8",
);
const buyer = await readFile(
  "src/app/(buyer)/buyer/page.tsx",
  "utf8",
);
const header = await readFile(
  "src/components/layout/Header.tsx",
  "utf8",
);

assert.doesNotMatch(shell, /مساحة حسابك/, "shared account header must not use the redundant account-space label");
assert.doesNotMatch(buyer, /مساحة العميل/, "buyer welcome hero must not duplicate the account header");
assert.match(shell, /<h1[^>]*>[\\s\\S]*\\{title\\}[\\s\\S]*<\\/h1>/, "account pages need one clear semantic H1");
assert.match(shell, /text-h1/, "account H1 must use the shared typography scale");
assert.match(shell, /text-body-sm leading-6/, "account description must keep a compact Arabic rhythm");
assert.match(shell, /متابعة التسوق/, "account header must preserve the return-to-store action");
assert.match(shell, /aria-label="أقسام الحساب"/, "account navigation must remain accessible");
assert.match(buyer, /مرحبًا بعودتك/, "buyer dashboard should use a welcome state rather than a second page heading");
assert.match(buyer, /طلباتي/, "authenticated buyer hero should provide a direct order action");
assert.match(header, /مركز الحساب/, "global header account label must describe the account area");
assert.doesNotMatch(header, /<span className="block text-body-sm font-medium">\\s*الملف الشخصي\\s*<\\/span>/, "global header must not mislabel every buyer route as profile");

console.log("buyer header structure checks passed");
