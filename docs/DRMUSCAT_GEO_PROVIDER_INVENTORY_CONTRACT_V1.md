# DrMuscat Geo Provider Inventory Contract V1

## Purpose

Define the future provider inventory evidence required before Oman geo pages can be considered for index or sitemap promotion.

This is a contract-only phase. It does not query providers, does not touch the database, does not add provider listing UI, and does not make any geo route indexable. It only defines the inventory standards future runtime work must prove. This is the part where we write the rulebook before inviting chaos to the meeting.

## Contract source

```text
src/config/geo/provider-inventory-contract.ts
```

## Validation command

```bash
pnpm geo:provider-inventory:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Current state

```text
status: contract-only
currentInventoryEvidenceAvailable: false
providerQueryAllowed: false
databaseAccessAllowed: false
indexPromotionAllowed: false
sitemapPromotionAllowed: false
```

## Entity inventory thresholds

### Governorate pages

```text
minimumPublishedProviders: 12
```

### Wilayat pages

```text
minimumPublishedProviders: 6
```

### Area pages

```text
minimumPublishedProviders: 3
```

## Required future evidence

A future provider inventory PR must prove:

- published provider profiles exist
- provider counts meet the entity threshold
- inventory source is tested and deterministic
- provider data access is reviewed
- human review has approved promotion readiness

## Hard guardrails in this phase

```text
publishedProviderCount: 0
verifiedProviderCount: 0
acceptsAppointmentsCount: 0
providerQueryAllowed: false
databaseAccessAllowed: false
indexPromotionAllowed: false
sitemapPromotionAllowed: false
```

## Explicit non-goals

- No provider query is added
- No database access is added
- No provider listing UI is added
- No geo route becomes indexable
- No geo route becomes sitemap-eligible
- No JSON-LD is generated
- No generated JSON is committed

## Future implementation gate

A future runtime provider inventory PR may add safe provider counting only after it follows this contract, keeps noindex and sitemap exclusion intact, and passes CI.
