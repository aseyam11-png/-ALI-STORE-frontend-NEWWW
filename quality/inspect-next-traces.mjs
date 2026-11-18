import fs from 'node:fs';
import path from 'node:path';

const nextRoot = path.resolve(process.argv[2] ?? '.next');
const scanRoots = [path.join(nextRoot, 'server')];
const rootServerTrace = path.join(nextRoot, 'next-server.js.nft.json');
const packages = ['@parcel/watcher', 'picomatch'];
const manifests = [];
const malformed = [];

function collectManifests(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectManifests(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.nft.json')) {
      manifests.push(fullPath);
    }
  }
}

for (const root of scanRoots) collectManifests(root);
if (fs.existsSync(rootServerTrace)) manifests.push(rootServerTrace);

function includesPackage(file, packageName) {
  const segments = file.replaceAll('\\', '/').split('/').filter(Boolean);
  const packageSegments = packageName.split('/');

  for (
    let index = 0;
    index <= segments.length - packageSegments.length - 1;
    index += 1
  ) {
    if (segments[index] !== 'node_modules') continue;
    if (
      packageSegments.every(
        (segment, offset) => segments[index + 1 + offset] === segment
      )
    ) {
      return true;
    }
  }

  return false;
}

function findPackageVersion(tracePath, tracedFile, packageName) {
  let candidate = path.resolve(path.dirname(tracePath), tracedFile);
  if (!fs.existsSync(candidate)) return 'unknown';

  try {
    if (!fs.statSync(candidate).isDirectory()) {
      candidate = path.dirname(candidate);
    }
  } catch {
    return 'unknown';
  }

  for (let depth = 0; depth < 16; depth += 1) {
    const packageJson = path.join(candidate, 'package.json');
    if (fs.existsSync(packageJson)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        if (metadata.name === packageName) return metadata.version ?? 'unknown';
      } catch {
        // A nested package.json may not describe the target package.
      }
    }

    const parent = path.dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }

  return 'unknown';
}

const findings = new Map(packages.map((name) => [name, new Map()]));

for (const manifestPath of manifests) {
  let trace;
  try {
    trace = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    malformed.push(
      `${path.relative(process.cwd(), manifestPath)}: ${error.message}`
    );
    continue;
  }

  for (const tracedFile of Array.isArray(trace.files) ? trace.files : []) {
    if (typeof tracedFile !== 'string') continue;

    for (const packageName of packages) {
      if (!includesPackage(tracedFile, packageName)) continue;
      const version = findPackageVersion(manifestPath, tracedFile, packageName);
      const key = [
        version,
        path.relative(process.cwd(), manifestPath),
        tracedFile,
      ].join('\\t');
      findings.get(packageName).set(key, {
        version,
        manifest: path.relative(process.cwd(), manifestPath),
        file: tracedFile,
      });
    }
  }
}

const lines = [
  '### Next.js server output tracing: dependency reachability',
  `Trace manifests inspected: ${manifests.length}`,
];

if (manifests.length === 0) {
  lines.push(
    'No Next.js `.nft.json` trace manifests were found under `.next/server` or at `.next/next-server.js.nft.json`.'
  );
}

for (const packageName of packages) {
  const matches = [...findings.get(packageName).values()];
  if (matches.length === 0) {
    lines.push(
      `- \`${packageName}\`: no references found in inspected server traces.`
    );
    continue;
  }

  const versions = [...new Set(matches.map((item) => item.version))].join(', ');
  lines.push(
    `- \`${packageName}\`: FOUND; traced version(s): ${versions}; matched entries: ${matches.length}.`
  );
  for (const match of matches.slice(0, 12)) {
    lines.push(`  - ${match.manifest} → ${match.file}`);
  }
  if (matches.length > 12) {
    lines.push(
      `  - … ${matches.length - 12} additional matching entries omitted.`
    );
  }
}

if (malformed.length > 0) {
  lines.push(`Malformed trace manifests: ${malformed.length}`);
  for (const item of malformed) lines.push(`- ${item}`);
}

const report = `${lines.join('\n')}\n`;
process.stdout.write(report);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${report}`);
}

if (malformed.length > 0) process.exitCode = 1;
