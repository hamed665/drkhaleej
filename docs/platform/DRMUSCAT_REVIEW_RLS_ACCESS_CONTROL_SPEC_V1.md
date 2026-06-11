# DrMuscat Review RLS & Access Control Spec V1

## Status and Authority

- Status: Documentation-only
- Authority: Future review RLS and access-control planning only
- Does not authorize implementation.
- Does not authorize database migration.
- Does not authorize table creation.
- Does not authorize RLS policy creation.
- Does not authorize database function/RPC/trigger creation.
- Does not authorize generated type updates.
- Does not authorize API/server action creation.
- Does not authorize UI/dashboard creation.
- Does not authorize Review schema.
- Does not authorize AggregateRating schema.
- Must be read together with:
  - `docs/platform/DRMUSCAT_VERIFIED_REVIEWS_RATINGS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_DATA_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PROVIDER_STORIES_COMMENTS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_LEGAL_TRUST_AI_EDITORIAL_POLICY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval.
- Future RLS implementation must follow the repository database migration protocol and RLS/security protocol.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only
- Lock Scope: Phase 0 — Repository Readiness
- Product Module: Phase 0 — Setup Only / documentation alignment
- Subphase ID: `ALIGN-REVIEW-RLS-ACCESS-CONTROL-V1`

## 1. Purpose

This specification defines future access-control and Row Level Security planning for review-related data before implementation. It provides a security baseline for review submissions, ratings, moderation, provider replies, disputes, reports, verification evidence, fraud signals, audit records, public display, provider scoping, and future administrative workflows.

The future RLS/access model must protect:

- public users
- authenticated review authors
- providers
- doctors
- provider staff
- content moderators
- medical reviewers
- legal/privacy reviewers
- admins
- super_admins
- private user data
- verification evidence
- moderation notes
- dispute evidence
- fraud signals
- rating integrity
- provider scoped access
- public SEO safety

This spec does not create policies, tables, functions, triggers, migrations, APIs, or runtime behavior.

## 2. Core Security Principles

- Deny by default.
- Sensitive review data is private by default.
- Public read access may include only approved public-safe review data after a separately approved feature launch.
- Anonymous writes are blocked.
- Provider cross-organization access is blocked.
- Providers cannot moderate their own reviews.
- Providers cannot edit ratings.
- Providers cannot change review eligibility.
- Users can only manage their own drafts/submissions under an approved policy.
- Moderators can only perform actions allowed by role.
- Medical reviewers see only assigned medical escalations.
- Legal/privacy reviewers see only assigned legal/privacy escalations.
- Super admin override requires audit.
- Client-only permission checks are not sufficient.
- All public/private boundaries must be enforced server-side and through RLS.
- RLS policies must not rely on untrusted client-supplied fields.

## 3. Actor and Role Model

| Actor/role | Allowed future read access | Allowed future write access | Blocked access | Audit requirement | Notes |
| --- | --- | --- | --- | --- | --- |
| Anonymous visitor | Approved public-safe review fields and approved aggregate fields only after public review display launch. | None. | All private review data, verification evidence, report details, dispute evidence, fraud signals, audit logs, author identifiers, and writes. | None for passive public reads unless future abuse controls require logging. | Public reads must be served from safe public views or equivalent scoped access. |
| Authenticated user | Their own review drafts/submissions and public-safe review data. | Create drafts, submit reviews, report reviews, and request removal only where policy and feature gates allow. | Other users' private review data, moderation notes, provider dispute evidence, fraud signals, and admin fields. | Required for submissions, reports, edit requests, and removal requests. | Authentication alone does not grant broad review access. |
| Review author | Own draft/submitted review, own allowed moderation status, and approved public output. | Edit own draft before submission; request edit/delete/removal under policy. | Approving, rejecting, hiding, bypassing moderation, or reading internal notes/evidence. | Required for submission, resubmission, edit, deletion/removal request, and report actions. | Author access must be based on trusted user identity, not client-supplied `author_user_id`. |
| `provider_owner` | Approved public reviews for own provider; scoped summaries for pending/reported/disputed reviews where policy allows. | Submit provider replies, open disputes, and provide provider-side dispute evidence for own provider only where approved. | Other providers' reviews, private author identity, verification evidence, moderation notes, fraud signals, rating edits, moderation actions, deletes, and aggregate manipulation. | Required for replies, disputes, evidence submission, and sensitive reads. | Ownership must be proven by server/RLS helper logic. |
| `provider_staff` | Same-provider public reviews and limited scoped operational summaries as delegated by provider owner/admin policy. | Draft replies or dispute inputs only if delegated; final submission may require provider owner/admin policy. | Cross-provider data, private identities, evidence, moderation, rating edits, and schema eligibility changes. | Required for delegated actions and sensitive reads. | Staff permissions must be least-privilege and provider-scoped. |
| `doctor/provider_staff` | Approved public reviews tied to own profile/entity where policy allows. | Request correction/escalation through provider-owned workflow; draft replies if assigned and approved. | Self-verification, self-review, rating edits, moderation, cross-provider data, private evidence, and direct publishing without workflow. | Required for correction/escalation requests and reply drafts. | Doctor-level access must not bypass provider organization scoping. |
| `content_manager` | Pending review queues, report/dispute summaries, and moderation history needed for assigned content tasks. | Approve/reject/hide/request revision/flag escalation only where role policy allows. | Legal/privacy override, unnecessary evidence, service-role-like access, direct rating calculation changes, and schema eligibility changes without approval. | Required for all moderation actions and queue access where sensitive. | Content management powers must remain narrower than admin/super_admin. |
| `moderator` | Pending reviews, reports, disputes, provider replies, and moderation history necessary for moderation. | Moderation decisions, escalation flags, provider reply moderation, and revision requests under approved policy. | Unrelated legal/privacy holds, unnecessary verification evidence, direct rating changes, direct schema eligibility changes, and client-side privileged access. | Required for all moderation decisions, escalations, and reversals. | Moderation must be auditable and policy-versioned. |
| `medical_reviewer` | Assigned medical-sensitive escalations and only the medical-relevant context needed for decision. | Add medical notes, recommend hide/reject/escalate, and flag unsafe medical claims. | Unrelated queues, fraud/device signals, unrelated provider data, unnecessary identifiers, final publication unless separately granted. | Required for every view and note on medical escalations. | Medical review must not become diagnosis/prescription via platform response. |
| `legal_privacy_reviewer` | Assigned legal/privacy escalations, takedown/removal requests, and relevant evidence. | Add legal/privacy notes and recommend hide/remove/redact/escalate. | Unrelated queues, direct rating calculation changes, public policy publication without approval, and evidence exposure. | Required for every view, note, recommendation, and decision. | Assigned-only access reduces unnecessary exposure of private data. |
| `admin` | Operational moderation queues, disputes, escalation assignments, provider replies, and policy-scoped records. | Assign escalations, approve provider replies, manage workflows, and act within approved policy. | Silent rating manipulation, unaudited destructive actions, service role use from client, and unapproved policy-sensitive changes. | Required for sensitive reads, workflow changes, assignments, and destructive actions. | Admin access is broad but still policy-bound and audited. |
| `super_admin` | Policy-sensitive records needed for approved override, configuration, and dangerous operations. | Override with audit, configure future review feature gates, approve dangerous operations, and approve policy-sensitive changes. | Client-side service role usage, unaudited overrides, and unsupported direct public exposure. | Always required for overrides, dangerous operations, configuration, and destructive actions. | Super admin powers must be rare, reason-coded, and reversible where possible. |
| `service_role/system job future-only` | Only records required for approved jobs. | Aggregate snapshots, eligibility snapshots, fraud calculation, notification events, reporting exports, and archival only after separate approval. | Any client exposure, broad non-audited access, automatic publishing unless policy allows, and uncontrolled schema eligibility changes. | Required for job execution, outputs, failures, and changes. | Service role/system jobs are future-only and require separate approval. |

## 4. Review Data Visibility Classes

| Visibility class | Examples | Who may read | Who may write/update | Public exposure rule | Provider exposure rule |
| --- | --- | --- | --- | --- | --- |
| `public_safe_review_fields` | Approved review body, approved title, approved display name output, approved date, locale, public status label. | Public users after launch; authenticated users; provider-scoped roles for their own provider; moderation/admin roles. | Review author before submission for draft fields; moderators/admins for approved public output status under policy. | Public only after approval, feature launch, and no privacy/legal/medical hold. | Providers may read for their own provider after approval; summaries for non-public states require policy. |
| `review_author_private_fields` | `author_user_id`, author account references, author contact indicators, own moderation status. | Review author, admins where policy requires, assigned moderators where needed. | Author for draft data; system/admin for trusted status fields. | Never public. | Providers must not see private author identity beyond approved public display policy output. |
| `provider_scoped_review_fields` | Provider ID, reviewable entity references, provider-scoped queue status, provider reply status. | Provider owner/staff for own provider; moderators/admins; authors for own review where allowed. | Trusted system/moderation/admin flows; provider roles only for own replies/disputes. | Public only if included in approved public output. | Own-provider only; no cross-provider access. |
| `moderator_private_fields` | Moderation status, notes, rejection reasons, policy version, escalation flags. | Moderators/content managers/admins; assigned reviewers where needed. | Moderation/admin roles under policy. | Never public. | Providers may receive safe status summaries only if policy allows; no raw notes. |
| `medical_escalation_fields` | Medical sensitivity flags, medical reviewer notes, unsafe claim assessment. | Assigned medical reviewers, admins, super_admins, and moderators where needed. | Assigned medical reviewers for notes/recommendations; admins for assignment and final workflow. | Never public except final redacted public outcome if approved. | Providers see only safe outcome/summary where policy allows. |
| `legal_privacy_escalation_fields` | PHI flags, defamation risk, consent/takedown notes, privacy hold state. | Assigned legal/privacy reviewers, admins, super_admins, and moderators where needed. | Assigned legal/privacy reviewers and admins under policy. | Never public except final approved public-safe action. | Providers see only policy-approved summary, not private evidence. |
| `fraud_signal_fields` | Device/IP risk indicators, duplicate detection, suspicious invitation burst, risk scores. | Fraud/admin/super_admin/system job roles as approved; limited moderator summary if policy allows. | System jobs and approved admin/fraud workflows. | Never public. | Providers must not see raw fraud signals; safe summary only if policy allows. |
| `verification_evidence_fields` | Appointment, lead, receipt, invitation, booking, or visit evidence references. | Assigned moderators/admins and verification roles where approved; authors may see limited own evidence status. | Trusted verification workflows and system/admin roles. | Never public. | Providers must not see private user evidence unless explicit policy permits a safe subset for dispute. |
| `audit_log_fields` | Actor, action, reason code, old/new state summary, timestamp, policy version. | Admins, super_admins, auditors, and assigned reviewers where necessary. | Append-only system/admin logging. | Never public. | Providers may receive safe outcome only, not raw audit logs. |
| `aggregate_public_fields` | Approved average rating, approved count, rating distribution if approved, entity ID. | Public users after launch and eligibility approval; authenticated users; provider roles for own provider; admin roles. | System jobs only after approved aggregate policy; super_admin/admin for reason-coded corrections only if allowed. | Public only after aggregate eligibility gates pass. | Providers may read own aggregates but cannot edit them. |
| `internal_reporting_fields` | Queue metrics, trend reports, moderation SLA, provider report summaries, export metadata. | Admin/reporting roles; provider roles only for own safe summaries if approved. | System jobs/admin reporting workflows under policy. | Never public unless transformed into approved public-safe aggregate. | Own-provider scoped summaries only; no cross-provider reporting. |

## 5. Table-by-Table RLS Planning

No SQL policies are created by this specification. The following entities are conceptual future planning targets only.

| Future conceptual table/entity | Public SELECT rule | Authenticated user SELECT rule | Authenticated user INSERT rule | Author UPDATE rule | Provider SELECT rule | Provider INSERT/UPDATE rule | Moderator/admin rule | Medical/legal reviewer rule | Service role/system job rule if needed later | Hard blocked operations | Audit requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review` | Only approved public-safe fields after launch, no holds, eligible entity. | Own reviews and public-safe reviews; no broad private access. | Draft/submit only where feature is enabled and entity is reviewable. | Own draft only before submission; resubmission only under policy. | Own-provider approved reviews and safe scoped summaries only. | No review text/rating edits; may trigger dispute/reply workflows only through separate tables. | Moderate status/visibility under policy. | Assigned escalation context only. | May update derived status only if approved workflow requires. | Anonymous writes, cross-provider reads, provider moderation, direct rating/schema manipulation. | Required for submit, moderation state changes, visibility changes, escalation, removal. |
| `review_rating` | Approved rating only if review is public and rating eligible. | Own rating and public-safe ratings. | With own eligible review submission only. | Own draft rating before submission; post-moderation changes only via approved resubmission. | Own-provider public/scoped rating summaries only. | Providers cannot insert/update ratings. | May mark eligibility/exclusion under policy but cannot silently alter values. | Assigned context only if relevant to escalation. | Aggregate jobs may read eligible ratings. | Provider edits, unaudited eligibility changes, hidden/rejected ratings in public aggregate. | Required for changes to rating values, eligibility, exclusion, and aggregate impact. |
| `review_verification` | Never public. | Own verification status only where policy allows; no raw evidence. | Evidence submission only through approved trusted flow if feature exists. | Author may update own pending evidence only before lock, where policy allows. | No raw evidence; safe own-provider dispute summary only if approved. | Providers cannot alter user evidence. | Verification/moderation roles may review evidence under policy. | Assigned legal/privacy/medical context only if relevant. | Verification jobs may calculate status after approval. | Public exposure, provider raw evidence access, self-verification, client-trusted verification. | Required for evidence reads, status changes, and verification decisions. |
| `review_moderation_event` | Never public. | Author may see safe status output only, not notes. | Users cannot insert moderation events. | None. | Providers may see safe status summary only if policy allows. | Providers cannot insert/update moderation events. | Moderators/admins insert decisions, notes, and escalations under policy. | Assigned reviewers may add notes/recommendations where relevant. | System may append workflow events if approved. | User/provider moderation, public notes, unaudited event edits/deletes. | Always required; preferably append-only. |
| `review_report` | Never public. | User may submit and see own report receipt/status if policy allows. | Authenticated report submission where feature enabled and anti-abuse rules pass. | Reporter may not edit after submission except withdrawal if approved. | Own-provider report/dispute-safe summaries only if policy allows. | Providers may report/open provider-side dispute through approved paths, not alter user reports. | Moderators/admins triage and resolve. | Assigned reviewers see reports relevant to escalation. | Jobs may create abuse/fraud derived summaries if approved. | Anonymous report spam, cross-provider report reads, public report details. | Required for report create, triage, resolution, escalation. |
| `review_dispute` | Never public. | Author may see safe status if their review is disputed, where policy allows. | Users may request dispute/removal only through approved policy. | Author may provide response/evidence only where approved. | Own-provider dispute creation and evidence submission only. | Providers may add own dispute evidence; cannot resolve or modify review directly. | Moderators/admins review, assign, resolve under policy. | Assigned medical/legal reviewers see relevant disputes only. | Jobs may manage deadlines/notifications if approved. | Cross-provider disputes, provider direct removal, raw evidence leaks. | Required for dispute open, evidence, assignment, resolution, and destructive outcomes. |
| `provider_review_reply` | Approved public reply only after moderation and no holds. | Public approved replies and own associated review context. | Users do not insert provider replies. | None. | Own-provider reply draft/submit/update before approval where policy allows. | Providers may draft/submit own replies; cannot publish without approval if moderation required. | Moderators/admins approve/reject/hide replies. | Assigned reviewers see replies with medical/legal risk. | Jobs may notify or archive only if approved. | Cross-provider replies, replies exposing PHI, provider self-publication without approved workflow. | Required for draft, submit, approve, reject, hide, publish. |
| `review_fraud_signal` | Never public. | Users cannot read raw signals. | Users cannot insert. | None. | Providers cannot read raw signals; safe summary only if policy allows. | Providers cannot write. | Admin/fraud/moderation roles may read summaries/actions under policy. | Medical/legal reviewers cannot read unless explicitly required for assigned case. | Fraud jobs may calculate/append signals. | Client exposure, provider raw signal access, unaudited signal overrides. | Required for signal creation, review, override, and export. |
| `review_eligibility_snapshot` | Eligibility output may affect public display but raw snapshot is not public unless approved. | Own review eligibility status only if policy allows. | Users cannot insert. | None. | Own-provider safe summary only if policy allows. | Providers cannot change eligibility. | Admin/moderation/SEO roles may review under policy. | Assigned reviewers see relevant holds. | Jobs may calculate snapshots under approved rules. | Client edits, provider edits, unapproved schema/rating eligibility changes. | Required for snapshot creation, recalculation, override. |
| `review_aggregate_snapshot` | Approved aggregate rating/count only after eligibility gates and launch. | Same as public plus own context if relevant. | Users cannot insert. | None. | Own-provider aggregate read only. | Providers cannot edit aggregates. | Admins may review and trigger recalculation under policy. | Reviewers normally no access unless assigned case impacts aggregate. | Aggregate jobs calculate snapshots. | Manual silent average edits, inclusion of hidden/rejected/blocked reviews. | Required for calculation, recalculation, override, publish/unpublish. |
| `review_audit_event` | Never public. | Users cannot read except possible safe own-action receipt outside raw audit. | Users cannot insert directly. | None. | Providers cannot read raw audit; safe own-action receipt only if approved. | Providers cannot write raw audit directly. | Admin/auditor/super_admin access under policy. | Assigned reviewers see only relevant audit entries if needed. | System appends immutable events. | Deletes, client writes, public exposure, cross-tenant leakage. | Always required; append-only and immutable where possible. |
| `review_policy_version_reference` | Public may read policy labels only if exposed as public policy docs, not raw internal records. | Users may see applicable public policy version labels. | Users cannot insert. | None. | Providers may see applicable public/provider policy version labels. | Providers cannot write. | Admin/super_admin manage approved policy references under change control. | Reviewers may reference assigned case policy version. | Jobs may stamp policy versions on events. | Unapproved policy changes, silent retroactive edits, client writes. | Required for policy creation, activation, deprecation, and case stamping. |

