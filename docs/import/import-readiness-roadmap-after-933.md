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
Wave 3+    OPEN
```

PRs #919–#921 are earlier canary/readback infrastructure. They predate the current Reservation authority and do not complete Wave 2, but their verifier and integrity-report implementations must be extended instead of rebuilt.

```text
Aligned through: PR #950
Baseline commit: 23198c9
Last aligned: 2026-07-22
```

The full runtime baseline and the cross-document state tokens are machine-readable here. The alignment validator treats this manifest as the canonical state record.

```json import-readiness-state
{
  "schemaVersion": "drkhaleej.importReadinessState.v1",
  "alignedThroughPr": 950,
  "runtimeBaseline": "23198c95295f72d97c650832ee4755e33b80f2dd",
  "lastAligned": "2026-07-22",
  "currentMigration": "0081_import_pharmacy_reservation_audit_split.sql",
  "currentNext": "VERIFIED-RESERVATION-HANDOFF",
  "waves": {
    "0": "COMPLETE",
    "1": "COMPLETE",
    "2.1": "COMPLETE",
    "2.2": "COMPLETE",
    "3+": "OPEN"
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
2. Raw authorization or rollback secrets never enter Server Action results, React state, hydration payloads, HTML, forms, browser storage, URLs, logs, analytics, tracing attributes, or displayable errors.
3. Review represents the exact canonical patch mutation will execute. Hidden field mutation is forbidden.
4. Authorization is bound to actor, entity, family, review identity, snapshot hash, entity fingerprint, expected version, patch hash, request hash, operation scope, and expiry.
5. Authorization consumption and reservation creation happen in one transaction.
6. Public visibility, index eligibility, and sitemap inclusion are separate promotions.
7. Bulk reuses the proven single-entity executor and remains blocked until recovery is repeatedly proven.
8. AI-assisted intake ends at Unified Draft/Review and cannot bypass controlled publication.

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
4. creates one reservation;
5. captures one rollback snapshot;
6. appends a reservation-phase audit event;
7. consumes and links authorization;
8. commits.

Any failure must leave zero reservation, snapshot and audit writes, an unconsumed authorization, and an unchanged entity.

Migration 0079 established the transaction. PR #949 then proved replay, conflict, two-client locking, four forced-abort boundaries, cleanup, and zero partial writes against an isolated Preview database.

Migration 0081 completes audit-event separation. New reservation writes now use:

```text
event_type = reservation_created
event_payload.phase = reservation
schema_version = drkhaleej.import.publishAudit.v2
```

Legacy `execution_started + phase=reservation` rows remain replay/readback-compatible with their prior schema versions. New reservations reject an incompatible event/schema pairing. `execution_started` is reserved for the real mutation boundary; the runtime handoff remains independently gated in P04-B.

### 2.2 Admin reservation and readback `COMPLETE (#943, #946)`

Operation:

```text
reserve_private_publish
RESERVE PRIVATE PUBLISH <entity-id>
```

The bounded operation is merged. `RES-INTEGRITY-READBACK` proved:

- exactly one linked reservation;
- exactly one snapshot;
- exactly one reservation-phase audit;
- consumed authorization linked to reservation;
- matching entity/review/family/version/fingerprint/patch hash/request hash/scope;
- no duplicate, orphan or audit gap;
- no entity mutation.

The verifier recognizes both legacy `execution_started + phase=reservation` rows and current `reservation_created + v2` rows, and fails closed on incompatible pairings.

PR #946 delivered the server-only verifier, focused tests and isolated Preview database evidence without invoking Publish or Rollback. The evidence recorded one authorization, reservation, snapshot, reservation audit, current audit and entity row; zero duplicates, orphans and audit gaps; and an unchanged entity with route, index and sitemap disabled.

PR #947 separately established independent code ownership. The active `main-protected-review` ruleset requires a pull request, one approval, Code Owner review, approval of the most recent reviewable push, resolved conversations, and blocks branch deletion and force pushes.

## Wave 3 — Existing Pharmacy private executor `OPEN`

### 3.1 Reservation→Execution gate

- Consume the already-implemented `reservation_created` reservation audit contract.
- Preserve old audit reader compatibility.
- Append `execution_started` only at real mutation time.
- Resolve and consume the already-verified Admin Reservation.
- Do not create a second Reservation inside private publish.

### 3.2 Admin wiring and publish readback

Operation:

```text
private_publish
EXECUTE PRIVATE PUBLISH <entity-id>
```

Admin calls the existing guarded Pharmacy executor and adds no independent SQL mutation path.

Mutation appends `execution_started`, applies the exact reviewed canonical patch, persists terminal result/audit, and creates or resolves the existing durable rollback reference.

Readback verifies terminal state, versions, exact patch, protected metadata, private/noindex/no-sitemap/no-route state, one rollback authority, no duplicate execution, and no public leakage.

## Wave 4 — Existing rollback path `OPEN`

### 4.1 Durable rollback authority

Use and harden the existing durable publish reference. Raw reference remains server-side, is bound to terminal publish identity/current version, and is consumed atomically.

```text
ROLLBACK PRIVATE PUBLISH <entity-id>
```

### 4.2 Exact recovery

Compare original logical state with post-rollback state. Bounded fields, publication state, locale, country, path, projection, metadata, relations included by snapshot contract, deletion and sort state must match.

Only append-only audit/history timestamps, updated version metadata, rollback metadata, and consumed authority states may differ.

## Wave 5 — Admin state machine and canary `OPEN`

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

Add server-authoritative refresh, stale detection, expiry countdown, double-submit protection, replay/fresh display, multi-tab collision handling, and readback-only safe retry. Never auto-retry reservation, mutation or rollback.

Run one real Preview Pharmacy through the complete Admin path. Integrity findings for orphan/duplicate/audit gap/unfinished execution/state mismatch/public/index/sitemap exposure/secret leakage/unrestricted payload must all be zero.

Wave 5 فقط پس از تکمیل checklist مستقل Post-P09 Go/No-Go و ثبت `GO` کامل است. این GO فقط Registry/Pharmacy Public work را باز می‌کند؛ Agent، Content و Bulk Gateهای جدا دارند.

## Wave 6 — Registry convergence `OPEN`

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

Mark supported/planned/disabled/unsupported. Extend existing registries only. Do not add routes, placeholders, category pages or sitemap entries in this audit.

## Wave 7 — Pharmacy public lifecycle `OPEN`

1. Independent public/noindex authorization and snapshot.
2. Approved bilingual public route with noindex and sitemap excluded.
3. EN/AR URL, canonical, hreflang, structured data, content, links, mobile, errors and performance verification.
4. Independent index promotion.
5. Independent sitemap promotion.

Each promotion has an independent rollback path.

## Wave 8 — Intake convergence and core families `OPEN`

Manual, CSV, Excel, API and AI-assisted ingestion converge into Unified Draft, canonical geo, evidence, duplicate detection, readiness, exact Review and controlled publish. Direct entity-table writes and entrypoint-specific publication are forbidden.

Entity Agent may create observations/evidence/drafts only. It cannot authorize, reserve, publish, index or add sitemap entries.

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
- parallel reservation/private publish/rollback/family/SEO/route/sitemap subsystems;
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
VERIFIED-RESERVATION-HANDOFF
```

P03 proved the atomic reservation transaction on an isolated Preview database. P04-A then introduced the v2 `reservation_created` audit contract without activating mutation. The next implementation is the independent P04-B server-only handoff from the already-verified Reservation to the existing private executor. It must not create a second Reservation.

After `VERIFIED-RESERVATION-HANDOFF` is green:

```text
PRIVATE-ADMIN-WIRING
→ ROLLBACK-AUTHORITY-HARDENING
→ ROLLBACK-EXACT-RECOVERY
→ ADMIN-STATE-MACHINE
→ REAL-ADMIN-CANARY
```
