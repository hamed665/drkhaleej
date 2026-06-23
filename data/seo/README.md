# SEO Generated Exports

This directory is reserved for generated SEO and geo export artifacts.

## Current generated files

- `oman-geo-registry.json`

## Policy

Generated JSON files in this directory are local build artifacts and are intentionally ignored by git.

The canonical source for the Oman geo registry is:

```text
src/config/geo/oman.ts
```

To regenerate the Oman geo export locally, run:

```bash
pnpm geo:export:oman
```

Do not commit timestamped generated JSON unless a future PR explicitly changes the artifact policy.
