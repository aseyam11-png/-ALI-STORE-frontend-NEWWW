# ALI STORE — DESIGN SYSTEM & EXPERIENCE SPECIFICATION

> Product design contract for the ALI STORE storefront.
> This document defines the visual language, UX behavior, responsive rules, accessibility requirements, component patterns, and page-level experience expectations.
> It is a design/experience contract, not a business-logic replacement.

---

## 1. Product Design North Star

ALI STORE is a B2C, supplier-based commerce storefront.

The customer experience must feel like a mature retail product:

- Fast to understand.
- Easy to search.
- Easy to compare.
- Clear about price, availability, shipping, and trust.
- Focused on purchase intent rather than visual decoration.
- Premium without looking expensive or artificial.
- Dynamic where interaction adds value, not merely because animation is possible.

### Primary user outcomes

1. Discover a useful product quickly.
2. Understand whether it is available and what it will cost.
3. Trust the information shown.
4. Add to cart without friction.
5. Complete checkout with confidence.
6. Track and manage the order after purchase.

### Design principle

Neutral-first, brand-accented, conversion-focused.

Orange is an accent and action language, not a wallpaper color.

---

## 2. Design Scope and Truthfulness

This file describes the intended storefront experience and the rules that implementation must follow.

It does not authorize changing:

- catalog business rules;
- supplier synchronization rules;
- inventory source of truth;
- pricing calculations;
- checkout/payment behavior;
- authentication/authorization rules;
- order state transitions;
- API contracts;
- domain models.

When a design requirement conflicts with business logic, business/domain truth wins. The UI must represent the real state instead of inventing data.

### Never manufacture UI truth

Do not invent:

- discounts that do not exist in the backend;
- stock quantities that are not authoritative;
- shipping promises that are not confirmed;
- seller/supplier claims that are not supported;
- ratings/reviews that do not exist;
- fake order progress;
- fake delivery dates.

Loading, empty, unavailable, unavailable-from-source, and error states are valid product states and must be designed intentionally.

---

## 3. Current Storefront Design Foundation

The current frontend already establishes a strong baseline that should be preserved and extended.

### Current visual foundation

- Arabic-first application.
- RTL document direction.
- IBM Plex Sans Arabic for display and body typography.
- Primary brand orange: #FF6B00.
- Deep warm charcoal for dark surfaces and high-contrast areas.
- Warm neutral grayscale for the majority of the UI.
- Deep teal, green, gold, and red are semantic/status colors and must remain subordinate to the brand.
- Three-layer token architecture: primitive → semantic → component usage.
- Controlled radius scale.
- Controlled elevation/shadow scale.
- Shared motion easing.
- Reduced-motion support.
- Shared container-shell alignment system.
- Focus-visible accessibility treatment.
- Sticky storefront header.
- Desktop and mobile navigation variants.
- Global cart/wishlist state indicators.
- Search entry points including normal search and visual search.

The existing CSS token system is the source of truth for visual primitives. New UI should consume existing semantic tokens instead of creating new one-off colors, shadows, radii, or typography values.

---

## 4. Brand Language

### Brand personality

Modern · Reliable · Direct · Practical · Premium · Confident

Avoid:

Noisy · Gamified · Over-glowing · Childish · Generic SaaS · AI-slop

### Visual balance

Use this approximate visual hierarchy:

- 70–80% neutral/warm surfaces and whitespace.
- 10–20% dark charcoal where strong contrast is useful.
- 5–10% brand orange for actions, highlights, active states, and attention anchors.
- Status colors only where semantically necessary.

Orange must immediately answer:

“What can I click or what deserves attention?”

It must not answer:

“Where can I put more color?”

---

## 5. Color Contract

Use the existing semantic tokens from src/app/globals.css.

### Primary

Brand orange is used for:

- primary CTA;
- active navigation state;
- important links;
- interactive emphasis;
- cart count;
- selected filters;
- action confirmation when appropriate.

### Dark / ink

Warm deep charcoal is used for:

- hero surfaces;
- high-contrast CTA alternatives;
- footer;
- major overlays;
- secondary premium surfaces.

### Success

Use only for:

- verified/available/success states;
- completed actions;
- positive inventory/order states;
- successful confirmation.

### Warning

Use only for:

- attention-required situations;
- low-stock warnings when real;
- pending states that are genuinely warning-like.

### Discount / danger

