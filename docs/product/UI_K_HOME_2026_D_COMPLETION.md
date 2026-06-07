# UI-K-HOME-2026-D — Premium Provider CTA / List Your Center Homepage Section

## 1. Final scope

Implemented a UI-only provider acquisition CTA section on the DrMuscat 2026 homepage immediately after the approved Discovery Categories section. The section is limited to homepage presentation and provider-oriented conversion messaging.

## 2. Files changed

- `src/components/home/HomeProviderCTA2026.tsx` — new localized provider CTA and static profile preview component.
- `src/components/home/HomePage2026HeaderHero.tsx` — mounted the provider CTA after Discovery Categories.
- `src/styles/dm2026-home.css` — added responsive DrMuscat 2026 glass/premium styles for the provider CTA.
- `docs/product/UI_K_HOME_2026_D_COMPLETION.md` — phase completion documentation.

## 3. UI-only provider CTA strategy

The section presents DrMuscat as a premium public discovery surface for healthcare providers in Oman. It uses calm commercial messaging, concise value points, and a profile preview card to communicate how a reviewed public profile can show photos, services, offers, and direct contact actions.

## 4. No form/backend/payment confirmation

This PR does not add a form, backend lead capture, API integration, CRM integration, Supabase calls, payment flow, checkout, pricing table, provider dashboard, or claim flow.

## 5. Media/photo preview approach

The profile preview includes a prominent but controlled CSS-only gallery/media placeholder. It uses gradients, soft glass overlays, and safe abstract visual blocks only. No external images, stock photos, real clinic photos, videos, or image assets were added.

## 6. Value points included

English value points:

- Premium profile
- Photos & gallery
- Special Offers
- WhatsApp, Call & Directions
- Arabic + English content
- Featured visibility preview

Arabic value points:

- ملف مميز
- الصور والمعرض
- العروض الخاصة
- واتساب واتصال واتجاهات
- محتوى عربي وإنجليزي
- معاينة الظهور المميز

## 7. CTA behavior and route safety

The CTA buttons use the existing approved localized provider route helper, `publicProviderRoute(locale, country)`, which maps to the existing `/[locale]/[country]/for-providers` route. No new route was created and no fake or dead links were introduced.

## 8. Arabic/RTL status

Arabic copy is included for headings, subtitles, value points, CTAs, preview labels, chips, rating preview, and notes. The component receives the existing `dir` prop and applies RTL-safe logical CSS properties.

## 9. Responsive notes

Desktop uses a premium two-column layout with content on one side and a profile/media preview on the other. Laptop and tablet widths stack cleanly when space is constrained. Mobile uses a single-column layout with full-width CTAs, compact media height, and no intentional horizontal overflow.

## 10. Accessibility notes

The section uses semantic `<section>` markup with an accessible heading reference. CTA actions are real links to an existing route. Preview-only action controls are disabled buttons to avoid fake submissions or dead behavior. Decorative glow/media elements are marked with `aria-hidden` where applicable, and focus-visible states are included for interactive links.

## 11. Performance notes

No new dependencies, external APIs, external images, videos, heavy JavaScript, or animation libraries were added. Visuals are CSS-only and reduced-motion preferences are respected for hover transitions.

## 12. SEO/route safety status

No SEO infrastructure files, sitemap, robots, `llms.txt`, route-check scripts, or i18n route definitions were changed. The homepage order is now Header, Smart Search, Featured Provider Board, Discovery Categories, Provider CTA, then stop.

## 13. Database/Supabase/RLS untouched confirmation

No migrations, seed files, Supabase clients, generated database types, RLS policies, API routes, database schema files, or backend data flows were changed.

## 14. Validation results

Required validation commands for this PR:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed after implementation:

- PASS — `git status --short` showed only the approved UI/documentation files changed.
- PASS with pre-existing warnings only — `pnpm lint`.
- PASS — `pnpm typecheck`.
- PASS — `pnpm build`.
- PASS — `pnpm routes:check`.
- PASS — `/en/om` and `/ar/om` server-rendered HTML smoke checks confirmed localized Provider CTA content is present.
- WARNING — automated screenshot capture was attempted with Playwright, but the package registry returned HTTP 403 in this environment; no repository dependency was added.

## 15. Manual QA checklist

- [ ] `/en/om` desktop
- [ ] `/ar/om` desktop
- [ ] `/en/om` laptop
- [ ] `/ar/om` laptop
- [ ] `/en/om` tablet
- [ ] `/ar/om` tablet
- [ ] `/en/om` mobile
- [ ] `/ar/om` mobile
- [ ] Smart Search unchanged
- [ ] Featured Provider Board unchanged
- [ ] Discovery Categories unchanged
- [ ] Header unchanged
- [ ] Language switch unchanged
- [ ] Mobile hamburger unchanged
- [ ] Provider CTA appears below Discovery Categories
- [ ] Section feels premium and not crowded
- [ ] Large media/profile preview is visible and balanced
- [ ] CTAs are clear
- [ ] No fake real provider data
- [ ] No pricing table
- [ ] No form
- [ ] No payment
- [ ] No backend/API/database/Supabase changes
- [ ] No new routes
- [ ] No SEO infra changes
- [ ] No package changes
- [ ] No horizontal overflow
- [ ] Arabic typography clean
- [ ] Build passes

## 16. Next PR recommendation

