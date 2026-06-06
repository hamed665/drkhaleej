# UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search Completion

## 1. Cleanup summary

PR #157 was cleaned up from an oversized full-homepage shell into the approved merge-ready scope: premium homepage top shell, single official header improvements, smart search command center and minimal discovery safety copy.

Lower homepage sections that were not ready for merge were removed/deferred from this PR.

## 2. Final PR scope

Final scope is `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`.

Included:

- Premium localized homepage top shell.
- Hero text and visual panel.
- Smart Search Command Center.
- Static intelligent autocomplete and suggestions.
- Country → City → Area dependency.
- Search hover/focus preview.
- Popular suggestion overflow handling.
- Minimal public-discovery safety copy.
- Single official header with bilingual labels/language switch and preview-safe disabled items where routes are not approved.

Excluded/deferred:

- Ads / Featured Board.
- Care Stories.
- Categories.
- Area discovery sections.
- Featured Doctors / Centers.
- Offers.
- Articles.
- Provider sales CTA.
- Footer redesign.

## 3. Files kept

- `src/app/[locale]/[country]/page.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/components/home/HomeSearch2026.tsx`
- `src/components/layout/site-header.tsx`
- `src/styles/dm2026-home.css`
- `src/styles/globals.css`
- `docs/product/UI_K_HOME_2026_A_COMPLETION.md`

## 4. Files removed/deferred

Removed/deferred from this PR because they represented unfinished lower homepage work:

- `src/components/home/HomeAds2026.tsx`
- `src/components/home/HomeAreas2026.tsx`
- `src/components/home/HomeArticles2026.tsx`
- `src/components/home/HomeCareStories2026.tsx`
- `src/components/home/HomeCategories2026.tsx`
- `src/components/home/HomeFeaturedProviders2026.tsx`
- `src/components/home/HomeForProviders2026.tsx`
- `src/components/home/HomeOffers2026.tsx`
- `src/components/home/HomeTrust2026.tsx`
- `docs/product/UI_K_HOME_2026_B_COMPLETION.md`
- `docs/product/UI_K_HOME_2026_FULL_COMPLETION.md`

Footer redesign was reverted to avoid including out-of-scope footer polish in this PR.

## 5. Header/language/sign-in/create-account status

- Exactly one official header is rendered by the global layout.
- Header labels are localized for English and Arabic.
- English language switch shows `العربية`.
- Arabic language switch shows `English`.
- Existing approved route helpers are used for supported links.
- Hospitals, Offers, Articles, Sign in and Create account remain disabled/preview-safe where approved routes are not available.
- No auth backend, payment backend, placeholder auth route or route-check change was added.

## 6. Hero/top shell status

- Homepage now renders only the 2026 top shell through `HomePage2026HeaderHero`.
- The top shell includes search-first placement, localized hero headline/subtitle, provider CTA link to the approved provider route and minimal safety micro-copy.
- No lower homepage redesign sections are rendered by `src/app/[locale]/[country]/page.tsx`.

## 7. Smart search behavior preserved

Preserved search behavior:

- Controlled query input.
- One-character English suggestions for `D`, `B`, `L`, `pet` and `q` through deterministic static matching.
- Arabic suggestions for `ط`, `أس` / `اس`, `مخت` and `ج` through normalized Arabic matching.
- Suggestion grouping for Services, Provider types, Areas, Offers and Guides with Arabic equivalents.
- Click-to-fill suggestion behavior.
- Hover/focus glass preview.
- Popular suggestion overflow handling with `More` / `المزيد` expansion.
- Safe local discovery preview after Search click without fake result cards.

## 8. City/area dependency status

- Country stays UI-only and uses disabled coming-soon options where applicable.
- City changes reset Area to the first valid area for that city.
- Muscat, Sohar, Salalah, Seeb and Bawshar expose city-specific areas.
- Limited-data Oman cities fall back to `City-wide discovery` / `اكتشاف على مستوى المدينة`.
- No Supabase, API or backend search is used.

## 9. RTL/Arabic status

- Arabic top shell and search remain RTL-safe through scoped `dir` and CSS rules.
- Arabic headings use compact sizing and comfortable line-height.
- Arabic search suggestions, preview and chips avoid negative letter spacing.
- Arabic language switch displays `English`.

## 10. SEO/route safety status

- No new routes were added.
- No routes were renamed.
- No sitemap, robots or `llms.txt` changes were made.
- Homepage metadata remains localized and server-rendered.
- No schema.org or fake structured data was added.
- Supported locales remain `en` and `ar`.
- Supported country remains `om`.

