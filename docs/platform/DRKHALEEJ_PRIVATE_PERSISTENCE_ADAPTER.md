# DrKhaleej Private Persistence Adapter Contract

## Purpose

This contract defines the private server-side adapter boundary required before controlled single-entity publish persistence can be implemented.

It does not implement a database adapter. It only fixes the request, result, replay, conflict, and terminal-result contracts that a future adapter must obey.

## Private server boundary

The adapter belongs behind a private server-only boundary. Public routes, client components, browser code, and unauthenticated callers must never receive this interface.

## Atomic reservation transaction

`runReservationSnapshotAuditTransaction` represents one atomic operation containing:

1. idempotency reservation;
2. rollback snapshot persistence;
3. execution-started audit persistence.

The adapter must not report `reserved` unless all three records commit together.

## Explicit result union

The transaction result is a closed union:

- `reserved`: a new reservation, snapshot, and audit event committed;
- `replayed`: the same request already has a terminal result;
- `conflict`: the key or expected version conflicts with persisted state;
- `failed`: the transaction aborted and committed nothing.

## Replay and conflict behavior

An identical idempotent replay may return the stored terminal result. A request-hash mismatch or expected-version mismatch must fail closed as `conflict`. The adapter must never silently convert a conflicting request into a fresh reservation.

## Terminal results

`persistTerminalResult` records only `succeeded`, `failed`, or `rolled_back` terminal outcomes and links them to the reservation, rollback snapshot, and audit chain established earlier.

## Safety boundary

- No database adapter implementation.
- No Supabase client or RPC call.
- No reservation, snapshot, audit, or terminal-result write.
- No publish mutation.
- No Admin action or button.
- No public route or sitemap behavior.
- No bulk publish.

Even when the interface contract is complete, `adapterReady`, `executionReady`, and `mutationEnabled` remain false. Types are useful, but they do not magically become a transaction coordinator merely because someone named them confidently.
