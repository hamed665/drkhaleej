# UI-K Brand 2026-A — Logo Foundation

## 1. Final Scope

This phase establishes a production-ready DrMuscat brand logo asset foundation for the existing public shell only. FIX01 keeps the implementation SVG-only: local SVG logo/favicon/app icon assets, the reusable logo component, current header/footer usage, and minimal Next.js SVG icon metadata declarations.

No database, Supabase, RLS, migrations, API routes, routing, sitemap, robots, `llms.txt`, package files, homepage sections, Search Hero, FAQ/Trust, WhatsApp support, schema, JSON-LD, or business features were changed.

## 2. Files Changed

- `src/components/brand/logo.tsx`
- `src/components/layout/site-header.tsx`
- `src/lib/seo/metadata.ts`
- `public/brand/drmuscat-logo-mark.svg`
- `public/brand/drmuscat-logo-lockup.svg`
- `public/brand/drmuscat-app-icon.svg`
- `public/favicon.svg`
- `docs/product/UI_K_BRAND_2026_A_LOGO_FOUNDATION.md`

## 3. Brand Direction Summary

The logo system follows the approved direction: a minimal premium D+M monogram, subtle healthcare plus detail, deep teal/emerald palette, compact discovery/trust feel, and rounded geometry for a softer healthcare hospitality tone. It avoids stock medical clichés, stethoscope/caduceus/heartbeat motifs, heavy local ornamentation, and Oman-specific symbols so the brand can remain globally scalable.

## 4. Logo Asset List

- `public/brand/drmuscat-logo-mark.svg` — primary compact SVG mark for header/footer UI usage.
- `public/brand/drmuscat-logo-lockup.svg` — complete SVG lockup reference asset with icon and wordmark.
- `public/brand/drmuscat-app-icon.svg` — square SVG app/favicon source asset.
- `public/favicon.svg` — stable square SVG favicon path.

FIX01 removed the raster/binary export pack from this PR: `public/brand/drmuscat-icon-192.png`, `public/brand/drmuscat-icon-512.png`, `public/apple-touch-icon.png`, and `public/favicon.ico`.

## 5. Header Usage

The existing reusable `Logo` component now renders the local SVG logo mark instead of the temporary `DM` placeholder text. The desktop header continues to use the full logo presentation with the DrMuscat wordmark and keeps the existing header height and layout contract.

## 6. Mobile Usage

The top mobile header continues to rely on the responsive existing header rules that hide the wordmark on very small screens. The mobile popover header uses the compact mark variant to reduce crowding around the close control and avoid horizontal overflow in English and Arabic layouts.

## 7. Footer Usage

The footer already consumed the reusable `Logo` component, so it receives the updated brand mark without changing footer structure, links, copy, or layout behavior.

## 8. Favicon/App Icon Implementation

Next.js metadata icon declarations now point only to stable local SVG paths for the favicon and mask-icon reference. Raster PNG, Apple touch icon, and ICO exports are deferred to avoid binary assets in this PR. The retained SVG favicon is square, local, crawlable, and representative of the new DrMuscat monogram system.

## 9. Google Favicon Readiness Notes

This PR makes DrMuscat eligible for SVG favicon discovery by exposing a stable square local SVG favicon through Next.js metadata conventions. Google may take days or weeks to recrawl favicon changes, and search-result favicon appearance is not guaranteed even when the implementation follows guidance. Raster favicon/app icons are intentionally deferred to a future binary asset export pack.

## 10. Intentionally Deferred

- Organization logo schema.
- WebSite schema.
- Social `sameAs` links.
- Open Graph image expansion.
- Raster PNG app icons.
- Apple touch icon PNG.
- ICO favicon fallback.
- Any structured data or JSON-LD.
- Any database-backed brand media management.

## 11. Validation Results

Validation commands for this phase:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`
- `pnpm seo:check`

Observed outcomes in this phase:

- `git status --short` showed only the planned SVG/code/documentation cleanup assets before commit.
- `pnpm lint` passed with pre-existing warnings in prototype/public detail files.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.
- `pnpm seo:check` passed.

## 12. Manual QA Notes

Manual QA checklist for preview review:

- `/` root redirect was verified by `curl -I http://127.0.0.1:3000/`, returning `308` with `location: /en/om`.
- `/en/om` response contains the new logo mark image path and icon metadata links.
- `/ar/om` response contains RTL markup and the same stable icon metadata links.
- SVG favicon/logo paths returned HTTP `200` locally for `/favicon.svg`, `/brand/drmuscat-app-icon.svg`, `/brand/drmuscat-logo-mark.svg`, and `/brand/drmuscat-logo-lockup.svg`.
- Removed binary paths returned HTTP `404` locally for `/favicon.ico`, `/apple-touch-icon.png`, `/brand/drmuscat-icon-192.png`, and `/brand/drmuscat-icon-512.png`.
- No added binary runtime assets remain after FIX01 cleanup; the retained brand assets are SVG/text/code/doc files.
- Browser screenshot capture was not available in this terminal-only environment; responsive visual checks should still be reviewed in the deployment preview.
- No generated presentation board image is used at runtime.
- No DB/API/Supabase/RLS/migration/schema/package changes were made.

## 13. FIX01 Summary

FIX01 converts the PR to an SVG-only brand foundation. The prior PNG and ICO files were removed from the branch so code review remains text/SVG based. The header, mobile menu, and footer continue to use the shared SVG logo component. The favicon decision is to keep `/favicon.svg` only for now and defer raster exports.

## 14. Next PR Recommendations

- `UI-K-BRAND-2026-B — Raster Icon Export Pack`
- `UI-K-SEO-2026-A — Structured Data Governance + Minimal WebSite/Organization Schema`