Red is reserved for:

- actual discounts;
- destructive actions;
- critical errors;
- destructive status.

Never use red merely to create visual excitement.

### Neutral

Neutral surfaces must carry most of the product UI.

Use contrast to create hierarchy:

background < surface < raised < floating < modal

Do not turn every card into a shadowed floating panel.

---

## 6. Typography Contract

### Typeface

IBM Plex Sans Arabic is the default family for Arabic and Latin UI.

Do not introduce another typeface without a product-level reason.

### Weight discipline

- 700 — headlines and major numeric emphasis.
- 500 — prices, tabs, buttons, key labels.
- 400 — body copy, descriptions, supporting information.

Avoid bolding every sentence.

### Hierarchy

Use the existing semantic scale:

- Display: hero/product-level statements.
- H1: page titles.
- H2: major sections.
- H3/H4: cards and subsection hierarchy.
- Body: readable product/support text.
- Small/Caption: metadata, helper text, secondary information.
- Label: compact UI labels.

### Arabic readability

Arabic UI requires comfortable vertical rhythm.

Do not create a second arbitrary line-height system per component. Reuse the global Arabic correction and semantic typography.

Headlines should be visually strong without becoming extremely dense.

---

## 7. Spacing Contract

Use the existing spacing scale.

Preferred rhythm:

- 4px — micro alignment.
- 8px — icon/text and compact control gaps.
- 12px — dense groups.
- 16px — normal component internal spacing.
- 24px — component/section grouping.
- 32px — strong content separation.
- 48–64px — section spacing.
- 80–96px — major editorial/hero spacing.

Avoid random values unless necessary for a specific visual constraint.

### Container

Use the shared container-shell where possible.

The storefront should feel aligned from:

Top bar → Header → Main content → Footer

Misaligned horizontal edges make the UI feel unfinished.

---

## 8. Radius Contract

Use the existing radius vocabulary:

- sm — compact controls.
- md — standard controls/cards.
- lg — prominent cards and containers.
- xl — hero/prominent rounded surfaces.

Do not mix many unrelated radii on one page.

A page should generally have one dominant radius language.

Avoid pill-shaped everything. Pills are for:

- tags;
- compact filters;
- badges;
- status chips;
- category shortcuts.

---

## 9. Elevation Contract

Use elevation intentionally:

### Raised

For:

- product cards;
- subtle grouped surfaces;
- low-priority floating separation.

### Floating

For:

- dropdowns;
- search suggestions;
- sticky utility surfaces;
- elevated compact panels.

### Modal

For:

- cart drawer;
- dialogs;
- mobile navigation;
- major overlays.

Avoid:

- colored glowing shadows;
- excessive card shadows;
- multiple nested shadows;
- shadow on every text block.

---

## 10. Motion Contract

Motion is functional polish.

The shared easing curve is cubic-bezier(0.22, 1, 0.36, 1).

### Recommended timings

- Micro interaction: about 160–220ms.
- Standard UI transition: about 200–300ms.
- Large drawer/modal transition: about 250–350ms.
- Image/hero emphasis: about 500–700ms.

### Motion should communicate

- state change;
- direction;
- hierarchy;
- context;
- successful action.

### Motion should not communicate

- randomness;
- constant attention seeking;
- “AI” branding;
- fake 3D depth;
- infinite movement.

### Reduced motion

Every animation system must respect prefers-reduced-motion.

Do not introduce motion that cannot degrade gracefully.

---

# 11. Global Storefront Shell

The current shell is conceptually:

Top Bar → Header → Global Navigation → Page → Footer → Mobile Store Bar

This is the standard storefront frame.

### Top Bar

Purpose:

- utility reassurance;
- support access;
- localization/currency;
- concise fulfillment/security communication.

Rules:

- Very compact.
- Never compete with the main header.
- Use small typography.
- Do not turn it into an advertising banner.

### Header

Purpose:

- brand recognition;
- global search;
- fast access to high-value customer actions.

Desktop priorities:

1. Logo.
2. Search.
3. Visual search.
4. Support/messages.
5. Notifications.
6. Wishlist.
7. Cart.
8. Account.

The search field is a primary interaction, not a decoration.

### Global navigation

Purpose:

- section discovery;
- category discovery;
- return-to-shopping behavior.

Keep the primary nav compact and predictable.

### Mobile shell

Mobile should use:

