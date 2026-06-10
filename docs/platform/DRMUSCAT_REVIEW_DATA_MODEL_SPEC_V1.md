# DrMuscat Review Data Model Spec V1

## Status and Authority

- Status: Documentation-only
- Authority: Future review/rating/moderation/dispute/provider-reply data model planning only
- Does not authorize implementation.
- Does not authorize database migration.
- Does not authorize table creation.
- Does not authorize RLS policy creation.
- Does not authorize generated type updates.
- Does not authorize API/server action creation.
- Does not authorize review/rating UI.
- Does not authorize Review schema.
- Does not authorize AggregateRating schema.
- Does not authorize analytics/tracking.
- Must be read together with:
  - `docs/platform/DRMUSCAT_VERIFIED_REVIEWS_RATINGS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PROVIDER_STORIES_COMMENTS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_LEGAL_TRUST_AI_EDITORIAL_POLICY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_SEO_REPORTING_ANALYTICS_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval.
- Future migration must follow the repository database migration protocol and RLS/security protocol.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only
- Lock Scope: Phase 0 — Repository Readiness
- Product Module: Phase 0 — Setup Only / documentation alignment
- Subphase ID: `ALIGN-REVIEW-DATA-MODEL-V1`

## 1. Purpose

This specification defines the future conceptual review data model before implementation. It records the planning boundary for DrMuscat verified reviews, ratings, moderation, disputes, provider replies, auditability, privacy controls, and migration readiness so later implementation phases can be reviewed against a frozen documentation baseline.

The future data model must support:

- verified reviews
- ratings
- review moderation
- provider replies
- disputes/removal requests
- abuse/fraud signals
- review reports
- review eligibility
- rating calculations
- schema eligibility planning
- privacy-safe verification evidence
- audit history
- future analytics/reporting
- future provider scoped access
- future admin moderation

This spec does not create tables, migrations, policies, APIs, UI, schema, analytics, or runtime behavior.

## 2. Data Model Principles

- Reviews are user-generated content with high trust risk.
- Ratings are derived from approved eligible reviews only.
- Verification evidence is private.
- Moderation decisions must be auditable.
- Provider replies are not reviews and do not affect rating averages.
- Disputes must not automatically remove reviews.
- Hidden, removed, rejected, or blocked reviews must not be counted unless future policy explicitly allows it.
- Legacy/imported reviews are blocked by default.
- Internal feedback is not public review content.
- Review/AggregateRating schema remains blocked until maturity.
- No public Persian/Hindi routes are authorized by this spec.
- No private patient data may be placed in public review fields.

## 3. Conceptual Entity Overview

Future conceptual entities may include:

- `review`
- `review_rating`
- `review_verification`
- `review_moderation_event`
- `review_report`
- `review_dispute`
- `provider_review_reply`
- `review_fraud_signal`
- `review_eligibility_snapshot`
- `review_aggregate_snapshot`
- `review_audit_event`
- `review_notification_event` later
- `review_policy_version_reference`

These are conceptual future entities only. They do not create database tables.

## 4. Review Entity

The review entity represents a user-submitted review about an approved provider, doctor, service, offer, or future supported reviewable entity.

Future fields may include:

- `id`
- `review_type`
- `reviewable_entity_type`
- `reviewable_entity_id`
- `provider_id`
- `doctor_id`
- `service_id`
- `offer_id`
- `author_user_id`
- `author_display_name_policy`
- `language`
- `locale`
- `country`
- `title`
- `body`
- `status`
- `moderation_status`
- `verification_status`
- `risk_level`
- `contains_medical_sensitive_content`
- `contains_private_data`
- `contains_abuse`
- `contains_defamation_risk`
- `submitted_at`
- `approved_at`
- `published_at`
- `hidden_at`
- `removed_at`
- `archived_at`
- `last_moderated_at`
- `moderated_by`
- `rejection_reason`
- `blocked_reason`
- `privacy_action_required`
- `dispute_status`
- `schema_eligible`
- `rating_eligible`
- `public_visibility`

Rules:

- Body must not contain private patient data.
- Public display requires approval.
- Reviewable entity must be approved/eligible.
- Status does not equal public visibility by itself.
- `schema_eligible` defaults false.
- `rating_eligible` defaults false until policy gates pass.

## 5. Rating Entity

Ratings store structured score dimensions associated with an approved review.

Future fields may include:

- `id`
- `review_id`
- `overall_rating`
- `cleanliness_rating`
- `communication_rating`
- `waiting_time_rating`
- `staff_behavior_rating`
- `value_transparency_rating`
- `booking_experience_rating`
- `service_quality_rating`
- `location_accessibility_rating`
- `provider_response_quality_rating`
- `rating_scale`
- `rating_version`
- `rating_eligible`
- `excluded_from_average`
- `exclusion_reason`
- `created_at`
- `updated_at`

Rules:

- Ratings require an associated review.
- Ratings must use approved dimensions only.
- Medical outcome ratings are avoided unless explicitly approved.
- Rating average must be derived, not manually edited.
- Sponsored/verified status cannot alter ratings.
- Provider replies do not affect ratings.

## 6. Review Verification Entity

Verification evidence helps determine whether a review may be labeled verified.

Future fields may include:

- `id`
- `review_id`
- `verification_type`
- `verification_status`
- `verified_by`
- `verified_at`
- `evidence_type`
- `evidence_reference`
- `evidence_private`
- `provider_invited`
- `invitation_id`
- `lead_id`
- `appointment_id`
- `receipt_reference`
- `phone_verified`
- `email_verified`
- `manual_verification_notes`
- `verification_expires_at`
- `rejection_reason`

Rules:

- Evidence must remain private.
- Verification labels require approved policy.
- No review may imply verified visit without evidence.
- Provider-invited reviews require manipulation controls.
- Raw patient/medical records must not be stored unless future privacy/legal policy explicitly approves it.
- Verification data must not be exposed to provider dashboards beyond approved safe labels.

## 7. Review Moderation Event Entity

Moderation events capture review decisions and status changes.

Future fields may include:

- `id`
- `review_id`
- `event_type`
- `from_status`
- `to_status`
- `moderator_user_id`
- `moderator_role`
- `reason_code`
- `reason_note`
- `medical_escalation_required`
- `legal_privacy_escalation_required`
- `fraud_escalation_required`
- `redaction_required`
- `public_visibility_changed`
- `rating_eligibility_changed`
- `schema_eligibility_changed`
- `created_at`

Rules:

- Every moderation decision must be auditable.
- Public visibility changes require audit.
- Rating/schema eligibility changes require audit.
- Redaction is future-only after policy approval.
- Moderator notes may be private.

## 8. Review Report Entity

Reports are user/provider/admin flags against a review.

Future fields may include:

- `id`
- `review_id`
- `reported_by_user_id`
- `reported_by_role`
- `report_type`
- `report_reason`
- `report_details`
- `status`
- `assigned_to`
- `resolved_by`
- `resolved_at`
- `resolution`
- `escalation_type`
- `created_at`

Report types may include:

- fake_review
- wrong_provider
- conflict_of_interest
- private_data
- defamation
- abuse
- duplicate
- spam
- medical_privacy_risk
- legal_risk
- provider_dispute
- user_safety

Rules:

- Reports do not automatically remove reviews.
- Report handling must be auditable.
- Report details may contain sensitive content and must be private by default.

## 9. Review Dispute Entity

Disputes are formal provider/user/admin challenges requiring review and resolution.

Future fields may include:

- `id`
- `review_id`
- `opened_by_user_id`
- `opened_by_role`
- `provider_id`
- `dispute_reason`
- `evidence_summary`
- `evidence_reference`
- `status`
- `assigned_admin_id`
- `legal_reviewer_id`
- `medical_reviewer_id`
- `resolution`
- `resolved_by`
- `resolved_at`
- `temporary_visibility_action`
- `rating_eligibility_action`
- `notes_private`
- `created_at`
- `updated_at`

Rules:

- Provider dispute does not automatically remove a review.
- Private evidence remains private.
- Legal/privacy/medical escalation may be required.
- Resolved disputes must be auditable.
- Rating eligibility may be suspended only under approved policy.

## 10. Provider Review Reply Entity

Provider replies are official responses to approved reviews by claimed/verified providers.

Future fields may include:

- `id`
- `review_id`
- `provider_id`
- `reply_author_user_id`
- `reply_body`
- `status`
- `moderation_status`
- `submitted_at`
- `approved_at`
- `published_at`
- `hidden_at`
- `removed_at`
- `moderated_by`
- `rejection_reason`
- `contains_private_data`
- `contains_medical_advice`
- `contains_abuse`
- `public_visibility`
- `created_at`
- `updated_at`

Rules:

- Provider replies do not affect rating averages.
- Provider replies require scoped provider access.
- Replies must not reveal patient data.
- Replies must not diagnose or prescribe.
- Replies may require moderation before display.
- Reply changes must be auditable.

## 11. Review Fraud Signal Entity

Fraud signals are moderation aids, not final decisions.

Future fields may include:

- `id`
- `review_id`
- `signal_type`
- `signal_score`
- `signal_source`
- `signal_summary`
- `privacy_sensitive`
- `requires_human_review`
- `reviewed_by`
- `reviewed_at`
- `reviewer_decision`
- `created_at`

Signal types may include:

- duplicate_text
- burst_pattern
- provider_self_review_suspected
- staff_review_suspected
- competitor_manipulation_suspected
- repeated_user_pattern
- incentivized_review_suspected
- review_bombing_suspected
- suspicious_invited_review_burst
- ip_device_signal_later_if_policy_approved

Rules:

- Fraud signals are not automatic guilt.
- Human review is required.
- IP/device signals require privacy approval before collection.
- Fraud data must not be public.

## 12. Review Eligibility Snapshot Entity

Eligibility snapshots capture whether a review is eligible for public display, rating calculation, schema, or reporting at a point in time.

Future fields may include:

- `id`
- `review_id`
- `public_display_eligible`
- `rating_average_eligible`
- `review_schema_eligible`
- `aggregate_rating_schema_eligible`
- `reporting_eligible`
- `eligibility_reason`
- `policy_version`
- `calculated_at`
- `calculated_by`
- `created_at`

Rules:

- Schema eligibility defaults false.
- AggregateRating eligibility defaults false.
- Rating eligibility depends on status, moderation, verification, and policy.
- Snapshots are planning concept only, not implementation.

## 13. Review Aggregate Snapshot Entity

Aggregate snapshots store computed rating summaries for eligible public display/reporting later.

Future fields may include:

- `id`
- `reviewable_entity_type`
- `reviewable_entity_id`
- `provider_id`
- `doctor_id`
- `eligible_review_count`
- `average_overall_rating`
- `dimension_averages`
- `rating_scale`
- `calculation_policy_version`
- `calculated_at`
- `calculated_by`
- `schema_eligible`
- `public_display_eligible`

Rules:

- Aggregates are derived, not manually edited.
- Aggregates use only approved eligible reviews.
- No AggregateRating schema until separate maturity approval.
- Hidden/rejected/blocked/admin_removed reviews are excluded unless future policy says otherwise.
- Provider cannot pay to alter aggregates.

## 14. Review Audit Event Entity

Audit events record sensitive review/rating lifecycle changes.

Future fields may include:

- `id`
- `entity_type`
- `entity_id`
- `actor_user_id`
- `actor_role`
- `action`
- `before_value_summary`
- `after_value_summary`
- `reason_code`
- `reason_note`
- `ip_or_device_context_later_if_policy_approved`
- `privacy_sensitive`
- `created_at`

Sensitive actions requiring audit:

- submit review
- approve review
- reject review
- hide review
- remove review
- block review
- report review
- open dispute
- resolve dispute
- change rating eligibility
- change schema eligibility
- publish provider reply
- hide provider reply
- fraud decision
- manual verification
- admin override

Rules:

- Audit logs must avoid leaking PHI.
- Sensitive audit data is private.
- Audit entries must be immutable in future implementation where possible.

## 15. Policy Version Reference

Review-related decisions should be tied to the policy version active at the time.

Future fields may include:

- `policy_version_id`
- `policy_name`
- `policy_version`
- `effective_date`
- `applies_to`
- `decision_context`
- `created_at`

Rules:

- Moderation and rating calculation must know which policy version applied.
- Schema eligibility must know which policy version applied.
- Future policy changes must not silently rewrite historical decisions.

## 16. Status and Enum Planning

The following are future enum-like values only. No enums are implemented in this PR.

Review statuses:

- draft
- submitted
- pending_moderation
- needs_revision
- approved
- rejected
- hidden
- reported
- under_dispute
- provider_replied
- admin_removed
- blocked
- archived

Verification statuses:

- unverified
- pending_verification
- verified_user
- verified_contact
- verified_visit
- manual_verified
- rejected
- expired

Moderation event types:

- submitted
- approved
- rejected
- hidden
- reported
- dispute_opened
- dispute_resolved
- blocked
- restored
- reply_submitted
- reply_approved
- reply_rejected
- rating_eligibility_changed
- schema_eligibility_changed

Dispute statuses:

- open
- under_review
- awaiting_user_response
- awaiting_provider_evidence
- escalated_legal
- escalated_medical
- resolved_keep
- resolved_hide
- resolved_remove
- resolved_block

Fraud signal statuses:

- unreviewed
- under_review
- dismissed
- confirmed
- escalated

## 17. Relationship Model

Conceptual relationships:

- One review belongs to one reviewable entity.
- One review may have one or more rating dimension records.
- One review may have zero or one verification record initially, extensible later.
- One review may have many moderation events.
- One review may have many reports.
- One review may have zero or more disputes.
- One review may have zero or more provider replies, but public display may restrict to latest approved reply.
- One review may have many fraud signals.
- One review may have many audit events.
- One review may have eligibility snapshots.
- Aggregate snapshots belong to a reviewable entity.

Rules:

- Relationships must preserve provider scoping.
- Provider access must not cross organizations.
- Public display must use approved/public-safe relationships only.

## 18. Public / Private Boundary

Public fields may include only after approval:

- approved review body
- approved rating
- approved reviewer display name policy output
- approved review date
- approved provider reply
- approved aggregate rating if eligible
- approved count if eligible

Private fields:

- `author_user_id`
- verification evidence
- phone/email evidence
- appointment/lead evidence
- moderation notes
- dispute evidence
- fraud signals
- audit logs
- privacy flags
- internal reviewer notes
- report details
- admin override reasons where sensitive

Rules:

- Private fields must never leak into public API responses.
- Provider dashboard sees only approved scoped data.
- No PHI/public patient data is allowed.
- Public reviewer identity policy must be approved.

## 19. RLS and Security Readiness Notes

This spec does not create RLS policies, but future RLS design must account for:

- Public read only approved public reviews when feature is launched.
- Authenticated users may create their own reviews only if review submission is enabled.
- Users may read/manage own review drafts according to policy.
- Providers may read/respond only to reviews for their own claimed/verified organization.
- Providers cannot moderate their own reviews.
- Providers cannot change ratings.
- Content managers/admins moderate according to role.
- Medical/legal reviewers see only assigned escalations.
- `super_admin` can override with audit.
- All sensitive tables are private by default.
- No anonymous writes.
- No client-only permission checks.

Future RLS spec is required before implementation.

## 20. Migration Readiness Gates

Before any review migration PR:

- verified reviews policy approved
- review data model approved
- review RLS/access control spec approved
- moderation workflow spec approved
- provider reply policy approved
- dispute/removal policy approved
- rating calculation policy approved
- privacy policy approved
- schema eligibility policy approved
- audit strategy approved
- public/private field boundary approved
- rollback plan approved
- generated type update plan approved
- validation plan approved

## 21. Explicit Non-Implementation

This PR includes:

- no migrations
- no tables
- no enums
- no constraints
- no indexes
- no RLS
- no generated types
- no API handlers
- no server actions
- no review UI
- no rating UI
- no provider reply UI
- no moderation UI
- no review routes
- no schema implementation
- no analytics/tracking
- no notification integration
- no seed data
- no source code changes
- no public Persian/Hindi routes

## 22. Future PR Sequence

Recommended future PR sequence only:

1. Review RLS and Access Control Spec
2. Review Moderation Workflow Spec
3. Review UI Wireflow Spec
4. Review Migration Plan Spec
5. Review Database Foundation Migration
6. Review Generated Types Update
7. Review Admin Read-Only Moderation Queue
8. Review Submission UI
9. Provider Reply UI
10. AggregateRating Schema Implementation only after review maturity approval

These recommendations do not authorize implementation.

## 23. Completion Report Requirements

Final Codex report must include:

- Files created/changed
- Confirmation documentation-only
- Confirmation no source code changed
- Confirmation no routes changed
- Confirmation no migrations/RLS/API/server actions changed
- Confirmation no review/rating/moderation/provider-reply/schema/runtime behavior was implemented
- Summary of future conceptual entities
- Summary of public/private boundary
- Summary of migration readiness gates
- Validation results
- Any blockers/conflicts
