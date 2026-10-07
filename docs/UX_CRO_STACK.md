# ALI STORE UX / CRO Stack

## Purpose

This project has a dedicated UX/CRO instrumentation layer, separate from store business logic and from correctness/security tooling.

## Stack

| Layer | Tool | Primary use |
| --- | --- | --- |
| Product analytics | PostHog | funnels, paths, session replay, feature flags, experiments |
| Session behavior | Microsoft Clarity | recordings, heatmaps, rage clicks, scroll behavior |
| Ecommerce analytics | GA4 | acquisition and ecommerce conversion reporting |
| UI system | Storybook | component isolation, states, interaction and accessibility review |
| UX research | Lyssna | first-click, five-second, preference, card sorting, tree testing |
| UX research | Maze | live-site and prototype usability studies |

Existing ALI STORE QA remains authoritative for correctness: TypeScript, ESLint, unit/contract tests, Playwright/Cypress, Lighthouse, axe, visual regression, security tooling, Sentry, and OpenTelemetry.

## Runtime gating

Analytics are disabled unless:

`NEXT_PUBLIC_UX_ANALYTICS_ENABLED=true`

Provider configuration:

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

Only public identifiers are allowed in the frontend environment.

## Event taxonomy

The shared helper in `src/lib/ux/analytics.ts` supports:

- `page_view`
- `view_item`
- `select_item`
- `search`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `add_to_wishlist`
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase`
- `view_promotion`
- `select_promotion`

GA4 ecommerce events use standard item fields such as `item_id`, `item_name`, `price`, `quantity`, `item_category`, and `item_brand`.

Do not send passwords, authentication tokens, payment details, full addresses, or raw customer messages.

## CRO workflow

1. Instrument the journey.
2. Measure the funnel in PostHog and GA4.
3. Inspect matching sessions and heatmaps in Clarity.
4. Form a UX hypothesis.
5. Validate with Lyssna or Maze when appropriate.
6. Build the UI change in Storybook.
7. Release through a controlled experiment or feature flag.
8. Compare conversion and guardrail metrics.
9. Keep a change only when the evidence supports it.

## Research tools

Lyssna and Maze remain external research platforms and are intentionally not runtime dependencies. Research links, tasks, recruited-user studies, and test plans belong in the UX/CRO workflow rather than customer-facing code.

## Privacy

Production analytics must be enabled only after applicable privacy/consent requirements are satisfied. Runtime instrumentation is explicitly gated so tracking cannot turn on accidentally.
