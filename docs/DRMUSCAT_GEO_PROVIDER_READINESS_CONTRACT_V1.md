# DrMuscat Geo Provider Readiness Contract V1

## Purpose

Define what must be true before Oman geo route pages can be considered ready for index promotion review.

This is still a contract-only phase. It does not query providers, does not touch the database, does not generate sitemap entries, and does not remove noindex. Humanity may be reckless, but this repository does not have to copy the habit.

## Contract source

```text
src/config/geo/provider-readiness-contract.ts
```

## Validation command

```bash
pnpm geo:provider-readiness:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Current readiness state

```text
currentRuntimeEvidenceAvailable: false
indexPromotionAllowed: false
sitemapPromotionAllowed: false
promotionRequiresRuntimeEvidence: true
promotionRequiresApprovedPr: true
```

## Entity readiness thresholds

### Governorate pages

```text
minimumPublishedProviders: 12
minimumEditorialWords: 120
```

### Wilayat pages

```text
minimumPublishedProviders: 6
minimumEditorialWords: 90
```

### Area pages

```text
minimumPublishedProviders: 3
minimumEditorialWords: 70
```

## Required checks before future promotion

Each entity family must prove:

- published provider inventory exists
- English editorial copy exists
- Arabic editorial copy exists
- canonical behavior has been reviewed
- hreflang behavior has been reviewed
- thin-page risk has been reviewed

## Explicit non-goals

- No provider queries
- No database access
- No route becomes indexable
- No route becomes sitemap-eligible
- No JSON-LD generation
- No generated JSON committed

## Future implementation gate

A future provider-readiness runtime PR may replace the static `currentRuntimeEvidenceAvailable: false` contract state only after it adds safe provider counting logic and tests.
