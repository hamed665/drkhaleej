# Imported Hospital Route Hold Removal

Status: release blocker alignment.
Scope: documentation only.

## Purpose

Imported hospital public detail must remain closed until the SEO/Geo release blockers pass.

The safest current posture is no public hospital detail route, rather than a noindex hold route. A missing route cannot accidentally gain metadata, links, sitemap exposure, or structured data.

## Current policy

The public hospital hub may exist.

The public hospital detail route must not exist until controlled release:

```text
src/app/[locale]/[country]/hospitals/[slug]/page.tsx
```

## Release dependency

Hospital detail can return only after:

```text
canonical resolver enabled
internal link coverage exists
hreflang projection ready
sitemap eligibility gate passes
page payload projection used
shared provider card view model used
first indexable batch complete
```

## Non-goals

This note does not add:

- hospital public detail
- sitemap entries
- JSON-LD
- runtime profile rendering
- import write/publish behavior
