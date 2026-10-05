# ALI STORE Frontend — Security Control Set (20 Tools)

This repository now has an explicit 20-tool security registry. The goal is coverage across code, secrets, dependencies, software supply chain, SBOM, web application attack surface, network exposure, injection testing, and CI/IaC policy.

## Tool registry

| # | Tool | Layer | Execution | Gate |
|---|---|---|---|---|
| 1 | CodeQL | SAST | `.github/workflows/codeql.yml` | Opt-in until GitHub Code Security is enabled |
| 2 | Semgrep | SAST | `.github/workflows/security-static.yml` | Blocking |
| 3 | Bearer | SAST / Data Security | `.github/workflows/security-static.yml` | Blocking |
| 4 | Gitleaks | Secrets | Existing security workflow | Blocking |
| 5 | TruffleHog | Secrets | `.github/workflows/security-static.yml` | Blocking |
| 6 | Secretlint | Secrets | `.github/workflows/security-static.yml` | Blocking |
| 7 | Snyk | SCA | `.github/workflows/security-static.yml` | Blocking when `SNYK_TOKEN` exists |
| 8 | OSV-Scanner | SCA | `.github/workflows/security-static.yml` | Blocking |
| 9 | Socket Firewall | Supply Chain | `.github/workflows/security-static.yml` | Protects package installs |
| 10 | Retire.js | JavaScript SCA | `.github/workflows/security-static.yml` | Blocking on vulnerable libraries |
| 11 | Trivy | Filesystem / SCA / Secrets / Misconfig | `.github/workflows/security-static.yml` | Blocking for HIGH/CRITICAL |
| 12 | Grype | Vulnerability correlation | `.github/workflows/security-static.yml` | Blocking for HIGH/CRITICAL |
| 13 | OWASP ZAP | DAST | `.github/workflows/security-active.yml` | Authorized active scan |
| 14 | Nuclei | DAST / templates | `.github/workflows/security-active.yml` | Authorized active scan |
| 15 | Wapiti | Web scanner | `.github/workflows/security-active.yml` | Authorized active scan |
| 16 | Nikto | Web server scanner | `.github/workflows/security-active.yml` | Authorized active scan |
| 17 | Nmap | Network exposure | `.github/workflows/security-active.yml` | Authorized active scan |
| 18 | sqlmap | SQL injection | `.github/workflows/security-active.yml` | Explicit opt-in only |
| 19 | Checkov | CI/IaC security | `.github/workflows/security-static.yml` | HIGH/CRITICAL policy gate |
| 20 | Syft | SBOM | `.github/workflows/security-static.yml` | Produces release evidence |

## Execution model

### Pull Request / mainline

The blocking layer is intentionally static:

```
Checkout
  ↓
Socket Firewall
  ↓
npm ci
  ↓
Semgrep + Bearer
  ↓
TruffleHog + Secretlint
  ↓
OSV + Trivy + Retire.js
  ↓
Syft → SBOM → Grype
  ↓
Checkov
```

Snyk is enabled automatically when `SNYK_TOKEN` exists.

### Authorized staging / local assessment

The active scanners stay outside normal pull-request execution:

```
Authorized target
  ├─ OWASP ZAP
  ├─ Nuclei
  ├─ Wapiti
  ├─ Nikto
  ├─ Nmap
  └─ sqlmap (explicit checkbox)
```

The workflow requires an explicit authorization checkbox before the active job executes.

## Required GitHub secrets

Only the external service integrations need secrets:

- `SNYK_TOKEN` — enables Snyk.
- `SOCKET_SECURITY_API_KEY` — reserved if/when the Enterprise Socket mode is selected.

Never place either value in `.env.example` or source control.

## Evidence

Security jobs upload reports where a tool produces a machine-readable artifact. A security result is considered complete only when the repository records the commit SHA, environment/target, tool version, date/time, result, and remediation status.

## Important scope boundary

The frontend repository does not pretend to perform backend/database checks. SQLfluff, Prisma checks, database query plans, and Python security checks remain in the ALI STORE backend pipeline.
