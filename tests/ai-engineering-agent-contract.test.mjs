import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test(
  "AI engineering workflow is manual, starts from trusted main, and separates validation",
  async () => {
    const workflow = await read(".github/workflows/ai-engineer.yml");

    assert.match(workflow, /workflow_dispatch:/);
    assert.match(
      workflow,
      /if: \$\{\{ github\.ref == 'refs\/heads\/main' \}\}/,
    );
    assert.match(workflow, /ref: main/);
    assert.match(workflow, /persist-credentials: false/);
    assert.match(workflow, /GEMINI_API_KEY: \$\{\{ secrets\.GEMINI_API_KEY \}\}/);
    assert.match(workflow, /quality-gates\.yml/);
    assert.match(workflow, /--auto --squash/);
    assert.match(workflow, /high_risk/);
    assert.match(workflow, /Leave an unverified PR in Draft/);
  },
);

test(
  "patch generator constrains paths and refuses incomplete existing-file context",
  async () => {
    const source = await read(".github/scripts/ai_engineer.py");

    assert.match(source, /ROOTS = \(/);
    assert.match(source, /BLOCKED = \{/);
    assert.match(source, /Absolute paths and path traversal are forbidden/);
    assert.match(source, /Existing file was not provided in full context/);
    assert.match(source, /Protected file cannot be edited/);
    assert.match(source, /The proposed edits did not change the worktree/);
    assert.doesNotMatch(source, /shell=True/);
  },
);

test(
  "optional security scans use environment context rather than direct secret references in if",
  async () => {
    const workflow = await read(".github/workflows/quality-gates.yml");

    assert.match(workflow, /if: \$\{\{ env\.SNYK_TOKEN != '' \}\}/);
    assert.match(workflow, /if: \$\{\{ env\.FOSSA_API_KEY != '' \}\}/);
    assert.doesNotMatch(workflow, /if:\s*\$\{\{\s*secrets\./);
  },
);

test(
  "backend verification runs when a backend Maven module exists and skips explicitly otherwise",
  async () => {
    const workflow = await read(".github/workflows/quality-gates.yml");

    assert.match(workflow, /Optional Spring Boot backend verification/);
    assert.match(workflow, /if \[ -f backend\/pom\.xml \]/);
    assert.match(workflow, /mvnw -B -f backend\/pom\.xml verify/);
    assert.match(workflow, /backend verification is explicitly skipped/);
  },
);
