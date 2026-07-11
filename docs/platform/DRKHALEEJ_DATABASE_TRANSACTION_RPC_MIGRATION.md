# DrKhaleej Controlled Publish Transaction RPC Migration

## Scope

Migration `0069_import_publish_transaction_rpcs.sql` creates only the private persistence RPCs required before a controlled single-entity publish executor can exist.

It does not publish an entity. It does not change entity visibility, routes, projections, index policy, or sitemap state.

## RPCs

### `import_publish_reserve_snapshot_audit`

Runs one atomic database transaction that:

1. validates one entity, actor, idempotency key, request hash, expected version, snapshot, audit version, and retention windows;
2. locks any existing idempotency record;
3. returns a replayed terminal result for an identical completed request;
4. fails closed on mismatched or in-progress requests;
5. reserves the idempotency key;
6. persists the rollback snapshot;
7. appends the `execution_started` audit event.

A failure after reservation rolls the complete function call back. There is no partial reservation-without-snapshot state.

### `import_publish_persist_terminal_result`

Locks the reservation and atomically persists:

- terminal outcome: `succeeded`, `failed`, or `rolled_back`;
- terminal JSON result;
- matching terminal audit event;
- actual version.

Repeated terminal writes return the existing terminal result instead of writing another result.

## SQL security

Both functions are:

- `SECURITY INVOKER`;
- pinned to `search_path = pg_catalog, public`;
- revoked from `PUBLIC`, `anon`, and `authenticated`;
- executable only by `service_role`;
- restricted to the three private publish persistence tables.

The migration creates no RLS policy and does not disable RLS. Service-role access is explicit at the function boundary rather than achieved through a public or authenticated policy.

## Deliberate exclusions

This phase adds no:

- application RPC caller;
- persistence adapter implementation;
- publish executor;
- entity-table mutation;
- route or projection mutation;
- sitemap or index mutation;
- Admin action or button;
- bulk publishing.

The RPCs can persist preparation and terminal audit state, but no application code calls them yet. Humanity has therefore acquired plumbing without immediately opening every valve.
