# P09 REAL-ADMIN-CANARY scope contract

## Mapping

- Execution Phase: Phase 9
- Lock Scope: Phase 11
- Product Module: Phase 18
- Subphase ID: `REAL-ADMIN-CANARY`

## Purpose

Run one isolated Preview Pharmacy through the complete P08 Admin lifecycle and produce a bounded, exact-SHA evidence bundle before any Post-P09 Go/No-Go decision.

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

## Required evidence

- exact Preview database identity and migration ledger through `0084`;
- one actor-bound and entity-bound Pharmacy fixture;
- the existing Review, Authorization, Reservation, private mutation, durable rollback authority and exact-recovery authorities only;
- persisted readback after every write;
- all ten stages complete from persisted truth;
- the complete integrity-zero set;
- bounded timing and bounded audit history;
- deterministic cleanup;
- no secret, raw durable reference, unrestricted payload or protected value in evidence;
- exact GitHub SHA, Vercel Preview and hosted Preview evidence identity.

The Preview Migration Sync workflow serializes migration verification, P05, P06, P07 and P09 under one fail-closed database-write lock so one pending workflow cannot displace another.

## Hosted proof versus literal UI session

The exact-SHA hosted runner must prove the same persisted authorities used by the protected Admin workflow and the static contract must prove that the page, panel and Server Action expose no bypass. This does not count as an authenticated browser session. Until one human operator completes the literal Vercel Preview Admin path, evidence must retain `browserSessionExecuted=false` and the Post-P09 decision must remain `NO-GO_PENDING_LITERAL_UI_SESSION`.

## Closed boundaries

- no Production connection, read, migration or mutation;
- no public, index, sitemap or route promotion;
- no new database authority, migration, RLS policy or RPC;
- no automatic retry of Reservation, private mutation or rollback;
- no second Reservation;
- no direct browser-visible persistence identifiers;
- no Registry, Agent, Content, Hospital, Doctor or Bulk work;
- no Post-P09 `GO` recorded until the independent checklist is complete.

## Stop conditions

Stop and record `NO-GO` on any unresolved UI-path bypass, orphan, duplicate, audit gap, unfinished execution, state mismatch, public/index/sitemap exposure, secret leakage, unrestricted payload leakage, exact-recovery mismatch, Production identity, or critical review finding.
