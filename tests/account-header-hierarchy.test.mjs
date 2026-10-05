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

assert.match(shell, /<h1[^>]*>[\s\S]*\{title\}[\s\S]*<\/h1>/, "account shell should have one semantic page title");
assert.match(shell, /الحساب/, "account shell should use a concise section eyebrow");
assert.doesNotMatch(shell, /مساحة حسابك/, "account shell should not use the redundant account-space label");
assert.match(shell, /text-h1/, "account shell should preserve the design-system H1 scale");
assert.match(shell, /text-body leading-7/, "account shell description should use comfortable Arabic reading rhythm");
assert.match(shell, /متابعة التسوق/, "account shell should preserve the shopping return action");
assert.match(buyer, /title="حسابي"/, "buyer should keep the clear page title");
assert.match(buyer, /description="تابع طلباتك وأدر بياناتك من مكان واحد\."/,
  "buyer overview should use concise, non-redundant copy",
);

console.log("account-header hierarchy checks passed");
