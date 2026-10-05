# ALI STORE Frontend — Quality Tooling

This repository uses a layered quality model.

- CI — automated on pull requests/pushes.
- Manual — desktop/browser workflow.
- External — SaaS/site audit requiring a deployed URL or account.
- Backend-only — useful for the ALI STORE backend/database, not the Next.js frontend.

The rule is: never install a tool only to make a checklist look complete. A tool runs only where its analysis is technically meaningful.

## UI/UX

1. axe DevTools — manual + CI engine — WCAG/accessibility.
2. Responsively App — manual — responsive layouts/viewports.
3. Colour Contrast Analyser — manual — contrast verification.
4. Percy — external/CI — visual regression snapshots.
5. Storybook — manual/CI — isolated component testing.
6. Open Color Tools — manual — color-blindness checks.
7. Font visualizer — manual — font loading/CLS inspection.
8. VisBug — manual — visual DOM/layout inspection.

## SEO & Metadata

9. Google Lighthouse SEO — CI — SEO audits on the built app.
10. Ahrefs Webmaster Tools — external — crawl/indexation/backlinks.
11. Screaming Frog — external — full-site crawl.
12. Structured Data Linter — external — JSON-LD/schema validation.
13. Hreflang Checker — external — locale alternates.
14. Robots.txt Checker — external — robots.txt validation.
15. XML Sitemap Validator — external — sitemap validation.

## Security — 20-tool control set

### Code security

16. CodeQL — SAST for JavaScript/TypeScript — `.github/workflows/codeql.yml`.
17. Semgrep — JavaScript/TypeScript SAST — `.github/workflows/security-static.yml`.
18. Bearer — SAST, secrets and data-flow security — `.github/workflows/security-static.yml`.

### Secrets

19. Gitleaks — repository secret detection — existing security workflow.
20. TruffleHog — verified/unverified credential discovery — `.github/workflows/security-static.yml`.
21. Secretlint — secret-pattern linting — `.github/workflows/security-static.yml`.

### Dependency and supply-chain security

22. Snyk — dependency/SCA scan — enabled when `SNYK_TOKEN` is configured.
23. OSV-Scanner — dependency vulnerability matching — `.github/workflows/security-static.yml`.
24. Socket Firewall — package-install supply-chain protection — `.github/workflows/security-static.yml`.
25. Retire.js — vulnerable JavaScript library detection — `.github/workflows/security-static.yml`.

### Vulnerability and SBOM

26. Trivy — filesystem/dependency/secret/misconfiguration scan — `.github/workflows/security-static.yml`.
27. Grype — vulnerability correlation against the generated SBOM — `.github/workflows/security-static.yml`.
28. Syft — CycloneDX SBOM generation — `.github/workflows/security-static.yml`.

### Active Web / network security

29. OWASP ZAP — authorized DAST baseline scan — `.github/workflows/security-active.yml`.
30. Nuclei — authorized template-based DAST — `.github/workflows/security-active.yml`.
31. Wapiti — authorized web application scanner — `.github/workflows/security-active.yml`.
32. Nikto — authorized web server scanner — `.github/workflows/security-active.yml`.
33. Nmap — authorized network/port/service exposure scan — `.github/workflows/security-active.yml`.
34. sqlmap — explicit opt-in authorized SQL injection testing — `.github/workflows/security-active.yml`.
35. Checkov — GitHub Actions/IaC policy security — `.github/workflows/security-static.yml`.

The security registry above intentionally contains the requested 20 tools. The numbering in this section continues the overall project tooling registry; see `docs/SECURITY_20_TOOLS.md` for the exact 1–20 security numbering.

### Security gate policy

- CodeQL remains opt-in until GitHub Code Security availability is confirmed for this private repository.
- Snyk is non-operational until `SNYK_TOKEN` is added as a GitHub Actions secret.
- Socket Firewall runs without an API key in free mode; Enterprise mode may be enabled later with a secret.
- Active scanners are not PR jobs. The active workflow requires an explicit authorization checkbox.
- sqlmap requires a separate explicit checkbox because it is an invasive injection-testing tool.
- Database and Python security checks stay with the backend pipeline.