## 11. Database/Supabase/RLS untouched confirmation

No database, Supabase, RLS, migration, generated DB type, seed, storage, RPC, grant, policy, API, auth or payment files were changed.

## 12. Performance notes

- No new dependencies.
- No animation library.
- No remote fonts.
- No large images or videos.
- Search interactivity is local client state only.
- CSS motion remains small and respects reduced-motion safeguards.
- Deferred heavy lower homepage sections were removed from this PR.

## 13. Validation results

- `git status --short` — run during cleanup.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Forbidden-path checks confirmed no forbidden files changed.
- Source checks confirmed smart search behavior remains present.
- Built-page HTML checks for `/en/om` and `/ar/om` confirmed the top shell/search render and deferred lower-section markers are absent.
- Browser screenshot tooling is unavailable in the container; interactive visual QA is documented as an environment limitation.

## 14. Remaining deferred homepage sections

Deferred for future PRs:

- Ads / Featured Board.
- Care Stories.
- Categories.
- Areas.
- Featured Doctors.
- Featured Centers.
- Offers.
- Articles.
- Provider sales CTA.
- Footer redesign.

## 15. Next PR recommendation

`UI-K-HOME-2026-B — Featured Provider Board / Ads Board`

## 16. FIX08 — Header wrapping and top/search layout repair

### Layout regression found after cleanup

- Cleanup correctly removed lower homepage scope, but the visual top shell needed a final layout repair.
- Header navigation could wrap into multiple rows on laptop/desktop widths.
- The hero/search stack needed to be explicitly vertical so the smart search command center stays full-width and readable.

### Header wrapping fix

- Header CSS was tightened so desktop/laptop keeps Brand | nav links | actions in one glass-pill row.
- Nav and action groups use internal horizontal overflow instead of expanding the header into multiple rows.
- Disabled preview-safe items remain compact and no new routes or auth pages were added.

### Hero/search vertical layout fix

- `HomePage2026HeaderHero` now renders compact hero intro first, the approved smart search full-width below it, then the minimal safety strip.
- The decorative side visual was removed from the rendered top shell so the search is no longer squeezed by a two-column hero layout.

### Smart search preserved

- No smart search state/autocomplete logic was rewritten.
- Controlled input, one-character suggestions, Arabic matching, suggestion grouping, hover/focus preview, click-to-fill, popular More handling and city/area dependency remain intact.

### Arabic/RTL status

- Header and top shell remain RTL-safe.
- Arabic title sizing remains compact.
- Arabic language switch continues to show `English`.

### Validation results

- `git status --short` — run during FIX08.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` confirmed top shell/search render and deferred lower-section markers remain absent.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page or lower homepage section files were changed in FIX08.

## 17. FIX09 — Restore search-first top layout

### Regression reason

- The previous layout repair still allowed the marketing hero to dominate the first viewport.
- Search was pushed down by a large centered headline, making the page feel less search-first and less like the approved command center presentation.

### Oversized hero removed

- The rendered oversized hero block was removed from the current top shell.
- The search component's compact badge/title/subtitle now acts as the search-first intro for this scoped PR.

### Search-first layout restored

- The top shell now renders the approved full-width `HomeSearch2026` command center first, followed by the compact safety strip.
- Search is not placed beside hero text and is not squeezed into a two-column grid.

### Approved smart search preserved

- `HomeSearch2026` state, autocomplete, one-character matching, Arabic normalization, suggestion grouping, hover/focus preview, click-to-fill behavior, popular More handling and city/area dependency were not changed.

### Header balance status

- Header CSS was tightened again for desktop/laptop balance.
- Brand, nav and actions remain in one glass-pill row with internal overflow available for tight widths.

### Arabic/RTL status

- Arabic top layout remains search-first and compact.
- Arabic search intro uses smaller line-height-aware sizing.
- Language switch behavior remains unchanged.

### Validation results

- `git status --short` — run during FIX09.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` confirmed search renders before the safety strip and deferred lower-section markers remain absent.

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic file was changed in FIX09.

## 18. FIX10 — Unified smart search card layout

### Problem fixed

- The approved smart search card visually read as split/two-column because the intro, command input, chips and location filters did not feel like one unified command center.
- Arabic felt busier because the intro and controls had too much competing horizontal structure.

### Unified vertical command-center layout