- compact header;
- expandable search;
- mobile navigation drawer;
- sticky bottom shopping utility when appropriate.

Do not simply compress desktop controls. Recompose them for touch.

---

# 12. Homepage Experience Specification

The homepage should act as a shopping launcher, not a corporate landing page.

Recommended structure:

1. Top Bar
2. Header + Search
3. Smart Navigation
4. Hero
5. Trust signals
6. Categories
7. Product discovery
8. Deals when real deal data exists
9. Discovery/personalization surfaces
10. Recently viewed when data exists
11. Support/trust reinforcement
12. Footer

### Hero

The current hero already uses a strong dark surface + product imagery + concise CTA structure.

Maintain:

- strong visual anchor;
- short value proposition;
- primary CTA;
- visual-search CTA;
- category shortcuts;
- product image with controlled treatment.

Do not introduce a 3D/canvas hero merely because the product is “premium.” Real product photography and smooth composition are preferred when they improve clarity.

### Hero copy

Good:

> اختَر أسرع. اكتشف أكثر. اشترِ بثقة.

Bad:

> The Future of AI-Powered Next-Gen Commerce Experiences.

The customer needs a shopping proposition, not an architecture statement.

### Category section

Category cards should communicate:

- what the category is;
- what happens when I click;
- visual identity.

Avoid text-heavy cards.

### Product discovery section

Product grids should use consistent card anatomy:

1. Product media.
2. Badge/status when real.
3. Product name.
4. Rating/review metadata when available.
5. Price.
6. Previous price/discount only when real.
7. Shipping/availability signal where useful.
8. Wishlist action.
9. Add-to-cart action when appropriate.

### Flash Deals

Only render a deals section when the backend actually provides deal/promotion truth.

Do not create fake percentages or countdown timers from mock data.

---

# 13. Product Card Specification

The product card is one of the most important conversion components.

### Card priorities

The customer should understand, in order:

What is it? → How much? → Is it trustworthy/available? → What can I do?

### Media

- Stable aspect ratio.
- No layout shift.
- Product should visually dominate the frame.
- Avoid excessive decorative backgrounds.
- Use consistent crop strategy across the grid.

### Wishlist

Wishlist must be:

- discoverable;
- reachable without opening the product;
- visually clear;
- stateful;
- accessible.

When toggled, provide immediate visual feedback.

Do not use a heart icon that looks identical in both selected and unselected states.

### Add to cart

Primary action should be obvious on hover/focus/desktop and sufficiently large for touch.

Avoid ambiguous labels such as:

- Go
- Open
- Do it

Prefer explicit intent:

- أضف للسلة
- عرض المنتج

### Loading state

Skeletons should preserve card dimensions.

Do not animate large blocks forever if data is already unavailable.

### Empty state

Empty product sections should explain what happened and provide a useful next action.

---

# 14. Product Details Page

The product page is the highest-intent information surface.

Recommended structure:

### Above the fold

Desktop:

- Gallery / main image.
- Product title.
- Rating/review summary if available.
- Price.
- Discount comparison if real.
- Availability.
- Variant selection.
- Shipping information.
- Primary add-to-cart action.
- Wishlist.
- concise trust reassurance.

### Information hierarchy

The first viewport should answer:

1. What is the product?
2. What does it cost?
3. Can I buy it now?
4. When/where can it ship?
5. What variants are available?
6. Why should I trust this listing?

Detailed content follows below:

- description;
- specifications;
- media;
- shipping details;
- returns;
- reviews;
- related products.

### Sticky purchase region

On desktop, a sticky purchase panel can be used when the page is long.

On mobile, use a bottom purchase bar when it improves conversion without covering critical information.

Do not permanently block more than necessary of the viewport.

---

# 15. Search Experience

Search is a core product capability.

The UI should support the product's real search capabilities, including when available:

- text search;
- Product/SKU lookup;
- category lookup;
- suggestions/autocomplete;
- spelling correction;
- category suggestions;
- visual search;
- AI-assisted discovery.

### Search autocomplete

Suggestions should be grouped by intent when useful:

- Products.
- Categories.
- Exact/SKU matches.
- Recent searches.

Do not overload the dropdown.

### Search states

Design:

- idle;
- typing;
- loading;
- results;
- no results;
- API error.

### No results

A good no-result screen should provide:

