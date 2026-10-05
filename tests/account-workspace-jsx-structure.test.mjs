import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  "src/components/commerce/account/AccountWorkspace.tsx",
  "utf8",
);

const mobileNav = source.match(
  /<nav\s+aria-label="أقسام الحساب"[\s\S]*?<\/nav>/,
);

assert.ok(mobileNav, "account workspace should contain a closed mobile account navigation");
assert.match(
  mobileNav[0],
  /ACCOUNT_NAV_GROUPS\.flatMap\(\(group\) => group\.items\)\.map/,
  "mobile account navigation should render its navigation items",
);

assert.match(
  source,
  /<\/nav>\s*<\/div>\s*<\/section>\s*<div className="bg-background">/,
  "account header section must close before the account content wrapper",
);

const opened = (source.match(/<section(?:\s|>)/g) ?? []).length;
const closed = (source.match(/<\/section>/g) ?? []).length;
assert.equal(opened, closed, "account workspace section tags must remain balanced");

console.log("account workspace JSX structure checks passed");