- The search card now uses a single vertical flow: compact badge/title/subtitle, full-width command input, content chips, provider chips, location row, popular suggestions and actions.
- The main input remains the strongest element inside the card and is not squeezed beside intro text.
- Suggestions are kept as a compact unified row/rail with the existing More behavior.

### Smart search behavior preserved

- `HomeSearch2026` search state, autocomplete, one-character matching, Arabic normalization, suggestion grouping, hover/focus preview, click-to-fill behavior, popular More handling and city/area dependency were not changed.

### City/area dependency preserved

- Country, city and area controls remain dependent and UI-only.
- Muscat, Sohar, Salalah, Seeb and Bawshar city-specific area behavior remains unchanged.
- Limited-data cities still fall back to `City-wide discovery` / `اكتشاف على مستوى المدينة`.

### Arabic/RTL status

- Arabic search intro uses the same vertical structure and avoids the previous split layout.
- Arabic title/subtitle remain compact and line-height-aware.
- Arabic autocomplete and chips remain RTL-safe.

### Validation results

- `git status --short` — run during FIX10.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` confirmed the search card renders, deferred lower-section markers remain absent and approved smart-search source markers remain present.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic was changed in FIX10.

### Remaining deferred sections

Ads / Featured Board, Care Stories, Categories, Areas, Featured Doctors, Featured Centers, Offers, Articles, Provider CTA and Footer redesign remain deferred.

## 19. FIX11 — Responsive QA and final visual polish

### Responsive QA summary

- Reviewed the scoped top-shell/search/header files after FIX10 and kept PR #157 limited to the homepage top shell and approved Smart Search Command Center.
- Added CSS-only responsive polish for desktop, laptop, tablet and mobile widths without adding JavaScript layout code, dependencies or new routes.
- Kept deferred lower homepage sections out of this PR.

### Visual polish summary

- Refined the search surface with a warmer premium glass background, softer border, controlled teal/gold ambient accents and a stronger but still lightweight shadow.
- Improved the command input focus treatment so it remains the dominant homepage action without increasing card height.

### Header / brand polish summary

- Polished the existing `DM` + `DrMuscat` brand presentation through scoped header CSS only.
- Improved mark sizing, spacing, alignment and contrast while preserving the single official header and existing header links/actions.

### Search card, chips, location and suggestions polish

- Strengthened selected chip states with a clear teal gradient and softened unselected chip surfaces.
- Preserved compact horizontal chip rails and popular suggestion More behavior.
- Polished Country / City / Area select controls so they read as premium discovery controls rather than raw admin fields.
- Kept the secondary bottom search action visually quieter so the main command-row Search button remains dominant.

### Arabic / RTL status

- Arabic search remains in the same unified vertical layout.
- RTL legend styling avoids uppercase/letter-spacing treatments that would look unnatural in Arabic.
- Arabic chips, selects and suggestion rails keep the existing overflow-safe behavior.

### Smart search behavior preserved

- `HomeSearch2026` state, autocomplete, one-character matching, Arabic normalization, suggestion scoring/grouping, hover/focus preview, click-to-fill, popular More handling, search preview and city/area dependency were not changed in FIX11.

### Validation results

- `git status --short` — run during FIX11 and showed only the scoped doc/CSS changes before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML and source checks passed for `/en/om`, `/ar/om`, deferred lower-section absence and approved smart-search markers.

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic was changed in FIX11.

### Remaining deferred sections

Ads / Featured Board, Care Stories, Categories, Areas, Featured Doctors, Featured Centers, Offers, Articles, Provider CTA and Footer redesign remain deferred.

### Merge-readiness recommendation

PR #157 is recommended to remain scoped as `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; future visual/product work should continue in `UI-K-HOME-2026-B — Featured Provider Board / Ads Board` or a dedicated header polish PR if a production logo asset is approved.

## 20. FIX12 — Language switch, mobile hamburger header and responsive safety

### Language switch status

- The header keeps the existing locale/country route structure and does not add new locales or routes.
- `/en/om` renders the language switch as `العربية` and points to `/ar/om`.
- `/ar/om` renders the language switch as `English` and points to `/en/om`.

### Mobile hamburger header status

- Narrow viewport header now shows the compact brand, the language switch and a real hamburger `<button>` instead of exposing the full desktop nav inline.
- The hamburger uses native popover behavior for a lightweight mobile menu, with no external library and no new dependency.
- The mobile menu contains the existing desktop destinations plus preview-safe pending/account items, reusing the same approved route helpers and disabled states.
- Desktop/laptop navigation remains visible and unchanged in behavior.

