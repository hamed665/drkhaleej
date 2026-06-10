# DrMuscat Provider Stories & Comments Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Provider stories, updates, comments, moderation, UGC, and reviews-boundary planning only.
- This specification does not authorize implementation.
- This specification does not authorize story database creation.
- This specification does not authorize comment database creation.
- This specification does not authorize review database creation.
- This specification does not authorize moderation UI.
- This specification does not authorize provider dashboard changes.
- This specification does not authorize public story routes.
- This specification does not authorize comments/reviews runtime behavior.
- This specification does not authorize AggregateRating schema.
- Must be read together with:
  - `docs/platform/DRMUSCAT_CMS_CONTENT_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_MEDIA_SEO_VIDEO_IMAGE_PERFORMANCE_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_LEGAL_TRUST_AI_EDITORIAL_POLICY_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-PROVIDER-STORIES-COMMENTS-V1`.

## 1. Purpose

This specification defines future provider stories, provider updates, doctor updates, comments, UGC moderation, provider replies, and review-boundary planning before any implementation begins. It exists to align future engagement and trust features with DrMuscat's Oman-first healthcare, beauty, wellness, pharmacy, lab, hospital, dental, pet clinic, and provider discovery strategy without creating runtime behavior.

The future system may support:

- provider stories/updates
- doctor stories/updates
- provider announcements
- new service/equipment announcements
- educational snippets
- offer/event updates
- short media posts
- article comments later
- provider profile comments later
- provider replies later
- reporting/flagging
- admin moderation
- medical/legal/SEO review where needed
- noindex story defaults
- future review system boundaries

Stories/comments are engagement and trust features. They are not automatic SEO pages, review systems, star-rating systems, schema eligibility signals, or substitutes for verified reviews.

## 2. Story and Update Content Types

Future story/update content types are conceptual only and do not create tables, routes, UI, workflows, or permissions.

| Type | Purpose | Public/private nature | Default indexing | Review requirement | Media allowance | Expiry/archive behavior | Medical/legal sensitivity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `provider_story` | General provider update, trust-building note, or short announcement. | Future public display only after approval; private while drafting/reviewing. | Noindex by default. | Admin moderation; medical/legal review if claims or privacy risk exists. | Limited approved images/video under media policy. | May expire or archive by date or relevance; archived remains noindex. | Medium by default; high if clinical claims or patient context appears. |
| `doctor_story` | Doctor-specific update tied to approved doctor profile facts. | Future public display only after approval; private while drafting/reviewing. | Noindex by default. | Admin moderation; medical review for clinical content. | Limited approved doctor/facility media; no fake doctor imagery. | May expire or archive; archived remains noindex. | Medium/high because identity, credentials, and medical claims require care. |
| `center_update` | Center, clinic, hospital, lab, pharmacy, dental, beauty, wellness, or pet clinic operational update. | Future public display only after approval. | Noindex by default. | Admin moderation; legal/privacy review if operational notice affects users. | Facility images allowed only when privacy-safe. | May expire when outdated; archived remains noindex. | Low/medium unless it includes medical, privacy, or service-availability risk. |
| `service_update` | Announcement of a new or changed service. | Future public display only after approval. | Noindex unless promoted through a separate approved service route/content workflow. | Admin moderation; medical review for clinical claims. | Service media allowed only when accurate and consent-safe. | May expire if service changes or is replaced. | Medium/high for treatment claims, outcomes, eligibility, or safety. |
| `equipment_update` | New equipment, technology, or facility capability announcement. | Future public display only after approval. | Noindex by default. | Admin moderation; evidence review for equipment claims. | Equipment/facility media allowed if truthful and privacy-safe. | May expire/archive when equipment is retired or claim becomes outdated. | Medium/high if it implies outcomes, superiority, or medical efficacy. |
| `event_update` | Event, awareness session, open day, campaign, webinar, or community activity. | Future public display only after approval. | Noindex by default unless separately approved as event content. | Admin moderation; legal/medical review when topic is sensitive. | Event imagery allowed with consent and privacy controls. | Expires after event date; archived remains noindex. | Low/medium; high for medical advice, children, emergencies, or sensitive topics. |
| `offer_update` | Short-term offer, package, discount, or promotion. | Future public display only after approval and terms review. | Noindex unless promoted to an approved offer detail route. | Admin/owner approval; legal/compliance review where needed. | Offer creative allowed if truthful and labeled. | Must include expiry/terms; expires automatically in future implementation. | Medium/high because healthcare offers can be misleading or regulated. |
| `educational_tip` | Short educational snippet or awareness note. | Future public display only after approval. | Noindex by default; not an Article by default. | Medical review when diagnosis, treatment, prescription, symptoms, lab interpretation, or high-risk advice appears. | Simple illustrative media allowed only when accurate. | May archive when outdated; reviewed content may require re-review. | Medium/high depending topic. |
| `behind_the_scenes` | Non-clinical trust content about facility culture, team, or operations. | Future public display only after approval. | Noindex by default. | Admin moderation; privacy review if people/patients appear. | Facility/team media allowed only with consent and no private data. | May archive by date/relevance. | Low/medium unless patient/staff/privacy issues appear. |
| `opening_hours_update` | Temporary or permanent opening-hours note. | Future public display only after approval or verified source workflow. | Noindex by default. | Admin moderation or verified data review. | Usually no media; simple graphics only if approved. | Temporary notices expire; outdated hours must archive or be corrected. | Low, but high if urgent care/emergency availability is implied. |
| `temporary_notice` | Short-lived closure, relocation, service interruption, maintenance, or urgent operational notice. | Future public display only after approval/verification. | Noindex. | Admin moderation; legal/medical escalation if patient safety is affected. | Minimal media only when useful and privacy-safe. | Must expire/archive when no longer valid. | Medium/high if it affects access to care or safety. |
| `sponsored_story` | Paid or sponsored provider update, campaign, or advertorial-style post. | Future public display only after approval and visible sponsorship labeling. | Noindex unless separately approved as sponsored landing content. | Admin/owner approval; legal/compliance and medical review where needed. | Sponsored media allowed only if labeled and compliant. | Expires by campaign term; archived remains noindex unless separately approved. | Medium/high because paid influence, claims, offers, and disclosure require review. |
| `internal_story_draft` | Internal planning draft, moderation note, or provider-submitted concept not intended for public visibility. | Private only. | Noindex and not publicly routable. | Internal review only; cannot become public without formal workflow. | Internal reference media only; no public exposure. | May be archived or deleted under future retention policy. | Depends on content; private data must be protected. |

