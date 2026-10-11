# AI Engineering Agent

## Status and scope

The AI Engineering Agent is an opt-in, manually started workflow. It proposes source, test, and documentation changes on a dedicated branch, opens a Draft Pull Request, and runs the repository quality-gates workflow against the exact generated commit. It does not write directly to main.

The agent builds a tracked-file inventory and uses the mandatory Graphify query plus selected complete file contents to assemble task-specific context. This is not a promise that all repository source can fit into a model context. Oversized files are not offered for replacement; the agent should stop when it cannot make a justified change from complete context.

## One-time setup

1. Add GEMINI_API_KEY under GitHub repository Settings, Secrets and variables, Actions, Secrets. Never put the key in source files or a workflow variable.
2. Optionally set the repository Actions variable GEMINI_MODEL. The workflow defaults to gemini-3.8-flash.
3. Confirm the workflow permission policy allows the workflow token to create branches and pull requests.
4. Enable GitHub Actions auto-merge in repository settings if automatic merge requests are desired. Configure branch protection and required checks for main. If GitHub refuses the auto-merge request, the workflow does not force a merge.
5. Confirm Actions runners can actually start. A workflow cannot repair a repository-level runner/billing/usage restriction from within the job.

## Starting a task

From GitHub, open Actions, select ALI STORE AI Engineering Agent, choose Run workflow on main, and enter one concrete task. Include observed behavior, expected behavior, and acceptance criteria. Example: "Fix the product-list empty state when the API returns an empty page. Add regression coverage. Do not alter pricing, stock, or API contracts."

The workflow checks out the trusted main branch, builds or queries the Graphify architecture map, and invokes the trusted script. The generated patch is constrained to source, test, and documentation paths. It does not change GitHub workflow files, environment/secret files, package manifests, lockfiles, deployment configuration, or Maven build files. Such changes require a separately reviewed change.

## Validation and merge behavior

1. The generator job has the Gemini secret, but does not execute generated source or test code.
2. The generated changes are committed to an isolated AI branch and a Draft PR is opened.
3. A separate job dispatches quality-gates.yml against that branch and waits for the run.
4. On a failed, missing, cancelled, or unobservable quality-gates run, the PR remains Draft and no auto-merge is requested.
5. On a successful run, the workflow re-checks that the PR head SHA still equals the validated SHA.
6. The workflow requests auto-merge only for changes not classified as high risk by the path-based safety gate. Authentication, API, security, payment, checkout, pricing, inventory, order, supplier, shipping, database, migration, middleware, and admin paths stay Draft for human review. The classifier is intentionally conservative but is not a complete semantic security analysis.

The quality-gates workflow includes the frontend lint, typecheck, contract tests, production build, dependency/security scans, browser quality, link checks, and an optional Maven verification step when backend/pom.xml exists. A skipped optional check is not evidence that the missing capability was tested.

## Security boundaries and limitations

- Repository code and generated model output are treated as untrusted input.
- Generated code is not run in the job holding GEMINI_API_KEY.
- The patch generator does not execute commands taken from the task or repository.
- The separate validation workflow executes repository code without the Gemini key.
- High-risk changes require human review.
- A green report only proves the configured checks passed on the recorded SHA. It does not prove that every bug is absent or that live payment, supplier, inventory, or shipping integrations are production-ready.
- Auto-merge needs repository settings and branch policies to permit it. This workflow never bypasses required reviews or checks and never force-merges.

## Troubleshooting

- Missing GEMINI_API_KEY: add the secret and rerun.
- Graphify fails: resolve the architecture-indexing failure first; the generator intentionally stops.
- No safe patch returned: refine the task and include acceptance criteria. The agent must not invent missing contracts.
- Quality gates fail before any steps run: inspect the Actions workflow annotations and repository runner availability. Do not treat this as a code-test failure or a pass.
- Auto-merge request rejected: enable auto-merge and configure protected-branch rules in GitHub settings, then review the PR state.