### Responsive safety status

- Mobile header CSS hides desktop nav links inline to prevent crowding and clipping.
- The mobile menu is constrained to the viewport, scrolls internally when needed and uses premium glass styling consistent with the top shell.
- Search component logic and approved search layout were not changed.

### Navigation translation deferred note

Full header navigation/i18n refinement remains deferred to a future header/navigation polish PR. FIX12 only guarantees the language-switch label/href correctness and mobile header safety required for PR #157.

### Validation results

- `git status --short` — run during FIX12 and showed only scoped header/CSS/report changes before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed after adding native popover attributes.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML/source checks passed for `/en/om`, `/ar/om`, language switch labels/hrefs, mobile menu markers, deferred lower-section absence and approved smart-search markers.

### Merge-readiness recommendation

PR #157 remains recommended as `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`. Lower homepage sections, footer redesign, full navigation/i18n polish and production logo work remain future PRs.

## 21. FIX13 — Hamburger icon polish and Arabic language switch hardening

### Arabic language switch fix

- Hardened `SiteHeader` locale detection by keeping the existing `x-drmuscat-locale` header and adding safe pathname-header fallbacks before defaulting to English.
- `/en/om` continues to render the language switch as `العربية` with `/ar/om` as the target.
- `/ar/om` now has a stronger server-side fallback path to render the language switch as `English` with `/en/om` as the target if the primary locale header is unavailable.
- No new locales, routes, route helpers or i18n config changes were added.

### Hamburger icon polish

- The existing mobile hamburger button behavior was preserved.
- The three strokes were made shorter, cleaner, centered and more compact with a dark teal color and softly rounded ends.
- No icon package, SVG asset or dependency was added.

### Validation results

- `git status --short` — run during FIX13 and showed only scoped header/CSS/report changes before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML/source checks passed for `/en/om`, `/ar/om`, language switch labels/hrefs, mobile menu markers, deferred lower-section absence and unchanged smart-search markers.

### Merge-readiness note

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; full navigation translation, production logo work and lower homepage sections remain future PRs.

## 22. FIX14 — Hard mobile menu close, hamburger icon and Arabic switch fix

### Arabic language switch fixed

- Kept the server-side `SiteHeader` locale resolution and added a tiny header-scoped browser sync as a hard fallback so `/ar/om` visibly resolves the language switch to `English` with `/en/om` as the target.
- `/en/om` continues to show `العربية` with `/ar/om` as the target.
- No new locale, route, route helper or i18n config was added.

### Mobile menu closes after nav click

- Mobile menu links and preview-safe menu items now carry a close marker.
- A small delegated header script calls the native popover `hidePopover()` when a marked mobile menu item is clicked, while preserving the link href navigation.
- Desktop navigation behavior is unchanged.

### Hamburger icon compacted

- The hamburger button now uses an explicit `dm2026-hamburger-icon` wrapper with three centered strokes.
- Stroke width, height and gap are constrained to compact premium dimensions and use the DrMuscat dark teal color.
- No external icon, SVG asset, dependency or image was added.

### Validation results

- `git status --short` — run during FIX14 and showed only scoped header/CSS/report changes before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML/source checks passed for `/en/om`, `/ar/om`, exact language switch labels/hrefs, mobile close markers, hamburger icon markers, deferred lower-section absence and unchanged smart-search markers.

### Manual QA results

- `/en/om` and `/ar/om` desktop/mobile language switch labels and hrefs were checked through built-page HTML/source validation.
- Mobile menu close behavior is implemented through the native popover close script and marked mobile menu items.
- Smart Search source markers remained unchanged.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic was changed in FIX14.

### Merge-readiness note

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; remaining navigation/i18n polish and lower homepage sections should proceed in future PRs.

## 23. FIX15 — Locale source fix for header language switch

### Root cause found

- `RootLayout`, `AppShell` and `SiteHeader` all depend on request headers for the active locale.
- The existing Next.js request-interception file is `src/proxy.ts`, which is the project middleware-equivalent in this Next 16 app.
- The previous proxy parsed everything after the locale as a single `country` value, which made nested localized routes unreliable and did not expose `x-drmuscat-country`.
- The header then had to rely on brittle fallbacks and a browser-side language-sync patch.

### Locale source fix

