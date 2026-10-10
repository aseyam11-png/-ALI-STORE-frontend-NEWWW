# ALI STORE — Design System Tooling

This layer adds tooling around the existing ALI STORE design contract. It does not change storefront business logic, API contracts, supplier truth, checkout behavior, authentication, or catalog rules.

## Included

- Storybook 10.6.1 — isolated UI workshop and component documentation.
- Storybook A11y 10.6.1 — axe-based accessibility checks at component level.
- Storybook Vitest 10.6.1 — connects stories with the existing Vitest layer.
- Storybook Designs 11.1.4 — Figma/web reference panel; compatible with Storybook 10.
- Style Dictionary 5.5.5 — governed token inventory and CSS export.
- eslint-plugin-jsx-a11y 6.10.2 — static JSX accessibility checks.
- Stylelint — CSS correctness and consistency checks.
- Chromatic — optional component visual review when the repository variable `CHROMATIC_ENABLED=true` and secret `CHROMATIC_PROJECT_TOKEN` are configured.
- Playroom — optional P2 interactive playground; installed locally by bootstrap only.

## Runtime truth

`src/app/globals.css` remains the existing runtime visual source of truth. `tokens/ali-store.tokens.json` is a governed inventory/snapshot of core primitives currently used by the system. The first rollout intentionally does not replace the runtime CSS source, preventing a visual regression during tooling adoption.

Future controlled migration:

`tokens → generated CSS → globals.css consumers`

That migration should be a separate visual change with visual regression coverage.

## CI gates

`.github/workflows/design-system.yml` checks token structure, Storybook coverage existence, hardcoded hex colors in UI primitives, Style Dictionary generation, JSX accessibility lint, CSS lint, and Storybook production build.

Chromatic is opt-in through the repository variable `CHROMATIC_ENABLED=true` plus the `CHROMATIC_PROJECT_TOKEN` secret; it does not block the normal gate until explicitly enabled.

## Governance

Every new shared UI primitive should have a Storybook story, default and relevant loading/disabled/error states, keyboard/focus behavior, RTL-safe layout, token-based styling, accessibility expectations, and visual regression coverage before wide rollout.

## Local installation

Run `powershell -ExecutionPolicy Bypass -File tools/design-system/bootstrap.ps1` from the repository root. This installs Storybook and the Design System packages and updates the package lock through npm.
