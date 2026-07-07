# TSX Implementation Checklist

This checklist defines the only acceptable shape for the PR that turns the first-batch bridge smoke from inert scaffold into an executed TypeScript smoke.

## Required command

Run this locally before opening the implementation PR:

```bash
pnpm add -D tsx
```

Do not edit `pnpm-lock.yaml` by hand.

## Required changed files

The implementation PR must include all of these changes together:

- `package.json` with `tsx` in dev dependencies;
- `pnpm-lock.yaml` with the generated lockfile entries;
- `scripts/import/smoke-first-batch-dry-run-bridge.ts` restored as an executable smoke;
- `fixtures/import/import-readiness-runner.manifest.json` with the smoke command added;
- `scripts/import/check-tsx-dependency-implementation-preflight.mjs` updated from pending to implemented state;
- `scripts/import/check-first-batch-bridge-smoke-scaffold.mjs` retired or rewritten for implemented state;
- `docs/import/VERCEL_SAFE_IMPORT_SCAFFOLD_RULE.md` retired or updated to implemented state.

## Required safety checks

The implementation PR must keep all of these true:

- imported hospital public hold remains active;
- hospital sitemap URL count remains zero;
- generated fixture output remains stable;
- first-batch report remains `no_go` while hospital public release is held;
- no public route is opened;
- no sitemap family is added;
- no database migration is added.

## Review rule

If `package.json` contains `tsx`, then the PR must not be accepted unless `pnpm-lock.yaml` and the executable bridge smoke are included in the same diff.
