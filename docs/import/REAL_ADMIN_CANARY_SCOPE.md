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
