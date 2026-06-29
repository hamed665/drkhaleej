# DrKhaleej Public Surface Policy

## Purpose

This policy keeps the DrKhaleej soft-launch public surface small, reviewed, crawl-safe, and reversible.

## Source files

The public surface must stay aligned across:

- `src/lib/seo/page-registry.ts`
- `src/app/sitemap.ts`
- `src/lib/seo/metadata.ts`
- `src/app/robots.ts`
- `public/llms.txt`
- `docs/seo/DRKHALEEJ_ROUTE_INDEXABILITY_SNAPSHOT_V1.md`
- `docs/DRKHALEEJ_LOCATION_V2_STATUS.md`

If these files disagree, the safe result is noindex, sitemap-excluded, no JSON-LD, and no index-ready LLM declaration.

## Soft-launch public allowlist

The launch-core public pages are:

- country root
- doctors hub
- centers hub
- labs hub
- pharmacies hub
- hospitals hub
- services hub
- for-providers page

## Preview and utility pages

Search, filters, dental, beauty, offers, pet, articles, and location routes may exist for users or QA, but they are not launch-ready search landing pages in the soft-launch phase.

They must remain excluded from sitemap output unless a dedicated promotion PR changes that policy.

## Provider profile policy

Provider profile URLs may be public only through the existing reviewed publication guards and queue checks.

A public profile must have reviewed source evidence, reviewed timestamp, safe canonical path, Oman geo signal, and at least one safe public contact, website, map, or direction signal.

## Navigation policy

Primary navigation should promote only launch-core, user-ready routes.

Noindex, blocked, preview-only, or utility-only routes must not be presented as complete launch surfaces.

## Structured data policy

Noindex preview pages must not emit JSON-LD.

Schema output must never be broader than the visible reviewed page content.

Review, rating, hours, and availability schema remain blocked unless a dedicated promotion PR approves them.

## LLM-facing policy

`public/llms.txt` must list only launch-ready routes under index-ready routes and must keep preview routes separate.

## Review before limited public launch

Before limited public launch, review:

1. Primary navigation route list.
2. Sitemap output.
3. Robots output.
4. `llms.txt` route list.
5. Static route registry.
6. Route indexability snapshot.
7. Provider profile guards.
8. Public profile UI for QA-only fields.
9. Noindex preview JSON-LD absence.
10. Rollback plan.
