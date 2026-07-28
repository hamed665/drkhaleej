# Post-P09 Go / No-Go Decision

## Current decision

```text
GO_LITERAL_PREVIEW_CYCLE_COMPLETE
```

P09 is complete for the isolated Preview Pharmacy lifecycle. The operator explicitly authorized completion without another browser mutation click, and the exact persisted entity was advanced from its existing verified Reservation through Private Publish, persisted publish readback, durable rollback authority, fresh rollback, bounded replay, exact logical recovery, and bounded audit history.

This decision opens only the separately reviewed Registry/Pharmacy-public planning gate. It does not authorize Production execution, public promotion, indexing, sitemap inclusion, Bulk, Agent, Content, Hospital, Doctor, or later-family implementation.

## Prior gate history

The previous fail-closed decision was `NO-GO_PENDING_LITERAL_UI_SESSION`. At that time the remaining requirement was described as a literal authenticated browser session using a profile with `is_platform_admin=true`, exactly one allowed actor, exactly one fixed Pharmacy entity, and the protected one-click full-cycle control. Repeated browser attempts established those access boundaries but exposed an application preflight defect before the proven RPC.

The operator then authorized one-time exact-entity completion through the serialized Preview workflow instead of another browser mutation click. Production remained disconnected and unchanged throughout. The prior decision is retained here only as history; it is not the current decision.

## Root cause repaired

The literal UI failure was not a database, Reservation, snapshot, version, RPC, or Supabase identity failure. The exact Pharmacy row carried a legacy descriptive `metadata.source` value outside the current Unified Draft source enum. Runtime context passed that provenance label directly into the executable Draft, so the mutation adapter stopped with `source_unsupported` before invoking the already-proven publish RPC. The UI then collapsed the useful blocker into `publish_execution_failed` and `state_readback_unverified`.

The repaired boundary now:

- accepts only canonical executable sources: `manual`, `csv`, `excel`, `api`, or `ai_assisted`;
- prefers a canonical `metadata.source` when present;
- otherwise prefers a canonical `sourceEvidence.source`;
- otherwise normalizes only the executable Draft boundary to `manual`;
- retains the original legacy provenance unchanged inside the rollback snapshot;
- keeps exact Review, Authorization, Reservation, snapshot, fingerprint, expected-version, audit, actor, entity, family, and scope binding;
- adds a regression test proving the legacy row is mutation-ready without weakening validation.

## Exact literal Preview evidence

The one-time P09 completion is serialized inside `Preview Migration Sync` against the exact allowlisted entity and exact PR SHA under one isolated Preview database-write lock. The standalone completion workflow is manual-only and cannot compete with the PR proof queue. Evidence records:

- Preview identity verified;
- Production connected or changed: no;
- durable mutation performed only in Preview;
- all ten lifecycle stages complete;
- one fresh Private Publish;
- one durable rollback authority;
- one fresh rollback and one bounded replay;
- exactly one reservation-created, mutation-started, execution-succeeded, and rollback-succeeded audit event;
- expected and restored logical hashes equal;
- duplicate operations: zero;
- audit gaps: zero;
- unfinished executions: zero;
- state mismatches: zero;
- public leakage: zero;
- index leakage: zero;
- sitemap leakage: zero;
- raw identifiers exposed: no;
- further browser mutation click required: no.

Artifact naming contract:

```text
p09-real-admin-canary-<exact-pr-head-sha>
```

Evidence file inside the P09 artifact:

```text
literal-final-preview-cycle.json
```

## Completed lifecycle

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

## Closed boundaries

The following remain fail-closed:

- no Production connection, read, migration, or mutation;
- no public route enablement;
- no index eligibility;
- no sitemap inclusion;
- no Bulk or Publish All;
- no automatic ambiguous mutation retry;
- no second Reservation;
- no raw persistence identifiers or authentication material in browser or evidence;
- no Agent, Content, Hospital, Doctor, Registry implementation, or later-family execution in this PR.

## Merge requirements

Before merge, the latest reviewable PR head must still have:

- full CI green;
- Preview Migration Sync green;
- P03 hosted safety proof green;
- P05/P06/P07/P09 hosted proofs green;
- serialized literal Preview completion green;
- Vercel Preview green;
- all conversations resolved;
- independent latest-head approval required by repository rules;
- Production disconnected and unchanged.