- clear explanation;
- query echo;
- spelling/correction suggestion;
- popular categories or products;
- visual search CTA where available.

Bad:

> Nothing found.

---

# 16. Visual Search Experience

Visual search is a discovery tool.

### Entry points

- Header.
- Navigation.
- Hero CTA.
- Product discovery helpers where appropriate.

### Upload state

The interface should clearly communicate:

- where to upload;
- supported input;
- privacy/reassurance where applicable;
- cancellation/reset.

### Processing state

Use a calm processing indicator.

Never imply that AI has completed analysis before it actually has.

### Results

Prioritize:

- visually related product images;
- confidence/relevance where the system actually exposes it;
- price;
- availability;
- direct product action.

Avoid making visual search look like a generic chatbot.

---

# 17. Ask Ali / AI Discovery

AI should be presented as a shopping assistant, not as the identity of the store.

### Good use cases

- explain product differences;
- narrow choices;
- summarize specifications;
- recommend based on explicitly stated criteria;
- guide discovery;
- help interpret catalog information.

### Rules

AI output must remain grounded in real catalog/system data.

Never let AI invent:

- stock;
- prices;
- shipping promises;
- policies;
- product specifications;
- supplier relationships.

### Visual design

AI surfaces may use a subtle accent or spark icon, but should remain part of the same ALI STORE design system.

Avoid:

- neon gradients;
- chatbot avatars everywhere;
- glowing AI blobs;
- excessive animated particles.

---

# 18. Cart Drawer and Cart Page

### Cart drawer

Purpose:

Confirm add-to-cart action and offer the fastest path to checkout.

The drawer should show:

- item image;
- product/variant name;
- quantity;
- line price;
- remove/edit;
- subtotal;
- checkout CTA;
- continue shopping.

### Cart principles

- Never hide the price.
- Never hide quantity.
- Make variant identity clear.
- Preserve customer context.
- Provide immediate success feedback when an item is added.

### Cart page

The full cart should handle:

- quantity changes;
- removal;
- unavailable items;
- price changes;
- shipping/fees when known;
- order summary;
- checkout continuation.

Any server-side change to price/availability must be reflected honestly.

---

# 19. Checkout Experience

Checkout should minimize cognitive load.

Recommended structure:

1. Account/contact.
2. Shipping address.
3. Shipping method.
4. Payment method.
5. Order review.
6. Final confirmation.

### Checkout rules

- Keep the order summary visible.
- Make total cost unmistakable.
- Do not hide required information behind unnecessary accordions.
- Preserve entered form data when safe.
- Validate at field and submission levels appropriately.
- Provide actionable errors.

### Error language

Bad:

> Validation failed.

Better:

> تأكد من إدخال رقم الهاتف بشكل صحيح.

Error messages should tell the user what to do next.

---

# 20. Customer Account Area

The buyer account should feel like a control center, not an admin dashboard.

Recommended entry structure:

- Overview.
- Orders.
- Order details.
- Wishlist.
- Saved addresses.
- Profile.
- Notifications.
- Support/messages.
- Preferences.

### Buyer dashboard hierarchy

High-value information first:

1. Current/recent orders.
2. Active order status.
3. Quick actions.
4. Saved/wishlist items.
5. Account settings.
6. Support.

Avoid dense BI-style metrics unless they actually help customers.

---

# 21. Orders Page

Orders are customer history and reassurance.

Each order row/card should make it immediately clear:

- order number;
- date;
- item summary;
- total;
- current status;
- next action.

### Status language

Use understandable customer-facing states.

Example:

تم استلام الطلب → قيد المعالجة → تم الشحن → في الطريق → تم التسليم

Do not expose raw internal event names or technical enum values.

### Order details

Show:

- order summary;
- products/variants;
- financial summary;
- shipping address when appropriate;
- shipping information;
- tracking data when available;
- current status timeline;
- support action;
- return/refund action when applicable.

---

# 22. Wishlist Experience

Wishlist is a retention and comparison tool.

### Empty wishlist

Should include:

- friendly explanation;
- shopping CTA;
- categories/discovery shortcuts.

### Filled wishlist

Prioritize:

- product image;
- price;
- availability;
- discount if real;
- quick add-to-cart;
- remove;
- product details.

Wishlist state should remain visually consistent across product cards, product pages, header counters, and wishlist page.

---

# 23. Support Experience

Support is a trust mechanism.

### Support entry points

