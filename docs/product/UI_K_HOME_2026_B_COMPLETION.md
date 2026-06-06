# UI-K-HOME-2026-B Completion — Premium Featured Provider / Sponsored Visibility Board

## 1. Final scope

Implemented a UI-only, static-safe Featured Provider / Sponsored Visibility Board for the DrMuscat 2026 homepage. The section is mounted directly below the approved Smart Search top shell and compact discovery safety strip.

Execution mapping:

- Execution Phase: Phase 3 — Public SEO Platform UI surface continuation
- Lock Scope: Homepage section only
- Product Module: Public homepage premium discovery and visibility preview
- Subphase ID: UI-K-HOME-2026-B

## 2. Files changed

- `src/components/home/HomeFeaturedBoard2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_B_COMPLETION.md`

No optional page file edit was required because the homepage shell already renders through `HomePage2026HeaderHero`.

## 3. Featured board visual/product purpose

The new board presents DrMuscat as a premium Oman-first healthcare discovery platform with a high-end glass/bento composition:

- A large main preview card for a reviewed public provider profile surface.
- A side sponsored placement preview with approval and trust context.
- A compact mini-card rail for future visibility surfaces across specialists, labs, pharmacies and wellness providers.
- A polished action dock that visually demonstrates conversion points for profile discovery.

The visual purpose is to prove that paid visibility can look professional, calm and healthcare-appropriate without implying quality ranking or using fake provider data.

## 4. Static-safe content strategy

The content uses neutral preview labels only. It does not include:

- Real provider data
- Fake provider names
- Fake doctor names
- Fake ratings
- Fake reviews
- Fake availability
- Fake phone numbers
- Fake WhatsApp numbers
- Fake maps/directions URLs
- Fake medical claims
- “Best,” “top rated,” “trusted by,” “available today,” “book now,” or guaranteed-result language

The copy uses preview-safe phrases such as “Featured visibility preview,” “Sponsored placement preview,” “Reviewed public profile,” “Public discovery only,” and “Confirm details with provider.”

## 5. Action buttons behavior

The main card includes four real interactive `<button type="button">` controls:

- View Profile
- Directions
- Call
- WhatsApp

Arabic equivalents are included:

- عرض الملف
- الاتجاهات
- اتصال
- واتساب

All four are preview-safe non-navigation buttons. They do not link to fake provider profiles, maps, phone numbers or WhatsApp numbers. Each button includes `aria-label` and `title` text explaining that the action becomes available after provider approval.

## 6. Sponsored/visibility disclaimer

The board includes clear sponsored/visibility trust language:

- Sponsored visibility does not mean quality ranking.
- Provider profile actions appear after approval.
- Confirm details with provider.

Arabic equivalents are included and displayed inside the side card and header trust note.

## 7. Arabic/RTL status

The component provides full Arabic copy and respects the passed `dir` prop. CSS includes RTL-aware typography rules that avoid negative Arabic letter spacing while keeping hierarchy and spacing polished.

## 8. Responsive notes

Responsive behavior was implemented with CSS only:

- Desktop: two-column premium bento board with prominent main card, side card and four-card rail.
- Laptop: constrained max width and flexible grid prevent horizontal overflow.
- Tablet: main/side cards stack and the rail becomes a two-column grid.
- Mobile: single-column flow with a 2x2 action button grid and practical tap targets.

## 9. Accessibility notes

Accessibility implementation includes:

- Semantic `section`, `article`, `aside`, `dl`, `ul`, and `button` elements.
- Real buttons for non-navigation preview actions.
- No div-buttons.
- Decorative glows, avatar shapes and orbit elements marked `aria-hidden="true"`.
- Focus-visible styles for action buttons.
- Readable color contrast using existing DrMuscat teal, ink and warm surface tokens.

## 10. Performance notes

The board is lightweight:

- No data fetching.
- No Supabase usage.
- No API calls.
- No remote images.
- No videos.
- No icon libraries.
- No new dependencies.
- CSS-only decorative shapes and states.
- No endless animations.
- `prefers-reduced-motion` is respected for hover transitions.

## 11. SEO/route safety status

No routes, sitemap, robots, llms, route helpers, i18n config or SEO infrastructure were changed. The section is static server-rendered UI copy on the existing homepage route and does not introduce new crawlable routes or schema markup.

## 12. Database/Supabase/RLS untouched confirmation

Confirmed untouched by scope:

- Database schema
- SQL migrations
- Supabase files
- RLS policies
- API routes
- Generated DB types
- Seed files
- Auth backend
- Payment backend

## 13. Validation results

Required validation commands for this PR:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Observed outcomes in this implementation pass:

- `git status --short`: showed only the four approved files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Local render smoke check: `/en/om` and `/ar/om` returned the featured board copy from `next start`.

Screenshot note: no Chromium/Playwright browser binary is available in this container, so automated screenshot capture could not be performed without adding an unapproved dependency.

## 14. Manual QA checklist

Manual route/device checks to perform in browser QA:

