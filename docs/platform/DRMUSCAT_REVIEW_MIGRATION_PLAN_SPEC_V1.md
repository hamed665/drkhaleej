# DrMuscat Review Migration Plan Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Future review migration planning only.
- This spec does not authorize implementation.
- This spec does not authorize SQL migration creation.
- This spec does not authorize table creation.
- This spec does not authorize enum creation.
- This spec does not authorize index or constraint creation.
- This spec does not authorize RLS policy creation.
- This spec does not authorize generated type updates.
- This spec does not authorize runtime code.
- This spec must be read together with:
  - `docs/platform/DRMUSCAT_VERIFIED_REVIEWS_RATINGS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_DATA_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_RLS_ACCESS_CONTROL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_MODERATION_WORKFLOW_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_UI_WIREFLOW_SPEC_V1.md`
- Future migration requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-REVIEW-MIGRATION-PLAN-V1`.

## 1. Purpose

This spec defines the future migration plan for review system implementation before any database, RLS, generated type, API, UI, route, schema, or runtime behavior is built. It is a planning and implementation-readiness document only.

The future migration plan must cover:

- Migration sequencing.
- Dependency checks.
- Table grouping.
- Enum strategy.
- Constraints strategy.
- Indexes strategy.
- RLS sequencing.
- Generated types sequencing.
- Rollback strategy.
- Validation strategy.
- No public access until RLS is explicitly approved and tested.
- No schema or rating public display until review maturity is separately approved.

No implementation is authorized by this spec.

## 2. Migration Prerequisites

Before any review migration is created or applied, the following prerequisites must be satisfied:

- Review policy specs approved.
- Review data model spec approved.
- Review RLS/access control spec approved.
- Review moderation workflow spec approved.
- Review UI wireflow spec approved.
- Public/private boundary approved.
- Rollback plan approved.
- Generated types plan approved.
- Validation plan approved.
- No unresolved scope conflict.
- No public review launch assumption.
- No `AggregateRating` assumption.

If any prerequisite is missing, ambiguous, or conflicting, the future migration task must stop and report the blocker.

## 3. Proposed Migration Grouping

Future migration groups should be planned as discrete, reviewable units. The groups below are conceptual only and do not authorize any migration file.

| Group | Purpose | Dependencies | Risk Level | Rollback Considerations | Validation Requirement |
| --- | --- | --- | --- | --- | --- |
| 1. Review enums and base types | Define reusable review statuses and base value sets if repo convention supports database enums. | Approved status taxonomy and repo enum convention inspection. | Medium, because enum rollback can be difficult. | Prefer reversible text/check constraints if project convention favors them; document enum removal limitations. | Verify names, values, and generated type impact before use. |
| 2. Review core tables | Establish the private raw review and rating foundation. | Existing schema inspection and approved FK targets. | High, because core tables may hold sensitive review content. | Keep table creation separate from public exposure; no production data deletion without approval. | Apply migration locally and verify table structure and privacy defaults. |
| 3. Review moderation/report/dispute tables | Support moderation history, reports, disputes, escalation, and evidence separation. | Core review table and role/escalation policy approval. | High, because moderation and dispute records can contain sensitive material. | Preserve append-only history where possible; avoid destructive rollback after data exists. | Verify private defaults and RLS readiness. |
| 4. Provider reply tables | Store provider replies separately from reviews. | Core reviews, provider ownership model, reply moderation policy. | Medium to high, because replies can expose PHI if not moderated. | Separate reply records from ratings and allow safe status rollback. | Verify provider scope fields and no rating aggregate side effects. |
| 5. Audit and policy reference tables | Track sensitive actions and policy versions used for decisions. | Approved audit fields and policy/version model. | High, because audit logs must avoid PHI while preserving accountability. | Avoid deleting audit records; use additive correction patterns. | Verify actor/action/reason coverage and PHI minimization. |
| 6. Eligibility and aggregate snapshot tables | Store future derived eligibility and aggregate values. | Approved eligibility rules, mature review policy, no public display assumption. | High, because aggregates can influence public trust and schema output. | Rebuild snapshots from eligible source records if rules change. | Verify hidden/rejected/blocked/admin_removed reviews are excluded. |
| 7. Optional notification event tables later | Queue review-related notifications if separately approved. | Notification policy, delivery system, and privacy rules. | Medium, with privacy risk if payloads leak review data. | Use minimal payloads and safe retry/disable strategy. | Verify no notification integration is activated without approval. |
| 8. Indexes and constraints | Add performance and integrity support for approved access patterns. | Final table fields and query plan review. | Medium, with migration performance risk. | Drop/recreate indexes only in approved maintenance windows if needed. | Verify moderation, provider, and public-safe query support without over-indexing. |
| 9. RLS enablement | Enable row-level security on review tables before exposure. | Table creation complete and RLS test harness planned. | High, because misconfiguration can leak private data. | RLS rollback must not open public access; fail closed. | Verify RLS is enabled and no unsafe default access exists. |
| 10. RLS policies in separate implementation phase | Add explicit policies for public projection, authenticated users, providers, moderators, admins, and assigned reviewers. | Role matrix, helper functions, assignment model, and tests approved. | Critical, because policies define data access. | Policy rollback must be tested and preserve private defaults. | Positive and negative RLS tests required. |
| 11. Generated types update | Regenerate Supabase types after approved migrations apply cleanly. | Clean migration state and generated type command availability. | Medium, because type drift can break source integration. | Document generated type rollback or forward-fix strategy. | Review generated diff for only expected review changes. |
| 12. Validator updates | Add or update validators only when implementation scope approves them. | Migration, generated types, and RLS validation needs. | Medium, because validators can block CI if incorrect. | Revert validator changes if scope or assumptions are wrong. | Confirm validators catch unsafe public access and unexpected source changes. |

## 4. Candidate Future Migration Files

Do not create these files in this PR. The following names are conceptual future filenames only:

- `supabase/migrations/<timestamp>_review_core_foundation.sql`
- `supabase/migrations/<timestamp>_review_moderation_foundation.sql`
- `supabase/migrations/<timestamp>_review_eligibility_aggregate_foundation.sql`
- `supabase/migrations/<timestamp>_review_rls_enablement.sql`
- `supabase/migrations/<timestamp>_review_rls_policies.sql`

These are planning names only. No migration file is created in this PR.

## 5. Table Sequencing Plan

Future table creation should proceed in dependency order and must remain private until RLS and public projection rules are approved.

| Order | Future Table/Support Area | Dependency | Why Before/After | Public/Private Default | RLS Risk | Validation Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Review policy/version reference support | Approved policy version model. | Policy references should exist before review decisions are stored. | Private. | Medium. | Verify policy version references are stable and not user-editable without approval. |
| 2 | `reviews` | Existing user/provider/entity targets verified. | Core parent record for ratings, moderation, reports, disputes, replies, and audit. | Private raw table. | Critical. | Verify no anon or broad authenticated access. |
| 3 | `review_ratings` | `reviews`. | Ratings depend on a review and must remain separate for dimensions and eligibility. | Private raw table. | High. | Verify rating bounds and no provider mutation path. |
| 4 | `review_verifications` | `reviews` and approved verification policy. | Verification evidence depends on review identity and must remain private. | Private. | Critical. | Verify evidence fields are excluded from public projections. |
| 5 | `review_moderation_events` | `reviews` and moderator role model. | Moderation history should append to review lifecycle decisions. | Private. | Critical. | Verify assigned-only/legal/medical restrictions when applicable. |
| 6 | `review_reports` | `reviews` and report taxonomy. | Reports target existing reviews. | Private. | High. | Verify reporter privacy and report status rules. |
| 7 | `review_disputes` | `reviews`, provider scope, and dispute policy. | Provider disputes require review and provider identity. | Private with provider-scoped limited access later. | Critical. | Verify provider cannot see protected evidence beyond approved fields. |
| 8 | `provider_review_replies` | `reviews`, provider scope, reply policy. | Replies are separate child records and must be moderated before display. | Private until approved projection. | High. | Verify replies do not affect rating averages. |
| 9 | `review_fraud_signals` | `reviews` and fraud policy. | Fraud signals attach to reviews but are not final decisions. | Private. | Critical. | Verify provider and public cannot read raw signals. |
| 10 | `review_eligibility_snapshots` | Reviews, ratings, moderation, verification, and fraud status. | Eligibility should be derived after lifecycle inputs exist. | Private by default. | High. | Verify default false for schema/aggregate eligibility. |
| 11 | `review_aggregate_snapshots` | Eligibility snapshots and aggregate policy. | Aggregates derive from eligible reviews only. | Private until public aggregate approval. | Critical. | Verify excluded statuses do not count. |
| 12 | `review_audit_events` | Review lifecycle tables and audit taxonomy. | Audit events capture sensitive actions across the review system. | Private. | High. | Verify PHI minimization and immutable/append-only behavior. |
| 13 | `review_notification_events` later | Notification feature approval. | Notifications should be delayed until review workflows are stable. | Private. | Medium. | Verify no notification integration or payload leak without approval. |

## 6. Enum and Status Strategy

Future enum-like values may include:

- `review_type`
- `review_status`
- `moderation_status`
- `verification_status`
- `report_type`
- `dispute_status`
- `provider_reply_status`
- `fraud_signal_status`
- `eligibility_status`
- `risk_level`
- `escalation_type`

Rules:

- Prefer consistency with existing repo enum style.
- Avoid premature enum lock if project convention prefers text columns with check constraints.
- Any enum requires rollback awareness, including how to handle value removal and generated type changes.
- No enum is created in this PR.

## 7. Constraint Strategy

Future constraint planning must include:

- Foreign keys only to approved existing tables.
- Avoid circular dependencies.
- Nullable fields for future optional reviewable entity types.
- Check constraints for rating range.
- Check constraints for status if enum types are not used.
- `created_at` and `updated_at` requirements consistent with repo convention.
- Deleted/archived behavior documented before implementation.
- Rating value bounds enforced at the database layer when approved.
- Provider scoping constraints where provider ownership is required.
- No public data leak through constraint messages.

No constraints are created by this spec.

## 8. Index Strategy

Future indexes should be planned for:

- Reviews by reviewable entity.
- Reviews by `provider_id`.
- Reviews by `author_user_id`.
- Reviews by `status`.
- Reviews by `moderation_status`.
- Reviews by `verification_status`.
- Reviews by `submitted_at`.
- Ratings by `review_id`.
- Moderation events by `review_id`.
- Reports by `review_id` and `status`.
- Disputes by `provider_id` and `status`.
- Provider replies by `review_id` and `status`.
- Fraud signals by `review_id` and `status`.
- Aggregate snapshots by reviewable entity.
- Audit events by `entity_type` and `entity_id`.

Rules:

- Indexes must support moderation queues.
- Indexes must support provider-scoped reads.
- Indexes must support public approved review reads only after public projection approval.
- Avoid over-indexing and validate expected query paths before adding indexes.
- No indexes are created in this PR.

## 9. RLS Sequencing Plan

Future RLS sequencing must follow a fail-closed model:

- Enable RLS before any public access.
- No public `SELECT` until a public-safe view or policy is approved.
- No anon `INSERT`, `UPDATE`, or `DELETE`.
- Authenticated writes only after a feature gate is approved.
- Provider-scoped reads only after helper policy approval.
- Moderation/admin policies only after the role matrix is approved.
- Medical/legal assigned-only policies only after the assignment model is approved.
- Service role jobs must remain server-side only.
- RLS tests are required before public use.

No RLS implementation is authorized by this spec.

## 10. Public View / Projection Strategy

Future public exposure must use approved projections rather than raw private tables:

- Raw review tables are private by default.
- Public views/projections may be created only after separate approval.
- Public projection may include approved body, rating, date, display name, reply, and aggregate fields.
- Public projection must not include `author_user_id`.
- Public projection must not include verification evidence.
- Public projection must not include moderation notes.
- Public projection must not include dispute evidence.
- Public projection must not include fraud signals.
- Public projection must not include audit logs.
- Public projection must not include PHI.
- Schema JSON-LD must use only approved public projection data.

No views are created by this spec.

## 11. Rollback Strategy

Future review migration PRs must define rollback requirements before implementation:

- Migrations should be reversible where possible.
- Destructive rollback must be avoided after production data exists.
- Use additive migrations when possible.
- Separate table creation from public exposure.
- RLS policy rollback must be tested.
- Generated type rollback must be documented.
- No production data deletion is allowed without explicit approval.
- Rollback notes must be included in every migration PR.
- A failed migration must stop and report a blocker.

## 12. Validation Strategy

Future validation should include, where available and applicable:

- `supabase db lint` if available.
- Local migration apply/reset if the repo supports it.
- Schema diff check.
- Generated types diff check.
- RLS positive tests.
- RLS negative tests.
- No public `SELECT` leakage tests.
- No anon write tests.
- Provider cross-scope denial tests.
- Moderation/admin access tests.
- Public projection field tests.
- TypeScript typecheck after generated types.
- `pnpm lint`.
- `pnpm typecheck`.
- Project validator if available.

No validation implementation is authorized by this spec.

## 13. Stop Conditions

A future migration must stop if any of the following occur:

- Required docs are missing.
- Existing table conflicts are discovered.
- Naming conflict is discovered.
- Unresolved role conflict exists.
- Unsafe public access is detected.
- RLS cannot be tested.
- Generated type update fails.
- Migration cannot rollback and no approved safe forward-fix exists.
- Validator fails.
- Package or source changes appear unexpectedly.
- No explicit approval exists for migration scope.

## 14. Explicit Non-Implementation

This spec explicitly does not create or modify:

- SQL files.
- Migrations.
- Tables.
- Enums.
- Constraints.
- Indexes.
- RLS.
- Generated types.
- API handlers.
- Server actions.
- UI.
- Public views.
- Private views.
- Schema implementation.
- Analytics/tracking.
- Notification integration.
- Seed data.
- Source code changes.
- Public Persian/Hindi routes.

## 15. Future PR Sequence

Recommended future sequence, subject to separate approval:

1. Review Database Foundation Migration PR.
2. Review Generated Types Update PR.
3. Review RLS Policy Implementation PR.
4. Review Admin Read-Only Moderation Queue PR.
5. Review Submission UI PR.
6. Provider Reply UI PR.
7. Aggregate Rating Display PR.
8. `AggregateRating` Schema PR only after maturity approval.

These are recommendations only and do not authorize implementation.

## 16. Completion Report Requirements

A completion report for this spec or future related migration work must include:

- Files created/changed.
- Confirmation documentation-only.
- Confirmation no SQL, migration, table, RLS, generated types, or code changes were made unless explicitly approved by that future phase.
- Summary of migration grouping.
- Summary of RLS sequencing.
- Summary of rollback and validation strategy.
- Blockers/conflicts.