- top bar;
- header/messages;
- order details;
- account;
- footer.

### Support page

Should quickly answer:

- What can I ask?
- How do I contact support?
- Where is my order?
- How do returns work?

Avoid making customers navigate through a maze before finding contact options.

---

# 24. Notifications

Notifications must be meaningful.

Good notification examples:

- order status changed;
- payment completed;
- shipment updated;
- refund processed;
- action required.

Avoid noisy marketing notifications in high-priority UI.

Read/unread states must have sufficient contrast but should not dominate the interface.

---

# 25. Category and Listing Pages

### Listing page anatomy

1. Breadcrumb.
2. Category title/description.
3. Search/refinement context.
4. Filters.
5. Sort.
6. Results count.
7. Product grid.
8. Pagination/infinite loading when the actual data layer supports it.

### Desktop

Use a persistent or collapsible filter rail when appropriate.

### Mobile

Use a sticky or easily reachable:

تصفية + ترتيب

control.

Do not expose a huge filter form permanently on small screens.

### Filter chips

Selected filters should be visible and removable.

Always provide a clear-all option when multiple filters are active.

---

# 26. Responsive Design Contract

ALI STORE must be designed for:

- mobile;
- tablet;
- laptop;
- large desktop.

Do not treat responsive design as desktop but smaller.

### Mobile

Priorities:

- one-handed interaction;
- readable typography;
- thumb-reachable controls;
- sticky purchase actions where appropriate;
- bottom navigation/utility when useful;
- compact cards;
- drawer-based filters/navigation.

### Tablet

Use adaptive grids and preserve comfortable spacing.

### Desktop

Use horizontal composition for:

- search;
- navigation;
- product gallery/details;
- filters;
- account layouts.

### Large desktop

Do not let content stretch infinitely.

Use max-width containers and deliberate negative space.

---

# 27. Touch Targets

Interactive controls should generally target at least a comfortable ~44px touch area.

Important mobile actions:

- search;
- back;
- cart;
- wishlist;
- quantity;
- add to cart;
- checkout;
- filter;
- sort.

Do not use tiny icon-only actions for critical tasks without adequate hit area and accessible labels.

---

# 28. Accessibility Contract

Accessibility is part of the product quality bar.

### Required

- semantic HTML;
- keyboard navigation;
- visible focus;
- accessible labels;
- correct button/link semantics;
- meaningful alt text;
- sufficient color contrast;
- accessible dialogs/drawers;
- Escape handling for overlays;
- logical reading order;
- no information conveyed by color alone.

### RTL

The entire interface must remain logically RTL.

Directional icons may need semantic mirroring.

Do not mirror icons that are not directional.

### Loading

Use:

- aria-busy when appropriate;
- live-region announcements for meaningful async state changes;
- stable layout during loading.

---

# 29. Images and Media

### Product media

Product images should be optimized for:

- stable layout;
- fast loading;
- clear focal point;
- consistent crop;
- responsive delivery.

### Remote images

Keep dimensions/aspect ratios stable to avoid cumulative layout shift.

### Decorative imagery

Do not add decorative imagery simply to fill empty space.

Every major visual should either:

- explain;
- build trust;
- guide attention;
- identify a category/product;
- improve emotional purchase intent.

---

# 30. Empty, Error, Loading, and Offline-Quality States

Every important data surface must define at least:

### Loading

Skeleton or compact loading indicator that preserves geometry.

### Empty

Explain why the surface is empty and what the customer can do next.

### Error

Explain what failed, whether the user can retry, and what remains usable.

### Unavailable

Distinguish “no data” from “data temporarily unavailable.”

### Stale data

Where product freshness matters, avoid presenting old data as real-time truth.

### Partial data

If a product has price but shipping information is unavailable, show exactly that rather than hiding the entire product or inventing shipping.

---

# 31. Data-Freshness UX

Supplier-based commerce introduces an important design requirement:

store truth and source truth are not necessarily identical in time.

The UI should reflect real freshness metadata when available.

Potential UI language:

- محدّث الآن
- آخر تحديث قبل 5 دقائق
- التوفر يتأكد عند الطلب
- سيتم تأكيد الشحن عند إتمام الطلب

Only show such copy when supported by the backend/data contract.

Never expose internal implementation vocabulary that customers cannot understand.

---

# 32. Trust and Verification

Trust should be earned through evidence.

