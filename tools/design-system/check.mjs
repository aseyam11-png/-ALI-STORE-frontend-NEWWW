import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens", "ali-store.tokens.json"), "utf8"));
const groups = ["color", "radius", "spacing", "typography", "motion"];
const missing = groups.filter((group) => !tokens[group]);
if (missing.length) {
  console.error(`[design-system] Missing token groups: ${missing.join(", ")}`);
  process.exit(1);
}

const uiDir = path.join(root, "src", "components", "ui");
const uiFiles = fs.readdirSync(uiDir).filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"));
const storyFiles = fs.readdirSync(uiDir).filter((file) => file.endsWith(".stories.tsx"));
if (!storyFiles.length) {
  console.error("[design-system] No component stories were found.");
  process.exit(1);
}

const hardcodedHexFiles = [];
for (const file of uiFiles) {
  const content = fs.readFileSync(path.join(uiDir, file), "utf8");
  if (/(^|[^\\w])#[0-9a-fA-F]{6}\\b/.test(content)) hardcodedHexFiles.push(file);
}
if (hardcodedHexFiles.length) {
  console.error("[design-system] Hardcoded hex colors found in UI primitives:");
  hardcodedHexFiles.forEach((file) => console.error(`  - ${file}`));
  process.exit(1);
}
console.log(`[design-system] OK — ${uiFiles.length} UI source files, ${storyFiles.length} stories, ${groups.length} governed token groups.`);
