import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test(
  "TypeScript ESTree receives the patched minimatch 11 dependency",
  async () => {
    const packageJson = await readJson("package.json");
    const packageLock = await readJson("package-lock.json");

    assert.equal(
      packageJson.overrides?.["@typescript-eslint/typescript-estree"]?.minimatch,
      "^11.0.1",
    );

    const packages = packageLock.packages ?? {};
    const estree =
      packages["node_modules/@typescript-eslint/typescript-estree"];
    const nestedMinimatch =
      packages[
        "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch"
      ];

    assert.ok(
      estree,
      "@typescript-eslint/typescript-estree must exist in the lockfile",
    );
    assert.ok(
      nestedMinimatch,
      "the patched minimatch must be nested under TypeScript ESTree",
    );
    assert.match(nestedMinimatch.version, /^11\./);
    assert.equal(
      nestedMinimatch.dependencies?.["@isaacs/nonrecursive-glob-match"],
      "^1.1.0",
    );
    assert.equal(
      packages["node_modules/@isaacs/nonrecursive-glob-match"]?.version,
      "1.1.0",
    );
  },
);

test(
  "the unrelated legacy minimatch 3 dependency is not globally replaced",
  async () => {
    const packageLock = await readJson("package-lock.json");
    const legacyMinimatch = packageLock.packages?.["node_modules/minimatch"];

    assert.equal(legacyMinimatch?.version, "3.1.5");
  },
);
