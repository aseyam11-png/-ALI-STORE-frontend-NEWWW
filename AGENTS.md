# ALI STORE agent workflow

## Mandatory Graphify gate

Graphify is the architecture map for this repository. Before any non-trivial analysis, diagnosis, refactor, bug fix, or feature change:

1. Ensure Graphify is installed from the official package:
   `uv tool install --upgrade "graphifyy==0.9.79"`
2. If `graphify-out/graph.json` does not exist, build the code graph:
   `graphify extract . --code-only`
3. Use Graphify to locate the relevant subsystem before opening/editing source files:
   `graphify query "<question about the change or failure>"`
   `graphify path "<concept A>" "<concept B>"`
   `graphify explain "<symbol or module>"`
4. Only then inspect source files and implement the smallest justified change.
5. After code changes, refresh the graph:
   `graphify update .`
   If TypeScript path/module-resolution configuration changed, perform a clean rebuild with `graphify extract . --code-only --force`.
6. Re-run the relevant tests and use the refreshed graph to verify the changed dependency surface.

## ALI STORE constraints

- Do not change store business logic merely to integrate Graphify.
- Prefer existing architecture and contracts; do not create duplicate feature systems.
- Treat Graphify as architecture evidence, not as a substitute for compiler, tests, security scanning, or runtime validation.
- Keep `graphify-out/` local/CI-only; do not commit generated graph artifacts unless explicitly requested.

## Cross-repository work

For changes spanning frontend and backend, analyze both repositories with Graphify before editing either side, then verify the integration contract after both changes are complete.
