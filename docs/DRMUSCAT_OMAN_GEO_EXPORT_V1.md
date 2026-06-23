# DrMuscat Oman Geo Export V1

## Purpose

Export the static Oman geo registry into a machine-readable SEO data artifact for later approved local SEO and entity graph phases.

## Command

```bash
pnpm geo:export:oman
```

## Output

```text
data/seo/oman-geo-registry.json
```

## Scope

This export reads from:

```text
src/config/geo/oman.ts
```

It exports governorates, wilayats, areas, and summary counts.

## Explicit non-goals

- No runtime pages
- No dynamic routing
- No database migrations
- No provider data
- No reviews or ratings
- No sitemap, robots, llms.txt, metadata, JSON-LD, or schema changes
- No full Oman expansion yet
- No generated JSON committed in this PR
