# Import Readiness Execution Roadmap after PR #933

Tracking issue: #934

## Purpose

This document is the repository source of truth for completing controlled import and publication without duplicating the existing Pharmacy backend, rollback path, family registry, route registry, geo authority, SEO eligibility, sitemap eligibility, or internal-link infrastructure.

The implementation order is strict. Later waves must not be opened early merely to create activity. A pull request is complete only when its behavior, safety boundary, tests, readback, and required hosted checks are green.

## Status

This is the authoritative wave status. It must be updated in the same PR that completes a wave and must stay aligned with factual project-state references and Issue #934.

```text
Wave 0     COMPLETE  (#936–#939) Client-boundary authorization removal, canonical patch, metadata/locale, stable operation identity
Wave 1     COMPLETE  (#940–#941) Server-owned authorization persistence, invalidation, bounded readback
Wave 2.1   COMPLETE  (#942, #949, #950) Atomic reservation, hosted DB safety, and reservation audit-event separation complete
Wave 2.2   COMPLETE  (#943, #946) Admin reservation operation and authorization-linked integrity readback proven
Wave 3+    COMPLETE  (#953, #954) Verified Reservation handoff, guarded private mutation, terminal persistence, durable reference and publish readback proven
Wave 4.1   COMPLETE  (#955) Atomic server-selected rollback authority, one-time consumption and bounded replay proven
Wave 4.2   COMPLETE  (#956) Exact logical recovery and bounded hash-only mismatch diagnostics proven
Wave 5     COMPLETE  (#957, #958) Server-authoritative Admin state machine, literal Preview lifecycle, integrity-zero proof and Post-P09 GO complete
Wave 6     COMPLETE  Registry Authority Audit and Registry Convergence complete; no public activation
Wave 7.1   COMPLETE  Pharmacy public/noindex authority and bilingual live noindex route complete
Wave 7.2   COMPLETE  Pharmacy public rollback and exact Queue recovery are proven
Wave 7.3   COMPLETE  Independent Pharmacy Index promotion and exact public/noindex rollback are proven
Wave 7.4   COMPLETE  Independent Pharmacy Sitemap inclusion and exact P14 Index rollback are proven
Wave 8     PARTIAL   P16 intake, P17 Source Evidence, P18 duplicate/geo candidates, Gate B Contract Hardening, Entity Candidate persistence, additive Human Review decisions, WORKER-RUNTIME-ADR and closed-by-default AUTOMATION-JOB-RUNTIME complete; Preview activation remains closed
```

PRs #919–#921 are earlier canary/readback infrastructure. They predate the current Reservation authority and do not complete Wave 2, but their verifier and integrity-report implementations must be extended instead of rebuilt.

```text
Aligned through: PR #975
Baseline commit: d5632e9
Last aligned: 2026-08-12
```

The full runtime baseline and the cross-document state tokens are machine-readable here. The alignment validator treats this manifest as the canonical state record.

```json import-readiness-state
{
  "schemaVersion": "drkhaleej.importReadinessState.v1",
  "alignedThroughPr": 975,
  "runtimeBaseline": "d5632e9600902afe20046c0f71fdfa0d466d8359",
  "lastAligned": "2026-08-12",
  "currentMigration": "0095_import_automation_job_runtime.sql",
  "currentNext": "AUTOMATION-JOB-PREVIEW-ACTIVATION",
  "waves": {
    "0": "COMPLETE",
    "1": "COMPLETE",
    "2.1": "COMPLETE",
    "2.2": "COMPLETE",
    "3+": "COMPLETE",
    "4.1": "COMPLETE",
    "4.2": "COMPLETE",
    "5": "COMPLETE",
    "6": "COMPLETE",
    "7.1": "COMPLETE",
    "7.2": "COMPLETE",
    "7.3": "COMPLETE",
    "7.4": "COMPLETE",
    "8": "PARTIAL"
  },
  "currentReservationAudit": {
    "eventType": "reservation_created",
    "phase": "reservation"
  },
  "reservationCreatedImplemented": true
}
```

