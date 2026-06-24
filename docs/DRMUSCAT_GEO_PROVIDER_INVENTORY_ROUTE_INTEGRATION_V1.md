# DrMuscat Geo Provider Inventory Route Integration V1

## Purpose

Wire the safe Oman geo provider inventory accessor into the runtime geo route scaffold.

This PR exposes provider inventory state on the geo runtime pages without adding provider queries, database access, provider cards, sitemap entries, JSON-LD, or index promotion. The current inventory state still comes only from the contract, so the pages show a safe contract-only inventory status. Thrilling? No. Correct? Yes. The bar for civilization remains low but visible.

## Integrated routes

```text
/[locale]/[country]/oman/governorates/[governorateSlug]
/[locale]/[country]/oman/wilayats/[wilayatSlug]
/[locale]/[country]/oman/areas/[areaSlug]
```

## Runtime accessor

```text
src/lib/geo/oman-provider-inventory.ts
```

The routes call:

```text
getOmanGeoProviderInventoryContract({ entity })
```

and pass the result into:

```text
<OmanGeoRuntimeScaffold providerInventory={providerInventory} />
```

## Validation command

```bash
pnpm geo:provider-inventory-route:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Current behavior

The pages expose contract-only inventory state:

```text
status: contract-only
publishedProviderCount: 0
providerQueryAllowed: false
databaseAccessAllowed: false
indexPromotionAllowed: false
sitemapPromotionAllowed: false
```

## Safety guarantees

- No provider query is executed
- No database access is added
- No provider listing UI is added
- Route integration does not add sitemap behavior
- Route integration does not add JSON-LD behavior
- No noindex guardrail is removed
- Inventory state is contract-only

## Explicit non-goals

- No provider cards
- No provider query
- No database access
- No index promotion
- No sitemap entries
- No JSON-LD
- No generated JSON committed

## Future implementation gate

A later provider inventory UI or data-source PR may add real provider inventory only after provider inventory, provider readiness, editorial readiness, noindex, and sitemap exclusion guardrails all remain enforced.
