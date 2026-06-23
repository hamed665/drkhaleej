# DrMuscat Geo Provider Inventory Runtime Accessor V1

## Purpose

Add a safe runtime accessor layer for Oman geo provider inventory state.

The accessor reads only from the provider inventory contract and does not query providers, the database, Supabase, APIs, or any external source. It exposes the current contract-only state so future route work can depend on one stable accessor instead of inventing little provider-count rituals all over the codebase. Tiny mercy, honestly.

## Accessor source

```text
src/lib/geo/oman-provider-inventory.ts
```

## Validation command

```bash
pnpm geo:provider-inventory-runtime:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Runtime helpers

```text
listOmanGeoProviderInventoryContracts()
getOmanGeoProviderInventoryContract(input)
getOmanGeoProviderInventoryRuntimeState()
```

## Current runtime state

```text
hasRuntimeEvidence: false
providerQueryAllowed: false
databaseAccessAllowed: false
publishedProviderCount: 0
verifiedProviderCount: 0
acceptsAppointmentsCount: 0
indexPromotionAllowed: false
sitemapPromotionAllowed: false
```

## Safety guarantees

- No provider query is executed
- No database access is added
- No Supabase client is imported
- No provider listing UI is added
- No geo route becomes indexable
- No geo route becomes sitemap-eligible
- Runtime state is derived from contract counts only

## Explicit non-goals

- No provider data source
- No provider query
- No database access
- No provider cards
- No JSON-LD
- No generated JSON committed
- No removal of noindex guardrails

## Future implementation gate

A later PR may replace this contract-only accessor with a safe provider inventory data source only after the provider inventory contract, provider readiness contract, noindex guardrails, and sitemap exclusion guardrails all remain enforced.