## 6. Public Read Policy Planning

Public users may eventually read only:

- approved review body
- approved rating
- approved public reviewer display name policy output
- approved review date
- approved provider reply
- approved aggregate rating/count if eligible
- only for reviewable entities approved for public display
- only if review display feature is launched
- only if no privacy/legal/medical hold applies

Public users must never read:

- `author_user_id`
- phone/email
- verification evidence
- appointment/lead/receipt evidence
- moderation notes
- dispute evidence
- fraud signals
- report details
- audit logs
- internal reviewer notes
- admin override reasons
- private patient data
- PHI

## 7. Authenticated User / Review Author Policy Planning

Authenticated users may eventually:

- submit review drafts where feature is enabled
- read their own submitted reviews
- read their own moderation status where policy allows
- edit own draft before submission
- request edit/delete/removal according to approved policy
- report reviews where feature is enabled

Authenticated users must not:

- approve their own reviews
- bypass moderation
- change ratings after moderation unless policy allows resubmission
- access other users' private review data
- see moderation notes
- see provider dispute evidence
- submit anonymous public reviews
- submit reviews for blocked/unsupported reviewable entities

## 8. Provider Owner / Provider Staff Policy Planning

Provider owners/staff may eventually:

- read approved public reviews for their own provider
- read pending/reported/disputed review summaries for their own provider only where policy allows
- submit provider replies for their own provider only
- view provider reply status for their own replies
- open dispute for their own provider's review
- provide evidence for own provider's dispute

