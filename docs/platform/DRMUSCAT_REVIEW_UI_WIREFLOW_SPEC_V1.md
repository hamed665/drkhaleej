# DrMuscat Review UI Wireflow Spec V1

## Status and Authority

- Status: Documentation-only
- Authority: Future review UI wireflow and UX state planning only
- Does not authorize implementation.
- Does not authorize routes.
- Does not authorize components.
- Does not authorize forms.
- Does not authorize review widgets.
- Does not authorize moderation dashboards.
- Does not authorize provider dashboard changes.
- Does not authorize API/server actions.
- Does not authorize analytics/tracking.
- Does not authorize schema.
- Must be read together with:
  - `docs/platform/DRMUSCAT_VERIFIED_REVIEWS_RATINGS_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_DATA_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_RLS_ACCESS_CONTROL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_REVIEW_MODERATION_WORKFLOW_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only
- Lock Scope: Phase 0 — Repository Readiness
- Product Module: Phase 0 — Setup Only / documentation alignment
- Subphase ID: `ALIGN-REVIEW-UI-WIREFLOW-V1`

## 1. Purpose

This specification defines future review UI flows before implementation. It aligns public review display, review submission, provider replies, reports, disputes, moderation queues, escalation views, aggregate rating display, privacy boundaries, accessibility, and multilingual states with the review data, RLS, moderation, legal/trust, and SEO planning specs.

Future UI areas:

- public review display
- review submission flow
- logged-in user review management
- provider reply flow
- report review flow
- provider dispute flow
- moderation queue
- medical/legal escalation views
- admin override flow
- aggregate rating display
- empty/restricted states
- multilingual English/Arabic review UI

No UI, route, component, form, API, server action, dashboard, schema, or runtime behavior is implemented by this spec.

## 2. Public Review Display Wireflow

Future public display on provider/doctor pages may include:

- review summary block
- average rating only if eligible
- review count only if eligible
- approved review list
- approved provider replies
- report review action
- write review CTA only if enabled
- empty state
- no AggregateRating schema until maturity
- no review display if feature disabled

States:

- reviews disabled
- no approved reviews
- approved reviews exist but aggregate not eligible
- aggregate eligible
- review under dispute hidden
- provider reply pending hidden
- provider reply approved

The public display flow must never imply that schema, aggregate rating, or review publication is available before separate approval and implementation.

## 3. Review Submission Wireflow

Future steps:

1. User clicks write review.
2. Login is required.
3. User selects reviewable entity.
4. User enters rating dimensions.
5. User writes review.
6. User sees medical/privacy warning.
7. User confirms no private patient data.
8. User submits.
9. Review enters pending moderation.
10. User sees submitted state.

Validation messages:

- login required
- rating required
- body required
- do not include private medical data
- do not request diagnosis/prescription/emergency help
- unsupported provider/entity
- duplicate review warning
- submission disabled

No form implementation is authorized by this spec.

## 4. User Review Management Wireflow

Future user states:

- draft
- submitted
- pending moderation
- needs revision
- approved
- rejected
- hidden
- reported
- under dispute
- removed

User actions:

- edit draft
- view status
- request removal
- respond to revision request
- report privacy issue
- view safe moderation outcome

Blocked:

- bypass moderation
- approve own review
- edit after approval without policy
- see internal moderation notes
- see provider evidence
- see fraud signals

## 5. Provider Reply Wireflow

Future provider flow:

1. Provider owner/staff views own-provider approved review.
2. Provider clicks reply.
3. Reply guidance is shown.
4. Provider drafts reply.
5. Reply enters pending moderation.
6. Moderator approves, rejects, or requests revision.
7. Approved reply displays under review.

Guidance:

- do not reveal patient identity
- do not discuss treatment details
- do not diagnose/prescribe
- do not attack reviewer
- invite private contact if needed
- correct facts politely

No provider reply UI implementation is authorized by this spec.

## 6. Report Review Wireflow

Future flow:

1. Logged-in user or provider reports review.
2. Reporter selects reason.
3. Reporter enters optional details.
4. Reporter confirms report.
5. Report enters queue.
6. User/provider receives safe status if policy allows.

Report reasons:

- spam
- abuse
- privacy issue
- fake review
- wrong provider
- defamation
- medical unsafe content
- duplicate
- other

No report UI implementation is authorized by this spec.

## 7. Provider Dispute Wireflow

Future provider flow:

1. Provider owner opens dispute on own-provider review.
2. Provider selects dispute reason.
3. Provider provides safe evidence summary.
4. Provider submits dispute.
5. Dispute enters moderation queue.
6. Outcome is shown as safe summary.

States:

- dispute submitted
- under review
- awaiting provider evidence
- awaiting user clarification
- resolved keep
- resolved hide
- resolved remove
- resolved block

No dispute UI implementation is authorized by this spec.

## 8. Moderation Queue Wireflow

Future admin/moderator queue areas:

- pending reviews
- reported reviews
- disputed reviews
- provider replies
- medical escalations
- legal/privacy escalations
- fraud signals

Queue actions:

- approve
- reject
- hide
- request revision
- escalate medical
- escalate legal/privacy
- escalate fraud
- open dispute
- resolve dispute
- approve/reject provider reply
- restore
- admin remove

No moderation UI implementation is authorized by this spec.

## 9. Medical / Legal Escalation Wireflow

Future views:

- assigned cases only
- minimum necessary context
- private evidence protected
- reviewer recommendation
- admin finalization
- audit trail

Medical reviewer actions:

- recommend approve
- recommend reject
- recommend hide
- recommend request revision
- recommend admin escalation

Legal/privacy actions:

- recommend hide
- recommend remove
- recommend redact future-only
- recommend request evidence
- recommend admin escalation

No escalation UI implementation is authorized by this spec.

## 10. Admin Override Wireflow

Future super_admin/admin override must require:

- reason code required
- before/after summary
- policy version reference
- audit required
- dangerous action confirmation
- rollback/reversal note

Override actions:

- hide
- admin remove
- restore
- change eligibility
- lock dispute
- resolve dispute
- publish correction notice future-only

No override UI implementation is authorized by this spec.

## 11. Aggregate Rating Display Wireflow

Rules:

- Average rating is hidden until eligibility threshold is approved.
- Rating count is hidden until eligible.
- AggregateRating schema is blocked until maturity approval.
- Rating display must use approved eligible reviews only.
- Hidden, rejected, blocked, and admin_removed reviews are excluded.
- Provider cannot pay to alter display.
- Sponsored/verified status does not alter display.
- Display must clearly distinguish verified/claimed/sponsored status from rating.

States:

- aggregate disabled
- insufficient approved reviews
- aggregate eligible but schema disabled
- aggregate and schema eligible later after approval

## 12. Empty, Disabled, and Restricted States

UI copy concepts to define later:

- reviews disabled
- reviews coming later
- no approved reviews yet
- write review unavailable
- login required
- pending moderation
- reply pending moderation
- under dispute
- hidden for policy review
- removed by moderation
- reporting unavailable
- provider reply unavailable

No copy finalization is authorized; this section is planning-only.

## 13. Arabic / English UI Planning

- English and Arabic UI states are required.
- Arabic requires RTL layout support.
- Review submission labels must be localized.
- Warning messages must be localized.
- Moderation status labels must be localized.
- Rating dimension labels must be localized.
- No Persian/Hindi public review UI is authorized.
- Arabic review content must not be auto-translated without policy.
- Language/locale must be stored according to data model planning.

## 14. Accessibility and UX Rules

- Forms must be keyboard accessible.
- Error messages must be clear.
- Star/rating controls must be accessible.
- Screen reader labels are required.
- Status indicators must not rely on color only.
- Destructive actions require confirmation.
- Privacy warnings should use plain language.
- Flow must be mobile-friendly.
- Dark patterns must be avoided.
- Sponsored/verified distinctions must be clear.
- Loading, error, and empty states must be planned.

## 15. Privacy and Safety UX Rules

Future warnings must communicate:

- do not include personal health information
- do not include phone/email unless policy allows
- do not request diagnosis/prescription/emergency help
- contact provider directly for private matters
- use emergency services for urgent/emergency situations
- reviews are moderated
- provider replies are public if approved
- report privacy issue

## 16. Public / Private Display Boundary

Public UI may show:

- approved review body
- approved rating
- approved display name policy output
- approved date
- approved provider reply
- approved aggregate if eligible

Public UI must not show:

- `author_user_id`
- verification evidence
- moderation notes
- dispute evidence
- fraud signals
- report details
- audit logs
- PHI/private data

## 17. Failure Modes to Avoid

- Review shown before moderation.
- Rating shown before eligibility.
- AggregateRating schema implied by UI too early.
- Provider reply shown before moderation.
- Private evidence exposed.
- User thinks review is medical consultation.
- Provider can delete negative review.
- Confusing verified/sponsored/rating labels.
- Arabic layout broken.
- Inaccessible star controls.
- Dark patterns discouraging negative reviews.
- Fake urgency/incentives.
- Unsupported medical claims in UI.

## 18. Explicit Non-Implementation

- No routes.
- No components.
- No forms.
- No review widgets.
- No moderation dashboard.
- No provider dashboard changes.
- No API handlers.
- No server actions.
- No database changes.
- No RLS changes.
- No generated types.
- No analytics/tracking.
- No schema implementation.
- No notification implementation.
- No source code changes.
- No public Persian/Hindi routes.

## 19. Future PR Sequence

Recommended future sequence only:

1. Review Migration Plan Spec
2. Review Database Foundation Migration
3. Review RLS Policy Implementation
4. Review Generated Types Update
5. Review Admin Read-Only Moderation Queue
6. Review Submission UI
7. Provider Reply UI
8. Aggregate Rating Display UI
9. AggregateRating Schema Implementation only after maturity approval

These recommendations do not authorize implementation.

## 20. Completion Report Requirements

Final Codex report must include:

- files created/changed
- confirmation documentation-only
- confirmation no code/routes/components/migrations/RLS/API/server actions changed
- confirmation no review UI/moderation UI/provider reply UI/schema/runtime behavior implemented
- summary of public review display flow
- summary of submission/provider reply/moderation flows
- summary of privacy/safety UI boundaries
- validation results
- blockers/conflicts
