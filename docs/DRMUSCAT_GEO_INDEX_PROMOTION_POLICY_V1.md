# DrMuscat Geo Index Promotion Policy V1

## Purpose

Define the rules that must be satisfied before any Oman geo route can move from noindex runtime scaffold to indexable SEO landing page.

Runtime route files already exist for governorates, wilayats, and areas. They also have noindex metadata and sitemap exclusion guardrails. This policy prevents accidental promotion before the pages have enough real content to deserve search indexing.

## Current status

```text
blocked-until-content-ready
```

No Oman geo route is indexable yet.

## Policy source

```text
src/config/geo/index-promotion-policy.ts
```

## Entity policies

### Governorate pages

Minimum readiness before index review:

```text
minimumPublishedProviders: 12
minimumEditorialWords: 120
```

### Wilayat pages

Minimum readiness before index review:

```text
minimumPublishedProviders: 6
minimumEditorialWords: 90
```

### Area pages

Minimum readiness before index review:

```text
minimumPublishedProviders: 3
minimumEditorialWords: 70
```

## Required promotion checks

Before any geo page family becomes indexable, a separate approved PR must prove:

- published provider or listing inventory exists
- localized English and Arabic editorial copy exists
- canonical and hreflang behavior has been reviewed
- thin-page risk has been reviewed
- sitemap inclusion policy has been approved

## Current hard guardrails

```text
noindexRequiredByDefault: true
sitemapAllowedByDefault: false
jsonLdAllowedByDefault: false
promotionRequiresApprovedPr: true
```

## Explicit non-goals

- No route becomes indexable in this PR
- No sitemap entries are added
- No JSON-LD is added
- No provider query is added
- No database migration is added
- No generated JSON is committed

## Future promotion PR

A future promotion PR may change a geo page family from blocked to eligible only after content readiness can be tested automatically.
