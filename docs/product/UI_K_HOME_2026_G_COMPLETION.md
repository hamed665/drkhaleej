# UI-K-HOME-2026-G Completion — Premium Homepage Search Hero Simplification

## 1. Final scope

This PR refines only the existing DrMuscat homepage search hero. It simplifies the hero copy, reduces visible filter clutter, keeps the core search interaction, and adds an image-ready right-side visual placeholder without adding real media assets.

Execution mode: `PHASED_BUILD_ONLY`.

Four-axis mapping:

- Execution Phase: UI homepage refinement phase
- Lock Scope: Homepage search hero UI/UX only
- Product Module: Public homepage discovery/search surface
- Subphase ID: `UI-K-HOME-2026-G`

## 2. Files changed

- `src/components/home/HomeSearch2026.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_G_COMPLETION.md`

No other files were changed.

## 3. Search hero simplification summary

- Reworked the existing search hero into a cleaner premium two-column layout.
- Left column now focuses on the badge, headline, subtitle, main search bar, limited primary chips, visible Country/City/Area selectors, More filters, CTA row, and trust microcopy.
- Removed the always-visible secondary provider filter row from the first view.
- Removed the static popular-suggestion strip from the default hero view to reduce scan burden.
- Preserved typed search suggestions, click-to-fill behavior, selected search category state, location state, and discovery preview behavior.

## 4. Copy changes

English visible hero copy:

- Badge: `Healthcare discovery for Oman`
- Headline: `Find trusted care, all in one place.`
- Subtitle: `Search doctors, clinics, labs, pharmacies, services and offers by country, city and area.`
- Search placeholder: `Search doctors, centers, services, offers or areas...`

Arabic visible hero copy:

- Badge: `اكتشاف الرعاية الصحية في عُمان`
- Headline: `ابحث عن رعاية موثوقة في مكان واحد.`
- Subtitle: `ابحث عن الأطباء والعيادات والمختبرات والصيدليات والخدمات والعروض حسب الدولة والمدينة والمنطقة.`
- Search placeholder: `ابحث عن أطباء أو مراكز أو خدمات أو عروض أو مناطق...`

## 5. Country/City/Area filter decision

Country remains visible and outside More filters to communicate that DrMuscat is scalable beyond one city. City and Area also remain visible so users can immediately narrow discovery by location without opening secondary controls.

Defaults continue to come from the existing homepage search copy/state, preserving Oman/Muscat/current area behavior.

## 6. More filters strategy

More filters is implemented as a compact native disclosure control for secondary provider-type filters that were previously visible in the main hero. It does not add backend, database, route, or query infrastructure. It uses existing provider type state and form naming.

## 7. Visual placeholder strategy

The right-side panel is a designed, premium, image-ready placeholder using CSS-only healthcare and location motifs. It includes small placeholder/trust badges and explanatory copy. No image, external asset, video, upload logic, admin integration, CMS integration, or backend behavior was added.

## 8. Arabic/RTL notes

- Arabic copy uses natural RTL layout and no negative letter spacing.
- RTL headline sizing and line-height are explicitly tuned to avoid clipping.
- Chips, More filters, Country/City/Area controls, CTAs, trust microcopy, and visual placeholder content remain readable in RTL.

## 9. Mobile notes

- The hero stacks vertically below the desktop breakpoint.
- The search bar remains prominent and becomes full-width-friendly on small screens.
- Primary chips remain horizontally usable on mobile to avoid an exhausting wall of fields.
- More filters remains compact; secondary filters are hidden until opened.
- The visual placeholder becomes smaller and secondary on mobile.

## 10. SEO safety notes

- Meaningful badge/headline/subtitle text remains rendered as visible text.
- No heading/subtitle text was replaced by image text.
- No metadata, sitemap, robots, llms.txt, JSON-LD, schema.org markup, or route files were changed.
- No new routes were created.

## 11. No backend/database/SEO infra changes confirmation

Confirmed:

- No database changes.
- No Supabase changes.
- No RLS changes.
- No migration changes.
- No API route changes.
- No SEO infrastructure changes.
- No sitemap, robots, or llms.txt changes.
- No package or dependency changes.
- No header/footer changes.
- No Special Offers, Provider CTA, Discovery Categories, or Featured Provider Board changes.
- No real image asset was added.

## 12. Validation results

- `git status --short` — completed; expected modified files only (`HomeSearch2026.tsx`, `dm2026-home.css`, and this completion report).
- `pnpm lint` — passed with pre-existing warnings outside this PR scope.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.

## 13. Manual QA notes

Manual QA checklist status:

- `/en/om` desktop: implementation reviewed against responsive CSS/code paths; screenshot capture was attempted but blocked by registry policy for the temporary Playwright CLI.
- `/ar/om` desktop: implementation reviewed against responsive CSS/code paths; screenshot capture was attempted but blocked by registry policy for the temporary Playwright CLI.
- `/en/om` mobile: implementation reviewed against responsive CSS/code paths; screenshot capture was attempted but blocked by registry policy for the temporary Playwright CLI.
- `/ar/om` mobile: implementation reviewed against responsive CSS/code paths; screenshot capture was attempted but blocked by registry policy for the temporary Playwright CLI.
- Search hero is cleaner and less crowded.
- Search hero fits better within one screen on desktop.
- Main search bar remains prominent.
- Country, City, and Area are visible.
- More filters exists for secondary filters.
- Primary chips are limited and clean.
- Right-side visual placeholder is premium and not blank.
- No real image assets were added.
- Mobile is not too long or crowded.
- Arabic RTL works.
- Header/footer remain unchanged.
- Special Offers remains unchanged.
- Provider CTA remains unchanged.
- No DB/API/Supabase/RLS/SEO/package changes.
- Build passes.

## 14. Next PR recommendation

`UI-K-HOME-2026-H — Homepage FAQ + Trust/Safety Foundation`

## 15. FIX01 summary — Compact and Polish Premium Homepage Search Hero

FIX01 keeps the approved premium hero direction and applies targeted polish only to the existing homepage search hero.

### Beauty and Pet Clinic chip addition

The visible `Search in` chip set now includes Beauty and Pet Clinic in the requested order.

English order:

1. Doctors
2. Centers
3. Labs
4. Pharmacies
5. Beauty
6. Pet Clinic
7. Services
8. Offers

Arabic order:

1. الأطباء
2. المراكز
3. المختبرات
4. الصيدليات
5. التجميل
6. العيادات البيطرية
7. الخدمات
8. العروض

Beauty and Pet Clinic use the existing services/provider-type state only; no backend, route, query, database, or search infrastructure was added.

### Mobile height reduction

- Reduced mobile hero padding, vertical gaps, heading size, subtitle line-height, chip height, select height, More filters height, CTA height, trust-chip height, and visual-placeholder height.
- Kept the main search, Country, City, Area, More filters, Search in chips, CTAs, and trust messages visible.
- Mobile now treats the hero as a compact premium search surface instead of a tall form wall.

### Mobile search/input polish

- Mobile search input and Search button now share one integrated compact row at normal mobile widths.
- The input uses ellipsis-friendly sizing to avoid clipped/overflowing placeholder text.
- The Search button remains tappable but no longer defaults to an oversized full-width block except on very narrow screens.

### Mobile chip row polish

- The primary Search in row is intentionally horizontally scrollable with tighter spacing and an edge fade affordance.
- Doctors, Centers, Labs, Pharmacies, Beauty, Pet Clinic, Services, and Offers remain accessible without adding Articles or other default chips.
- Horizontal page overflow is avoided by constraining scrolling to the chip row.

### Country/City/Area compact treatment

- Country, City, and Area remain visible outside More filters.
- On mobile, the three controls use a compact three-column layout with smaller labels and shorter selects while preserving readable values and RTL support.
- On very narrow screens, the controls can stack to prevent clipping.

### Trust/safety deduplication

- The hero keeps one compact inline trust row with the required messages:
  - Public discovery only / اكتشاف عام فقط
  - Confirm details with provider / أكد التفاصيل مع مقدم الخدمة
  - Not medical advice / ليست نصيحة طبية
- The duplicate compact safety panel in the search-first top container is hidden via scoped CSS so the messages are not repeated heavily.

### Visual placeholder refinement

- The right-side placeholder remains CSS-only and image-ready.
- FIX01 adds more purposeful internal composition: subtle guide lines, healthcare/location motifs, a compact verified-information card, and tighter glass-card spacing.
- On mobile, the visual placeholder becomes shorter and secondary while retaining an image-ready cue.
- No real image, remote asset, admin/CMS integration, upload logic, or backend was added.

### Arabic/RTL notes

- Arabic chips now include `التجميل` and `العيادات البيطرية`.
- RTL headline sizing, chip scrolling, compact selects, CTA row, trust row, and visual placeholder remain scoped for natural RTL layout and no horizontal page overflow.

### FIX01 validation results

- `git status --short` — completed; expected modified files only (`HomeSearch2026.tsx`, `dm2026-home.css`, and this completion report).
- `pnpm lint` — passed with pre-existing warnings outside FIX01 scope.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.

### FIX01 merge-readiness recommendation

Merge-ready. Required validation commands pass; final reviewer visual QA should confirm the compact mobile hero density on target devices before release.
