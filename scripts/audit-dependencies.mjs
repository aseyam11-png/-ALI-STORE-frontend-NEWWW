import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ADVISORY = "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";
const ADVISORY_TITLE =
  "picomatch vulnerable to ReDoS through single-branch repeated extglobs";
const ADVISORY_RANGE = "<=4.0.7";

const lockfile = JSON.parse(readFileSync("package-lock.json", "utf8"));
const lockPackages = lockfile.packages ?? {};

function entriesForPackage(name) {
  const suffix = `/node_modules/${name}`;
  return Object.entries(lockPackages).filter(
    ([path]) => path === `node_modules/${name}` || path.endsWith(suffix),
  );
}

function isDevOnlyPackage(name) {
  const entries = entriesForPackage(name);
  return entries.length > 0 && entries.every(([, entry]) => entry.dev === true);
}

function isAffectedPicomatchVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version ?? "");
  if (!match) return false;
  const [, major, minor, patch] = match.map(Number);
  return (
    major < 4 || (major === 4 && (minor < 0 || (minor === 0 && patch <= 7)))
  );
}

function runAudit(args) {
  const cacheDirectory = mkdtempSync(join(tmpdir(), "ali-store-npm-audit-"));
  try {
    const result = spawnSync(
      "npm",
      ["audit", ...args, "--cache", cacheDirectory, "--json"],
      {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
        shell: process.platform === "win32",
      },
    );

    if (result.error) {
      throw new Error(`Unable to execute npm audit: ${result.error.message}`);
    }

    let report;
    try {
      report = JSON.parse(result.stdout);
    } catch {
      throw new Error(
        `npm audit did not return valid JSON. Exit: ${result.status}. ${result.stderr}`,
      );
    }

    return { report, status: result.status, stderr: result.stderr };
  } finally {
    rmSync(cacheDirectory, { recursive: true, force: true });
  }
}

function isKnow...[truncated]