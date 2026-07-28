# P09 REAL-ADMIN-CANARY scope contract

## Mapping

- Execution Phase: Phase 9
- Lock Scope: Phase 11
- Product Module: Phase 18
- Subphase ID: `REAL-ADMIN-CANARY`
- Status: `COMPLETE`

## Purpose

Run one isolated Preview Pharmacy through the complete P08 Admin lifecycle and produce a bounded, exact-SHA evidence bundle before any Post-P09 decision.

```text
Dry Run
→ Exact Review
→ Authorization Ready
→ Reservation
→ Reservation Verified
→ Private Publish
→ Publish Verified
→ Rollback
→ Exact Recovery Verified
→ Bounded Audit History
```

## Completion result

The exact persisted Preview Pharmacy completed all ten stages. The final path resumed from the existing verified Reservation, performed one real private mutation, verified persisted publish state, created one server-only durable rollback authority, performed one fresh rollback, verified one bounded replay, and proved exact logical recovery.

The final decision is:

```text
GO_LITERAL_PREVIEW_CYCLE_COMPLETE
```

No further browser mutation click is required. The operator explicitly authorized one-time completion through the protected GitHub workflow after repeated literal browser attempts had already established the authenticated actor/entity boundary. This was not scheduled, background, bulk, or Production execution.

## Root-cause repair

The literal UI failure was traced to a legacy descriptive `metadata.source` value outside the canonical Unified Draft source enum. The database authority and publish RPC were valid, but the application mutation adapter rejected the Draft before RPC with `source_unsupported`.

The runtime boundary now normalizes legacy provenance safely:

- canonical `metadata.source` is used when valid;
- canonical `sourceEvidence.source` is the fallback;
- otherwise only the executable Draft boundary falls back to `manual`;
- original metadata remains unchanged in the rollback snapshot;
- Review, Authorization, Reservation, snapshot, fingerprint, version, actor, entity, family, scope, audit, and expiry bindings remain exact;
- regression coverage proves that unsupported legacy provenance cannot silently bypass or block the verified Reservation path.

## Required evidence

The exact-SHA evidence must retain:

- exact Preview database identity and migration ledger;
- one actor-bound and entity-bound Pharmacy;
- existing Review, Authorization, Reservation, private mutation, durable rollback authority, and exact-recovery authorities only;
- persisted readback after every write;
- all ten stages complete from persisted truth;
- one fresh publish, one durable reference, one fresh rollback, and one bounded rollback replay;
- exactly one reservation, mutation-start, publish-success, and rollback-success audit event;
- equal expected and restored logical hashes;
- complete integrity-zero set;
- bounded timing and bounded audit history;
- no secret, raw durable reference, unrestricted payload, protected value, or raw persistence identifier in evidence;
- exact GitHub SHA, Vercel Preview, and isolated Preview identity;
- Production disconnected and unchanged.

Artifact naming contract:

```text
p09-literal-final-preview-cycle-<exact-pr-head-sha>
```

## Execution model

The one-time completion workflow is fail-closed and entity-hash-bound. It:

- requires explicit enablement;
- verifies Preview and Production refs differ;
- requires the Supabase Session pooler for the Preview project;
- refuses any Production ref in the database URL;
- resolves only the fixed allowlisted entity by hash;
- resumes only from persisted consumed Authorization and live Reservation truth;
- creates no second Reservation;
- executes only one private mutation when still reserved;
- creates at most one durable rollback reference;
- performs exact rollback and bounded replay;
- proves exact restored state and zero public/index/sitemap leakage;
- emits bounded evidence with no raw identifiers.

The workflow shares the existing isolated Preview database-write concurrency lock with Preview Migration Sync and the hosted P05/P06/P07/P09 proofs.

## Closed boundaries

- no Production connection, read, migration, or mutation;
- no public, index, sitemap, or route promotion;
- no new database authority, migration, RLS policy, or RPC for the legacy-source repair;
- no parallel authentication authority outside Supabase Auth;
- no automatic retry of an ambiguous Reservation, private mutation, or rollback;
- no scheduled or recurring canary execution;
- no second Reservation;
- no direct browser-visible persistence identifiers;
- no Registry implementation, Agent, Content, Hospital, Doctor, or Bulk work in this PR;
- no permission to merge without independent latest-head approval required by repository rules.

## Stop conditions

Stop and record `NO-GO` on any unresolved boundary bypass, orphan, duplicate, audit gap, unfinished execution, state mismatch, repeated ambiguous mutation, missing post-step readback, public/index/sitemap exposure, secret leakage, unrestricted payload leakage, exact-recovery mismatch, Production identity, or critical review finding.
