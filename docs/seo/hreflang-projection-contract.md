# Hreflang Projection Contract

Status: canonical hreflang projection contract.
Scope: documentation and validation only.
Build mode: canonical-first, locale-pair-safe, noindex-suppressed.

## Purpose

DrKhaleej must emit hreflang only for canonical, public-safe, locale-paired pages. Hreflang must not be guessed from route strings, search queries, imported metadata, or pages that are noindex.

This contract keeps English, Arabic, and x-default alternates consistent before page payloads, sitemap entries, and index promotion consume them.

## Supported locales

The initial supported public locale set is:

```text
en-OM
ar-OM
x-default
```

`x-default` should point to the canonical English Oman URL unless a later contract changes the default.

## Projection input requirements

A page may receive hreflang projection only when it has:

```text
pageType
entityType
entityId
locale
country
canonicalPath
publicRouteEnabled
publicSafe
indexable
pairedLocaleCanonicalPath
pairedLocalePublicSafe
pairedLocaleRouteEnabled
```

## Projection rules

The projection must return null when:

```text
canonical is null
publicRouteEnabled is false
publicSafe is false
page is noindex
paired locale is missing
paired locale is not public-safe
paired locale route is disabled
country is not om
locale is unsupported
```

## Sitemap hreflang rules

Sitemap hreflang must be suppressed when:

```text
page is noindex
canonical is null
paired locale is missing
paired locale is noindex
page is blocked by imported hospital release blockers
```

## HTML head rules

HTML alternate links may only be rendered from this projection, not directly from components.

Each valid projection must include:

```text
self alternate
paired locale alternate
x-default alternate
```

## Imported hospital rule

Imported hospital hreflang remains blocked until:

```text
imported hospital release blockers pass
canonical resolver is enabled
internal link coverage exists
sitemap eligibility passes
page payload projection is used
shared card view model is used
first indexable batch is complete
```

## Non-goals

This contract does not add or change:

- runtime HTML head output
- sitemap XML output
- public routes
- page payloads
- internal links
- imported hospital release
- database schema