Use trust signals for:

- verified information;
- secure checkout;
- clear returns;
- order tracking;
- confirmed shipping information.

Avoid meaningless badge overload.

One strong trust signal is better than six decorative badges.

---

# 33. Navigation Rules

Primary navigation should remain stable.

Do not add navigation items because a feature exists technically.

A navigation item earns its position when it:

- helps customers discover;
- supports a high-frequency task;
- improves conversion;
- reduces navigation friction.

The current navigation model provides:

- Home;
- Products;
- Deals;
- Visual Search;
- Categories.

New items should not duplicate these responsibilities.

---

# 34. Header Search Rules

Search is a top-level product action.

### Desktop

Search should remain visually dominant.

### Mobile

Search can expand into a dedicated row or focused mode.

### Search control states

- idle;
- focused;
- typing;
- suggestions open;
- loading;
- error;
- submitted.

The search field should preserve the query where context makes sense.

---

# 35. Page Layout Formula

A strong ALI STORE page usually follows:

Context → Discovery → Decision → Action → Reassurance

Example:

- Context: breadcrumb/title.
- Discovery: filters/search/categories.
- Decision: product content.
- Action: add to cart/checkout.
- Reassurance: shipping/returns/support.

Pages should not start with decorative content before user intent is clear.

---

# 36. Content Design Rules

### Labels

Use customer language, not backend terminology.

### Buttons

Use verbs.

Good:

- تصفح المنتجات
- أضف للسلة
- اشترِ الآن
- تتبع الطلب
- إعادة المحاولة

Bad:

- مزيد
- تشغيل
- تنفيذ
- Process

### Product copy

Be concise.

A card is not the place for a full marketing paragraph.

### Prices

Make current price visually dominant.

Use previous price and discount only when mathematically and operationally real.

---

# 37. Premium Quality Checklist

A UI is not premium because it has gradients, glass, glow, or animation.

Premium quality comes from:

- consistent spacing;
- high-quality imagery;
- strong typography;
- alignment;
- information hierarchy;
- restrained color;
- correct states;
- responsive behavior;
- accessible interactions;
- reliable data representation.

Before adding decoration, fix:

1. spacing;
2. typography;
3. alignment;
4. state handling;
5. hierarchy;
6. responsiveness.

---

# 38. Anti-Patterns — Explicitly Forbidden

Do not introduce:

- random gradients;
- neon backgrounds;
- excessive glassmorphism;
- giant glowing buttons;
- unnecessary 3D/canvas scenes;
- fake AI dashboards;
- fake countdown timers;
- fake review counts;
- fake discount values;
- fake stock counters;
- giant rounded pills everywhere;
- oversized text that pushes products below the fold;
- excessive animations;
- inaccessible icon buttons;
- technical errors shown directly to customers;
- internal backend terminology in shopper UI;
- duplicated components doing the same job;
- multiple competing visual systems.

### No AI-slop

Avoid a visual recipe that looks like:

purple/blue gradient + glowing orb + sparkles + glass cards + random floating elements + generic AI-powered copy.

ALI STORE should look like a real commerce product first.

---

# 39. Component Architecture Rules

### Reuse before duplication

Before creating a new component, search for an existing component with the same semantic responsibility.

Prefer:

- shared buttons;
- shared cards;
- shared badges;
- shared modal/drawer primitives;
- shared form controls;
- shared layout containers;
- shared typography/tokens.

### Composition over duplication

Page components should compose domain-capable UI components rather than duplicate business logic.

### UI must not own domain truth

Presentation code should consume:

- catalog services;
- order services;
- cart/wishlist stores;
- server state;
- domain mappers.

Do not hardcode product truth directly in presentation components.

---

# 40. Design Token Governance

The existing globals.css token system is the visual source of truth.

New design tokens should be added only when:

1. the need is real;
2. an existing token cannot express it;
3. the new token benefits multiple components;
4. naming is semantic and consistent.

Do not add random component colors. Prefer semantic aliases.

---

# 41. Component State Matrix

Interactive components should define:

| State | Requirement |
|---|---|
| Default | Clear hierarchy and affordance |
| Hover | Small, meaningful visual response |
| Focus | Visible keyboard focus |
| Active/Pressed | Immediate feedback |
| Disabled | Clearly unavailable, still readable |
| Loading | Preserve geometry and communicate progress |
| Success | Confirm completed action |
| Error | Explain problem + recovery |
| Empty | Explain absence + next action |

