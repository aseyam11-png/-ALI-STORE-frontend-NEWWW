import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test(
  "AI engineering workflow is manual and separates generation from validation",
  async () => {
    const workflow = await read(".github/workflows/ai-engineer.yml");

    assert.match(workflow, /workflow_dispatch:/);
    assert.match(
      workflow,
      /if: \$\{\{ github\.ref == 'refs\/heads\/main' \}\}/,
    );
    assert.match(workflow, /ref: main/);
    assert.match(workflow, /persist-credentials: false/);
    assert.match(workflow, /secrets\.GEMINI_API_KEY/);
    assert.match(workflow, /quality-gates\.yml/);
    assert.match(workflow, /--auto --squash/);
    assert.match(workflow, /high_risk/);
    assert.match(workflow, /Leave an unverified PR in Draft/);
  },
);

test(
  "patch generator blocks unsafe paths and incomplete existing-file edits",
  async () => {
    const source = await read(".github/scripts/ai_engineer.py");

    assert.match(source, /ROOTS = \(/);
    assert.match(source, /BLOCKED = \{/);
    assert.match(source, /Absolute paths and path traversal are forbidden/);
    assert.match(source, /Existing file was not provided in full context/);
    assert.match(source, /Protected file cannot be edited/);
    assert.match(source, /The proposed edits produced no worktree changes/);
    assert.match(source, /flags=re\.UNICODE/);
    assert.doesNotMatch(source, /shell=True/);
  },
);

test(
  "optional security scans avoid secrets in if conditions",
  async () => {
    const workflow = await read(".github/workflows/quality-gates.yml");

    assert.match(workflow, /SNYK_ENABLED: \$\{\{ secrets\.SNYK_TOKEN != '' \}\}/);
    assert.match(workflow, /FOSSA_ENABLED: \$\{\{ secrets\.FOSSA_API_KEY != '' \}\}/);
    assert.match(workflow, /if: \$\{\{ env\.SNYK_ENABLED == 'true' \}\}/);
    assert.match(workflow, /if: \$\{\{ env\.FOSSA_ENABLED == 'true' \}\}/);
    assert.doesNotMatch(workflow, /if:\s*\$\{\{\s*secrets\./);
  },
);

test(
  "backend verification runs only when a Maven module exists",
  async () => {
    const workflow = await read(".github/workflows/quality-gates.yml");

    assert.match(workflow, /Optional Spring Boot backend verification/);
    assert.match(workflow, /if \[ -f backend\/pom\.xml \]/);
    assert.match(workflow, /mvnw -B -f backend\/pom\.xml verify/);
    assert.match(workflow, /backend verification is explicitly skipped/);
  },
);
