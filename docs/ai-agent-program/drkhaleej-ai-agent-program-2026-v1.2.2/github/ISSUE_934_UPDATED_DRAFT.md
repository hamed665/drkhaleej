# Issue #934 — Updated Body Draft

## Goal

Complete controlled import and publication by extending the existing Pharmacy backend, authorization, reservation, rollback, family, route, geo, SEO, sitemap and internal-link authorities. No parallel subsystem is allowed.

## Baseline

```text
Aligned through: PR #943
Baseline commit: 74541b9
Last aligned: 2026-07-15
```

## Status

- [ ] Alignment delivery — Sync roadmap/CURRENT_STATE/matrix/Issue through `#943` (`P01`)
- [x] Wave 0 — Client boundary, canonical patch, metadata/locale, operation identity (`#936–#939`)
- [x] Wave 1 — Persisted server authorization and bounded readback (`#940–#941`)
- [ ] Wave 2.1 — Atomic reservation (`#942`): transaction complete; audit-event separation remains
- [ ] Wave 2.2 — Admin reservation (`#943`): operation complete; integrity readback remains
- [ ] Wave 3 — Existing Pharmacy private executor
- [ ] Wave 4 — Durable rollback and exact recovery
- [ ] Wave 5 — Admin state machine and real canary
- [ ] Wave 6 — Registry convergence
- [ ] Wave 7 — Pharmacy public/index/sitemap lifecycle
- [ ] Wave 8 — Intake convergence, Hospital, Doctor
- [ ] Wave 9 — Shared core and later families
- [ ] Final — Bulk

## Current next task

### RES-INTEGRITY-READBACK

Implementation این task فقط پس از merge شدن documentation alignment شروع می‌شود.

- [ ] Extend existing server-only readback verifier.
- [ ] Verify exactly one linked reservation.
- [ ] Verify exactly one snapshot.
- [ ] Verify exactly one reservation audit.
- [ ] Verify consumed authorization linked to reservation.
- [ ] Verify entity/review/family/version/fingerprint/patch hash/request hash/scope.
- [ ] Verify zero duplicate/orphan/audit-gap finding.
- [ ] Verify entity has not mutated.
- [ ] Recognize current audit signature: `execution_started` + `phase=reservation`.
- [ ] Keep forward compatibility for future `reservation_created`.
- [ ] Add focused unit/integration tests.
- [ ] Produce Preview DB evidence.

## Next sequence

```text
RES-INTEGRITY-READBACK
→ RES-DB-SAFETY-PROOF
→ PRIVATE-RESERVATION-GATE
→ PRIVATE-ADMIN-WIRING
→ ROLLBACK-AUTHORITY-HARDENING
→ ROLLBACK-EXACT-RECOVERY
→ ADMIN-STATE-MACHINE
→ REAL-ADMIN-CANARY
→ POST-P09 GO/NO-GO
```

## Merge policy

- focused unit and integration tests؛
- migration/RLS/RPC validation when applicable؛
- replay/concurrency proof when state can be written twice؛
- persistence readback for every write؛
- exact recovery for rollback؛
- `pnpm import:publish-readiness-audit:validate`؛
- typecheck، lint، build؛
- GitHub Actions and Vercel green؛
- hosted canary when behavior changes.

## Explicitly stopped

- parallel authorization/reservation/publish/rollback systems؛
- client bearer-secret handoff؛
- direct Excel or Agent publish؛
- public/index before Pharmacy Admin canary؛
- Hospital and Doctor in parallel؛
- placeholder routes/SEO pages؛
- candidate relation public links؛
- organizational inference from proximity؛
- Bulk Publish/Publish All؛
- unrelated LLM content automation before its authority and roadmap open.

## Post-P09 decision

بعد از REAL-ADMIN-CANARY، checklist مستقل Go/No-Go تکمیل می‌شود. GO فقط Registry/Pharmacy Public milestone را باز می‌کند؛ Agent، Content و Bulk همچنان Gate مستقل دارند.