- Updated `src/proxy.ts` to parse the first path segment as locale and the second path segment as country.
- `/en/om...` now forwards `x-drmuscat-locale: en` and `x-drmuscat-country: om`.
- `/ar/om...` now forwards `x-drmuscat-locale: ar` and `x-drmuscat-country: om`.
- The proxy does not redirect or rewrite URLs for this fix.

### Header cleanup

- Removed the browser-side language-switch text/href sync from `SiteHeader` because the language switch should now be correct on first server render.
- Kept the small mobile-menu close script so clicking a marked mobile menu item closes the native popover.
- Smart Search was not touched.

### Language switch QA result

- `/en/om` renders the language switch as `العربية` with `/ar/om` as the target.
- `/ar/om` renders the language switch as `English` with `/en/om` as the target.

### Validation result

- `git status --short` — run during FIX15 and showed only scoped proxy/header/report changes before commit.
- `pnpm lint` — run during FIX15.
- `pnpm typecheck` — run during FIX15.
- `pnpm build` — run during FIX15.
- `pnpm routes:check` — run during FIX15.
- Built-page HTML/source checks were run for `/en/om`, `/ar/om`, exact language switch labels/hrefs, mobile close markers, deferred lower-section absence and unchanged smart-search markers.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic was changed in FIX15.

### Merge-readiness recommendation

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; the header locale source is now fixed at the request boundary and remaining navigation/i18n polish should continue in a future PR.

## 24. FIX15B — Root middleware locale header source

### Root cause found

- `RootLayout`, `AppShell` and `SiteHeader` depend on `x-drmuscat-locale` for the active global locale.
- There was no root `middleware.ts` or `src/middleware.ts` file setting this request header, while the header language switch depends on that value for correct first render.
- `/ar/om` could therefore still reach the global header as `en` when the request locale header was unavailable.

### Locale source fix

- Added root-level `middleware.ts` as the explicit locale header source requested for PR #157.
- The middleware parses pathname segments without redirecting, rewriting or changing URLs.
- `/en/om...` forwards `x-drmuscat-locale: en` and `x-drmuscat-country: om`.
- `/ar/om...` forwards `x-drmuscat-locale: ar` and `x-drmuscat-country: om`.
- No new locales, countries, route helpers, route config, sitemap or robots changes were added.

### Header status

- `SiteHeader` continues to derive the visible language switch from the resolved server locale.
- `/en/om` renders `العربية` targeting `/ar/om`.
- `/ar/om` renders `English` targeting `/en/om`.
- The accepted mobile menu close behavior and hamburger icon were not redesigned.

### Validation result

- `git status --short` showed only root `middleware.ts` and this completion report changed for FIX15B before commit.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm routes:check` passed during FIX15B.
- Built-page HTML/source checks for `/en/om` and `/ar/om` passed, confirming exact language switch labels/hrefs, mobile menu markers, Smart Search render marker, and absence of deferred lower-section markers.
- Forbidden-area checks passed and confirmed only this documentation file and root `middleware.ts` were changed in FIX15B.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file or search logic was changed in FIX15B.

### Merge-readiness recommendation

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; root middleware now provides the request locale header required by the global layout/header.

## 25. FIX16 — Next 16 proxy locale source and Vercel middleware build fix

### Vercel middleware build error root cause

- The FIX15B root-level `middleware.ts` activated the legacy middleware artifact path referenced by the Vercel failure: `.next/server/middleware.js.nft.json`.
- The project is on Next `16.2.7`, where the installed framework documentation and local build output support the `proxy.ts` convention for request-boundary work.
- Keeping root `middleware.ts` was therefore the likely source of the Vercel middleware packaging failure.

### Middleware removed / proxy added

- Removed root `middleware.ts` so the build no longer produces the failing middleware artifact path.
- Added root `proxy.ts` as the request-header source for the global layout/header locale.
- The proxy reads pathname segments and forwards `x-drmuscat-locale` for `en`/`ar` and `x-drmuscat-country` when the second segment exists.
- The proxy does not redirect, rewrite, change pathnames, add routes, add locales, change countries, or touch SEO files.

### Locale header behavior preserved

- `/en/om...` forwards `x-drmuscat-locale: en` and `x-drmuscat-country: om`.
- `/ar/om...` forwards `x-drmuscat-locale: ar` and `x-drmuscat-country: om`.
- `SiteHeader` continues to derive the language switch from the server locale header on first render.

### Language switch QA result

- `/en/om` renders `العربية` targeting `/ar/om`.
- `/ar/om` renders `English` targeting `/en/om`.
- Mobile menu behavior and hamburger styling were not redesigned in FIX16.
- Smart Search was not changed.

### Validation results

- `git status --short` showed only the scoped middleware removal, root proxy addition and completion-report update before commit.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm routes:check` passed during FIX16.
- Built-page checks for `/en/om` and `/ar/om` passed for exact language-switch labels/hrefs, mobile menu markers, Smart Search render marker and absence of deferred lower-section markers.
- Forbidden-area checks passed for database, Supabase, RLS, API, sitemap, robots, llms, package, lockfile, route-check, Smart Search, hero/search top shell, route page and lower-section files.

