# DrMuscat Review Generated Types & Validation Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Future generated types and validation planning only.
- This spec does not authorize implementation.
- This spec does not authorize generated type update.
- This spec does not authorize migration.
- This spec does not authorize source code changes.
- This spec does not authorize tests or validators.
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-REVIEW-GENERATED-TYPES-VALIDATION-V1`.

## 1. Purpose

This spec defines how future review migration implementation must update generated Supabase types and validate database, RLS, and source integration.

No implementation is authorized by this spec.

## 2. Generated Types Strategy

Future generated type work must follow these rules:

- Generated types are updated only after migration applies cleanly.
- Generated types must be committed in a dedicated PR or in the same approved migration phase, depending on repo convention.
- Generated type diff must be reviewed.
- No unrelated type changes are allowed.
- No manual editing of generated files is allowed unless repo convention explicitly allows it.
- If generated `public.Views` unexpectedly changes, stop and report.
- If review private tables appear in public projection unexpectedly, stop and report.

## 3. Type Safety Requirements

Future implementation must ensure:

- Review table types exist.
- Rating table types exist.
- Moderation, event, report, dispute, and reply types exist.
- Nullable fields match the migration.
- Enum/text statuses align with the database design.
- Generated `Insert` and `Update` types are safe.
- Private fields are not accidentally exposed through public view types.
- Public projection types remain separate from raw private table types.

## 4. Validation Command Planning

Future implementation may require:

- `git status --short`.
- Supabase migration apply/reset if available.
- `supabase db lint` if available.
- Generated types command if configured.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm test` if available.
- Route/SEO validator only if routes are touched.
- RLS positive tests.
- RLS negative tests.
- Schema diff checks.
- Generated type diff checks.

No commands are implemented here except docs diff-check for this documentation-only PR.

## 5. RLS Validation Matrix

Future RLS tests must verify:

- Anon cannot insert, update, or delete.
- Anon cannot read raw private tables.
- Public can read only an approved public projection if launched.
- Authenticated user can create own draft only if enabled.
- User cannot read other private reviews.
- Provider cannot read other provider reviews.
- Provider cannot read verification evidence.
- Provider cannot change rating.
- Provider cannot moderate.
- Moderator can access queues.
- Medical reviewer access is assigned-only.
- Legal reviewer access is assigned-only.
- Service role is not exposed to client.
- Hidden, rejected, and blocked reviews are excluded from aggregate.

## 6. Source Integration Validation

If future source code is touched under a separate approval, validation must confirm:

- Review types are used safely.
- No direct raw table exposure to client exists.
- Server components/actions respect auth boundaries.
- Provider dashboard access is scoped.
- Public pages use safe projection only.
- No schema JSON-LD is generated from raw/private tables.
- No public Persian/Hindi routes are created.
- No accidental sitemap/index changes are introduced.

## 7. Failure and Stop Conditions

Future implementation must stop if:

- Generated types fail.
- Migration fails.
- RLS tests fail.
- Public view exposes private fields.
- Broad authenticated select appears.
- Anon write appears.
- Service role is used client-side.
- `Review` or `AggregateRating` schema appears before approval.
- Unrelated source, package, or config changes appear.
- Generated types include unexpected changes.
- Validation command is unavailable without explanation.

## 8. Rollback Validation

Future rollback must verify:

- Migration can rollback or has a safe forward-fix strategy.
- Generated types reflect rollback or forward-fix state.
- RLS policies are removed/adjusted safely.
- No orphaned public views remain.
- No public access remains open.
- App typecheck still passes.
- Validators pass.

## 9. CI / PR Report Requirements

Future implementation PR reports must include:

- Migration files.
- Generated type files.
- Validation commands and results.
- RLS positive/negative test summary.
- Public/private exposure summary.
- Rollback notes.
- Known warnings.
- Blockers.

## 10. Explicit Non-Implementation

This spec explicitly does not create or modify:

- Generated type update.
- Migration.
- RLS tests.
- Validator implementation.
- Source code.
- Package changes.
- CI changes.
- Routes.
- Schema.
- Analytics/tracking.

## 11. Future PR Sequence

Recommended future sequence, subject to separate approval:

1. Review Database Foundation Migration.
2. Generated Types Update.
3. Review RLS Policy Implementation.
4. Review RLS Test Harness.
5. Admin Queue Read-Only UI.

## 12. Completion Report Requirements

A completion report for this spec or future related work must include:

- Files created/changed.
- Confirmation docs-only.
- Confirmation no migration, generated types, or source changes were made unless explicitly approved by that future phase.
- Summary of generated types strategy.
- Summary of validation matrix.
- Blockers/conflicts.
