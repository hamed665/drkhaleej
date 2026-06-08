# UI-K Routing 2026-A — Root Redirect Completion

## Scope

This scope correction replaces the prior out-of-scope FAQ, trust, and UI changes with a root route redirect only.

## Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform routing baseline correction
- Lock Scope: Route contract correction only
- Product Module: Public localized homepage routing
- Subphase ID: UI-K-ROUTING-2026-A

## Implemented Behavior

- `/` permanently redirects to `/en/om`.
- The redirect is implemented in the existing Next.js App Router structure with `src/app/page.tsx`.
- Localized home routes remain served by `src/app/[locale]/[country]/page.tsx`.

## Explicit Non-Changes

No changes were made to:

- `src/components/home/HomeFAQ2026.tsx`
- `src/components/home/HomeTrustSafety2026.tsx`
- `src/styles/dm2026-home.css`
- database files
- Supabase files
- migrations
- API routes
- sitemap, robots, llms, schema, or metadata files
- package files

## Validation Completed

Required validation commands completed:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Manual route checks completed against the production build on local port `3100`:

- `/` returned `308 Permanent Redirect` with `location: /en/om`
- `/en/om` returned `200 text/html; charset=utf-8`
- `/ar/om` returned `200 text/html; charset=utf-8`