## Merge policy

Every implementation pull request must satisfy all checks relevant to its scope:

- focused unit tests;
- integration tests for cross-boundary behavior;
- static contract checks;
- migration-current validation for database changes;
- RLS, grants, and RPC privilege validation for database changes;
- compatibility checks for changed RPC signatures and audit schema versions;
- concurrency and replay tests where state can be written twice;
- persistence readback for every write path;
- exact recovery verification for rollback paths;
- `pnpm import:publish-readiness-audit:validate`;
- `pnpm typecheck`;
- `pnpm lint`;
- `pnpm build`;
- all required GitHub Actions green;
- Vercel green;
- hosted Preview proof when runtime behavior changes.

A write path must not merge without readback. A rollback path must not merge without exact logical recovery verification. A public promotion path must not merge before the Pharmacy Admin Preview canary and integrity report are green.

## Invariants

1. One authority exists for each concept. Existing reservation, snapshot, mutation, rollback, registry, route, geo, SEO, sitemap, duplicate, and relation authorities are extended rather than copied.
2. Raw authorization, Reservation, rollback snapshot, audit, or rollback-reference material never enters Server Action results, React state, hydration payloads, HTML, forms, browser storage, URLs, logs, analytics, tracing attributes, or displayable errors.
3. Review represents the exact canonical patch mutation will execute. Hidden field mutation is forbidden.
4. Authorization and the verified Reservation handoff are bound to actor, entity, family, Review identity, operation attempt, snapshot hash, entity fingerprint, expected version, patch hash, request hash, operation scope, and expiry.
5. Authorization consumption and Reservation creation happen in one transaction.
6. Private Publish must consume the already verified Reservation and must never create a second Reservation.
7. Public visibility, index eligibility, and sitemap inclusion are separate promotions.
8. Bulk reuses the proven single-entity executor and remains blocked until recovery is repeatedly proven.
9. AI-assisted intake ends at Unified Draft/Review and cannot bypass controlled publication.

## Wave 0 — Security and contract debt `COMPLETE (#936–#939)`

### 0.1 Client boundary

- Raw authorization material removed from Server Action results.
- UI receives bounded lifecycle status only.
- Reservation and mutation remained disabled while this boundary was repaired.

### 0.2 Canonical reviewed patch

- One canonical Pharmacy mutation patch.
- Persisted Review diff derived from that patch.
- Stable normalization and hash contracts.
- Mutation-key allowlist.

### 0.3 Metadata and locale

- Protected metadata preserved with allowlisted merge.
- Canonical geo and projection metadata preserved.
- Locale no longer forced to English.

### 0.4 Stable operation identity

- Stable idempotency identity per actor/entity/review/operation/patch.
- Refresh, retry, back navigation and multiple tabs resolve one attempt.

## Wave 1 — Server-owned authorization `COMPLETE (#940–#941)`

### 1.1 Persistence

The existing authorization persistence was extended with review/family/version/hash/scope/lifecycle identity instead of creating a second subsystem.

Supported lifecycle:

```text
issued → consumed
issued → invalidated
issued → expired
```

No persisted claimed state is introduced.

### 1.2 Invalidation and bounded readback

- New Review invalidates the previous active authorization for the same identity.
- Fingerprint/version/hash/expiry/scope changes invalidate old authorization.
- UI receives bounded status only.

## Wave 2 — Atomic reservation `COMPLETE`

### 2.1 Atomic authorization/reservation `COMPLETE (#942, #949, #950)`

Migration 0079 atomically:

1. locks and verifies active authorization;
2. verifies Preview, actor, entity, Pharmacy family, Review, snapshot, fingerprint, expected version, patch hash, request hash, scope, and expiry;
3. resolves replay/conflict by stable idempotency;
4. creates one Reservation;
5. captures one rollback snapshot;
6. appends a reservation-phase audit event;
7. consumes and links authorization;
8. commits.