Providers/staff must not:

- read reviews for other providers
- read private user identity beyond approved display
- read verification evidence
- read private medical/patient data
- moderate reviews
- approve/reject/hide reviews
- edit user review text
- edit ratings
- change average ratings
- change schema eligibility
- delete reviews
- access fraud signals unless policy allows safe summary
- see cross-provider reporting

## 9. Doctor / Provider Staff Policy Planning

Doctors or assigned provider staff may eventually:

- read approved public reviews tied to their own profile/entity where policy allows
- request correction/escalation through provider-owned workflow
- draft replies only if assigned and approved by provider_owner/admin policy

Doctors/staff must not:

- self-verify
- self-review
- modify ratings
- moderate reviews
- view cross-provider data
- view private verification/dispute/fraud details
- publish replies without approved workflow

## 10. Moderator / Content Manager Policy Planning

Moderators/content managers may eventually:

- read pending reviews
- read report/dispute queues
- approve/reject/hide reviews according to policy
- request revision
- flag medical/legal/fraud escalation
- moderate provider replies
- view moderation history necessary for task

Moderators/content managers must not:

- override legal/privacy holds without role approval
- change rating calculations directly
- change schema eligibility without SEO/admin approval
- access unnecessary verification evidence
- expose private user/patient data
- use service-role-like power from client-side code

