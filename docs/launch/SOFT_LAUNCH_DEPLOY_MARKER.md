# DrKhaleej Soft Launch Deploy Marker

## Status

Soft launch marker for the controlled DrKhaleej public surface.

Target date: `2026-06-30`

## Required checks

Before deployment, the target commit must have these checks completed successfully:

- DrKhaleej CI
- Noindex Preview Structured Data Guard
- Soft Launch Check
- Vercel preview

## Current soft-launch scope

Launch-core static public routes:

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

Preview and utility routes remain sitemap-excluded and noindex-controlled.

## Provider profile scope

Only guarded imported doctor, pharmacy, and hospital profile routes may be public when their existing guard and queue checks pass.

Imported lab and imported center profile sitemap entries remain out of the first soft-launch surface.

## Crawler-facing files

Review before deploy:

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`

Expected behavior:

- sitemap is allowlist-based
- preview routes are not sitemap-listed
- preview routes are not blocked in robots if they rely on page-level noindex
- llms index-ready route list matches the launch-core public surface

## Manual smoke list

Run manual smoke checks for:

- home English and Arabic
- doctors English and Arabic
- centers English and Arabic
- labs English and Arabic
- pharmacies English and Arabic
- hospitals English and Arabic
- services English and Arabic
- for-providers English and Arabic
- search route with a query in English and Arabic
- header primary nav
- mobile menu
- language switch
- footer links
- imported provider profile sample if a guarded eligible sample exists

## Go criteria

Deployment may proceed only when:

- CI and focused launch workflows are green
- Vercel preview is green
- primary navigation shows only launch-core route families
- preview routes remain sitemap-excluded
- noindex preview routes do not emit JSON-LD
- public imported provider profiles hide raw internal QA fields
- app shell does not create nested main landmarks
- rollback path in `docs/launch/SOFT_LAUNCH_2026_06_30.md` remains valid

## Stop criteria

Do not deploy if:

- CI fails
- Vercel preview fails
- sitemap includes search, preview, location, or unreviewed profile URLs
- preview pages emit JSON-LD
- `llms.txt` marks preview routes as index-ready
- provider profile UI exposes raw canonical path or raw internal score
- app shell creates nested main landmarks

## Post-deploy observation window

During the first 24 hours after soft launch, watch:

- 404s
- form submissions
- WhatsApp and call clicks
- sitemap accessibility
- robots accessibility
- `llms.txt` accessibility
- obvious mobile layout issues
- Search Console setup readiness

## Notes

This marker does not promote new routes and does not change runtime behavior. It records the deployment approval surface only.