Any failure must leave zero Reservation, snapshot and audit writes, an unconsumed authorization, and an unchanged entity.

PR #949 proved replay, conflict, two-client locking, all four forced-abort boundaries, deterministic cleanup, and zero partial writes against an isolated Preview database.

Migration 0081 completes audit-event separation. New Reservation writes use:

```text
event_type = reservation_created
event_payload.phase = reservation
schema_version = drkhaleej.import.publishAudit.v2
```

Legacy `execution_started + phase=reservation` rows remain replay/readback-compatible with their prior schema versions. New Reservations reject an incompatible event/schema pairing. `execution_started` remains reserved for the real mutation boundary.

### 2.2 Admin reservation and readback `COMPLETE (#943, #946)`

Operation:

```text
reserve_private_publish
RESERVE PRIVATE PUBLISH <entity-id>
```

The bounded operation and `RES-INTEGRITY-READBACK` prove:

- exactly one linked Reservation;
- exactly one rollback snapshot;
- exactly one reservation-phase audit;
- consumed authorization linked to the Reservation;
- matching entity/review/family/version/fingerprint/patch hash/request hash/scope;
- no duplicate, orphan, or audit gap;
- no entity mutation.

The verifier recognizes both legacy `execution_started + phase=reservation` rows and current `reservation_created + v2` rows, and fails closed on incompatible pairings.

PR #947 separately established independent code ownership. The active `main-protected-review` ruleset requires a pull request, one approval, Code Owner review, approval of the most recent reviewable push, resolved conversations, and blocks branch deletion and force pushes.

## Wave 3 — Existing Pharmacy private executor `COMPLETE (#953, #954)`

### 3.1 Reservation→Execution gate `COMPLETE (#953)`

P04-B extends the existing authorities rather than creating another transaction or executor:

- consumes the `reservation_created` Reservation audit contract while preserving legacy reader compatibility;
- binds actor, entity, Review state, operation attempt, idempotency key, request hash, patch hash, expected version, snapshot hash, entity fingerprint, family, scope, expiry, Reservation, rollback snapshot, and audit evidence;
- requires exact authorization, Reservation, snapshot, audit, and entity-fingerprint counts;
- requires zero duplicate, orphan, and audit-gap findings;
- rejects stale, foreign, incomplete, expired, unverified, non-exact, or incompatible evidence before the executor port;
- hands the already verified Reservation to one injected server-only executor port;
- invokes no Reservation RPC and creates no second Reservation;
- returns only a bounded result and exposes no raw persistence identifiers.

### 3.2 Admin wiring and publish readback `COMPLETE (#954)`

Operation:

```text
private_publish
EXECUTE PRIVATE PUBLISH <entity-id>
```

P05 wires the already verified Reservation to the existing guarded Pharmacy executor and adds no independent SQL mutation path.

Migration 0082 preserves the existing PostgreSQL RPC identity while changing its third argument semantics to carry the verified reservation-audit ID. The RPC verifies the reservation audit, appends exactly one `execution_started + phase=mutation` event under `drkhaleej.import.publishAudit.v3`, applies the exact reviewed canonical patch, preserves protected metadata and the private boundary, and persists terminal success in the existing authority.

The executor creates one opaque server-only durable rollback reference and returns success only after readback verifies:

- exactly one Reservation, rollback snapshot, reservation audit, mutation start, terminal success and durable reference;
- exact expected and actual versions;
- exact reviewed canonical patch;
- canonical geo and projection metadata preservation;
- private/draft/inactive/unfeatured/noindex/no-route/no-sitemap state;
- zero duplicate execution and zero public exposure;
- bounded replay and deterministic cleanup.

The isolated hosted P05 proof runs only after Preview Migration Sync verifies migration 0082 on the exact PR SHA. Production is not connected or changed.