## 11. Medical Reviewer Policy Planning

Medical reviewers may eventually:

- read reviews or replies assigned/escalated for medical-sensitive review
- view only medical-relevant context needed for decision
- add medical review notes
- recommend hide/reject/escalate
- flag unsafe medical claims

Medical reviewers must not:

- moderate unrelated reviews
- access fraud/device signals
- access unrelated provider data
- access unnecessary personal identifiers
- publish final decision unless policy grants role
- provide diagnosis/prescription through platform response

## 12. Legal / Privacy Reviewer Policy Planning

Legal/privacy reviewers may eventually:

- read assigned legal/privacy escalations
- review defamation/privacy/PHI/consent disputes
- recommend hide/remove/redact/escalate
- add legal/privacy notes
- review removal/takedown requests

Legal/privacy reviewers must not:

- access unrelated review queues
- change rating calculations directly
- publish final policy changes without approval
- expose private evidence
- use client-side-only access control

## 13. Admin and Super Admin Policy Planning

Admins may eventually:

- manage moderation workflows
- assign escalations
- review disputes
- approve provider replies
- view operational queues
- act within approved policy

Super admins may eventually:

- override with audit
- configure future review feature gates
- approve policy-sensitive changes
- approve dangerous operations

Rules:

- super_admin override must be audited
- destructive actions require reason codes
- admin actions must not silently alter rating averages
- service role must not be used from client
- production dangerous operations require validation and rollback plan

