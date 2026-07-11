# DrKhaleej Publish Reservation and Snapshot Transaction

## Purpose

This phase defines the atomic persistence boundary required after a controlled publish dry-run is reviewed and before any entity state mutation can exist.

## Ordered transaction

A future persistence adapter must perform exactly these operations in one transaction:

1. reserve the idempotency key and bind it to the entity, actor, expected version, and dry-run request hash;
2. capture the complete pre-publish rollback snapshot;
3. append the `execution_started` audit event referencing the reservation and snapshot.

Partial success is forbidden. If any operation fails, the transaction must roll back all three operations.

## Idempotency conflict behavior

A repeated key with the same request identity must return the existing terminal result when one exists. A repeated key with conflicting request data must fail closed. It must never create a second reservation or a second publish attempt.

## Required inputs

- reviewed dry-run plan;
- protected persistence schema;
- transaction coordinator;
- one entity and actor;
- idempotency key;
- SHA-256 request hash;
- expected entity version;
- complete rollback snapshot;
- audit schema version;
- bounded reservation and rollback retention.

## Safety state

`contractReady` only confirms the proposed transaction shape is valid.

This phase keeps all operational switches disabled:

- `persistenceReady = false`;
- `executionReady = false`;
- `mutationEnabled = false`;
- `bulkAllowed = false`;
- `databaseOperations = []`.

## Scope

- Contract and fixture only.
- No database adapter implementation.
- No reservation write.
- No snapshot write.
- No audit write.
- No publish mutation.
- No server action or Admin button.
- No sitemap or route behavior.
- No bulk publish.

The goal is to make the first three persistence writes inseparable before anyone is permitted to add the fourth write that changes public state. Databases appreciate this sort of restraint, even when humans find it less cinematic.
