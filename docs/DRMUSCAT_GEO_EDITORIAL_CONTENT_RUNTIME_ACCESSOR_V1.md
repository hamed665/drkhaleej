# DrMuscat Geo Editorial Content Runtime Accessor V1

## Purpose

Add a safe runtime accessor layer for future Oman geo editorial content.

The accessor reads only from the editorial content registry and exposes only entries that are both published and human-reviewed. Since the registry is intentionally empty and disabled right now, every lookup returns `null` in this phase. This is boring, which is exactly what safety infrastructure should be. Excitement belongs in marketing decks, not content promotion guardrails.

## Accessor source

```text
src/lib/geo/oman-editorial-content.ts
```

## Validation command

```bash
pnpm geo:editorial-content-runtime:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Runtime behavior

The accessor exposes:

```text
listPublishedOmanGeoEditorialContent()
getOmanGeoEditorialContent(input)
getOmanGeoEditorialContentRuntimeState()
```

## Safety rules

The accessor must only return content where:

```text
status === 'published'
reviewedByHuman === true
```

If no content exists, lookup returns:

```text
null
```

## Current state

```text
registryEnabled: false
publishedContentCount: 0
hasPublishedContent: false
```

## Explicit non-goals

- No editorial copy is added
- No draft editorial copy is added
- No provider queries are added
- No database access is added
- No route becomes indexable
- No route becomes sitemap-eligible
- No JSON-LD is generated
- No generated JSON is committed

## Future implementation gate

A later route integration PR may use this accessor inside geo pages, but it must keep noindex and sitemap exclusion in place until editorial and provider readiness evidence exists.