1. `/en/om` desktop
2. `/ar/om` desktop
3. `/en/om` laptop
4. `/ar/om` laptop
5. `/en/om` tablet
6. `/ar/om` tablet
7. `/en/om` mobile
8. `/ar/om` mobile

Manual visual checks:

- Featured board appears below Smart Search.
- Search from PR #157 still works.
- Header language switch still works.
- Mobile hamburger still works.
- Board feels premium and not like placeholder junk.
- View Profile / Directions / Call / WhatsApp buttons look polished.
- Buttons do not use fake phone/maps/WhatsApp links.
- Arabic version is clean.
- No horizontal overflow.
- No fake ratings/reviews/provider names.
- No lower homepage sections restored.

## 15. Next PR recommendation

UI-K-HOME-2026-C — Discovery Categories / Browse Paths

## 16. FIX01 — Compact Premium Rotating Visibility Surface

### Problems fixed from first PR #158 attempt

FIX01 addresses the first implementation review concerns:

- Replaced the oversized section headline with a compact premium header row.
- Reworked the board from loose placeholder-feeling cards into one unified glass module.
- Moved the action dock into the immediately visible main profile area.
- Strengthened the right-side monetization/offer surface so sponsored visibility value is clear.
- Reduced vertical heaviness and removed the hero-like feel from the section.
- Added a rotating/active provider slot model while keeping all content preview-safe.

### New compact board layout

The updated board uses a single max-width glass module aligned with the homepage search container. The top row contains the badge, compact title, subtitle, and trust note. The main board uses a desktop two-column layout:

- Left/main area for the active provider visibility preview, abstract logo tile, category context, safe description, status chips, and action dock.
- Right/offer area for provider-approved offer preview, sponsored visibility context, review status, and Homepage / Area / Category placement labels.
- Bottom mini rail for four compact visibility slots with an active state.

### Rotation/active slot behavior

The board now includes a tiny local client-side rotation. It rotates between four static-safe preview slots every 4.5 seconds unless the user hovers or focuses within the module. It also respects `prefers-reduced-motion` by not auto-rotating for users who request reduced motion.

Rotating slots:

1. Premium Clinic Preview / معاينة عيادة مميزة
2. Specialist Profile Preview / معاينة ملف اختصاصي
3. Lab Visibility Preview / معاينة ظهور مختبر
4. Pharmacy Visibility Preview / معاينة ظهور صيدلية

The active slot updates:

- Main card title and category.
- Main safe preview description.
- Status chips.
- Right-side offer/visibility context.
- Mini rail active state.

### Action button behavior

The action dock remains preview-safe and uses real buttons, not links:

- View Profile / عرض الملف
- Directions / الاتجاهات
- Call / اتصال
- WhatsApp / واتساب

All four actions use `button type="button"`, avoid fake hrefs, fake phone numbers, fake maps, fake WhatsApp links, and fake profile destinations. Each action includes `aria-label` and `title` text explaining that the action appears after provider approval.

### Offer/right-side card behavior

The right card now functions as the monetization/value area. It clearly communicates:

- Provider-approved offer preview.
- Appears after review.
- Sponsored context is clearly marked.
- Offer visibility can support profile discovery.
- Placement preview can include Homepage, Area, Category, Specialty, Tests, or related discovery context depending on the active static slot.

No fake prices, fake discounts, fake provider names, fake ratings, fake availability, or fake medical claims are used.

### Arabic/RTL status

Arabic copy was updated for the compact redesign. RTL styling remains intentional, with no negative Arabic letter spacing. Arabic action labels and slot labels are kept short enough for the compact action dock and mobile layouts.

### Responsive status

The updated CSS keeps the board compact across breakpoints:

- Desktop/laptop: two-column board with visible action dock and right-side offer card.
- Tablet: main and offer cards stack; action dock becomes 2x2.
- Mobile: stacked layout; action dock remains 2x2; slot rail becomes horizontal scroll to avoid overflow and oversized typography.

### Validation results

Required FIX01 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Observed FIX01 outcomes in this implementation pass:

- `git status --short`: showed only the three approved FIX01 files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed after tightening the active-slot fallback for TypeScript safety.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Local render smoke check: `/en/om` and `/ar/om` returned the compact FIX01 board copy from `next start`.
- Screenshot capture warning: no Chromium/Playwright browser binary is available in this container, and adding one would require an unapproved dependency/tooling change.

### Forbidden files untouched

FIX01 does not change:

- `src/components/home/HomeSearch2026.tsx`
- Header, hamburger, language switch, or footer files
- Proxy/middleware files
- Routes or route-check scripts
- API routes
- Supabase files
- Database schema, migrations, generated DB types, seed files, or RLS policies
- Sitemap, robots, or `public/llms.txt`
- `package.json` or `pnpm-lock.yaml`

### Merge readiness recommendation

Merge readiness is recommended after validation passes and browser QA confirms that `/en/om` and `/ar/om` show a compact premium board directly below Smart Search, with the action dock and right-side offer card visible and no horizontal overflow.
