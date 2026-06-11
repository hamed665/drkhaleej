# DrMuscat Review Database Foundation Migration Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Future review database foundation migration design only.
- This spec does not authorize implementation.
- This spec does not authorize SQL creation.
- This spec does not authorize migration file creation.
- This spec does not authorize table creation.
- This spec does not authorize generated type update.
- This spec does not authorize RLS policy creation.
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-REVIEW-DATABASE-FOUNDATION-MIGRATION-V1`.

## 1. Purpose

This spec defines the future database foundation shape for DrMuscat reviews. It is a planning document only and does not create SQL, migrations, tables, RLS, generated types, source code, UI, routes, schema, analytics, notification behavior, or runtime behavior.

The future database foundation must cover:

- Future table list.
- Table purpose.
- Key fields.
- Nullable strategy.
- Foreign key strategy.
- Rating strategy.
- Verification evidence privacy.
- Moderation/audit design.
- Aggregate snapshot design.
- No public access until RLS is approved and tested.

## 2. Future Table Inventory

The following conceptual future tables are candidates only. Exact table names and fields must be verified against the actual schema before any implementation.

| Conceptual Table | Purpose | Public/Private Default | Sensitive Fields | Owner/Scope | Relationship Notes | RLS Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `review_policy_versions` | Stores policy/version references used by review decisions. | Private. | Policy metadata, decision references, internal notes if any. | Admin/policy governance. | Referenced by reviews, moderation events, disputes, and audit events. | Medium; policy data can reveal internal moderation standards. |
| `reviews` | Stores raw review records and lifecycle status. | Private raw table. | Author identity, body, lifecycle timestamps, risk/status fields. | Author user and reviewable provider/entity scope. | Parent for ratings, verification, moderation, reports, disputes, replies, fraud signals, eligibility, aggregates, and audit. | Critical; raw review content and author identity must not leak. |
| `review_ratings` | Stores rating values and dimensions for a review. | Private raw table. | Rating dimensions, eligibility/exclusion metadata. | Review-owned; provider scoped through review only. | Child of `reviews`; aggregate source only after eligibility rules. | High; ratings must not be provider-modifiable or publicly exposed early. |
| `review_verifications` | Stores verification status and evidence references. | Private. | Phone/email/lead/appointment/receipt references and evidence metadata. | Verification/moderation team. | Child of `reviews`; may reference approved lead/appointment/receipt records later. | Critical; evidence must not be visible to providers or public users. |
| `review_moderation_events` | Records moderation lifecycle decisions and escalations. | Private. | Moderator identity, reasons, notes, escalation details. | Moderator/admin/legal/medical assigned scope. | Append-only child of `reviews` where possible. | Critical; notes and escalation content are sensitive. |
| `review_reports` | Stores user/provider reports about reviews. | Private. | Reporter identity, report reason/details, triage status. | Reporter and moderation scope. | Child of `reviews`; may trigger moderation events. | High; reporter privacy and report content must be protected. |
| `review_disputes` | Stores provider dispute workflow records. | Private with limited provider-scoped access only after approval. | Evidence, internal notes, legal/medical escalation details. | Provider-scoped plus assigned reviewer scope. | Child of `reviews`; may reference provider reply/moderation events. | Critical; providers must not see protected evidence or other-provider data. |
| `provider_review_replies` | Stores provider replies separately from review bodies. | Private until approved public projection. | Reply body, provider actor, moderation status. | Provider-scoped. | Child of `reviews`; public only after moderation approval. | High; replies can leak PHI or treatment details. |
| `review_fraud_signals` | Stores fraud or abuse indicators. | Private. | IP/device/risk indicators, model/tool outputs if ever approved. | Trust/safety and assigned reviewers. | Child of `reviews`; informs moderation but is not a final decision. | Critical; fraud signals must not imply public/provider guilt. |
| `review_eligibility_snapshots` | Stores derived eligibility for display, aggregation, and schema. | Private by default. | Eligibility reasons, exclusion reasons, policy version. | System/moderation governance. | Derived from review, rating, moderation, verification, and fraud state. | High; eligibility mistakes can cause unsafe public display. |
| `review_aggregate_snapshots` | Stores derived aggregate values for reviewable entities. | Private until public aggregate approval. | Count/rating snapshots, exclusion metadata. | System-generated. | Derived from eligibility snapshots and eligible ratings. | Critical; aggregates affect trust and future schema output. |
| `review_audit_events` | Captures sensitive review actions. | Private. | Actor, role, action, reason, before/after, policy version. | Admin/audit scope. | References review entities by type/id and policy versions. | High; audit logs must avoid PHI and remain protected. |
| `review_notification_events` later | Optional later event table for notification workflows. | Private. | Notification payload metadata, recipient references. | Server-side notification system. | Created only if notification integration receives separate approval. | Medium; payloads can leak review data if not minimized. |

## 3. Core Reviews Table Planning

A future `reviews` table may conceptually include the following columns, subject to schema verification and separate approval:

- `id`
- `review_type`
- `reviewable_entity_type`
- `reviewable_entity_id`
- `provider_id`
- `doctor_id`
- `service_id`
- `offer_id`
- `author_user_id`
- `language`
- `locale`
- `title`
- `body`
- `status`
- `moderation_status`
- `verification_status`
- `risk_level`
- `submitted_at`
- `approved_at`
- `published_at`
- `hidden_at`
- `removed_at`
- `archived_at`
- `created_at`
- `updated_at`

Rules:

- The raw table is private by default.
- Public display is allowed only through an approved projection later.
- Review body must be moderated before public display.
- `status` does not equal public visibility alone; public visibility must also respect moderation, verification/eligibility, RLS, and projection rules.

## 4. Ratings Table Planning

Future rating storage must observe these planning rules:

- One review may have one or more rating dimensions.
- Rating scale planning must be explicit and consistent across entity types.
- Rating bounds must be enforced when implementation is approved.
- Exclusion flags must support moderation, fraud, hidden, rejected, blocked, and admin-removed outcomes.
- Rating eligibility must be derived, not manually assumed.
- Aggregate values must not be manually edited except through a separately approved controlled recalculation process.
- Providers cannot modify ratings.
- Medical outcome ratings must not be introduced without explicit policy approval.

## 5. Verification Table Planning

Future verification records must be privacy-first:

- Verification evidence is private.
- Verified labels are policy-gated and do not automatically authorize public display.
- Phone, email, lead, appointment, or receipt references are private.
- Raw patient records must not be stored unless a future policy explicitly approves it.
- Providers cannot see raw verification evidence.
- Verification status must be auditable.

## 6. Moderation / Report / Dispute Tables Planning

Future moderation, report, and dispute records must follow these rules:

- Moderation events should be append-only where possible.
- Reports are private.
- Disputes may be scoped to a provider, but private evidence remains protected.
- Legal, medical, and fraud escalations require assigned-only access.
- Reason codes are required for sensitive decisions.
- Destructive actions must be audited.

## 7. Provider Reply Table Planning

Future provider replies must be separate from reviews:

- Provider replies are stored separately from review records.
- Provider replies are scoped by `provider_id`.
- Provider replies require moderation before public display.
- Provider replies must not include PHI, treatment details, diagnosis, or prescription information.
- Provider replies do not affect rating averages.
- Approved public display may happen later only through a safe projection.

## 8. Fraud Signal Table Planning

Future fraud signal records must remain internal and decision-support only:

- Fraud signals are private.
- Fraud signals are not automatic guilt.
- Human review is required before enforcement decisions.
- IP/device signals require policy approval.
- Providers cannot see raw fraud signals.
- AI/fraud tools cannot make final decisions.

## 9. Eligibility and Aggregate Snapshot Planning

Future eligibility and aggregate snapshots must preserve safety and maturity gates:

- Eligibility snapshots default false for schema and aggregate use.
- Aggregate snapshots are derived from eligible reviews only.
- Aggregate count/rating may be public only after explicit approval.
- No `AggregateRating` schema is allowed until maturity approval.
- Hidden, rejected, blocked, and admin-removed reviews are excluded from aggregates.

## 10. Audit Planning

Future audit records must support accountability without creating new privacy risk:

- Audit events are required for sensitive actions.
- Audit events should include actor, role, action, reason, before/after, and policy version where appropriate.
- PHI must be avoided in audit logs.
- Audit logs are private by default.
- Audit events should be immutable or append-only where possible.

## 11. Existing Table Dependency Planning

Future implementation must not assume exact existing schema unless verified during the approved migration phase. Conceptual foreign key targets may include:

- Auth/user profile table for `author_user_id`.
- Provider/organization table for `provider_id`.
- Doctor/provider profile table for `doctor_id`.
- Offers table if offer reviews are later allowed.
- Policy/version table for policy references.

Rules:

- Future implementation must inspect the actual schema before migration.
- If exact table names differ from the plan, stop and report.
- No guessing is allowed during migration.

## 12. RLS Enablement Planning

Future RLS planning must use private-by-default access:

- Raw tables are private by default.
- RLS must be enabled on every review table.
- No anon write policies are allowed.
- No broad authenticated select policies are allowed.
- Public projection may be added later only after approval.
- Service role access must remain server-only.
- Positive and negative RLS tests are required.

## 13. Naming and Style Rules

Future database foundation work must:

- Follow repo naming conventions.
- Use `snake_case` table and column names.
- Use consistent timestamps.
- Use consistent status naming.
- Avoid ambiguous columns.
- Avoid public/private confusion.
- Document every status and reason code.
- Avoid final SQL in this spec.

## 14. Explicit Non-Implementation

This spec explicitly does not create or modify:

- Migration.
- SQL.
- Tables.
- RLS.
- Generated types.
- API.
- UI.
- Schema.
- Source code changes.

## 15. Future PR Sequence

Recommended future sequence, subject to separate approval:

1. Review Migration Plan approval.
2. Review Database Foundation Migration.
3. Review Generated Types Update.
4. Review RLS Policy Implementation.
5. Review RLS Tests.
6. Admin Read-Only Queue.

## 16. Completion Report Requirements

A completion report for this spec or future related work must include:

- Files created/changed.
- Confirmation docs-only.
- Confirmation no migration, table, RLS, generated types, or code changes were made unless explicitly approved by that future phase.
- Summary of future table inventory.
- Summary of privacy-sensitive tables.
- Summary of RLS readiness.
- Blockers/conflicts.
