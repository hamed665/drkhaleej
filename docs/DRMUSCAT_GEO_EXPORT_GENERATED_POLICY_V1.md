# DrMuscat Geo Export Generated Artifact Policy V1

## Purpose

Define how DrMuscat handles generated geo export artifacts so the repository stays clean and reproducible.

## Canonical source

The canonical Oman geo registry source is:

```text
src/config/geo/oman.ts
```

Generated export files must be treated as derived artifacts, not source of truth.

## Current export command

```bash
pnpm geo:export:oman
```

This command writes:

```text
data/seo/oman-geo-registry.json
```

## Git policy

Generated JSON exports under `data/seo/` are ignored by git.

The repository should commit:

- Source registry files
- Export scripts
- Documentation
- Directory markers such as `.gitkeep`
- Directory README files

The repository should not commit:

- Timestamped generated JSON
- Locally refreshed export artifacts
- CI-generated JSON output

## Why generated JSON is ignored

The export includes a `generatedAt` timestamp. Committing it would create noisy diffs every time the export runs, which is how repositories slowly become junk drawers with commit history attached.

## Future exception process

A generated JSON file may be committed only if a future approved PR explicitly changes this policy and explains why the artifact needs to be versioned.

## Non-goals

- No runtime routes
- No database migrations
- No provider data
- No sitemap changes
- No metadata or JSON-LD changes
- No SEO page generation
