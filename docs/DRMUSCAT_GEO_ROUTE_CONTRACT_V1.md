# DrMuscat Geo Route Contract V1

## Purpose

Define and guard the runtime route scaffold for Oman geo discovery.

This contract now allows runtime route files and controlled metadata generation for governorate, wilayat, and area discovery pages while keeping all geo pages noindex until provider listings and SEO content are ready.

## Status

```text
metadata-noindex
```

Runtime route files are enabled. Metadata is enabled only with noindex guardrails.

## Canonical source

The canonical geo registry remains:

```text
src/config/geo/oman.ts
```

The route contract lives in:

```text
src/config/geo/route-contract.ts
```

The shared runtime scaffold component lives in:

```text
src/components/geo/oman-geo-runtime-scaffold.tsx
```

The metadata guardrail helper lives in:

```text
src/lib/seo/geo-route-metadata.ts
```

## Runtime route templates

The route scaffold follows the existing DrMuscat locale/country structure:

```text
/[locale]/[country]/...
```

### Governorates

```text
/[locale]/[country]/oman/governorates/[governorateSlug]
```

### Wilayats

```text
/[locale]/[country]/oman/wilayats/[wilayatSlug]
```

### Areas

```text
/[locale]/[country]/oman/areas/[areaSlug]
```

Supported route params remain limited to:

```text
locale: en | ar
country: om
```

## Metadata policy

Geo route metadata is enabled with noindex guardrails:

```text
robots.index = false
robots.follow = true
googleBot.index = false
googleBot.follow = true
```

This means the pages can render and expose safe titles/descriptions, but they are not treated as indexable SEO landing pages yet.

## Validation command

```bash
pnpm geo:routes:validate
```

The validator checks that:

- The contract is in `metadata-noindex` status.
- Runtime route files exist.
- Metadata exists on each route file.
- The noindex metadata helper is used.
- Sitemap remains disabled.
- JSON-LD remains disabled.
- The route files guard invalid params with `notFound()`.

## Implementation gates still pending

Future SEO route work must be done in separate approved PRs and must include:

- index/noindex promotion rules
- provider listing behavior
- empty state behavior
- hreflang QA
- canonical QA
- sitemap behavior
- JSON-LD behavior

## Explicit non-goals

- No sitemap entries
- No JSON-LD generation
- No provider queries
- No database migrations
- No generated JSON committed
- No claim that thin pages are indexable yet
