# P06 Rollback Authority Hardening

## Mapping

- Execution Phase: `Phase 9`
- Lock Scope: `Phase 11`
- Product Module: `Phase 6`
- Subphase ID: `ROLLBACK-AUTHORITY-HARDENING`

## Purpose

P06 hardens the existing durable Pharmacy rollback authority. One eligible authority is selected from persisted server state, bound to the successful terminal publish identity and current entity version, consumed in the same transaction as the existing Pharmacy rollback RPC, and safely replayed from persisted bounded readback.

## Existing authorities only

P06 extends the existing durable publish-reference table, Pharmacy private rollback RPC, rollback snapshot, terminal persistence/audit authority, guarded Admin workflow ports, and isolated Preview proof infrastructure. It introduces no second rollback system and no direct entity-table mutation path.

## Implemented behavior

- reuses the existing durable Pharmacy publish reference;
- keeps the random raw reference server-only and out of browser, form, workflow, canary, and result DTOs;
- selects exactly one eligible reference by actor, entity, successful terminal publish identity, current version, snapshot identity/hash, expiry, and unconsumed state;
- locks the center, reference, terminal record, and rollback snapshot before rollback;
- executes the existing Pharmacy rollback RPC and consumes the reference in one database transaction;
- leaves the reference unconsumed on conflict, failure, or transaction abort;
- persists a bounded consumption result and deterministic SHA-256 result hash;
- returns a stable bounded replay result after the authority is consumed;
- proves concurrent calls yield one fresh rollback and one replay, with exactly one rollback-success audit;
- preserves private/draft/inactive/noindex/no-route/no-sitemap boundaries.

## Database migrations

- `0083_import_pharmacy_atomic_rollback_authority.sql` adds the bounded consumption state, active-authority uniqueness, and the service-role-only atomic authority wrapper around the existing Pharmacy rollback RPC.
- The isolated Preview proof exposed that Supabase installs `pgcrypto` in the `extensions` schema. The already-applied `0083` migration was not edited. Instead, forward-only migration `0084_import_pharmacy_rollback_digest_schema.sql` replaces only the wrapper function and schema-qualifies `extensions.digest(...)`.
- Both functions remain `SECURITY INVOKER`, use an explicit `pg_catalog, public` search path, revoke execution from public roles, and grant execution only to `service_role`.

## Hosted proof

On the isolated Supabase Preview database, the exact-SHA proof verified:

- migration `0084` in the hosted ledger and the final RPC definition;
- one concurrent fresh rollback and one bounded replay;
- exactly one consumed durable authority and one rollback-success audit;
- valid persisted result hashing;
- exact snapshot restoration for the P06 fixture;
- zero duplicate rollback and zero public/index/sitemap/route exposure;
- a conflicting fixture remained unconsumed, unrestored, and without a rollback audit;
- deterministic fixture cleanup;
- Production was not connected or changed;
- raw identifiers were not included in evidence.

## Closed boundaries

- no full field-by-field exact recovery comparator reserved for P07;
- no rollback UI or Admin state-machine activation reserved for P08/P09;
- no public, index, sitemap, route, bulk, Agent, Content, Hospital, or Doctor activation;
- no Production connection, migration, mutation, or read.

## Validation

- focused unit and contract tests;
- migration/RPC/RLS/grant static validation;
- replay and two-client atomic-consumption proof against isolated Preview;
- exact-SHA Preview Migration Sync and separate P05/P06 evidence artifacts;
- full repository CI and Vercel Preview;
- independent approval before merge.

## Next gate

`ROLLBACK-EXACT-RECOVERY` must compare the complete logical pre-publish snapshot with post-rollback state. P06 does not activate that P07 comparator or the Admin rollback UI.