## 14. Service Role / System Job Planning

Future service role/system jobs may be needed for:

- aggregate snapshot calculation
- eligibility snapshot calculation
- notification event creation
- fraud signal calculation
- analytics/reporting export
- scheduled archival

Rules:

- service role must never be exposed to client
- jobs must be narrowly scoped
- jobs must be auditable
- jobs must not publish reviews automatically unless policy allows
- jobs must not change schema eligibility without approved rules
- jobs must respect privacy and PHI boundaries
- jobs require separate implementation approval

## 15. Operation Matrix

Values used below are planning labels only: `allowed`, `denied`, `scoped`, `assigned only`, `future-only`, `audit required`, and `policy required`.

| Operation | Anonymous | Authenticated user | Review author | Provider owner | Provider staff | Moderator/content_manager | Medical reviewer | Legal/privacy reviewer | Admin | Super admin | Service role future-only |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| create review draft | denied | policy required | allowed | denied | denied | denied | denied | denied | denied | denied | denied |
| submit review | denied | policy required | allowed | denied | denied | denied | denied | denied | denied | denied | denied |
| read own review | denied | scoped | allowed | denied | denied | denied | denied | denied | scoped | audit required | denied |
| edit own draft | denied | scoped | allowed | denied | denied | denied | denied | denied | denied | denied | denied |
| report review | denied | policy required | scoped | scoped | scoped | scoped | assigned only | assigned only | scoped | audit required | denied |
| approve review | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| reject review | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| hide review | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| remove review | denied | denied | policy required | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| open dispute | denied | policy required | scoped | scoped | scoped | scoped | denied | denied | scoped | audit required | denied |
| resolve dispute | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| submit provider reply | denied | denied | denied | scoped | scoped | denied | denied | denied | scoped | audit required | denied |
| approve provider reply | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | denied |
| calculate aggregate | denied | denied | denied | denied | denied | denied | denied | denied | policy required | audit required | future-only |
| read aggregate | future-only | future-only | future-only | scoped | scoped | scoped | assigned only | assigned only | scoped | audit required | future-only |
| change rating eligibility | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | future-only |
| change schema eligibility | denied | denied | denied | denied | denied | policy required | assigned only | assigned only | audit required | audit required | future-only |
| view fraud signal | denied | denied | denied | denied | denied | policy required | denied | assigned only | audit required | audit required | future-only |
| view verification evidence | denied | denied | scoped | denied | denied | policy required | assigned only | assigned only | audit required | audit required | future-only |
| view audit event | denied | denied | denied | denied | denied | assigned only | assigned only | assigned only | audit required | audit required | future-only |