## Database / Backend-only

36. Sqlfluff
37. Database-linter
38. pgAdmin Query Plan
39. MongoDB Compass Explain
40. Prisma Lint
41. PyTest

These tools are retained in the registry but must not be forced into a Next.js frontend CI job.

## Performance

42. WebPageTest — external — multi-region performance.
43. k6 — manual/CI — load testing against an authorized environment.
44. Bundlesize — CI-equivalent — bundle-size budget.
45. PageSpeed Insights — external — Core Web Vitals and field/lab data.
46. Loki — manual/CI — visual regression/component screenshot checks.

## Static Code Quality

47. ESLint — CI.
48. Stylelint — conditional CI for CSS/SCSS.
49. SonarQube — external/CI.
50. Knip — CI — dead files/exports/dependencies.
51. Dependency Cruiser — CI — dependency graph/circular dependency detection.
52. Prettier — CI — formatting consistency.

## Logic & Testing

53. Jest — optional — unit tests where Jest is selected.
54. Cypress — CI/runtime — E2E browser testing.
55. Postman API Tests — CI/manual — API contract verification.
56. Mockoon — manual — API failure/offline/degraded-mode simulation.

## Content, links & compliance

57. Lychee — CI — broken link detection.
58. Vale — manual/CI — UX/content wording checks.
59. FOSSA — optional external/CI — open-source compliance.
60. Markdownlint — CI — Markdown quality.
61. License Checker — CI — npm dependency license inventory.
62. I18n-lint — manual/CI — translation coverage.

## Advanced quality and observability

63. Playwright — cross-browser E2E — `advanced-quality.yml`.
64. React Testing Library — component behavior tests.
65. Vitest — unit/integration tests.
66. MSW — deterministic API mocking.
67. axe-core — automated accessibility engine.
68. Pa11y CI — accessibility crawl.
69. Lighthouse CI — performance/accessibility/SEO regression.
70. Next.js Bundle Analyzer — reserved for bundle analysis.
71. CodeQL — security analysis engine.
72. Socket — supply-chain protection.
73. Secretlint — secret linting.
74. Renovate — dependency update automation.
75. cspell — spelling/terminology validation.
76. Pact — planned frontend-backend consumer contract testing.
77. Sentry — planned production runtime monitoring until DSN is configured.
78. OpenTelemetry — planned distributed tracing layer.
79. Chromatic — optional until Storybook is installed.
80. BackstopJS — visual regression.
81. Semgrep — SAST.
82. Bearer — data/security analysis.
83. OSV-Scanner — SCA.
84. TruffleHog — secret verification.
85. Nuclei — authorized DAST.
86. Wapiti — authorized web scanning.
87. Nikto — authorized server scanning.
88. Syft — SBOM.
89. Grype — SBOM vulnerability correlation.
90. Checkov — IaC/CI policy scanning.

## Audit policy

Every release-quality scan records: commit SHA, environment/URL, tool+version, date/time, result (PASS/FAIL/BLOCKED/NOT APPLICABLE), evidence path, and root cause/remediation status for every failure.

## Applicability rules

- Database and Python tools stay with the backend.
- Nmap/sqlmap/ZAP/Nuclei/Wapiti/Nikto are not unrestricted PR jobs; they belong to authorized staging/local active-scan workflows.
- External SaaS tools require credentials or a deployed URL.
- Desktop tools remain documented/manual; pretending they are CI checks creates false confidence.
- Storybook should be installed through its official initializer before adding component stories. This repository currently has no .storybook directory.

## Local audit order

`npm ci` → ESLint → TypeScript → contract tests → Prettier → Knip → Dependency Cruiser → Markdownlint/Lychee → production build → Cypress → Lighthouse → axe → static security/SCA → SBOM/Grype → external visual/SEO scans → authorized active security.
