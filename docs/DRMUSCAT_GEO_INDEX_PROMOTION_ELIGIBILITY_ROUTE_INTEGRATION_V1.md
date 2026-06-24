# DrMuscat Geo Index Promotion Eligibility Route Integration V1

## Purpose

Wire the Oman geo index promotion eligibility gate into the runtime geo routes and scaffold.

This PR does not make any page indexable. It only exposes the central eligibility state in the runtime scaffold so QA and future implementation work can see why a geo page remains blocked.

## Integrated routes

```text
/[locale]/[country]/oman/governorates/[governorateSlug]
/[locale]/[country]/oman/wilayats/[wilayatSlug]
/[locale]/[country]/oman/areas/[areaSlug]
```

## Runtime gate

```text
src/lib/geo/oman-index-promotion-eligibility.ts
```

The routes call:

```text
getOmanGeoIndexPromotionEligibility({ entity, slug, locale })
```

and pass the result into:

```text
<OmanGeoRuntimeScaffold indexPromotionEligibility={indexPromotionEligibility} />
```

## Validation command

```bash
pnpm geo:index-promotion-route:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Current runtime display

The scaffold displays:

```text
eligibleForIndexPromotion: false
noindexRequired: true
sitemapAllowed: false
jsonLdAllowed: false
status: blocked-until-content-ready
blockedReasons: [...]
```

## Safety guarantees

- No noindex guardrail is removed
- No sitemap inclusion is added
- No JSON-LD is generated
- No provider query is added
- No database access is added
- No provider cards are added
- No index promotion is enabled

## Explicit non-goals

- No metadata promotion
- No route becomes indexable
- No sitemap entry is added
- No JSON-LD generation
- No provider query
- No database access
- No generated JSON committed

## Future implementation gate

A later PR may use this eligibility gate to support promotion review only after provider inventory evidence, localized editorial content, canonical and hreflang QA, thin-page review, sitemap policy review, and an approved promotion PR exist.