## 16. Public / Private API Boundary Planning

Future API/read model planning:

- Public APIs return only public-safe fields.
- Provider APIs are scoped to own provider.
- Author APIs are scoped to own reviews.
- Moderation APIs are restricted to moderation roles.
- Medical/legal APIs are assigned-only.
- Service APIs are not publicly callable.
- Raw table exposure for sensitive entities is blocked.
- Private fields must not appear in generated public types/views.
- Joins/views must not accidentally expose private fields.
- Review private data must not be included in SEO payloads.
- Private data must not be included in schema JSON-LD.

No API implementation is authorized by this spec.

## 17. RLS Helper Function Planning

Future helper concepts may include:

- current user id
- current user role
- `is_super_admin`
- `is_admin`
- `is_content_manager`
- `is_medical_reviewer`
- `is_legal_privacy_reviewer`
- `owns_provider(provider_id)`
- `staff_of_provider(provider_id)`
- `assigned_to_review(review_id)`
- `review_author(review_id)`
- `review_is_public(review_id)`
- `review_is_safe_for_provider_scope(review_id)`

Rules:

- helper functions require separate approval
- helper functions must avoid security definer mistakes
- helper functions must not expose private data
- helper functions must be tested with positive and negative cases
- no helper functions are implemented in this PR

## 18. Policy Failure Modes to Avoid