## Wave 4 — Existing rollback path `COMPLETE`

### 4.1 Durable rollback authority `COMPLETE (#955)`

Operation contract:

```text
ROLLBACK PRIVATE PUBLISH <entity-id>
```

P06 hardens the existing durable Pharmacy publish reference rather than introducing a second rollback authority. Migrations 0083 and 0084 add bounded consumption state and the service-role-only atomic authority RPC, then apply the forward pgcrypto schema correction proven by isolated Preview.

The authority path now:

- accepts only allowlisted actor/entity identity and entity-bound confirmation;
- keeps the random raw reference out of browser, form, workflow and canary inputs/results;
- binds the eligible authority to successful terminal publish identity, current entity version, rollback snapshot identity/hash, actor, entity and expiry;
- locks the center, reference, terminal record and snapshot;
- executes the existing Pharmacy rollback RPC and consumes the authority in one transaction;
- leaves failed or conflicting authority state unconsumed;
- returns bounded `rolled_back` or persisted `replayed` evidence;
- persists a bounded consumed result and SHA-256 integrity hash;
- preserves private/draft/inactive/noindex/no-route/no-sitemap state.

The exact-SHA hosted proof produced one fresh rollback and one replay from concurrent clients, exactly one consumed reference, exactly one rollback-success audit, zero duplicate rollback, zero public exposure, an unconsumed failed fixture and deterministic cleanup. Production was not connected or changed.

### 4.2 Exact recovery `COMPLETE (#956)`

P07 adds one server-only logical comparator to the existing rollback canary/readback path. It canonicalizes the protected original snapshot and persisted post-rollback state, including bounded Pharmacy fields, bilingual locale/country, canonical route identity, geo/projection and protected metadata, deletion/sort state, private publication flags and the current exact empty relation snapshot contract.

Only append-only audit/history state, monotonic entity-version metadata, rollback metadata and consumed authority state are allowlisted differences. Aggregate hashes mask only those explicit paths. Any other mismatch fails closed with a bounded normalized field path and SHA-256 expected/actual hashes; raw protected values and identifiers are not emitted.

The exact-SHA isolated Preview proof produced equal expected/actual logical hashes, mismatch count zero, verified a deliberate protected nested mismatch using hash-only diagnostics, preserved private/noindex/no-route/no-sitemap state, reported zero public exposure, completed deterministic cleanup and kept Production disconnected.

## Wave 5 — Admin state machine and canary `COMPLETE (#957, #958)`

Keep `/admin/imports/readiness` and the existing design system.

```text
Dry Run
→ Exact Review
→ Authorization Ready
→ Reserve
→ Reservation Verified
→ Private Publish
→ Publish Verified
→ Rollback
→ Exact Recovery Verified
→ Bounded Audit History
```

P08 extends the existing protected `/admin/imports/readiness` workflow with all ten stages above. Every visible stage is derived from persisted server readback. The UI provides explicit readback-only refresh, stale and expiry handling, countdown, client pending lock, server revision binding for multi-tab collisions, fresh/replayed receipts, bounded audit history, and manual Preview-only rollback through the existing atomic authority. Reservation, mutation, and rollback are never retried automatically. Raw durable references, protected values, and unrestricted payloads remain outside browser contracts.

P08 changes no database schema or authority and keeps the workflow single-entity, Pharmacy-only, private/noindex/no-route/no-sitemap, actor/entity allowlisted, and unavailable in Production.

P09 completed the fixed isolated Preview Pharmacy lifecycle across all ten persisted stages. The exact-head proof records one fresh Private Publish, one durable rollback authority, one fresh rollback, one bounded replay, exact logical recovery, and zero orphan, duplicate, audit-gap, unfinished-execution, state-mismatch, public, index, sitemap, secret, raw-identifier, or unrestricted-payload findings. Production remained disconnected and unchanged.