Not every component needs every state, but critical interactive controls do.

---

# 42. Forms

Forms should be:

- grouped logically;
- easy to scan;
- validated predictably;
- forgiving;
- clear about required fields.

### Validation

Prefer:

- inline field errors;
- summary for multi-error submissions;
- clear correction instructions.

Do not erase user input because validation failed.

---

# 43. Drawers and Dialogs

Used for:

- mobile navigation;
- cart drawer;
- filter drawer;
- compact settings;
- confirmations.

Rules:

- trap focus appropriately;
- support Escape;
- prevent background interaction when modal;
- use a clear title;
- provide an explicit close control;
- animate with restraint.

A drawer is not a full page unless its content genuinely requires it.

---

# 44. Tables vs Cards

For customers:

Use cards/list patterns for:

- products;
- orders;
- support messages;
- wishlist.

Use tables only when comparison of many structured values is genuinely easier in rows/columns.

Do not copy the admin dashboard visual language into the buyer experience.

---

# 45. Buyer vs Seller/Admin Separation

ALI STORE customer UX and operational/admin UX have different visual goals.

### Buyer

- shopping;
- trust;
- simplicity;
- decision-making.

### Seller/Admin/Operations

- density;
- monitoring;
- filtering;
- workflow;
- analytics.

Do not make customer pages look like internal management consoles.

---

# 46. Homepage Conversion Rules

The homepage should make these actions obvious:

- search;
- browse categories;
- view products;
- visual search;
- add to cart;
- open wishlist;
- open account/orders.

Primary CTA should visually dominate secondary actions.

Do not place four equally loud buttons in one area.

---

# 47. Mobile Purchase Rules

On mobile, the purchase action must remain discoverable during long product pages.

Possible pattern:

السعر | أضف للسلة

Use only when it improves the purchase path and does not cover important content.

Ensure safe-area spacing for devices with bottom system UI.

---

# 48. Performance-Aware Design

Design decisions must respect performance.

Prefer:

- responsive images;
- lazy loading below the fold;
- stable image frames;
- CSS/transform-based motion;
- lightweight icons;
- progressive loading;
- localized client-side state where useful.

Avoid:

- huge hero assets;
- unnecessary canvas rendering;
- heavy animation libraries for trivial effects;
- enormous DOM trees;
- repeated network requests caused by decorative components.

---

# 49. SEO-Aware UX

Important customer-facing pages should have:

- unique page title;
- useful description;
- semantic headings;
- crawlable product/category links;
- meaningful image alt text;
- clean URLs where possible.

SEO must support the experience rather than distort it.

---

# 50. Design QA Before Merge

A frontend design change is not complete because TypeScript compiles.

### Visual QA

Check:

- desktop;
- tablet;
- mobile;
- RTL;
- narrow mobile width;
- large desktop;
- long product names;
- long Arabic copy;
- empty states;
- error states;
- slow-loading states;
- large image ratios.

### Interaction QA

Check:

- keyboard;
- focus;
- hover;
- touch;
- drawer open/close;
- search interactions;
- wishlist toggle;
- cart behavior;
- navigation active states.

### Data QA

Check:

- zero products;
- unavailable products;
- missing image;
- missing discount;
- missing shipping;
- changed price;
- changed inventory;
- stale response;
- API error.

---

# 51. Definition of Done — UI/UX

A design implementation is DONE only when:

- it uses existing semantic design tokens;
- it does not introduce fake business data;
- it works in RTL;
- it is responsive;
- critical actions are accessible;
- loading/empty/error states are intentional;
- motion respects reduced-motion preferences;
- interactive states are complete;
- the visual hierarchy is coherent;
- the page does not duplicate existing capabilities;
- business/domain logic remains unchanged unless the task explicitly requires it;
- the UI communicates the actual backend state;
- visual QA passes at mobile and desktop breakpoints.

---

# 52. AI Coding Agent Instructions

When an AI coding agent is asked to modify ALI STORE frontend UI:

### Step 1 — Understand the existing system

Inspect:

- page composition;
- feature services;
- stores;
- existing shared UI;
- route structure;
- design tokens;
- API/domain types.

Do not design in isolation.

### Step 2 — Identify the semantic responsibility

Ask:

Is this a new capability, or should an existing component be improved?

