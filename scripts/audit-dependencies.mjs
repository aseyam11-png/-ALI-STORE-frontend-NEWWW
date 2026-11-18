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
  const [major, minor, patch] = match.slice(1).map(Number);
  return major < 4 || (major === 4 && minor === 0 && patch <= 7);
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

function isKnownPicomatchChain(name, vulnerabilities, visiting = new Set()) {
  if (visiting.has(name) || !isDevOnlyPackage(name)) return false;

  const finding = vulnerabilities[name];
  if (!finding || !["high", "critical"].includes(finding.severity)) {
    return false;
  }

  if (name === "picomatch") {
    const versions = entriesForPackage("picomatch").map(
      ([, entry]) => entry.version,
    );
    return (
      versions.length > 0 &&
      versions.every(isAffectedPicomatchVersion) &&
      finding.via.length === 1 &&
      typeof finding.via[0] === "object" &&
      finding.via[0].url === ADVISORY &&
      finding.via[0].title === ADVISORY_TITLE &&
      finding.via[0].range === ADVISORY_RANGE
    );
  }

  if (finding.via.length === 0) return false;

  const next = new Set(visiting);
  next.add(name);
  return finding.via.every(
    (item) =>
      typeof item === "string" &&
      isKnownPicomatchChain(item, vulnerabilities, next),
  );
}

function fail(message, details = "") {
  console.error(`[dependency-audit] FAIL: ${message}`);
  if (details) console.error(details);
  process.exit(1);
}

const affectedPicomatch = entriesForPackage("picomatch").filter(([, entry]) =>
  isAffectedPicomatchVersion(entry.version),
);

if (affectedPicomatch.some(([, entry]) => entry.dev !== true)) {
  fail(
    "An affected picomatch version is not marked dev-only in package-lock.json.",
    JSON.stringify(
      affectedPicomatch.map(([path, entry]) => ({
        path,
        version: entry.version,
        dev: entry.dev,
      })),
      null,
      2,
    ),
  );
}

const production = runAudit(["--omit=dev", "--audit-level=high"]);
const productionCounts = production.report.metadata?.vulnerabilities;
if (!productionCounts || production.status !== 0) {
  fail(
    "Production dependency audit failed or returned an incomplete report.",
    JSON.stringify(productionCounts ?? production.stderr),
  );
}
if (productionCounts.high > 0 || productionCounts.critical > 0) {
  fail(
    "Production dependencies contain high/critical vulnerabilities.",
    JSON.stringify(productionCounts),
  );
}
console.log(
  "[dependency-audit] PASS: production dependencies have zero high/critical findings.",
);

const full = runAudit([]);
const vulnerabilities = full.report.vulnerabilities;
if (!full.report.metadata?.vulnerabilities || !vulnerabilities) {
  fail("Full dependency audit returned an incomplete report.", full.stderr);
}

const severe = Object.entries(vulnerabilities).filter(([, finding]) =>
  ["high", "critical"].includes(finding.severity),
);

const unexpected = severe
  .filter(([name]) => !isKnownPicomatchChain(name, vulnerabilities))
  .map(([name, finding]) => ({
    name,
    severity: finding.severity,
    direct: finding.isDirect,
    via: finding.via,
  }));

if (unexpected.length > 0) {
  fail(
    "High/critical findings exist outside the single reviewed dev-only picomatch advisory chain.",
    JSON.stringify(unexpected, null, 2),
  );
}

if (severe.length > 0) {
  console.warn(`[dependency-audit] REVIEWED DEV-ONLY EXCEPTION: ${ADVISORY}.`);
  console.warn(
    `[dependency-audit] ${severe.length} high/critical audit entries are transitive effects of this one advisory.`,
  );
} else if (affectedPicomatch.length > 0) {
  console.warn(
    `[dependency-audit] npm audit returned no high/critical entries, but package-lock.json still contains affected dev-only picomatch versions covered by ${ADVISORY}.`,
  );
}

if (affectedPicomatch.length > 0) {
  console.warn(
    "[dependency-audit] The upstream advisory has no patched npm release. Separate OSV/Trivy scans remain enabled.",
  );
} else if (severe.length === 0) {
  console.log(
    "[dependency-audit] PASS: full dependency tree has zero high/critical findings.",
  );
}