The independent Post-P09 decision is `GO_LITERAL_PREVIEW_CYCLE_COMPLETE`. This GO opens only the separately reviewed Registry/Pharmacy-public planning gate; Agent, Content, Hospital, Doctor, later-family and Bulk gates remain closed.

## Wave 6 — Registry convergence `COMPLETE`

Audit and document:

```text
ImportEntityType
→ PublicEntityFamily
→ PublicProviderRouteFamily
→ database storage family
→ SEO profile
→ schema projection
→ relation policy
→ sitemap family
```

Mark supported/planned/disabled/unsupported. Extend existing registries only. Do not add routes, placeholders, category pages, or sitemap entries in this audit.

The Registry Authority Audit is complete in [`registry-authority-audit.md`](registry-authority-audit.md). It found split intake/public vocabularies, a noncanonical relation alias, capability flags that must not act as release approval, a non-fail-closed family lookup, and a legacy helper that couples index and sitemap promotion.

`REGISTRY-CONVERGENCE` is complete in [`registry-convergence.md`](registry-convergence.md). One total intake-to-public/storage/route adapter now covers all canonical entity types, legacy Admin staging vocabulary resolves explicitly, unknown family lookup fails closed, relation rules use canonical types, and capability metadata remains separate from route release. The public sitemap now consumes the canonical family and route authorities. Every previously disabled route remains disabled.

Index/sitemap decoupling remains part of the later independent Pharmacy index and sitemap promotions. This wave does not authorize route activation, public promotion, a migration, or Production execution.

## Wave 7 — Pharmacy public lifecycle `COMPLETE`

1. Independent public/noindex authorization and snapshot.
2. Approved bilingual public route with noindex and sitemap excluded.
3. EN/AR URL, canonical, hreflang, structured data, content, links, mobile, errors and performance verification.
4. Independent index promotion.
5. Independent sitemap promotion.

Each promotion has an independent rollback path.

P11 `PHARMACY-PUBLIC-NOINDEX-AUTHORITY` is complete in
[`PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md`](PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md).
Migration `0087` installs only the protected authorization/publication
authority and binds bilingual paths to a `published_noindex` Queue record.
P12 `PHARMACY-BILINGUAL-LIVE-VERIFY` is complete in
[`PHARMACY_BILINGUAL_LIVE_VERIFY.md`](PHARMACY_BILINGUAL_LIVE_VERIFY.md). The
exact EN/AR routes now require that P11 authority and always remain noindex,
outside imported discovery and Sitemap output, and without JSON-LD. P13
`PHARMACY-PUBLIC-ROLLBACK` is complete in
[`PHARMACY_PUBLIC_ROLLBACK.md`](PHARMACY_PUBLIC_ROLLBACK.md). Migration `0088`
extends the same protected authority, restores a pre-existing Queue exactly or
removes the P11-created Queue, and proves tamper failure, concurrency and
persisted replay. Index and Sitemap promotion remain independent and Production
remains disconnected. P14 `PHARMACY-INDEX-PROMOTION` is complete in
[`PHARMACY_INDEX_PROMOTION.md`](PHARMACY_INDEX_PROMOTION.md). Migration `0089`
adds a separate Index authority, promotes only robots/Index state while
Sitemap remains excluded, and restores the exact P11 public/noindex Queue on
rollback. Tamper failure, concurrent promotion/rollback, persisted replay and
readback are proven on isolated Preview. Sitemap promotion remains independent
and Production remains disconnected. P15 `PHARMACY-SITEMAP-PROMOTION` is
complete in [`PHARMACY_SITEMAP_PROMOTION.md`](PHARMACY_SITEMAP_PROMOTION.md).
Migration `0090` binds the exact promoted P14 authority, moves only the Queue
from `index_eligible/index_eligible/excluded` to
`index_eligible/index/included`, and restores the exact P14 Queue on rollback.
Forward-only Migration `0091` aligns the pre-existing Queue policy constraint
with that reviewed terminal `index` state; it changes no data, grant or RLS
policy.
The existing dynamic Sitemap reader requires the P15 evidence marker and an
exact canonical route match. JSON-LD, candidate links, later families and
Production remain closed.

