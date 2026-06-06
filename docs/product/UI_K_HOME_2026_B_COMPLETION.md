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

## 17. FIX02 — Locked DrMuscat 2026 Design System Alignment

### Confirmed no new fonts

FIX02 does not add font imports, Google Fonts, remote fonts, new `font-family` declarations, or new typography tokens. The Featured Board inherits the existing DrMuscat 2026 typography from the app body.

### Confirmed typography inherits approved DrMuscat 2026 system

The approved Smart Search typography inherits from `body`, which uses `var(--dm-font-sans)` for LTR and `var(--dm-font-arabic)` under RTL. The rebuilt Featured Board follows that same inheritance model and only uses existing type-size tokens such as `--dm-type-h3`, `--dm-type-small`, `--dm-type-caption`, and `--dm-type-micro`.

### Confirmed no legacy template style reuse

The rebuilt CSS is scoped to `.dm2026-featured-board*` and consumes existing DrMuscat 2026 primitives/tokens such as:

- `.dm2026-container`
- `.dm2026-glass`
- `.dm2026-card-glass`
- `.dm2026-card-soft`
- `.dm2026-badge`
- `.dm2026-button`
- `--dm-color-*`, `--dm-radius-*`, `--dm-shadow-*`, `--dm-motion-*`, and `--dm-focus-ring`

No legacy homepage/template classes or new visual system classes were introduced.

### Confirmed dynamic rotating preview architecture

FIX02 replaces the narrow four-category model with an 8-entry static preview inventory. Each inventory item includes:

- `id`
- localized `providerKind`
- localized `title`
- localized `subtitle`
- localized `city`
- localized `area`
- localized `chips`
- localized `visibilityContext`
- localized `offerContext`

This structure is intentionally local/static and can scale to a larger future provider visibility inventory without changing routes, APIs, database schema, or Supabase access.

### Confirmed no hardcoded inventory dependency

The rail now represents flexible preview inventory rather than assuming only clinic, specialist, lab, or pharmacy placements exist. Safe preview entries include clinic, specialist, lab, pharmacy, wellness, pet clinic, dental center, and medical service preview surfaces.

### Confirmed action buttons are preview-safe

The action dock continues to use real `<button type="button">` elements for:

- View Profile / عرض الملف
- Directions / الاتجاهات
- Call / اتصال
- WhatsApp / واتساب

No fake hrefs, maps, `tel:`, WhatsApp links, profile URLs, phone numbers, prices, discounts, ratings, review counts, provider names, or availability claims were added. The `aria-label` and `title` values explain that actions appear after provider approval.

### Confirmed DB/Supabase/RLS/SEO untouched

FIX02 does not change database schema, migrations, Supabase files, RLS policies, API routes, route helpers, i18n config, sitemap, robots, `llms.txt`, metadata, package files, or route-check scripts.

### Validation results

Required FIX02 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Observed FIX02 outcomes in this implementation pass:

- `git status --short`: showed only the three approved FIX02 files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Local render smoke check: `/en/om` and `/ar/om` returned the FIX02 board copy from `next start`.
- Screenshot capture warning: no Chromium/Playwright browser binary is available in this container, and adding one would require an unapproved dependency/tooling change.

### Manual QA notes

Manual browser QA should confirm:

- `/en/om` and `/ar/om` inherit the same typography feel as the approved Smart Search.
- The board reads as one DrMuscat 2026 glass module, not a separate template.
- The action dock is visible and polished on desktop/laptop.
- Mobile keeps a 2x2 action dock and a contained horizontal rail.
- Arabic text remains controlled, readable, and free of negative letter spacing.
- Search, header, language switch, and hamburger behavior remain untouched.

### Merge readiness recommendation

Merge readiness is recommended after validation passes and visual QA confirms the Featured Board feels like a natural monetization-ready continuation of the approved Smart Search section while preserving static-safe preview content and all forbidden-area boundaries.

## 18. FIX03 — Provider-Led Premium Visibility Board Polish

### FIX03 summary

FIX03 polishes the existing Premium Visibility Board without rebuilding the homepage section, changing the header, changing Smart Search, changing fonts, or touching backend/SEO infrastructure. The visible UI now leads with provider profile previews instead of internal product-surface language.

### Exact files changed

- `src/components/home/HomeFeaturedBoard2026.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_B_COMPLETION.md`

### Fonts were not changed

