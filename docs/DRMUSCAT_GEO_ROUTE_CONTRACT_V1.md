# DrMuscat Geo Route Contract V1

## Purpose

Define the planned route shapes for Oman geo discovery before any runtime routes are implemented.

This contract is intentionally static. It allows DrMuscat to agree on URL shape, locale handling, entity hierarchy, and future SEO expectations without creating Next.js route files yet.

## Status

```text
planned-only
```

Runtime routes are not enabled by this PR.

## Canonical source

The canonical geo registry remains:

```text
src/config/geo/oman.ts
```

The route contract lives in:

```text
src/config/geo/route-contract.ts
```

## Planned route templates

### Governorates

```text
/en-om/oman/governorates/[governorateSlug]
/ar-om/oman/governorates/[governorateSlug]
```

### Wilayats

```text
/en-om/oman/wilayats/[wilayatSlug]
/ar-om/oman/wilayats/[wilayatSlug]
```

### Areas

```text
/en-om/oman/areas/[areaSlug]
/ar-om/oman/areas/[areaSlug]
```

## Validation command

```bash
pnpm geo:routes:validate
```

The validator checks that:

- The contract remains planned-only.
- Runtime routes remain disabled.
- All six English/Arabic route templates exist.
- Route names are unique.
- The contract can see the current Oman geo registry counts.

## Implementation gates

Future runtime route work must be done in a separate approved PR and must include:

- Next.js route files
- metadata behavior
- hreflang behavior
- canonical behavior
- sitemap behavior
- empty state behavior
- noindex/index policy for thin pages

## Explicit non-goals

- No Next.js route files
- No runtime pages
- No sitemap entries
- No metadata generation
- No JSON-LD generation
- No provider queries
- No database migrations
- No generated JSON committed