## Wave 8 — Intake convergence and core families `PARTIAL`

Manual, CSV, Excel, API and AI-assisted ingestion converge into Unified Draft, canonical geo, evidence, duplicate detection, readiness, exact Review and controlled publish. Direct entity-table writes and entrypoint-specific publication are forbidden.

Entity Agent may create observations/evidence/drafts only. It cannot authorize, reserve, publish, index, or add sitemap entries.

Then complete Hospital followed by Doctor. They reuse shared transaction/authorization/rollback authorities through family adapters. Hospital and Doctor are not implemented in parallel.

## Wave 9 — Shared core and later families `OPEN`

Extract generic controlled-publish core only after Pharmacy, Hospital and Doctor are proven.

Extend existing registries and policy interfaces for:

- additional human healthcare facilities;
- medical retail;
- medical and non-medical beauty;
- veterinary medical;
- pet retail/services;
- fitness;
- home healthcare;
- ambulance;
- operator/charity facets.

Only verified relations create public internal links. Geographic proximity alone never creates an organizational relation.

## Final wave — Bulk `OPEN`

Bulk remains blocked until:

- at least ten successful private publishes;
- at least ten successful rollbacks;
- complete Pharmacy/Hospital/Doctor lifecycles;
- representative later-family canaries;
- zero duplicate/orphan/audit-gap/public-leakage/recovery findings.

Bulk uses per-entity jobs, initial concurrency one, pause/cancel/kill-switch controls, bounded read retries, no automatic retry for ambiguous mutations, and the same single-entity executor. There is no blind Publish All.

## Explicitly stopped

Do not add:

- independent claim/claim-recovery lifecycle;
- browser bearer-secret handoff;
- encrypted authorization cookies or server-memory custody as persisted authority replacement;
- parallel Reservation/private publish/rollback/family/SEO/route/sitemap subsystems;
- direct Excel or Agent publish;
- Hospital and Doctor implementation in parallel;
- public/index before Pharmacy Admin canary;
- placeholder or empty routes;
- candidate-relation public links;
- organizational inference from proximity;
- Bulk Publish or Publish All before the final wave;
- unrelated Content/SEO LLM automation before its own authority and tracked roadmap are opened.

## Current next implementation

```text
AUTOMATION-JOB-PREVIEW-ACTIVATION
```

`ENTITY-CANDIDATE-PIPELINE` is complete in
[`ENTITY_CANDIDATE_PIPELINE.md`](ENTITY_CANDIDATE_PIPELINE.md). `ENTITY-RESOLUTION-GATE` is complete in
[`ENTITY_RESOLUTION_GATE.md`](ENTITY_RESOLUTION_GATE.md): it records only an additive immutable Human
Review decision and does not apply it. The documentation-only
[`WORKER-RUNTIME-ADR`](WORKER_RUNTIME_ADR_GATE.md) gate is complete, with its concrete providers,
identity, storage, fencing, egress, observability, cost, ownership and recovery choices recorded in
[`WORKER_RUNTIME_ARCHITECTURE_DECISION.md`](WORKER_RUNTIME_ARCHITECTURE_DECISION.md).
[`AUTOMATION-JOB-RUNTIME`](AUTOMATION_JOB_RUNTIME.md) implements the private queue, signed service
boundary, lease fencing, bounded outbox, internal API and an idle Worker shell with every switch and
identity disabled. `AUTOMATION-JOB-PREVIEW-ACTIVATION` is the next independent gate; it must supply
the complete accepted evidence bundle before provisioning or starting the loop. Decision application,
Content, Hospital, Doctor, later-family, Bulk behavior and Production execution remain closed.