No font imports, Google Fonts, remote fonts, new `font-family` declarations, or font-token changes were added. The board continues to inherit the approved DrMuscat 2026 English and Arabic typography from the existing homepage system.

### Search/header/language/footer unchanged

FIX03 does not edit Smart Search, header, hamburger, language switch, or footer files. The board remains mounted below the approved search/safety shell and does not change search behavior or language behavior.

### DB/API/SEO/auth unchanged

FIX03 does not modify database files, Supabase files, migrations, RLS policies, API routes, auth files, route helpers, sitemap, robots, `llms.txt`, package files, or lockfiles.

### Safe rating preview handling

The main provider card now includes a visible rating-style area using clearly marked preview wording only:

- English: `Rating preview`, `4.8 sample rating`, and `Verified reviews appear after approval`.
- Arabic: `معاينة التقييم`, `تقييم تجريبي 4.8`, and `تظهر المراجعات الموثقة بعد الاعتماد`.

The rating presentation is static and explicitly sample/preview. It does not include fake production review counts or imply live provider performance.

### Provider-led preview rail

The rotating rail now shows provider preview names, provider types, area/city context, and a small rating-preview indicator. It no longer presents the visible rail as generic internal visibility labels such as lab/pharmacy visibility surfaces. The local static inventory remains safe and scalable for future 20–40 provider entries without adding routes, APIs, Supabase, or database work.

### Offer panel behavior

The right-side panel now follows the active provider preview and displays provider-specific offer context such as dental cleaning, lab test, wellness, pharmacy, and pet care package previews. Offers remain approval-gated and contain no real prices, fake discounts, fake availability, booking promises, or medical claims.

### Validation results

Required FIX03 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX03 files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Manual QA notes

Manual browser QA should confirm:

- `/en/om` and `/ar/om` show the provider-led board directly below Smart Search.
- The board uses the same DrMuscat 2026 font system and does not introduce new typography.
- The main card reads as a provider profile preview with rating, services, offer context, and polished actions.
- The rail shows provider previews, not internal product/system labels.
- Arabic text remains controlled, readable, and unclipped.
- No horizontal overflow appears on desktop or mobile.
- Search, header, language switch, hamburger, and footer behavior remain unchanged.

### Merge readiness recommendation

FIX03 is merge-ready after lint, typecheck, build, route checks, and final visual QA confirm the board feels provider-led, premium, compact, static-safe, and aligned with the approved DrMuscat 2026 design system.

## 19. FIX04 — Premium Mock Photo Rotation Refinement

### FIX04 summary

FIX04 refines only the existing homepage Featured Provider Preview section. The main provider card now includes a premium mock photo composition that keeps the provider/center visually prominent without changing the approved homepage header, Smart Search, locale system, font system, routes, SEO infrastructure, database, Supabase, RLS, API, or package files.

### Exact files changed

- `src/components/home/HomeFeaturedBoard2026.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_B_COMPLETION.md`

### Mock photo rotation behavior

Each static provider preview now includes four localized mock photo labels. The visible photo area renders a refined two-image composition with one larger primary image and one smaller secondary image. A lightweight local timer rotates the provider photo pair approximately every 1.75 seconds and uses safe cleanup. The existing provider selector rotation remains separate and slower.

Reduced-motion users receive a stable photo composition because the photo and provider timers do not run when `prefers-reduced-motion: reduce` is active.

### Static-safe image strategy

No real provider photos, remote images, public assets, storage integrations, image APIs, or new dependencies were added. The “photos” are CSS-only mock visual surfaces with localized `role="img"` labels, designed to preview how provider photography could look after approval.

### Provider-led polish

The provider name, type, location, rating preview, service chips, offer preview, and action dock remain visible within the main card. The rail keeps provider names and thumbnail-style markers, while the offer panel continues to update with the selected provider preview.

### Safety confirmations

FIX04 keeps the implementation UI-only and presentational. It does not add fake phone numbers, fake maps, fake WhatsApp links, real provider data, prices, discounts, availability, booking promises, or medical guarantees. It also does not change fonts, header/search behavior, SEO infrastructure, database, Supabase, RLS, API, auth, sitemap, robots, `llms.txt`, `package.json`, or the lockfile.

### Validation results

Required FIX04 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX04 files changed.
- `pnpm lint`: passed with pre-existing warnings only after removing a synchronous state reset effect flagged by lint.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Manual QA notes

