# TSX Dependency Implementation Preflight

This document gates the PR that will add `tsx` for the first-batch TypeScript bridge smoke.

## Current repository package state

- package manager: `pnpm`
- lockfile: `pnpm-lock.yaml`
- selected bridge runtime path: `tsx`
- current implementation state: dependency not yet added

## Required implementation PR shape

The next PR that adds `tsx` must update all of these together:

1. `package.json`
2. `pnpm-lock.yaml`
3. one bridge smoke script under `scripts/import/`
4. the import-readiness manifest
5. the dependency implementation guard

## Required behavior

The implementation PR must not open any public behavior. It must not change:

- public routes;
- sitemap generation;
- hospital public hold behavior;
- database migrations;
- public provider discovery.

The bridge smoke must execute a TypeScript entrypoint through `tsx` and prove only that the TypeScript bridge can be invoked in CI. The first-batch generator must remain fixture-only until a later PR explicitly connects it to the real bridge.

## Review rule

If `package.json` contains `"tsx"`, then `pnpm-lock.yaml` must also contain a matching `tsx` lock entry and the import-readiness manifest must include the bridge smoke check.

If `package.json` does not contain `"tsx"`, then this preflight remains in pending state.

## Current decision state

`dependency_status`: `pending`

`runtime_path`: `tsx`

`public_behavior_change`: `none`
