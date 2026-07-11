# DrKhaleej Database Transaction RPC Security Design

## Purpose

This contract defines the SQL security boundary for the future controlled single-entity publish persistence RPC. It does not create the function, execute SQL, or enable publication.

## Security model

The future RPC must use `SECURITY INVOKER`, not `SECURITY DEFINER`.

The search path must be pinned to `pg_catalog, public`. A Pinned search path prevents object shadowing through writable schemas.

Execution privileges must be private by default:

- `REVOKE EXECUTE FROM PUBLIC` is mandatory.
- No authenticated execution is allowed.
- No anonymous execution is allowed.
- Service-role only execution is permitted through the private server adapter.

RLS remains enabled on all persistence tables. The RPC must not become a shortcut around the table boundary.

## Atomic transaction stages

The future function must run these stages in one transaction:

1. validate request fields and hashes;
2. check idempotency conflict or terminal replay;
3. check optimistic entity version;
4. reserve the idempotency key;
5. capture the rollback snapshot;
6. append the execution-started audit event;
7. persist the terminal result only after the controlled operation finishes.

Any error must abort the transaction. Partial reservation, orphan snapshots, and orphan audit events are forbidden.

## Replay and conflict behavior

An identical request with a terminal result may return that existing terminal result. A reused idempotency key with a different request hash or expected version must fail closed.

## Input and output design

Inputs must be explicit typed values rather than an unrestricted JSON command envelope. UUIDs, SHA-256 hashes, versions, retention windows, and JSON object payloads must be validated before writes.

The result must map to the closed adapter union:

- `reserved`
- `replayed`
- `conflict`
- `failed`

## Scope boundary

- No SQL function is created in this phase.
- No migration is added.
- No RPC call is added.
- No database writes occur.
- No server action or Admin button is added.
- No publish mutation is enabled.
- No route or sitemap behavior changes.
- No bulk publish is allowed.

The contract can become ready while `rpcReady`, `executionReady`, and `mutationEnabled` remain false. This separation is intentional, because database privilege mistakes tend to be remarkably efficient at converting design shortcuts into incident reports.
