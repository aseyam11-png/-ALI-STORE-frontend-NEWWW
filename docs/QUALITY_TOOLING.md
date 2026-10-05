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

## Security

16. Trivy — CI — filesystem/dependency/config scan.
17. Gitleaks — CI — secret detection/history.
18. OWASP ZAP — manual workflow — active web security scan.
19. Snyk — optional CI — dependency/SCA scan.
20. Hadolint — conditional/manual — Dockerfile lint (no Dockerfile currently detected).
21. Nmap — manual workflow — authorized network exposure scan.
22. sqlmap — manual workflow — authorized injection testing.
23. Checkov — conditional/manual — Terraform/IaC (no IaC currently detected).

## Database / Backend-only

24. Sqlfluff
25. Database-linter
26. pgAdmin Query Plan
27. MongoDB Compass Explain
28. Prisma Lint

These are retained in the registry but must not be forced into a Next.js frontend CI job.

## Performance

29. WebPageTest — external — multi-region performance.
30. k6 — manual/CI — load testing against an authorized environment.
31. Bundlesize — CI-equivalent — bundle-size budget.
32. PageSpeed Insights — external — Core Web Vitals and field/lab data.
33. Loki — manual/CI — visual regression/component screenshot checks.

## Static Code Quality

34. ESLint — CI.
35. Stylelint — conditional CI for CSS/SCSS.
36. SonarQube — external/CI.
37. Knip — CI — dead files/exports/dependencies.
38. Dependency Cruiser — CI — dependency graph/circular dependency detection.
39. Prettier — CI — formatting consistency.

## Logic & Testing

40. Jest — optional — unit tests where Jest is selected.
41. PyTest — backend-only.
42. Cypress — CI/runtime — E2E browser testing.
43. Postman API Tests — CI/manual — API contract verification.
44. Mockoon — manual — API failure/offline/degraded-mode simulation.

## Content, links & compliance

45. Lychee — CI — broken link detection.
46. Vale — manual/CI — UX/content wording checks.
47. FOSSA — optional external/CI — open-source compliance.
48. Markdownlint — CI — Markdown quality.
49. License Checker — CI — npm dependency license inventory.
50. I18n-lint — manual/CI — translation coverage.

## Audit policy

Every release-quality scan records: commit SHA, environment/URL, tool+version, date/time, result (PASS/FAIL/BLOCKED/NOT APPLICABLE), evidence path, and root cause/remediation status for every failure.

### Applicability rules

- Database and Python tools stay with the backend.
- Nmap/sqlmap/ZAP are not unrestricted PR jobs; they belong to authorized staging/local active-scan workflows.
- External SaaS tools require credentials or a deployed URL.
- Desktop tools remain documented/manual; pretending they are CI checks creates false confidence.
- Storybook should be installed through its official initializer before adding component stories. This repository currently has no .storybook directory.

## Local audit order

npm ci → ESLint → TypeScript → contract tests → Prettier → Knip → Dependency Cruiser → Markdownlint/Lychee → production build → Cypress → Lighthouse → axe → security/SCA scans → external visual/SEO scans.
