# DrMuscat Geo Sitemap Exclusion Guardrails V1

## Purpose

Prevent noindex Oman geo route scaffolds from being accidentally added to the sitemap.

The geo route pages currently have runtime pages and noindex metadata, but they do not yet have provider listings, index promotion rules, sitemap policy, or JSON-LD. Until those gates are approved, sitemap inclusion must remain blocked.

## Command

```bash
pnpm seo:geo:sitemap-exclusion
```

The command is also included in:

```bash
pnpm seo:check
```

## Guardrail behavior

The guardrail checks that:

- the geo route contract remains in `metadata-noindex` status
- `noindexEnabled` remains true
- `sitemapEnabled` remains false
- `src/app/sitemap.ts` does not include geo route path tokens
- `src/app/sitemap.ts` does not import the Oman geo registry
- `src/app/sitemap.ts` does not import the geo route contract

## Blocked sitemap route families

```text
/oman/governorates
/oman/wilayats
/oman/areas
```

## Why this matters

A noindex page in a sitemap sends mixed signals. The current strategy is to let the runtime scaffolds exist while keeping them out of public XML discovery until the pages have enough useful content to justify indexing.

## Explicit non-goals

- No sitemap entries
- No JSON-LD generation
- No provider queries
- No database migrations
- No generated JSON committed
- No index promotion rules

## Future promotion gate

Geo routes can be added to sitemap only after a future approved PR defines:

- provider/listing content availability
- index/noindex promotion rules
- canonical QA
- hreflang QA
- sitemap generation policy
- JSON-LD policy