Prefer improving the existing component.

### Step 3 — Protect logic

Do not alter:

- product fetching behavior;
- cart business rules;
- wishlist state semantics;
- order transitions;
- authentication;
- supplier synchronization;
- pricing logic;

unless the task explicitly includes that behavior.

### Step 4 — Apply the design system

Use:

- semantic color tokens;
- existing typography tokens;
- existing spacing;
- existing radius;
- existing shadows;
- shared motion rules.

### Step 5 — Design all meaningful states

At minimum:

- loading;
- success/default;
- empty;
- error;
- disabled where applicable.

### Step 6 — Test the real interaction

Do not stop at a successful build.

Verify the component in its actual route and state flow.

### Step 7 — Remove accidental complexity

After implementation, ask:

- Did I add a new component unnecessarily?
- Did I duplicate an existing feature?
- Did I add visual effects without product value?
- Did I hardcode data?
- Did I break mobile or RTL?
- Did I change logic when only design was requested?

---

# 53. Recommended Page Inventory

The customer-facing system should have dedicated, coherent experiences for:

### Discovery

- Home
- Product listing
- Category page
- Search results
- Visual search
- AI discovery / Ask Ali

### Commerce

- Product details
- Cart drawer
- Cart
- Checkout
- Order confirmation

### Buyer account

- Buyer overview
- Orders
- Order details
- Wishlist
- Profile
- Addresses
- Notifications
- Support/messages

### System states

- Not found
- Service unavailable
- Authentication required
- Empty catalog
- Empty wishlist
- Empty cart
- Order not found
- Search no-results

---

# 54. Final Design Rule

When a visual decision is uncertain, prefer this sequence:

Clarity → Trust → Conversion → Beauty → Decoration

Never reverse it.

A beautiful interface that makes shopping harder is a design failure.

A clean interface that makes the customer understand, trust, and buy is the target.

---

## Audit Note

This specification is aligned with the current storefront foundation and should evolve with the real product. When implementation changes, update this document so that the design contract remains an accurate reference for future development.

Document: DESIGN.md
Scope: ALI STORE customer-facing frontend
Language/Direction: Arabic / RTL first
Primary design system: Existing ALI STORE semantic tokens
Business model constraint: B2C supplier-based commerce; no customer-facing B2B presentation


## 20. Design System Tooling and Governance

The implementation is now backed by a component-level tooling layer:

- Storybook for isolated component development and documentation.
- Storybook A11y for component accessibility review.
- Storybook Vitest integration for story-driven component tests.
- Storybook Designs for Figma/web reference context.
- Style Dictionary for a governed token inventory.
- eslint-plugin-jsx-a11y for static JSX accessibility checks.
- Stylelint for CSS correctness checks.
- Chromatic is supported as an optional visual-review gate.
- Chromatic remains optional and is enabled in CI only with repository variable \`CHROMATIC_ENABLED=true\` plus the \`CHROMATIC_PROJECT_TOKEN\` secret.


Every shared UI primitive should have a story covering its normal and material state variants. New styling should consume the existing semantic tokens in \`src/app/globals.css\` rather than introduce one-off colors, radii, shadows, or typography values.

The initial token inventory does not replace the runtime CSS source. Runtime token migration is a separate visual change and must be protected by visual regression checks.

## 21. Homepage Quick Shop Sidebar

The homepage hero uses a dedicated Quick Shop category rail on large screens. In RTL it occupies the right side, while the primary hero content and editorial image remain to its left.

Required category targets:

- الملابس — resolves to the canonical clothing/fashion category when available.
- الأحذية — resolves to the canonical shoes/footwear category when available.
- الساعات — resolves to the canonical watches category when available.
- الإكسسوارات — resolves to the canonical accessories category when available.

The sidebar is catalog-aware. It must not invent category ids, product counts, availability, prices, discounts, or other commerce truth. When a target category cannot be resolved from the real catalog, the item remains visually present but is disabled and marked unavailable rather than linking to an invented route.

Desktop pattern:

`Quick Shop 280px → Hero content/image flexible area`

Mobile pattern:

`Quick Shop 2-column compact grid → Hero content → Hero image`

The sidebar uses existing ALI STORE semantic tokens, shared motion easing, RTL-safe logical positioning, focus-visible treatment, and Storybook coverage. It is a homepage composition pattern, not a second navigation system.
