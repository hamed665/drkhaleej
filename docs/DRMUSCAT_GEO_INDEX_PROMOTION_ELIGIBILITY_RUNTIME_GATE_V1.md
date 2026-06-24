# DrMuscat Geo Index Promotion Eligibility Runtime Gate V1

## Purpose

Add a single runtime gate that determines whether an Oman geo page is eligible for future index promotion.

The current answer is always blocked. This is intentional. Provider inventory evidence, localized editorial content, QA review, sitemap policy review, and an approved promotion PR do not exist yet. The gate exists so future implementation work has one obvious place to prove readiness instead of scattering magical optimism across route files.

## Gate source

```text
src/lib/geo/oman-index-promotion-eligibility.ts
```

## Validation command

```bash
pnpm geo:index-promotion-eligibility:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Runtime helpers

```text
getOmanGeoIndexPromotionPolicy(entity)
getOmanGeoIndexPromotionEligibility(input)
```

## Current eligibility output

```text
status: blocked-until-content-ready
eligibleForIndexPromotion: false
noindexRequired: true
sitemapAllowed: false
jsonLdAllowed: false
```

## Evidence sources checked

The gate reads:

```text
OMAN_GEO_INDEX_PROMOTION_POLICIES
getOmanGeoProviderInventoryContract()
getOmanGeoProviderInventoryRuntimeState()
getOmanGeoEditorialContent()
getOmanGeoEditorialContentRuntimeState()
```

## Current block reasons

```text
provider-inventory-runtime-evidence-unavailable
provider-inventory-threshold-not-met
published-editorial-content-unavailable
localized-editorial-content-missing
```

## Safety guarantees

- No noindex guardrail is removed
- No sitemap promotion is allowed
- No JSON-LD is allowed
- No provider query is added
- No database access is added
- No route becomes indexable
- No generated JSON is committed

## Explicit non-goals

- No index promotion
- No sitemap inclusion
- No JSON-LD generation
- No provider query
- No database access
- No editorial content creation
- No provider card UI

## Future implementation gate

A later PR may make a page eligible for review only after provider inventory, localized editorial content, canonical/hreflang QA, thin-page review, sitemap policy review, and approved promotion PR evidence all exist.
