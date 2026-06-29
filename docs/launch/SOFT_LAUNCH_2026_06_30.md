# DrKhaleej Soft Launch Checklist - 2026-06-30

## Purpose

This checklist defines the controlled soft-launch gate for DrKhaleej on `2026-06-30`.

Soft launch means public access with tight crawl control, reviewed launch-core routes, honest preview states, and a documented rollback path. It does not mean broad index promotion.

## Required merged PRs before soft launch

- Launch source-of-truth docs.
- App shell semantic cleanup.
- Primary navigation launch allowlist.
- Preview structured-data check.
- Sitemap, robots, `llms.txt`, and route snapshot review.
- Provider profile public UI cleanup.
- Final soft-launch gate marker.

## Static public allowlist

The following static URLs may be public launch-core routes:

- `/en/om`
- `/ar/om`
- `/en/om/doctors`
- `/ar/om/doctors`
- `/en/om/centers`
- `/ar/om/centers`
- `/en/om/labs`
- `/ar/om/labs`
- `/en/om/pharmacies`
- `/ar/om/pharmacies`
- `/en/om/hospitals`
- `/ar/om/hospitals`
- `/en/om/services`
- `/ar/om/services`
- `/en/om/for-providers`
- `/ar/om/for-providers`

## Preview and utility routes

These routes may exist for users or QA, but they must remain sitemap-excluded during soft launch:

- `/en/om/search`
- `/ar/om/search`
- `/en/om/dental`
- `/ar/om/dental`
- `/en/om/beauty`
- `/ar/om/beauty`
- `/en/om/offers`
- `/ar/om/offers`
- `/en/om/pet-clinics`
- `/ar/om/pet-clinics`
- `/en/om/pet-shops`
- `/ar/om/pet-shops`
- location pages
- article shell pages
- generated article pages

## Sitemap expectations

Sitemap output may include only:

- launch-core static URLs marked ready and sitemap eligible
- guarded imported provider profile URLs that pass all queue, source, canonical, geo, and contact/map checks

Sitemap output must not include:

- search/filter URLs
- preview routes
- location pages
- location/category composite pages
- article shell pages
- unreviewed provider profiles
- imported lab profiles
- imported center profiles

## Robots expectations

`robots.txt` must:

- reference `/sitemap.xml`
- block internal or operational surfaces already covered by `src/app/robots.ts`
- not block preview routes that rely on page-level `noindex` metadata

## Metadata expectations

Every launch-core route must have:

- localized metadata
- canonical URL
- hreflang alternates
- safe public-discovery description

Every preview or utility route must have:

- `noindex, follow`
- no sitemap eligibility
- no public claim that it is complete or authoritative

## LLM-facing expectations

`public/llms.txt` must:

- list only launch-core routes under index-ready routes
- list preview routes separately
- state that provider details are directory facts only
- avoid unsupported ranking, verification, availability, or public authority claims

## Structured-data expectations

Before soft launch:

- noindex preview routes must not emit JSON-LD
- provider schema must remain disabled unless a dedicated schema promotion PR approves it
- review, rating, hours, and availability schema remain blocked unless a dedicated promotion PR approves them

## Provider profile expectations

A public imported provider profile may render only if:

- route guard returns the profile
- import queue marks the URL eligible
- candidate is approved
- source evidence exists
- reviewed timestamp exists
- Oman geo signal exists
- contact, website, map, or direction signal exists
- canonical path is exact

Public UI must not expose QA-only fields such as raw canonical paths or raw internal scoring.

## Mobile QA checklist

Check these on mobile width before soft launch:

- home first fold
- header menu open and close
- language switch
- search form layout
- category hub layout
- provider CTA
- footer
- Arabic RTL layout
- WhatsApp floating action if enabled

## Smoke URL list

Use these routes for manual smoke checks:

- `/en/om`
- `/ar/om`
- `/en/om/doctors`
- `/ar/om/doctors`
- `/en/om/pharmacies`
- `/ar/om/pharmacies`
- `/en/om/hospitals`
- `/ar/om/hospitals`
- `/en/om/services`
- `/ar/om/services`
- `/en/om/for-providers`
- `/ar/om/for-providers`
- `/en/om/search?q=pharmacy`
- `/ar/om/search?q=صيدلية`

## CI checklist

Required before soft launch approval:

- Vercel preview is successful.
- GitHub Actions main CI is successful.
- Any focused launch guard workflow is successful.
- No open PR changes route/index behavior without review.

Expected commands inside CI:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm build`
- `pnpm routes:check`
- `pnpm env:check`
- `pnpm geo:check:oman`
- `pnpm seo:check`

## Rollback plan

If the soft launch exposes an unsafe public surface:

1. Remove affected URL family from sitemap eligibility.
2. Keep user-safe public routes available with noindex metadata when possible.
3. Revert imported provider queue rows away from `index_eligible`, `index`, and `included` for affected entries.
4. Keep candidate data available for review instead of deleting it.
5. Submit updated sitemap after the rollback is deployed.
6. Re-check `robots.txt`, `sitemap.xml`, `llms.txt`, and route snapshot.
7. Record the rollback reason and affected route family in this document or a follow-up launch note.

## Go decision

Soft launch may proceed only when:

- launch-core routes pass smoke checks
- preview routes remain sitemap-excluded
- preview routes do not emit JSON-LD
- primary navigation promotes only launch-core surfaces
- provider profile routes remain guarded
- location pages remain noindex and sitemap-excluded
- `llms.txt`, sitemap, robots, and route registry agree
- rollback path is documented

## No-go decision

Soft launch must stop if:

- CI fails
- sitemap includes preview, search, location, or unreviewed provider URLs
- preview pages emit JSON-LD
- provider profiles expose QA-only fields
- primary navigation promotes preview-only surfaces as launch-core routes
- `llms.txt` declares preview routes as index-ready
- rollback steps are unclear
