# PR Draft — ALIGN-CURRENT-STATE

## Suggested title

```text
docs: align import readiness state through PR #943
```

## Canonical mapping

```text
Execution Phase: Phase 9 — Production Hardening
Lock Scope: Phase 10 — SEO Ops, Redirects, Import, Duplicate Tools
Product Module: Phase 6 — Admin Foundation
Subphase ID: ALIGN-CURRENT-STATE
Baseline: main@74541b9
```

## Purpose

Align the repository's canonical import roadmap and project-state references with `main@74541b9` before any new runtime implementation.

## Scope

- Update `docs/import/import-readiness-roadmap-after-933.md`.
- Update `docs/project-state/CURRENT_STATE.md`.
- Update `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`.
- Update stale factual migration/status references in root `README.md` and keep it a pointer rather than a parallel ledger.
- Add or extend a non-runtime alignment validator/workflow for baseline، migration range و current-next consistency.
- Prepare the matching Issue #934 body/checklist update.

## Required ledger

```text
Aligned through: PR #943
Baseline commit: 74541b9
Last aligned: 2026-07-15

Wave 0     COMPLETE  (#936–#939)
Wave 1     COMPLETE  (#940–#941)
Wave 2.1   PARTIAL   (#942) atomic reservation complete; audit-event separation open
Wave 2.2   PARTIAL   (#943) Admin operation merged; authorization-linked integrity readback open
Wave 3+    OPEN
```

## Required corrections

1. Do not claim `reservation_created` already exists.
2. Record the current reservation audit signature:

```text
event_type=execution_started
event_payload.phase=reservation
```

3. Set current next implementation to `RES-INTEGRITY-READBACK`.
4. State that readback requires server-only verifier code, tests and Preview DB evidence; it is not docs-only.
5. Record that audit event separation belongs to `PRIVATE-RESERVATION-GATE`.
6. Reuse/extend the existing readback verifier and integrity report from earlier canary work.

## Non-goals

- no runtime behavior؛
- no migration؛
- no schema change؛
- no capability enablement؛
- no AI Agent feature؛
- no public route/index/sitemap work.

Allowed non-runtime files: documentation، alignment validator و workflow محدود به همان validator.

## Acceptance

- one canonical wave ledger؛
- no stale current-next pointer؛
- no claim that old #919–#921 complete current reservation authority؛
- all referenced files agree؛
- changed files limited to documentation/state references and the non-runtime alignment validator/workflow؛
- unrelated local changes excluded.
- runtime/migration/schema diff برابر صفر؛
- Issue #934 بلافاصله پس از merge با merged SHA به‌روزرسانی و دوباره readback شود؛ GitHub Issue mutation بخشی از commit اتمیک نیست.