- Public can read private review data.
- Providers can read other providers' reviews.
- Providers can see `author_user_id` or verification evidence.
- Users can approve their own reviews.
- Providers can moderate their own reviews.
- Providers can alter rating averages.
- Hidden/rejected reviews included in aggregate.
- Service role exposed to client.
- Moderation notes leaked publicly.
- Fraud signals leaked to providers.
- Schema generated from unapproved reviews.
- `noindex`/`index` changed by review status accidentally.
- Client-only permission checks.
- Overbroad admin policies.
- Missing audit on overrides.
- Anonymous writes.
- Private PHI in public API response.

## 19. Testing and Validation Planning

Future implementation must test:

- anonymous cannot write
- anonymous can only read approved public-safe fields
- user can create own draft if enabled
- user cannot read other private reviews
- provider can only read own scoped review summaries
- provider cannot read verification evidence
- provider cannot change rating
- provider cannot moderate
- moderator can approve/reject only through approved paths
- medical reviewer sees only assigned medical escalations
- legal reviewer sees only assigned legal/privacy escalations
- hidden/rejected/blocked reviews excluded from public aggregates
- service role jobs do not expose outputs publicly
- public views exclude private fields
- schema excludes unapproved reviews

## 20. Migration Readiness Gates

Before any RLS/migration implementation:

- Review Data Model Spec approved
- Review RLS & Access Control Spec approved
- Review Moderation Workflow Spec approved
- Review policy/legal/trust specs approved
- public/private field boundary approved
- role matrix approved
- provider scoping model approved
- audit requirements approved
- helper function plan approved
- positive/negative test plan approved
- rollback plan approved
- generated type plan approved
- no public SELECT unless explicitly approved
- no anon INSERT/UPDATE/DELETE
- no broad authenticated access
- no service role client exposure

## 21. Explicit Non-Implementation

- no migrations
- no tables
- no RLS policies
- no helper functions
- no database functions
- no triggers
- no generated types
- no API handlers
- no server actions
- no UI
- no public views
- no private views
- no schema implementation
- no analytics/tracking
- no notification integration
- no seed data
- no source code changes
- no public Persian/Hindi routes

## 22. Future PR Sequence

Recommendations only:

1. Review Moderation Workflow Spec
2. Review UI Wireflow Spec
3. Review Migration Plan Spec
4. Review Database Foundation Migration
5. Review RLS Policy Implementation
6. Review Generated Types Update
7. Review Admin Read-Only Moderation Queue
8. Review Submission UI
9. Provider Reply UI
10. AggregateRating Schema Implementation only after review maturity approval

## 23. Completion Report Requirements

Final Codex report must include:

- Files created/changed
- Confirmation documentation-only
- Confirmation no source code changed
- Confirmation no routes changed
- Confirmation no migrations/RLS/API/server actions changed
- Confirmation no helper functions/database functions/triggers/generated types were created
- Confirmation no review/rating/moderation/provider-reply/schema/runtime behavior was implemented
- Summary of role/access model
- Summary of table-by-table RLS planning
- Summary of public/private API boundary
- Summary of migration readiness gates
- Validation results
- Any blockers/conflicts
