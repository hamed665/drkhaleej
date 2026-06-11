# DrMuscat Review Moderation Workflow Spec V1

## Status and Authority

- Status: Documentation-only
- Authority: Future review moderation, dispute, provider reply, escalation, and audit workflow planning only
- Does not authorize implementation.
- Does not authorize database migration.
- Does not authorize table creation.
- Does not authorize RLS policy creation.
- Does not authorize API/server action creation.
- Does not authorize moderation UI.
- Does not authorize notification integration.
- Does not authorize AI moderation.
- Does not authorize Review schema.
- Does not authorize AggregateRating schema.
- Must be read together with:
  - `docs/platform/DRMUSCAT_VERIFIED_REVIEWS_RATINGS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_DATA_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_RLS_ACCESS_CONTROL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PROVIDER_STORIES_COMMENTS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_LEGAL_TRUST_AI_EDITORIAL_POLICY_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only
- Lock Scope: Phase 0 — Repository Readiness
- Product Module: Phase 0 — Setup Only / documentation alignment
- Subphase ID: `ALIGN-REVIEW-MODERATION-WORKFLOW-V1`

## 1. Purpose

This specification defines the future review moderation workflow for DrMuscat before any runtime implementation. It establishes the planned workflow boundaries for an Oman-first healthcare, beauty, wellness, pharmacy, lab, hospital, dental, pet clinic, and provider discovery platform where reviews may affect public trust, provider reputation, privacy, healthcare safety, and future SEO eligibility.

The future workflow must cover:

- review submission moderation
- review approval/rejection/hide/block
- medical escalation
- legal/privacy escalation
- fraud escalation
- provider dispute
- user report
- provider reply moderation
- admin override
- audit trail
- visibility and rating eligibility effects
- schema eligibility effects
- notification planning
- no automation without approval

This spec is planning-only and does not implement any feature, route, table, policy, queue, API, UI, notification, AI moderation, schema output, or runtime behavior.

## 2. Moderation Principles

- Moderation is required before public review display in early phases.
- Reviews must not become public automatically.
- Ratings must not be included in averages automatically.
- Review or AggregateRating schema eligibility must not be granted automatically.
- Private user data, private patient data, verification evidence, reports, disputes, fraud signals, and moderation notes must be protected.
- Medical-sensitive content must be escalated when it could create safety, diagnosis, prescription, emergency, treatment, procedure, medication, or outcome-risk concerns.
- Legal/privacy-sensitive content must be escalated when it may contain PHI, doxxing, defamation risk, consent concerns, takedown requests, illegal content, or privacy complaints.
- Suspected fraud must be escalated for human review; signals are not proof.
- A provider dispute must not automatically remove, hide, or change a review.
- Reviewer rights and provider rights must be balanced through scoped evidence, safe summaries, and auditable decisions.
- All sensitive actions must be auditable.
- Destructive actions require reason codes.
- AI suggestions cannot make final moderation, legal, medical, visibility, rating, or schema decisions.

## 3. Review Intake Workflow

Future review intake steps:

1. User starts review draft.
2. User submits review.
3. System validates required fields later in an approved implementation phase.
4. Review enters `pending_moderation`.
5. Preliminary risk flags are calculated later if approved.
6. Moderator reviews content.
7. Moderator chooses action.

Possible intake outcomes:

- `approve`
- `request_revision`
- `reject`
- `block`
- `escalate_medical`
- `escalate_legal_privacy`
- `escalate_fraud`
- `hold_for_verification`
- `hold_for_dispute_review`

Rules:

- No public visibility before approval.
- No rating calculation before eligibility.
- No schema eligibility before maturity approval.
- No provider notification may include private user data, verification evidence, private patient data, or raw moderation notes.

## 4. Moderation Decision Types

| Decision type | Purpose | Who may perform | Public visibility effect | Rating eligibility effect | Schema eligibility effect | Audit requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `approve_public` | Approve a public-safe review for display when policy allows. | Moderator, admin, or super_admin under future policy. | May become public if feature and entity are enabled. | May be eligible only if separate rating gates pass. | Remains false unless future maturity gates pass. | Required with actor, reason/policy, and before/after state. |
| `approve_public_no_rating` | Display a safe review while excluding rating impact. | Moderator, admin, or super_admin. | May become public. | Explicitly excluded from rating average/count. | Remains false. | Required with exclusion reason. |
| `approve_internal_only` | Retain review for internal context without public display. | Moderator, admin, or super_admin. | Not public. | Not eligible. | Not eligible. | Required with internal-only reason. |
| `request_revision` | Ask author to revise unsafe, incomplete, or policy-risk content. | Moderator or admin. | Not public while pending revision. | Not eligible. | Not eligible. | Required with safe author-facing reason. |
| `reject_policy_violation` | Reject review for general policy breach. | Moderator, admin, or super_admin. | Not public. | Not eligible. | Not eligible. | Required with policy reason code. |
| `reject_private_data` | Reject review containing private patient/user data. | Moderator, legal/privacy reviewer recommendation plus admin where required. | Not public. | Not eligible. | Not eligible. | Required with privacy sensitivity marker. |
| `reject_abuse` | Reject abusive, threatening, harassing, or hateful content. | Moderator, admin, or super_admin. | Not public. | Not eligible. | Not eligible. | Required with abuse reason code. |
| `reject_medical_advice_request` | Reject content that asks for diagnosis, prescription, emergency advice, or unsafe medical guidance. | Moderator with medical escalation where required. | Not public. | Not eligible. | Not eligible. | Required with medical-safety reason. |
| `reject_fake_review` | Reject review determined fake after approved human workflow. | Admin, super_admin, or fraud-authorized moderator. | Not public. | Not eligible. | Not eligible. | Required with evidence summary and privacy controls. |
| `block_review` | Block severe-risk review from publication/resubmission path. | Admin or super_admin; moderator if future policy allows. | Not public. | Not eligible. | Not eligible. | Required with destructive action reason. |
| `hide_public_review` | Hide an already-public review during policy review or after decision. | Moderator, admin, or super_admin under policy. | Removed from public display. | Excluded while hidden unless future policy explicitly says otherwise. | Not eligible while hidden. | Required with before/after visibility. |
| `admin_remove` | Remove a review from public and active workflows by admin decision. | Admin or super_admin only. | Not public. | Not eligible. | Not eligible. | Required with reason code, confirmation, and policy version. |
| `restore_review` | Restore a hidden/removed review where policy permits. | Admin or super_admin; moderator if future policy allows. | May become public only if approval and safety gates still pass. | Re-evaluated; not automatic. | Re-evaluated; not automatic. | Required with restoration reason. |
| `escalate_medical` | Send review to medical safety workflow. | Moderator, admin, or automated signal only as non-final triage if approved later. | Not public during pending escalation unless future policy allows safe hold state. | Not eligible. | Not eligible. | Required with trigger summary. |
| `escalate_legal_privacy` | Send review to legal/privacy workflow. | Moderator, admin, or super_admin. | Not public or hidden if already public according to risk policy. | Not eligible while unresolved. | Not eligible. | Required with privacy/legal sensitivity. |
| `escalate_fraud` | Send review/signal to fraud review workflow. | Moderator, admin, fraud reviewer, or approved signal pipeline later. | Not automatically changed; may be held under policy. | Not eligible while held. | Not eligible. | Required; raw signals remain private. |
| `open_dispute` | Open provider dispute for a provider-scoped review. | Provider owner/staff through future scoped flow, moderator, or admin. | No automatic effect. | No automatic effect. | No automatic effect. | Required with dispute reason. |
| `resolve_dispute_keep` | Resolve dispute and keep review active/public if otherwise eligible. | Moderator/admin; admin where escalated. | Public only if approved and not otherwise held. | Re-evaluated under policy. | Remains blocked unless maturity gates pass. | Required with outcome summary. |
| `resolve_dispute_hide` | Resolve dispute by hiding review from public display. | Admin or authorized moderator. | Not public. | Not eligible while hidden. | Not eligible. | Required with reason code. |
| `resolve_dispute_remove` | Resolve dispute by removing review from active public use. | Admin or super_admin. | Not public. | Not eligible. | Not eligible. | Required with destructive action reason. |
| `resolve_dispute_block` | Resolve dispute by blocking review due to severe policy/fraud/safety issue. | Admin or super_admin. | Not public. | Not eligible. | Not eligible. | Required with destructive action reason and evidence summary. |

## 5. Medical Escalation Workflow

Trigger examples:

- diagnosis request
- prescription request
- emergency request
- lab result interpretation
- pregnancy/children/high-risk condition
- invasive procedure claim
- medical outcome guarantee
- medication/weight-loss injection claim
- before/after clinical claim
- unsafe advice
- review text suggesting harm risk

Workflow:

- Moderator flags medical escalation.
- Medical reviewer receives assigned case.
- Medical reviewer sees only necessary context.
- Reviewer recommends approve, reject, hide, request revision, or escalate admin.
- Admin/moderator finalizes according to approved policy.
- Decision is audited.

Rules:

- Medical reviewer does not diagnose or prescribe.
- Public reply must not provide medical advice.
- Sensitive PHI remains private.
- Final public action must be safe.

## 6. Legal / Privacy Escalation Workflow

Trigger examples:

- PHI/private patient data
- doxxing
- defamation risk
- consent dispute
- copyrighted/stolen media
- takedown/removal request
- provider identity dispute
- false accusation
- illegal content
- threatening content
- privacy complaint

Workflow:

- Moderator flags legal/privacy escalation.
- Legal/privacy reviewer receives assigned case.
- Reviewer sees only needed evidence.
- Reviewer recommends hide, remove, redact future-only, or escalate admin.
- Admin/super_admin finalizes where required.
- Decision is audited.

Rules:

- Privacy-sensitive evidence remains private.
- Redaction is future-only after explicit policy.
- Provider dispute does not reveal private evidence by default.
- Legal text is not created in this PR.

## 7. Fraud Escalation Workflow

Trigger examples:

- duplicate text
- review bombing
- suspicious provider-invited review burst
- suspected provider self-review
- suspected staff review
- suspected competitor manipulation
- suspicious repeated user pattern
- paid/incentivized review suspicion
- fake evidence suspicion

Workflow:

- Fraud signal is created later only if approved.
- Moderator/admin reviews signal.
- No automatic guilt is inferred from a signal.
- Possible actions:
  - `dismiss_signal`
  - `hold_review`
  - `request_clarification`
  - `reject_review`
  - `block_review`
  - `escalate_admin`
  - `preserve_for_audit`
- Decision is audited.

Rules:

- Fraud signals are never public.
- Raw fraud details are not shown to providers.
- Privacy policy is required before device/IP signals are collected or used.
- AI/fraud models cannot decide final outcome.

## 8. Provider Dispute Workflow

Future steps:

1. Provider opens dispute on own-provider review.
2. Provider selects dispute reason.
3. Provider submits safe evidence summary.
4. Dispute enters queue.
5. Moderator/admin reviews.
6. Legal/privacy/medical escalation occurs if needed.
7. Outcome is decided.
8. Provider and reviewer receive safe outcome where policy allows.

Possible outcomes:

- `keep_review`
- `hide_temporarily`
- `request_reviewer_clarification`
- `request_provider_evidence`
- `remove_review`
- `block_review`
- `mark_dispute_unfounded`
- `escalate_legal_privacy`
- `escalate_medical`
- `preserve_for_audit`

Rules:

- Provider cannot remove review directly.
- Provider cannot edit review text or rating.
- Provider cannot access private user identity or evidence.
- Dispute does not automatically alter rating unless policy says.
- All outcomes are audited.

## 9. User Report Workflow

Future steps:

1. Logged-in user reports review.
2. User selects reason.
3. Report enters moderation queue.
4. Moderator triages.
5. Escalation occurs if needed.
6. Outcome is recorded.
7. Reporter receives safe status if policy allows.

Report reasons:

- spam
- abuse
- fake review
- privacy issue
- wrong provider
- defamation
- medical unsafe content
- illegal content
- duplicate
- other

Rules:

- No anonymous reports in early phases.
- Reports do not auto-hide reviews unless a later high-risk policy explicitly allows it.
- Report details are private.
- Repeated false reports may trigger abuse handling later.

## 10. Provider Reply Moderation Workflow

Future steps:

1. Provider drafts reply.
2. Reply enters pending moderation.
3. Moderator reviews.
4. Medical/legal escalation occurs if needed.
5. Moderator/admin approves, rejects, or requests revision.
6. Approved reply is eligible for public display later if the feature exists.

Provider replies must not:

- reveal patient identity
- reveal treatment details
- diagnose
- prescribe
- attack reviewer
- threaten user
- offer misleading guarantees
- manipulate ratings
- include private evidence

Rules:

- Provider replies do not affect rating average.
- Replies must be auditable.
- Provider replies require scoped provider access.

## 11. Visibility and Eligibility Effects

Future decisions must separately define effects on:

- public visibility
- rating average eligibility
- review count eligibility
- Review schema eligibility
- AggregateRating schema eligibility
- provider dashboard visibility
- author visibility
- moderation queue visibility

Decision effect rules:

- Approved does not automatically mean rating eligible.
- Rating eligible does not automatically mean schema eligible.
- Schema eligibility remains false until maturity gates are approved.
- Hidden, rejected, blocked, and admin-removed reviews are not public.
- Disputed reviews may need temporary policy for public visibility and rating inclusion.
- Aggregate recalculation is future-only and requires separate approved implementation.

## 12. Audit Trail Requirements

Audit is required for:

- review submission
- review approval
- rejection
- hide/remove/block
- provider dispute open/resolve
- user report
- provider reply submit/approve/reject
- medical/legal/fraud escalation
- rating eligibility change
- schema eligibility change
- admin override
- restore action
- destructive action

Audit fields should include:

- actor
- role
- action
- reason code
- before/after summary
- policy version
- timestamp
- entity scope
- privacy sensitivity

No audit implementation is authorized by this spec.

## 13. Notification Planning

Future safe notifications may include:

- review submitted
- review approved/rejected
- review needs revision
- report received
- dispute opened/resolved
- provider reply submitted/approved/rejected
- escalation assigned
- moderation action completed

Rules:

- No notification integration is authorized.
- No email, SMS, or WhatsApp implementation is authorized.
- Notifications must not leak PHI.
- Providers receive only safe scoped summaries.
- Users receive only safe status.

## 14. AI Moderation Assistance Planning

AI may assist later with:

- spam suggestions
- toxicity flag suggestions
- PHI/private data flag suggestions
- fraud signal suggestions
- duplicate detection suggestions
- provider reply safety suggestions
- moderation summary drafts

AI must not:

- approve/reject/hide/delete reviews automatically
- change ratings
- rewrite user reviews
- generate fake reviews
- decide legal/medical outcome
- expose private data
- notify users/providers directly

No AI implementation is authorized by this spec.

## 15. Moderation Queue Planning

Future queues:

- `pending_review_queue`
- `medical_escalation_queue`
- `legal_privacy_queue`
- `fraud_signal_queue`
- `provider_dispute_queue`
- `user_report_queue`
- `provider_reply_queue`
- `admin_override_queue`
- `archived_actions_queue`

| Queue | Purpose | Allowed roles | Key fields | Blocked access | Default sort priority | Audit requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `pending_review_queue` | Triage newly submitted reviews before public display. | Moderators, admins, super_admins. | Review ID, entity scope, language, submission time, risk flags, author-safe status. | Public users, providers except safe own-provider status if approved, unrelated reviewers. | Oldest pending first, then high-risk flags. | Required for decision and state changes. |
| `medical_escalation_queue` | Review medical-sensitive cases. | Assigned medical reviewers, admins, super_admins; moderators as policy allows. | Review/reply ID, medical trigger, assigned reviewer, minimal context, recommendation. | Public users, providers, unassigned reviewers. | Medical safety hold and urgent triggers first. | Required for assignment, recommendation, and final action. |
| `legal_privacy_queue` | Review legal/privacy-sensitive cases. | Assigned legal/privacy reviewers, admins, super_admins. | Entity ID, privacy/legal trigger, evidence summary, assigned reviewer, hold status. | Public users, providers, unassigned reviewers, unrelated moderators. | Privacy/legal hold first, then takedown/threat risk. | Required for assignment, recommendation, and final action. |
| `fraud_signal_queue` | Review suspicious patterns without presuming guilt. | Fraud reviewers, admins, super_admins; limited moderator summary if approved. | Signal ID, review/entity scope, pattern type, safe summary, status. | Public users, providers, authors, general moderators unless approved. | Fraud burst and high-impact entities first. | Required; raw signal access must be recorded. |
| `provider_dispute_queue` | Triage provider disputes on own-provider reviews. | Moderators, admins, super_admins; legal/medical reviewers if escalated. | Dispute ID, provider ID, review ID, dispute reason, safe evidence summary, status. | Public users, other providers, raw private author evidence by default. | Active public high-visibility disputes first, then age. | Required for open, evidence request, and resolution. |
| `user_report_queue` | Triage reports submitted by logged-in users/providers. | Moderators, admins, super_admins; escalation reviewers if needed. | Report ID, reason, review ID, reporter scope, status, risk flags. | Public users, providers except own safe report status if policy allows, review authors. | Privacy/medical/illegal/threat reports first. | Required for triage and outcome. |
| `provider_reply_queue` | Moderate provider replies before display. | Moderators, admins, super_admins; medical/legal reviewers if escalated. | Reply ID, provider ID, review ID, reply body, status, risk flags. | Public users, unrelated providers, unassigned reviewers. | Replies with legal/medical risk first, then oldest. | Required for submit, approval, rejection, revision. |
| `admin_override_queue` | Handle sensitive overrides requiring elevated authority. | Admins and super_admins only; super_admin for most destructive cases if policy requires. | Target entity, proposed action, reason code, before/after summary, confirmation status. | Public users, providers, authors, non-admin moderators. | Destructive and legal/privacy holds first. | Required with elevated audit detail. |
| `archived_actions_queue` | Preserve completed/archived moderation decisions for audit review. | Admins, super_admins, auditors; limited assigned reviewer read if policy allows. | Action ID, entity scope, final status, policy version, timestamp, actor summary. | Public users, providers, authors, unrelated staff. | Newest archived action first or audit-filtered priority. | Required; append-only planning target. |

## 16. SLA and Priority Planning

Future priority levels:

- `normal`
- `high`
- `urgent`
- `legal_hold`
- `medical_safety_hold`
- `privacy_hold`
- `fraud_hold`

Priority triggers:

- PHI/privacy issue
- threat/abuse
- emergency/unsafe medical content
- legal takedown request
- provider dispute with evidence
- public review with high visibility
- suspected fraud burst

No SLA automation is authorized by this spec.

## 17. Failure Modes to Avoid

- Review public before moderation.
- Rating included before eligibility.
- Hidden review counted in average.
- Provider removes negative review directly.
- Moderator changes rating value silently.
- Legal/privacy evidence exposed to provider.
- Medical reviewer sees unrelated review queues.
- AI deletes/rejects reviews automatically.
- Schema generated from unapproved reviews.
- Provider reply leaks PHI.
- Audit missing for destructive action.
- No reason code for admin remove.
- Report details public.
- Review author sees fraud signals.

## 18. Testing and Validation Planning

Future implementation tests should verify:

- submitted review stays non-public
- approved review becomes public only if safe
- rejected/blocked review is not public
- hidden/admin_removed review not counted
- provider cannot remove review
- provider cannot edit rating
- provider can submit reply only for own provider
- reply requires moderation
- medical reviewer assigned-only
- legal reviewer assigned-only
- fraud signals private
- audit event created for every sensitive action
- schema eligibility remains false by default
- AggregateRating blocked without maturity gates

## 19. Explicit Non-Implementation

- No migrations.
- No tables.
- No RLS policies.
- No helper functions.
- No database functions.
- No triggers.
- No generated types.
- No API handlers.
- No server actions.
- No moderation UI.
- No review UI.
- No provider reply UI.
- No queues.
- No notifications.
- No AI moderation.
- No schema implementation.
- No analytics/tracking.
- No source code changes.
- No public Persian/Hindi routes.

## 20. Future PR Sequence

Recommended future sequence only:

1. Review UI Wireflow Spec
2. Review Migration Plan Spec
3. Review Database Foundation Migration
4. Review RLS Policy Implementation
5. Review Generated Types Update
6. Review Admin Read-Only Moderation Queue
7. Review Submission UI
8. Provider Reply UI
9. AggregateRating Schema Implementation only after review maturity approval

These recommendations do not authorize implementation.

## 21. Completion Report Requirements

Final Codex report must include:

- files created/changed
- confirmation documentation-only
- confirmation no code/routes/migrations/RLS/API/server actions changed
- confirmation no review/moderation/provider-reply/schema/runtime behavior implemented
- summary of moderation workflow
- summary of escalation workflow
- summary of audit and notification planning
- validation results
- blockers/conflicts
