# UI-K-NEW-PUBLIC-B — Homepage 2026 Implementation Report

## Phase identity

- **Task ID:** `UI-K-NEW-PUBLIC-B`
- **Mode:** `PHASED_BUILD_ONLY`
- **Execution Phase:** Phase 3 public SEO platform frontend refinement
- **Lock Scope:** Homepage route only plus isolated `public-2026` component tree
- **Product Module:** Public homepage UI
- **Subphase ID:** `UI-K-NEW-PUBLIC-B`

## Files read

- `AGENTS.md`
- `README.md`
- `docs/project-state/CURRENT_STATE.md`
- `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`
- `docs/master-spec/58_CODEX_PHASED_BUILD_MASTER_PLAN.md`
- `docs/master-spec/66_PHASE_LOCKS_AND_ALLOWED_FILE_CHANGES.md`
- `docs/master-spec/08_IMPLEMENTATION_TASKS_AND_PHASES.md`
- `docs/master-spec/67_DATABASE_MIGRATION_PROTOCOL.md`
- `docs/master-spec/68_TESTING_AND_VALIDATION_GATE.md`
- `docs/master-spec/69_ERROR_HANDLING_AND_STOP_RULES.md`
- `docs/master-spec/70_AGENT_OUTPUT_REPORT_TEMPLATE.md`
- `docs/master-spec/72_SECURITY_RLS_AND_SECRET_HANDLING_PROTOCOL.md`
- `docs/master-spec/73_SEO_BUILD_VALIDATION_PROTOCOL.md`
- `docs/master-spec/76_HUMAN_APPROVAL_CHECKPOINTS.md`
- `docs/addendums/V10_5_BUSINESS_GROWTH_REVENUE_ADDENDUM.md`
- `docs/addendums/V10_5_SEO_AI_SEARCH_EXPANSION_ADDENDUM.md`
- `docs/addendums/V10_5_MONETIZATION_SALES_REFERRAL_ADDENDUM.md`
- `docs/product/UI_K_DESIGN_REFERENCE_IMPORT_A.md`
- `docs/product/UI_K_ALIGN_B_TOKEN_TYPOGRAPHY.md`
- `src/app/[locale]/[country]/page.tsx`
- `src/app/layout.tsx`
- `src/components/home/home-hero.tsx`
- `src/components/home/home-category-preview.tsx`
- `src/components/home/home-trust-strip.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/styles/globals.css`
- `package.json`

## Files changed

- `src/app/[locale]/[country]/page.tsx`
- `src/components/public-2026/home/HomePage2026.tsx`
- `src/components/public-2026/home/HomeCopy2026.ts`
- `src/components/public-2026/home/HomeHeroSearch2026.tsx`
- `src/components/public-2026/home/HomeTrustBar2026.tsx`
- `src/components/public-2026/search/SearchHero2026.tsx`
- `src/components/public-2026/search/SearchQuickLinks2026.tsx`
- `src/components/public-2026/search/LocationSelect2026.tsx`
- `src/components/public-2026/sections/FeaturedProviders2026.tsx`
- `src/components/public-2026/sections/BrowseCategories2026.tsx`
- `src/components/public-2026/sections/BrowseAreas2026.tsx`
- `src/components/public-2026/sections/HomeArticles2026.tsx`
- `src/components/public-2026/sections/FaqSection2026.tsx`
- `src/components/public-2026/sections/TrustAndSafety2026.tsx`
- `src/components/public-2026/sections/PublicDisclaimer2026.tsx`
- `src/components/public-2026/cards/CategoryCard2026.tsx`
- `src/components/public-2026/cards/AreaCard2026.tsx`
- `src/components/public-2026/cards/ArticleCard2026.tsx`
- `src/components/public-2026/cards/ProviderPreviewCard2026.tsx`
- `src/components/public-2026/ui/Button2026.tsx`
- `src/components/public-2026/ui/Badge2026.tsx`
- `src/components/public-2026/ui/Card2026.tsx`
- `src/components/public-2026/ui/Container2026.tsx`
- `src/components/public-2026/ui/SectionHeader2026.tsx`
- `docs/product/UI_K_NEW_PUBLIC_B_HOMEPAGE_2026.md`

## Old homepage components disconnected

The homepage route no longer imports or renders:

- `HomeHero`
- `HomeCategoryPreview`
- `HomeTrustStrip`

Those legacy components were not edited. They remain available for any other existing references but are disconnected from the `/[locale]/[country]` homepage route.

## New public-2026 components added

A new isolated `src/components/public-2026/` tree was added for the 2026 homepage direction. The tree contains typed home, search, section, card, and small UI primitives. The visible homepage is search-first, keeps articles lower on the page, and uses honest preview/coming-soon copy instead of fake ratings, review counts, provider counts, or medical claims.

