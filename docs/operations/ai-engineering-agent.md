# AI Engineering Agent

## Status and scope

The AI Engineering Agent is an opt-in, manually started workflow. It proposes
source, test, and documentation changes on a dedicated branch, opens a Draft
Pull Request, and runs the repository quality-gates workflow against the
generated commit. It does not write directly to `main`.

The agent builds a tracked-file inventory and uses Graphify query output plus
selected complete file contents to assemble task-specific context. This does
not mean every source file is sent to the model simultaneously. Oversized files
are not offered for replacement; the agent should stop when it cannot justify
a change from the complete context it has.

## One-time setup

1. Add `GEMINI_API_KEY` under GitHub repository Settings, Secrets and
   variables, Actions, Secrets. Never put the key in source files or variables.
2. Optionally set the repository Actions variable `GEMINI_MODEL`. The
   workflow defaults to `gemini-3.8-flash`.
3. Confirm workflow permissions allow the workflow token to create branches
   and pull requests.
4. Enable GitHub Actions auto-merge in repository settings if automatic merge
   requests are desired. Configure branch protection and required checks for
   `main`. If GitHub refuses an auto-merge request, the workflow will not
   force a merge.
5. Confirm Actions runners can start. A workflow cannot repair a repository
   runner, billing, or usage restriction from within the job.

## Starting a task

Open Actions, select **ALI STORE AI Engineering Agent**, choose **Run workflow**
on `main`, and enter one concrete task. Include observed behavior, expected
behavior, and acceptance criteria.

Example: "Fix the product-list empty state when the API returns an empty page.
Add regression coverage. Do not alter pricing, stock, or API contracts."

The workflow checks out the trusted `main` branch, builds or queries the
Graphify architecture map, and invokes the trusted script. The generated patch
is constrained to source, test, and documentation paths. It cannot change
GitHub workflow files, environment or secret files, package manifests,
lockfiles, deployment configuration, or Maven build files. Those changes
require a separately reviewed infrastructure change.

## Validation and merge behavior

1. The generator job has the Gemini secret, but does not execute generated
   source or test code.
2. The generated changes are committed to an isolated AI branch and a Draft PR
   is opened.
3. A separate job dispatches `frontend.yml`, `quality-gates.yml`,
   `advanced-quality.yml`, and `security-static.yml` against that branch and
   waits for all four runs on the exact generated commit.
4. If the quality-gates run fails, is missing, is cancelled, or cannot be
   observed, the PR remains Draft and no auto-merge is requested.
5. After a successful run, the workflow checks that the PR head SHA still
   matches the validated commit.
6. The workflow requests auto-merge only when changed paths and task text are
   not classified as high risk. Authentication, API, security, payment,
   checkout, pricing, inventory, order, supplier, shipping, database,
   migration, middleware, and admin changes remain Draft for human review.
   This path-based classifier is conservative but is not a complete semantic
   security analysis.

The four dispatched workflows cover the frontend baseline, static quality,
contracts, production build, advanced unit/integration and Playwright checks,
accessibility, performance, SEO, and static/supply-chain security. The
quality-gates suite also runs an optional Maven verification step when
`backend/pom.xml` exists. A skipped optional check does not prove the missing
capability was tested. Active network penetration scans are intentionally not
automatic; run `security-active.yml` manually only against a target you own or
are explicitly authorized to test.

## Security boundaries and limitations

- Repository code and generated model output are untrusted input.
- Generated code is not run in the job holding `GEMINI_API_KEY`.
- The patch generator does not execute commands supplied by the task or repo.
- The separate validation workflow executes repository code without the
  Gemini key.
- High-risk changes require human review.
- A green report proves only that configured checks passed on the recorded
  SHA. It does not prove every bug is absent or that live payment, supplier,
  inventory, and shipping integrations are production-ready.
- Auto-merge depends on repository settings and branch policies. The workflow
  never bypasses required reviews or checks and never force-merges.

## Troubleshooting

- Missing `GEMINI_API_KEY`: add the secret and rerun.
- Graphify fails: resolve the architecture-indexing failure first; the
  generator intentionally stops.
- No safe patch is returned: refine the task and include acceptance criteria.
  The agent must not invent missing contracts.
- Quality gates fail before any steps run: inspect Actions annotations and
  runner availability. Do not treat this as either a code-test failure or a
  pass.
- Auto-merge is refused: enable auto-merge and configure protected-branch
  rules in GitHub settings, then review the PR state.
