# P06 Rollback Authority Hardening

## Mapping

- Execution Phase: `Phase 9`
- Lock Scope: `Phase 11`
- Product Module: `Phase 6`
- Subphase ID: `ROLLBACK-AUTHORITY-HARDENING`

## Purpose

P06 hardens the existing durable Pharmacy rollback authority. One eligible authority must be selected from persisted server state, bound to the successful terminal publish identity and current entity version, consumed in the same transaction as the existing Pharmacy rollback RPC, and safely replayed from persisted bounded readback.

## Existing authorities only

P06 extends the existing durable publish-reference table, Pharmacy private rollback RPC, rollback snapshot, terminal persistence/audit authority, guarded Admin workflow ports, and isolated Preview proof infrastructure. It must not introduce a second rollback system or a direct entity-table mutation path.

## Required behavior

- reuse the existing durable Pharmacy publish reference;
- keep the random raw reference server-only and out of browser/form/result DTOs;
- select exactly one eligible reference by actor, entity, successful terminal publish identity, current version, snapshot identity/hash, expiry, and unconsumed state;
- lock the reference and linked publish rows before rollback;
- execute the existing Pharmacy rollback RPC and consume the reference in one database transaction;
- leave the reference unconsumed on conflict, failure, or transaction abort;
- persist a bounded consumption result and deterministic result hash;
- return a stable replay result after the authority is consumed;
- prove concurrent calls yield one fresh rollback and one bounded replay, with no second rollback success audit;
- preserve private/draft/inactive/noindex/no-route/no-sitemap boundaries.

## Closed boundaries

- no field-level exact recovery comparator reserved for P07;
- no rollback UI or Admin state-machine activation reserved for P08/P09;
- no public, index, sitemap, route, bulk, Agent, Content, Hospital, or Doctor activation;
- no Production connection, migration, mutation, or read.

## Database rule

Existing migrations are immutable. P06 may add one forward-only migration to harden the existing reference and wrap the existing rollback RPC atomically. The wrapper remains `SECURITY INVOKER`, has an explicit search path, and is executable only by `service_role`.

## Validation

- focused unit and contract tests;
- migration/RPC/RLS/grant static validation;
- replay and two-client atomic-consumption proof against the isolated Preview database;
- exact-SHA Preview Migration Sync and P06 evidence artifact;
- full repository CI and Vercel Preview;
- independent approval before merge.

## Stop conditions

Stop if exact recovery comparison is required, browser custody of the raw reference is unavoidable, atomicity cannot be proven in Preview, or any work requires Production.
