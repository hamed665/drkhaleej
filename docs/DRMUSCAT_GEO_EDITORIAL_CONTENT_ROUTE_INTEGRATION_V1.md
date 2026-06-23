# DrMuscat Geo Editorial Content Route Integration V1

## Purpose

Wire the safe Oman geo editorial content accessor into the runtime geo route scaffold.

This PR connects the route layer to the editorial content accessor without adding any real editorial copy. The registry remains empty, so every route still renders the safe no-content state. In other words, the pipes are installed, but no one is pretending the water is flowing. Revolutionary discipline, apparently.

## Integrated routes

```text
/[locale]/[country]/oman/governorates/[governorateSlug]
/[locale]/[country]/oman/wilayats/[wilayatSlug]
/[locale]/[country]/oman/areas/[areaSlug]
```

## Runtime accessor

```text
src/lib/geo/oman-editorial-content.ts
```

The routes call:

```text
getOmanGeoEditorialContent({ entity, slug, locale })
```

and pass the result into:

```text
<OmanGeoRuntimeScaffold editorialContent={editorialContent} />
```

## Validation command

```bash
pnpm geo:editorial-content-route:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Current behavior

Because the editorial registry is still empty and disabled:

```text
editorialContent: null
registryEnabled: false
publishedContentCount: 0
```

The scaffold renders a safe empty editorial state instead of SEO copy.

## Safety guarantees

- Only published content can be returned by the accessor
- Only human-reviewed content can be returned by the accessor
- Route integration does not add sitemap behavior
- Route integration does not add JSON-LD behavior
- No geo page becomes indexable
- No provider query is added
- No database access is added

## Explicit non-goals

- No editorial content is added
- No draft editorial content is added
- No sitemap entries are added
- No JSON-LD is generated
- No generated JSON is committed
- No noindex guardrail is removed

## Future implementation gate

A later PR may add real localized content into the registry, but it must pass editorial content, editorial readiness, provider readiness, noindex, and sitemap exclusion guardrails first.
