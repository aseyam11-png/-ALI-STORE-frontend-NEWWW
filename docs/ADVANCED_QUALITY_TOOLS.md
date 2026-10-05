# ALI STORE — Advanced Quality Tooling

This is the second layer above the existing frontend quality gates.

## Added tooling

51. **Playwright** — cross-browser E2E for Chromium, Firefox, WebKit and mobile emulation. The repository contains a typed config and storefront smoke tests.

52. **React Testing Library** — component tests based on user-visible behavior.

53. **Vitest** — unit/integration test runner using a jsdom environment for frontend tests.

54. **MSW** — deterministic API mocking for tests and failure scenarios.

55. **axe-core** — accessibility assertions inside the Vitest harness plus the existing axe CLI scan.

56. **Pa11y CI** — page-level accessibility crawl inside CI.

57. **Lighthouse CI** — regression-oriented Lighthouse execution with assertions and repeated runs.

58. **Next.js Bundle Analyzer** — reserved as the bundle-analysis layer; activate after establishing the first bundle baseline.

59. **CodeQL** — JavaScript/TypeScript security analysis. The workflow is intentionally opt-in for the current private repository because GitHub Code Security availability depends on repository/plan capabilities.

60. **Socket** — supply-chain risk analysis; use as an external/CI check once the repository is enrolled.

61. **Secretlint** — repository secret-pattern linting in CI.

62. **Renovate** — automated npm dependency update policy via renovate.json. On GitHub Cloud, the recommended hosted setup is the Mend Renovate app.

63. **cspell** — spelling and terminology validation for source/docs, with an ALI STORE vocabulary dictionary.

64. **Pact** — reserved for true consumer-driven API contracts between this frontend and the Spring backend. Do not use it as an E2E replacement.

65. **Sentry** — production error/performance monitoring; activation requires the Sentry Next.js SDK and project DSN.

66. **OpenTelemetry** — future distributed tracing layer. Browser instrumentation should remain non-critical until the frontend/backend trace design is finalized.

67. **Chromatic** — Storybook visual/interaction/accessibility testing. The CI job activates only after Storybook exists and CHROMATIC_PROJECT_TOKEN is configured.

68. **BackstopJS** — visual regression for page-level snapshots. A checked-in reference baseline is required before this can be treated as a real regression gate.

## Architecture decision

We do not run every tool on every pull request.

- Fast PR gate: ESLint, TypeScript, contract tests, Vitest, Dependency Cruiser, secret scanning, dependency audit.
- Browser gate: Playwright smoke/cross-browser and accessibility.
- Performance regression: Lighthouse CI.
- Full visual regression: Chromatic/Backstop after baselines exist.
- Active security: ZAP/Nmap/sqlmap only against explicitly authorized staging/local targets.
- Production observability: Sentry.
- Distributed tracing: OpenTelemetry after backend/frontend trace context is designed.
- API compatibility: Pact after the real frontend API client surface is finalized.

This avoids false confidence from running many overlapping tools without useful baselines.
