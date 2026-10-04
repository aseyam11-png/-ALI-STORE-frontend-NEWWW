# ALI STORE Frontend Consolidation — 2026-10-04

## Consolidated scope

This release consolidation preserves the complete frontend tree produced by the validated UI work from:

- PR #33 — unified storefront UI and visual consistency.
- PR #34 — consistent storefront UI across purchase flows.
- PR #35 — storefront + admin experience overhaul.

The consolidated tree retains the latest validated application state, with only the release-gate test and this traceability document added for the consolidation.

## UX scope retained

### Storefront
- Responsive top bar, header, search and primary navigation.
- Mobile persistent navigation with Home, Products, Visual Search, Wishlist and Cart.
- Visual-search and catalog entry points.
- Unified product cards with real cart/wishlist interactions.
- Data-backed availability, discount and review presentation.
- Account navigation and mobile-safe shell spacing.
- Shared interaction, focus, motion and scrolling primitives.

### Administration
- Responsive admin shell with collapsible desktop navigation.
- Mobile admin drawer with focus management and Escape handling.
- Consolidated live modules: dashboard, products, orders/shipping, pricing, finance and fulfillment.
- Shared page header, metric card and status pill primitives.
- Loading, error and empty-state treatment.
- Removal of legacy admin modules from the live navigation.\n- Removal of unused seeded review, support-chat and finance stores that could reintroduce fake customer/financial state.

## Business-logic safety

No new B2B marketplace behavior is introduced.
No supplier-owned pricing is exposed as store truth.
Cart, wishlist, checkout, order, pricing and backend API contracts remain preserved.

## Validation gate

The consolidation is accepted only when the repository CI is green for:
1. Frontend lint.
2. Full Node contract suite.
3. Production Next.js build.
4. Backend unit tests.
5. PostgreSQL integration tests.

The new \`tests/frontend-release-gate.test.mjs\` additionally verifies:
- critical shell and navigation wiring,
- admin accessibility invariants,
- real cart/wishlist behavior,
- absence of obvious legacy B2B/mock/supplier-price leakage,
- semantic admin tokens,
- visual-search continuity,
- auth-aware buyer surfaces,
- backend-aligned search/category/checkout contracts.

## Git hygiene

A recovery branch is retained at:
\`archive/main-pre-consolidation-20261004\`

This points to the pre-consolidation \`main\` commit, so the previous commit graph remains recoverable after the clean-history rewrite.