Manual QA should confirm that `/en/om` and `/ar/om` show a compact premium board below Smart Search, that the two-image mock photo composition rotates smoothly without jarring motion, that actions remain visible on desktop, that mobile stacks cleanly, and that Arabic/RTL layout remains controlled with no horizontal overflow.

## 20. FIX05 — Compact Premium Photo Balance Pass

### FIX05 summary

FIX05 keeps the Featured Provider Preview section in the same approved layout and tightens the existing mock-photo treatment so it feels calmer, more premium, and less gallery-like. No homepage, header, Smart Search, typography, locale, route, SEO, database, Supabase, API, package, or lockfile changes were made.

### Visual refinements

- Shortened visible trust/profile/offer labels to reduce internal product language.
- Kept the two-image provider photo composition but made it more compact and balanced so the provider details and action dock remain visible.
- Adjusted the photo surface to use one larger image tile and one narrower secondary tile without an empty side row.
- Added a subtle glass blur to the photo shell and softened the internal overlay treatment.
- Preserved mobile stacking, RTL behavior, and reduced-motion handling.

### Safety confirmations

The section remains UI-only and static-safe. It uses CSS-only mock photo surfaces and localized mock labels, with no real provider photos, external assets, real data dependencies, fake phone numbers, fake directions links, fake WhatsApp links, booking promises, prices, discounts, availability, or medical guarantees.

### Validation results

Required FIX05 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX05 files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

## 21. FIX05 — Photo Overlay and Glass Action Button Strengthening

### Photo-led enhancement

This pass keeps the current provider-led board and strengthens the media story without rebuilding the layout. The existing two-image mock media area remains compact, rotates locally, and now presents short overlay labels that explain what the media represents, such as service focus and area context.

### Image overlay treatment

The main media tile now displays the active provider service chip as a subtle glass overlay. The secondary media tile displays the active provider area as a smaller glass overlay. Overlays are localized through the active English/Arabic provider data and remain short, readable, and static-safe.

### Glass action button polish

The action dock keeps the required four preview-safe button actions:

- View Profile / عرض الملف
- Directions / الاتجاهات
- Call / اتصال
- WhatsApp / واتساب

The buttons now use inline SVG icons for profile, map pin/directions, phone, and WhatsApp-style chat/phone recognition. The WhatsApp and Directions buttons receive subtle recognisable accent cues while preserving the DrMuscat 2026 glass style and avoiding loud brand-sticker treatment.

### Provider-led content emphasis

The provider name, provider type, city/area, rating preview, service chips, short provider copy, offer preview, media preview, and actions remain the primary hierarchy. Generic product-surface wording remains minimized.

### Guardrails confirmed

No fonts were added or changed. Header, Smart Search, language switch, footer, i18n/routing, SEO infrastructure, backend, database, Supabase, API routes, package files, and lockfile were not changed.

### Validation results

Required FIX05 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX05 action/media polish files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Merge readiness recommendation

Merge readiness is recommended after validation passes and visual QA confirms that `/en/om` and `/ar/om` show meaningful image overlays, recognisable WhatsApp/Directions/Call/Profile icons, compact desktop and mobile layouts, and no regression to header, search, font, route, SEO, or backend boundaries.

## 22. FIX06 — Provider-Linked Special Offer Panel

### Special Offer language update

FIX06 replaces generic offer language in the active offer panel with provider-linked Special Offer language. The panel now uses `Special Offer Preview` / `معاينة عرض خاص`, while the active provider card can show a small `Special Offer` / `عرض خاص` stamp.

### Provider-linked offer panel

The right-side panel now derives its title and subtitle from the active provider preview:

- English title pattern: `{Active Provider Name} Special Offer`
- Arabic title pattern: `عرض خاص من {اسم مقدم الخدمة}`
- English subtitle pattern: `{Offer Subtitle} from {Active Provider Name}`
- Arabic subtitle pattern: `{وصف العرض} من {اسم مقدم الخدمة}`

The panel bullets are concise and provider-led: provider-approved preview, linked to this profile, and visible after approval.

### Minimal Special Offer stamp

The main provider card now shows a small warm champagne/gold glass stamp when the active preview has an offer title. The stamp is intentionally minimal and sits beside the active featured badge so it does not cover provider text or media.

### Warm premium offer accent

The Special Offer panel uses a subtle warm border, champagne-tinted glass background, muted gold badge treatment, and soft gold shadow while retaining DrMuscat teal as the base palette. No bright yellow, red, neon, discount, or price styling was added.

### Safety confirmations

