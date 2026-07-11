# DrKhaleej Publish Persistence Schema

## Purpose

Migration `0068_import_publish_persistence_schema.sql` provides protected persistence for a future controlled single-entity publish executor.

It creates three private tables:

- `import_publish_idempotency_records`;
- `import_publish_rollback_snapshots`;
- `import_publish_audit_events`.

## Idempotency records

Each key is unique and bound to one entity, actor profile, expected version, and SHA-256 request hash. Expiry must be after creation and no later than 168 hours. Terminal results must be JSON objects.

## Rollback snapshots

Each snapshot belongs to exactly one idempotency record. It stores the pre-mutation state as an object plus a SHA-256 hash. Retention is bounded to 365 days. Restore metadata must be either entirely absent or entirely present.

## Audit events

Audit events record dry-run review, execution, and rollback lifecycle outcomes. They reference idempotency and optional rollback records using `ON DELETE RESTRICT`, preserving the audit chain instead of letting a convenient cascade erase history.

## Security boundary

All three tables have Row Level Security enabled. Migration 0068 creates no policies for `anon` or `authenticated` and adds no explicit service-role grants. Access remains private-by-default for future audited server infrastructure.

## Execution boundary

`schemaReady` does not mean execution-ready. This phase adds persistence only:

- no publish executor;
- no runtime database writes;
- no Admin button or server action;
- no public route or sitemap behavior;
- no bulk publish.

The database now has shelves for the safety equipment. Nobody has been handed the ignition key, which is the surprisingly difficult part of responsible software development.