## Route switch details

`src/app/[locale]/[country]/page.tsx` now preserves:

- `generateMetadata`
- supported locale/country validation
- `notFound()` behavior for unsupported params
- the existing canonical URL format

Only the rendered homepage tree was replaced with `HomePage2026`.

## SEO safety confirmation

- No sitemap file was changed.
- No robots file was changed.
- No `public/llms.txt` file was changed.
- No new public route files or URL patterns were added.
- Homepage metadata behavior and canonical path format were preserved.
- No schema.org markup was added.

## Backend, database, Supabase, and RLS confirmation

No backend, API route, auth, payment, Supabase, migration, generated type, seed, or RLS files were changed. The search and location controls are UI-only and do not call backend search, geolocation, Supabase, or APIs.

## Limitations

- Search input, suggestion groups, country/city/area selection, featured providers, and article cards are UI-only placeholders.
- Oman is active in the selector; UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, and Iran are shown as coming soon.
- Area options depend on the selected Oman city in the UI only.
- Existing site header and footer remain in place because this phase is homepage-only.

## Next recommended phase

`UI-K-NEW-PUBLIC-C — Public header/footer replacement or homepage shell refinement`

## FIX01 correction notes

`UI-K-NEW-PUBLIC-B-FIX01` corrected the first 2026 homepage implementation to better match the Claude Design reference while keeping production guardrails:

- Header localization was corrected so English shows `DrMuscat` and Arabic shows `دكتور مسقط` as the visible primary wordmark.
- Header navigation labels are locale-specific and compact in both English and Arabic.
- Footer was adjusted to a dark premium, bilingual-safe structure with Discover, For Providers, Support, and About columns, without adding unapproved route files.
- Homepage typography and `dm2026-*` styling were refined with project tokens and local font stacks only; no remote font loading or package changes were introduced.
- The search hero was strengthened to a large central Claude-style rounded card with dominant search input, clean selectors, chips, and grouped suggestions.
- The location selector now uses strict Country → City → Area behavior, with Oman active and other countries marked coming soon.
- Featured preview cards now show visible View profile, WhatsApp, Call, and Directions action UI without inventing real phone numbers, WhatsApp links, ratings, reviews, or provider counts.
- Category, area, and article cards were made more polished and public-safe while routing only to existing approved discovery routes.

No backend, database, Supabase, RLS, sitemap, robots, llms, route-check, package, lockfile, or generated database type files were changed in FIX01.

## FIX02 homepage visual and interaction cleanup

`UI-K-NEW-PUBLIC-B-FIX02` patched the existing 2026 homepage implementation without rebuilding it from scratch:

- Confirmed and preserved Arabic header localization with Arabic navigation labels and `دكتور مسقط` as the Arabic wordmark.
- Strengthened the search-first hero with a larger central search card, taller query input and CTA, compact location selector, quick chips, and grouped suggestions.
- Added a frontend-only featured centers/providers carousel below the hero search and before category grids, with sample cards, previous/next controls, dot indicators, auto-advance, hover/focus pause, and RTL/LTR-safe behavior.
- Tightened the Country → City → Area hierarchy in the homepage location selector so Oman cities remain city-only and Muscat areas remain area-only.
- Replaced inert floating WhatsApp/AI buttons with frontend-only interactive panels: a WhatsApp support preview panel and an AI assistant preview drawer with no backend/API calls.
- Polished category cards, carousel cards, floating panels, and RTL typography with scoped `dm2026-*` CSS only.

No database, Supabase, RLS, backend API, auth backend, payment backend, sitemap, robots, `llms.txt`, package, lockfile, or route-check files were changed in FIX02.

## UI-K-ALIGN-FIX-PUBLIC-PAGES-BLOCKERS-A notes

- Added a route-preserving frontend language switch so Arabic pages expose an English switch and English pages expose العربية while keeping the same locale/country route where available.
- Expanded the localized public header/footer links to include Articles, Sign in, Create account/Register, List your center, and For Providers without changing sitemap, robots, llms.txt, or route-check guardrails.
- Added frontend-only approved public pages for Articles, article detail, Sign in, Register, and List your center. These pages are UI placeholders only and do not connect to auth, AI, payment, Supabase, database, or API logic.
- Centralized the 2026 Country → City → Area data used by homepage/search/listing/register UI. Oman remains active, coming-soon countries are visible but disabled, city dropdowns contain only the approved Oman cities, and areas depend on the selected city.
- Confirmed the homepage featured centers carousel and floating WhatsApp/AI UI remain in the isolated public-2026 tree and are not backend-connected.