FIX06 remains static-safe and UI-only. It adds no fake prices, fake discounts, fake availability, medical promises, real provider data, backend calls, Supabase access, API calls, storage, routes, SEO changes, package changes, or font changes.

### Validation results

Required FIX06 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX06 files changed.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Manual QA notes and merge readiness

Manual QA should confirm that `/en/om` and `/ar/om` show a provider-linked Special Offer title that changes with the active provider, a subtle Special Offer stamp on the main card, premium warm offer accents, no overflow on mobile, and no changes to header, search, language switch, footer, fonts, routes, SEO, database, Supabase, API, package, or lockfile boundaries.

## 23. FIX07 — Final Premium Polish for Offer, Actions, Media and Rail

### Special Offer stamp polish

FIX07 keeps the provider-linked Special Offer behavior and refines the stamp into a warmer, more visible champagne/gold glass seal. It remains small, inline with the active provider status area, and uses compact mobile handling so it does not crowd Arabic or small-screen layouts.

### Provider-linked offer panel polish

The Special Offer panel remains linked to the active provider title and offer subtitle. The panel now has a stronger but still calm warm accent, a small premium seal marker, gold bullet indicators, and a softer static-safety note so it feels more commercial and less like a legal/informational card.

### Action button recognizability

The action buttons remain preview-safe real `<button type="button">` controls with no fake links. FIX07 sharpens the inline SVG cues for Directions, Call, and WhatsApp and strengthens the soft-glass icon surfaces so the actions are easier to recognise at a glance without adding external icon packages or loud brand colors.

### Media overlay labels

The two-tile provider media preview now uses concise localized overlay labels by media tone, such as `Care space`, `Treatment room`, `Reception preview`, `Diagnostic services`, and Arabic equivalents. These labels are static, short, and glassy; no external images or fake real photos were added.

### Provider rail readability

The bottom provider rail remains compact and horizontal but uses a larger thumbnail marker, more readable provider names, one cleaner provider/type/location line, and a small sample-rating pill. The rail still shows provider preview names rather than generic visibility labels.

### Guardrails confirmed

No font family, typography system, header, Smart Search, language switch, footer, i18n/routing, SEO infrastructure, backend, database, Supabase, API routes, package files, lockfile, real provider data, fake phone/map/WhatsApp URLs, prices, discounts, availability, or medical promises were added or changed.

### Validation results

Required FIX07 validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved FIX07 files changed before commit.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Merge readiness recommendation

Merge readiness is recommended after validation and visual QA confirm that `/en/om` and `/ar/om` retain the approved homepage/search foundation, show a premium Special Offer stamp, provider-linked offer panel, recognizable WhatsApp/Directions/Call buttons, meaningful media overlay labels, readable provider rail items, and no horizontal overflow on mobile.

## 24. Final Featured Provider Preview Refinement

### Single hero image direction

The featured provider card now presents one prominent rotating hero image instead of a two-tile gallery. The image remains static-safe and CSS-generated, while still using the existing lightweight photo rotation data so future provider profiles can support multiple approved photos without cluttering the current design.

### Provider-led framing and copy

The top framing was shortened to keep the section premium and profile-led. The visible copy now emphasizes approved profile preview, photos, rating, services, offers, and clear contact actions without overexplaining monetization mechanics.

### Special Offer and CTA polish

The Special Offer title stays linked to the active provider and uses a warm premium accent. The CTA row remains four preview-safe buttons only—View Profile, Directions, Call, and WhatsApp—with no fake profile, map, phone, or WhatsApp links.

### Provider rail and responsive status

The bottom rail continues to show sample provider/center names rather than generic category placeholders. The rail remains compact, horizontally scrollable on mobile, and keeps active provider selection clear.

### Guardrails confirmed

No font changes, search changes, header changes, language switch changes, footer changes, SEO/routing changes, backend/database/Supabase/API changes, package changes, fake prices, fake discounts, fake availability, fake medical promises, fake phone numbers, fake map URLs, or fake WhatsApp URLs were introduced.

### Validation results

Required final refinement validation commands:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

- `git status --short`: showed only the three approved featured-board files changed before commit.
- `pnpm lint`: passed with pre-existing warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Merge readiness recommendation

Merge readiness is recommended after visual QA confirms that `/en/om` and `/ar/om` retain the approved header, Smart Search, language switch, mobile menu, typography, and responsive behavior while showing a single premium hero image, visible rating, provider-linked Special Offer, clear WhatsApp/Directions actions, and provider-name rail previews.