UI-K-HOME-2026-E — List Your Center Request Page / Form UI

---

## FIX01 — Final Typography, CTA and Profile Preview Polish

### Scope

FIX01 applied targeted final polish only to the existing Provider CTA section. The section was not rebuilt, the homepage layout structure was not changed, and the Header, Smart Search, Featured Provider Board, and Discovery Categories sections remain untouched.

### Typography consistency polish

- Reduced the Provider CTA heading scale to better align with the approved DrMuscat homepage typography behavior.
- Kept all typography inheriting from the existing site system.
- Added no fonts, no font imports, no fallback font stack changes, and no global typography changes.
- Removed negative Arabic heading letter-spacing and kept Arabic line-height more formal and readable.

### Primary CTA polish

- Strengthened the primary CTA surface, border, and shadow so “List your center” / “أدرج مركزك” reads clearly as the primary action.
- Kept the secondary CTA quieter and supportive.
- Preserved the existing CTA text and existing approved provider route behavior.

### Profile preview readability polish

- Increased readability of the profile preview action labels.
- Made the Special Offer stamp clearer while keeping it calm and champagne-accented.
- Improved rating preview contrast and readability while preserving sample/preview-safe wording.
- Kept the media/photo preview CSS-only with no real provider images or assets.

### Premium color/life polish

- Added subtle DrMuscat teal and warm champagne richness using existing palette behavior only.
- Avoided loud gradients, noisy colors, ad-like treatment, or new visual language.

### Responsive polish

- Refined mobile heading size and Arabic line-height to prevent the heading from dominating small screens.
- Preserved full-width mobile CTAs and single-column stacking.
- Kept the profile preview readable on smaller screens without introducing horizontal overflow.

### FIX01 validation results

- PASS — `git status --short` showed only allowed FIX01 files changed.
- PASS with pre-existing warnings only — `pnpm lint`.
- PASS — `pnpm typecheck`.
- PASS — `pnpm build`.
- PASS — `pnpm routes:check`.
- PASS — `/en/om` and `/ar/om` server-rendered smoke checks confirmed localized CTA content remains present.
- WARNING — screenshot tooling was unavailable in this environment (`chromium`, `google-chrome`, `playwright`, and `wkhtmltoimage` were not installed).

### Merge readiness recommendation

After validation passes, PR #160 is recommended for merge as the final homepage Provider CTA section baseline. The next product step remains: UI-K-HOME-2026-E — List Your Center Request Page / Form UI.

---

## FIX02 — Premium Atmosphere Polish for Provider CTA Section

### Scope

FIX02 applied targeted visual polish only to the already-approved Provider CTA section. The section structure, homepage order, route behavior, and product scope remain unchanged.

### Premium atmosphere polish

- Added a Provider CTA-only ambient backdrop to create a more intentional premium conversion zone during scroll.
- Increased controlled surface depth using soft pearl, light teal haze, warm off-white, and restrained champagne accents.
- Kept the section light, calm, medical/trustworthy, and aligned with the DrMuscat 2026 visual system.

### Background/depth refinement

- Refined the main glass surface border, shadow stack, and internal highlight layers.
- Added a subtle side accent rail that respects LTR/RTL direction.
- Avoided dark, noisy, loud, ad-like, or disconnected visual treatment.

### Preview card readability improvements

- Increased the profile preview card contrast and depth without turning it into a real provider card.
- Improved the CSS-only media/photo preview treatment with richer teal/pearl/champagne layering.
- Made the reviewed profile label, Special Offer stamp, sample rating, chips, and disabled action labels easier to read.
- Preserved all preview-only safeguards: no real provider data, no live links, no claims, no prices, and no discounts.

### CTA polish

- Made the primary CTA more confident through stronger border, shadow, and glass highlight treatment.
- Kept the secondary CTA quieter while still polished and readable.
- Preserved existing CTA text and approved provider route behavior.

### Value point polish

- Improved value point cards with more intentional surface depth, spacing, and subtle teal marker treatment.
- Preserved the approved six English and Arabic value points without adding new items or crowding the section.

### Typography consistency confirmation

- The Provider CTA continues to inherit the approved DrMuscat typography system.
- No new font-family, Google Fonts, remote fonts, custom fallback stack, or global typography changes were introduced.
- Arabic heading treatment remains formal and readable with no negative Arabic letter-spacing.

### No global/system changes

- No Search, Header, Featured Board, Discovery Categories, Footer, language switch, route/i18n, SEO, backend, API, Supabase, database, migration, package, form, payment, pricing table, or dashboard files were changed.

### FIX02 validation results

- PASS — `git status --short` showed only allowed FIX02 files changed.
- PASS with pre-existing warnings only — `pnpm lint`.
- PASS — `pnpm typecheck`.
- PASS — `pnpm build`.
- PASS — `pnpm routes:check`.
- PASS — `/en/om` and `/ar/om` server-rendered smoke checks confirmed localized Provider CTA content, CTAs, preview labels, offer stamp, rating sample, and action labels remain present.
- WARNING — screenshot tooling was unavailable in this environment (`chromium`, `google-chrome`, `playwright`, and `wkhtmltoimage` were not installed).

### Merge readiness recommendation

After validation passes, PR #160 is recommended for merge as the final premium Provider CTA homepage baseline. The next product step remains: UI-K-HOME-2026-E — List Your Center Request Page / Form UI.
