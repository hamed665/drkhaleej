# DrKhaleej Supabase Publish Persistence Adapter

## Purpose

This layer implements the private application-side adapter for the two controlled-publish persistence RPCs introduced by migration `0069_import_publish_transaction_rpcs.sql`.

It does not publish an entity. It only persists idempotency reservation, rollback snapshot, execution-start audit data, and terminal persistence results.

## Private server-only adapter

The adapter imports `server-only` and accepts a narrow RPC client interface. It must only be constructed with a trusted server-side Supabase client that can execute service-role-only RPCs.

## Two approved RPCs only

The adapter may call only:

- `import_publish_reserve_snapshot_audit`
- `import_publish_persist_terminal_result`

It must not read or write tables directly.

## Closed result normalization

Reservation responses are normalized to:

- `reserved`
- `replayed`
- `conflict`
- `failed`

Terminal responses are normalized to:

- `persisted`
- `replayed`
- `conflict`
- `failed`

Unknown or malformed RPC payloads fail closed.

## Contract correction

Terminal persistence requires the explicit reservation ID, actor ID, actual version, terminal result, and audit schema version. The adapter contract now carries those values directly rather than attempting a secondary lookup.

## Snapshot integrity

The rollback snapshot is canonicalized and hashed with SHA-256 before the reservation RPC is called. Reservation and rollback expiration timestamps are converted to bounded TTL values:

- reservation: 24 to 168 hours
- rollback retention: 30 to 365 days

Invalid timestamps fail before an RPC call.

## Fail-closed error handling

Any RPC error, malformed response, unknown status, missing identifier, or invalid replay payload returns a typed failure. The adapter does not retry writes automatically.

## Safety boundary

- No imported-entity mutation
- No route, projection, index, visibility, or sitemap mutation
- No Admin action
- No server action
- No publish executor
- No bulk publish

This adapter makes the persistence infrastructure callable. It does not make controlled publish execution ready.