## 3. Story Status Lifecycle

Future story statuses:

- `draft`
- `pending_review`
- `needs_revision`
- `approved`
- `scheduled`
- `active`
- `expired`
- `archived`
- `rejected`
- `blocked`

Conceptual transitions:

- `draft` → `pending_review`
- `pending_review` → `needs_revision`
- `pending_review` → `approved`
- `approved` → `scheduled` or `active`
- `scheduled` → `active`
- `active` → `expired`
- `expired` → `archived`
- any review state → `rejected` or `blocked`
- `active` → `blocked` for safety/legal/privacy reason

Rules:

- Public visibility requires approval.
- Medical-sensitive story content requires medical review.
- Sponsored story content requires a sponsored label and admin/owner approval.
- Expired stories are noindex by default.
- Stories do not become SEO pages unless promoted to reviewed CMS content in a future approved workflow.

## 4. Story Indexing and SEO Rules

- Provider stories are noindex by default.
- Doctor stories are noindex by default.
- Temporary notices are noindex.
- Offer updates are noindex unless promoted to an approved offer detail route.
- Sponsored stories are noindex unless separately approved as sponsored landing content.
- Stories are excluded from sitemap by default.
- Stories must not emit Article schema by default.
- Stories must not emit Review/AggregateRating schema.
- Story content must not create thin programmatic SEO pages.
- Story archives should remain noindex unless a future policy approves otherwise.

## 5. Provider and Doctor Story Rules

- Providers/doctors cannot directly publish without moderation.
- Provider/doctor story drafts require admin moderation.
- Clinical or medical-sensitive claims require medical review.
- Provider cannot self-label verified/sponsored.
- Provider cannot claim “best”, “number one”, “guaranteed”, or “official” without approved evidence.
- Provider cannot publish patient/private data.
- Doctor identity and credentials must come from approved profile data.
- No fake doctor content is allowed.
- No fake equipment/facility claims are allowed.
- No misleading before/after content is allowed.
- No patient case examples are allowed without anonymization and approval.

## 6. Story Media Rules

- Story media follows `docs/platform/DRMUSCAT_MEDIA_SEO_VIDEO_IMAGE_PERFORMANCE_SPEC_V1.md`.
- Story media must be moderated.
- People/patient images require a privacy/consent policy.
- Before/after media is blocked by default until policy approval.
- Provider facility images must not show private patient data.
- Video stories must use a performance-safe strategy in future implementation.
- AI-generated fake provider/doctor/patient media is blocked.
- Captions/alt text should be truthful and must not be keyword-stuffed.

## 7. Comment Types

Future comment-related types are conceptual only:

- `article_comment`
- `provider_profile_comment`
- `doctor_profile_comment`
- `offer_comment`
- `story_reaction`
- `story_comment`
- `report_abuse`
- `provider_reply`
- `admin_note`
- `moderation_note`

Clarifications:

- Comments are not the same as verified reviews.
- Star ratings/reviews are future-only and are not implemented here.
- Comments should not create AggregateRating eligibility.
- Article comments may be enabled later only after a moderation workflow exists.
- Provider/doctor comments require login and moderation.

## 8. Comment Status Lifecycle

Future comment statuses:

- `draft`
- `pending_moderation`
- `approved`
- `rejected`
- `hidden`
- `reported`
- `locked`
- `provider_replied`
- `admin_removed`
- `blocked`

Rules:

- Comments require login.
- Anonymous comments are not allowed.
- Comments are moderated before public display in initial phases.
- Reported comments return to the moderation queue.
- Admin may hide/remove/lock comments.
- Provider replies require moderation rules.
- Comments with private medical/patient data must be rejected or redacted under an approved policy.
- Abusive/spam/defamatory content is rejected.