### Vercel deployment result

- A local production build passes with `proxy.ts` and without root `middleware.ts`.
- Live Vercel deployment execution is not available from this container, but the failing root middleware source has been removed and replaced with the Next 16 proxy convention.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, footer, route page, lower homepage section file, Smart Search file, search logic or homepage redesign file was changed in FIX16.

### Merge-readiness recommendation

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; the request locale source is now proxy-based for Next 16 build compatibility while preserving `/en/om` and `/ar/om` language-switch behavior.

## 26. FIX17 — Pathname-based visible language switch

### Root cause

- The visible header language switch was still tied to the server-resolved `safeLocale`, which can fall back to `en` if `x-drmuscat-locale` is unavailable or unreliable during deployment/static rendering.
- When that happened on `/ar/om`, the visible language switch could still render `العربية` instead of `English`.

### Client pathname language switch

- Added `HeaderLanguageSwitch` as a small client component dedicated to the visible language switch.
- The component uses `usePathname()` and derives the current locale from the actual browser pathname instead of request headers, proxy headers, `referer`, or `x-next-url` fallbacks.
- `/en/om` displays `العربية` and links to `/ar/om`.
- `/ar/om` displays `English` and links to `/en/om`.
- The switch intentionally uses the safe localized homepage target (`/{targetLocale}/{country}`) because preserving nested public discovery paths can require runtime Supabase configuration in local/preview environments.

### Scope preserved

- The desktop nav structure, mobile hamburger, mobile close-on-click behavior, proxy locale source, homepage top shell and Smart Search were not redesigned.
- Full root `<html lang>` / `dir` architecture cleanup remains deferred to `UI-K-I18N-ROOT-LAYOUT-A` if the global layout needs a future pathname-aware architecture pass.

### Validation results

- `git status --short` showed only the scoped header language-switch component, header import/render update and completion-report update before commit.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm routes:check` passed during FIX17.
- Built-page/source checks passed for `/en/om` and `/ar/om`, including visible language-switch labels/hrefs, mobile menu markers, Smart Search markers and absence of deferred lower-section markers.
- Forbidden-area checks passed for database, Supabase, RLS, API, sitemap, robots, llms, package, lockfile, proxy, route-check, Smart Search, hero/top shell, route page, style and lower-section files.

### Forbidden files untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, proxy, route-check, migration, footer, route page, lower homepage section file, Smart Search file, search logic or homepage redesign file was changed in FIX17.

### Merge-readiness recommendation

PR #157 remains scoped to `UI-K-HOME-2026-A — Premium Homepage Top Shell + Smart Search`; the visible language switch now derives from the actual pathname while the broader root layout locale architecture can be handled separately if needed.

## 27. Final pre-merge proxy convention check

### Proxy convention decision

- Next `16.2.7` recognizes both root `proxy.ts` and `src/proxy.ts`, but keeping both files is redundant for a single global request-bound locale header source.
- This repository keeps application code under `src/`, and `src/proxy.ts` already existed as the project proxy entry before the temporary root proxy workaround.
- The final pre-merge state therefore keeps only `src/proxy.ts` and removes the redundant root `proxy.ts`.
- `src/proxy.ts` now carries the accepted locale/country request-header behavior: parse pathname segments, forward `x-drmuscat-locale` for `en`/`ar`, forward `x-drmuscat-country` when present, and return `NextResponse.next` without redirects or rewrites.

### Scope preserved

- No UI, Smart Search, CSS, routes, database, Supabase, API, sitemap, robots, llms, package, lockfile or route-check files were changed in this final proxy convention cleanup.
- The visible language switch remains pathname-based through `HeaderLanguageSwitch`.

### Validation results

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm routes:check` passed after removing root `proxy.ts` and keeping `src/proxy.ts` as the single proxy source.
- Final merge readiness: ready from the proxy-convention perspective, with one Next 16 proxy entrypoint under `src/proxy.ts` and no duplicate root proxy file.
