---
name: graphify
description: "Mandatory graph-first workflow for ALI STORE codebase analysis, architecture tracing, impact analysis, and post-change graph refresh."
---

# Graphify — ALI STORE project skill

For any non-trivial codebase question or code change in this project, use Graphify before reading/editing source files.

## Required sequence

1. Ensure the CLI exists:
   `uv tool install --upgrade "graphifyy==0.9.72"`
2. Build the graph when missing:
   `graphify extract . --code-only`
3. Navigate the architecture with:
   `graphify query "<question>"`
   `graphify path "<A>" "<B>"`
   `graphify explain "<symbol>"`
4. Inspect only the source files justified by the graph result.
5. Implement the smallest safe change.
6. Refresh after changes:
   `graphify update .`
7. Run compiler/tests/security checks separately. Graphify never replaces them.

When work spans frontend and backend, build/query graphs for both repositories before modifying either repository.

Do not alter ALI STORE business logic as part of Graphify integration.