## 9. Moderation Rules

Blocked content:

- spam
- abusive language
- threats
- hate/harassment
- defamation
- fake reviews
- private patient data
- personal health information
- prescription requests
- diagnosis requests
- emergency medical requests
- lab result interpretation requests
- private provider/staff accusations without policy
- illegal content
- sexual/graphic content
- irrelevant promotion
- competitor manipulation
- fake provider claims
- fake before/after claims
- doxxing
- duplicate spam comments

Moderation actions:

- approve
- reject
- hide
- redact future-only after policy
- request revision
- escalate to admin
- escalate to medical reviewer
- escalate to legal/privacy reviewer
- lock thread
- ban/report user future-only after policy

No moderation implementation is authorized by this specification.

## 10. Provider Reply Rules

Future provider replies:

- Provider replies require verified/claimed provider access.
- Replies must be professional.
- Replies must not reveal patient data.
- Replies must not diagnose.
- Replies must not prescribe.
- Replies must not discuss private treatment details.
- Replies must not attack users.
- Replies must not offer misleading guarantees.
- Replies may invite a user to contact the provider privately.
- Replies may correct factual information politely.
- Replies may require admin moderation before display.

## 11. Review System Boundary

- Comments are not verified reviews.
- Stories are not reviews.
- Reactions are not reviews.
- Star ratings are future-only.
- Verified reviews require a separate review system spec and moderation maturity.
- Review/AggregateRating schema remains blocked until:
  - real approved reviews exist
  - anti-fake review policy exists
  - moderation workflow exists
  - provider reply policy exists
  - dispute/removal policy exists
  - schema eligibility is approved
- No seeded reviews are allowed.
- No fake ratings are allowed.
- No provider self-reviews are allowed.
- No review gating/manipulation is allowed.

## 12. UGC SEO and Indexing Rules

- Comments are not indexable by default in early phases.
- Story comments/reactions are noindex.
- UGC must not create thin pages.
- UGC must not create uncontrolled schema.
- UGC must not change page indexability.
- UGC must not add unreviewed medical claims to indexable content.
- Public display of UGC requires moderation.
- No UGC is included in a sitemap as standalone pages.
- Comments on medical-sensitive content may require stricter moderation.

## 13. Access Control Planning

Future roles:

- anonymous user: read approved public content only
- logged-in user: submit comments/reports where enabled
- provider_owner: draft provider stories, request replies, view own moderation status
- doctor/provider_staff: draft assigned updates where allowed
- content_manager: moderate content/comments/stories
- medical_reviewer: review medical-sensitive story/comment escalations
- legal/privacy reviewer: review privacy/defamation/consent escalations
- admin: manage moderation operations
- super_admin: override/lock/remove with audit

Rules:

- Server-side enforcement is required.
- Client-only permission checks are not allowed.
- Provider access must be scoped to the provider owner's own organization.
- Cross-provider access is not allowed.
- Anonymous moderation is not allowed.
- Every public action must be auditable in future implementation.

## 14. Notification Planning

Future notifications may include:

- story submitted
- story approved/rejected
- story needs revision
- comment submitted
- comment approved/rejected
- comment reported
- provider reply requested
- moderation escalation
- medical/legal review needed

Rules:

- No notification implementation is authorized.
- No email/SMS/WhatsApp integration is authorized.
- Notification content must not expose private patient data.
- Notification recipients must be role-scoped.

## 15. Audit and Safety Planning

Future audit records should track:

- who submitted
- who moderated
- who approved/rejected
- status changes
- visibility changes
- provider replies
- report/flag actions
- admin override
- medical/legal escalation
- removal reason
- blocked reason
- timestamp
- entity scope
- before/after content for sensitive moderation changes

No audit implementation is authorized by this specification.

## 16. Explicit Non-Implementation

This specification explicitly does not implement or authorize:

- no story tables
- no comment tables
- no review tables
- no moderation tables
- no story routes
- no comment UI
- no provider reply UI
- no provider dashboard changes
- no moderation dashboard
- no review system
- no ratings
- no AggregateRating schema
- no notification integration
- no media upload
- no AI moderation
- no RLS/API/server action changes
- no source code changes
- no public Persian/Hindi routes

## 17. Future PR Sequence

Recommended sequence only:

1. Verified Reviews & Ratings Spec V1
2. Provider Story Database Foundation
3. Comment/Moderation Database Foundation
4. Provider Story Draft UI
5. Admin Moderation Read-Only Queue
6. Admin Moderation Actions
7. Provider Reply Workflow
8. Review System Foundation only after policy maturity

These recommendations do not authorize implementation.

## 18. Completion Report Requirements

Final Codex report for this file must include:

- confirmation documentation-only
- files created/changed
- no code/routes/migrations/RLS/API/server actions changed
- no story/comment/review/moderation implementation
- summary of story/comment model
- summary of moderation and review-boundary rules
- validation results
- blockers/conflicts
