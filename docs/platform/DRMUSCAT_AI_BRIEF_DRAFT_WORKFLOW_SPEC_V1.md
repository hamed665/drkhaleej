# DrMuscat AI Brief & Draft Workflow Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: AI brief/draft workflow planning only.
- This specification does not authorize implementation.
- This specification does not authorize AI API integration.
- This specification does not authorize prompt execution.
- This specification does not authorize CMS writes.
- This specification does not authorize publishing automation.
- This specification does not authorize article generation in production.
- This specification does not authorize route generation.
- This specification does not authorize medical advice generation.
- This specification must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
  - `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_CMS_CONTENT_MODEL_SPEC_V1.md`
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-AI-BRIEF-DRAFT-WORKFLOW-V1`.

## 1. Purpose

This specification defines the future AI-assisted brief and draft workflow for DrMuscat content operations. DrMuscat is an Oman-first healthcare, beauty, wellness, pharmacy, lab, hospital, dental, pet clinic, and provider discovery platform, so AI-assisted content planning must be conservative, review-gated, localized, source-aware, and safe for medical-adjacent public content.

The future AI workflow may help with:

- keyword/topic clustering
- topic opportunity summaries
- SEO brief generation
- article outline generation
- English draft generation
- Arabic draft/transcreation support
- Persian internal owner summaries only
- FAQ suggestions
- title/meta suggestions
- schema suggestions
- internal link suggestions
- media/image/video suggestions
- risk classification notes
- reviewer notes
- refresh recommendations
- content decay analysis
- local SEO and provider supply recommendations

AI assists planning and drafting only. AI must never publish, approve, bypass reviewers, create medical advice, invent provider facts, or create pages from keyword rows.

## 2. AI Operating Principles

- Human approval is mandatory.
- Medical review is mandatory for high-risk content.
- SEO review is required before indexable publishing.
- AI output is draft material, not final truth.
- AI must cite uncertainty and flag missing facts.
- AI must not invent provider/doctor facts.
- AI must not invent citations.
- AI must not produce individualized medical advice.
- AI must not recommend diagnosis, prescription, treatment, emergency triage, or lab interpretation.
- AI must not bypass CMS status workflow.
- AI must not alter canonical/noindex/schema/sitemap decisions automatically.
- AI must not publish or schedule content.
- AI must not create public Persian/Hindi content.
- AI must preserve English/Arabic localization integrity.
- AI must be auditable in future implementation.

## 3. AI Workflow Types

The following workflow types are planning labels only. They do not create runtime prompts, automation, CMS actions, database tables, dashboards, routes, or publishing flows.

| Workflow type | Purpose | Allowed input | Allowed output | Review requirement | Blocked outputs |
| --- | --- | --- | --- | --- | --- |
| `topic_opportunity_summary` | Summarize why a topic may matter for Oman-first discovery and content strategy. | Approved keyword planning records, route inventory rules, content intelligence notes, approved analytics summaries later. | Opportunity summary, intent notes, funnel notes, provider supply considerations, hold reasons. | Editor and SEO review before any brief is created. | Article draft, route creation, direct publishing, unsupported demand claims. |
| `keyword_cluster_summary` | Group approved keyword records into strategic clusters. | Approved keyword planning records and taxonomy/category context. | Cluster summary, parent/child topic suggestions, overlap risks, cannibalization notes. | SEO review required. | Pages generated from every keyword row, automatic index/noindex decisions, public content. |
| `seo_brief_generation` | Draft a structured SEO brief for a human-approved candidate topic. | Approved topic, approved keyword cluster, content type, route inventory rules, SEO requirements. | Brief draft, metadata ideas, outline, link candidates, risk notes, source requirements. | Editor review, SEO review, and medical review if risk requires. | Final approval, canonical/schema/noindex approval, direct CMS write. |
| `content_outline_generation` | Produce a draft outline from an approved brief or approved topic. | Approved brief fields, target audience, intent, source requirements. | H1/H2/H3 outline, FAQ ideas, section notes, missing-fact flags. | Editor review; SEO review before publishing use. | Full final article, medical advice, unsupported claims. |
| `english_draft_generation` | Draft English content from an approved brief. | Approved brief, approved facts, approved sources, reviewer instructions. | English draft, disclaimers, blocked claims list, citation needs, risk notes. | Editor review, SEO review, and medical review for high-risk content. | Auto-published article, individualized medical advice, invented facts/citations. |
| `arabic_transcreation_support` | Support Arabic localization/transcreation while preserving reviewed meaning. | Approved English source draft or approved Arabic brief, localization notes, Oman/GCC phrasing guidance. | Arabic localization draft, Arabic metadata suggestions, parity notes. | Arabic localization review, editor review, SEO review, and medical review if required. | Mechanical mistranslation, added claims, removed disclaimers, indexable content without review. |
| `persian_internal_owner_summary` | Create owner/internal-only Persian summaries for decision support. | Approved internal notes, topic opportunity, risk notes, business context. | Persian internal summary, blocked reason summary, decision notes. | Owner/internal review only; never public review for publishing. | Public Persian route/content, indexed Persian content, private patient data. |
| `faq_suggestion_generation` | Suggest user-focused FAQs based on approved topic and facts. | Approved brief, approved services/categories, search intent, source requirements. | FAQ question ideas and draft answers requiring review. | Editor, SEO, and medical review if risk requires. | Fake FAQ schema assumptions, medical diagnosis/treatment advice, unsupported claims. |
| `metadata_suggestion_generation` | Suggest titles, meta titles, meta descriptions, OG titles, and OG descriptions. | Approved brief/draft, route family candidate, language and audience. | Metadata options and rationale. | SEO review required before use. | Automatic metadata publishing, keyword stuffing, misleading claims. |
| `schema_suggestion_generation` | Suggest whether content may be eligible for structured data. | Approved content type, visible content summary, route inventory rules, SEO requirements. | Schema eligibility note and required visible fields checklist. | SEO review required. | Schema markup generation for invisible/untrue content, fake ratings/reviews, auto-implementation. |
| `internal_link_suggestion_generation` | Suggest internal links to approved public destinations. | Approved route inventory, approved categories/services/providers, content draft. | Internal link candidates and anchor ideas. | SEO/editor review required. | Links to unapproved/deprecated/duplicate routes, invented provider/service URLs. |
| `media_suggestion_generation` | Suggest supporting image/video concepts and alt text ideas. | Approved brief/draft, content type, accessibility/SEO requirements. | Media concept suggestions, alt text suggestions, image/video need notes. | Editor and SEO review required; medical review if medical-sensitive visuals are involved. | Runtime image generation, misleading before/after claims, fake provider media. |
| `risk_classification_assist` | Assist with preliminary risk classification. | Approved topic, brief, draft, source notes, content category. | Suggested risk level, risk flags, reviewer requirements. | Human reviewer makes final risk decision; medical review for high risk. | Final risk approval, bypassing review, allowing blocked content. |
| `medical_reviewer_note_assist` | Help prepare notes for medical reviewer attention. | Draft, source requirements, known high-risk sections, blocked claim list. | Reviewer checklist, flagged claims, missing source notes. | Medical reviewer must review and decide. | Claiming medical approval occurred, diagnosis/treatment advice, fake citations. |
| `seo_reviewer_note_assist` | Help prepare SEO reviewer notes. | Brief/draft, route inventory rules, metadata, internal link candidates. | Search intent notes, cannibalization notes, route/index/schema review checklist. | SEO reviewer must review and decide. | Automatic index/canonical/schema/sitemap changes. |
| `refresh_recommendation_generation` | Suggest future refresh actions for existing content. | Approved analytics summaries, content inventory, age/review dates, route inventory. | Refresh recommendations, hold reasons, review routing. | Editor and SEO review; medical review if risk requires. | Automatic edits, noindex/canonical changes, publishing updates. |
| `content_decay_summary` | Summarize potential traffic, quality, or freshness decay. | Approved GSC/GA4/rank summaries later, content age, review dates. | Decay summary, likely causes, investigation checklist. | SEO/editor review required. | Automated content pruning, unsupported performance claims. |
| `provider_profile_copy_assist` | Improve future provider profile copy using approved facts only. | Approved public provider data, approved services, approved profile fields. | Clarity rewrite, profile completeness suggestions, internal link ideas. | Admin/editor moderation required. | Invented services, credentials, awards, verification, sponsorship, patient stories. |
| `doctor_profile_copy_assist` | Improve future doctor profile copy using approved facts only. | Approved public doctor data, approved specialties/services, approved profile fields. | Draft support text, completeness suggestions, FAQ ideas from approved facts. | Admin/editor moderation required; medical-sensitive claims need review. | Invented qualifications, credentials, availability, outcomes, reviews. |
| `offer_copy_assist` | Assist future offer copy after offer workflow exists. | Approved offer terms, eligibility, expiry, provider data, sponsorship labels. | Offer copy draft, clarity notes, required term checklist. | Admin/owner review; compliance review when required. | Fake scarcity, misleading discounts, unsupported outcome guarantees, unlabeled sponsorship. |
| `sponsored_content_assist` | Assist future sponsored content after sponsorship workflow exists. | Approved sponsorship status, approved facts, editorial/sponsorship label rules. | Sponsored copy draft, disclosure checklist, review notes. | Admin/owner, SEO, and compliance/medical review as required. | Hidden paid ranking claims, unlabeled sponsored content, fake medical claims. |

## 4. Input Source Policy

Allowed future AI inputs may include:

- approved keyword planning records
- approved CMS brief fields
- approved public provider data
- approved public doctor data
- approved category/area taxonomy
- approved content model fields
- public route inventory rules
- SEO metadata requirements
- reviewer instructions
- internal editorial notes
- Persian internal owner notes
- approved official/public source excerpts
- existing approved DrMuscat content
- Google Search Console / GA4 summaries later after approved integration

Blocked inputs:

- private patient data
- raw personal health information
- unapproved provider claims
- unverified doctor credentials
- unapproved reviews
- confidential business data not needed for the task
- raw Excel import as runtime data
- arbitrary user-submitted medical requests for diagnosis/treatment
- private messages from patients/providers unless a future privacy policy explicitly allows it

Rules:

- AI should receive minimum necessary context.
- Future implementation must define data retention, logging, and privacy policy before runtime use.
- Sensitive data must not be sent to AI providers without explicit approved policy.

## 5. Output Type Policy

Allowed future AI outputs may include:

- planning summary
- brief draft
- outline draft
- title options
- meta title options
- meta description options
- H1/H2 suggestions
- FAQ suggestions
- article draft
- Arabic localization draft
- Persian internal summary
- internal link suggestions
- media prompt suggestions
- alt text suggestions
- schema eligibility suggestion
- risk notes
- reviewer checklist
- refresh recommendation
- content merge/noindex recommendation

Blocked outputs:

- final approval
- direct publish command
- direct database write
- direct route creation
- medical diagnosis
- prescription instructions
- emergency triage
- lab interpretation advice
- treatment recommendation for an individual
- fake provider facts
- fake doctor credentials
- fake reviews/ratings
- fake citations
- unsupported “best” claims
- public Persian/Hindi content
- schema for invisible/untrue content
- pages generated directly from every keyword row

## 6. SEO Brief Workflow

Future SEO brief workflow steps:

1. Candidate topic selected from keyword/content intelligence.
2. Human/editor confirms content type and intent.
3. AI generates SEO brief draft.
4. AI flags risk level and missing facts.
5. Editor reviews brief.
6. SEO reviewer reviews search intent, route family, index/noindex, schema eligibility, internal links, and metadata.
7. Medical reviewer reviews if risk level requires it.
8. Owner/admin approves high-risk or strategic content before drafting.
9. Approved brief may move to draft workflow.

Brief output should include:

- content type
- target language(s)
- canonical group concept
- primary keyword
- secondary keywords
- search intent
- funnel stage
- target audience
- route family candidate
- index/noindex recommendation
- title options
- meta title options
- meta description options
- H1
- outline
- FAQ ideas
- internal link candidates
- provider/category/area link opportunities
- media suggestions
- schema eligibility suggestion
- risk level suggestion
- reviewer requirements
- source requirements
- blocked/hold reasons if any

Rules:

- AI brief is not final.
- Human review is required.
- Brief cannot approve its own route/index/schema decisions.

## 7. Draft Generation Workflow

Future draft generation workflow steps:

1. Approved brief exists.
2. AI generates draft content.
3. AI generates risk notes and missing-fact notes.
4. Editor reviews factual accuracy, tone, user usefulness, and readability.
5. Arabic localization/transcreation is created or reviewed.
6. SEO reviewer reviews metadata, headings, internal links, schema eligibility, and noindex/index assumptions.
7. Medical reviewer reviews high-risk or medical-sensitive content.
8. Owner/admin performs final approval where required.
9. Only approved content may be scheduled or published by a separate future CMS workflow.

Draft output should include:

- title
- slug suggestion
- excerpt
- body draft
- FAQ draft
- key takeaways
- disclaimer suggestion
- author/reviewer placeholder requirement
- meta title
- meta description
- OG title
- OG description
- internal link suggestions
- media suggestions
- schema eligibility notes
- source/citation needs
- risk notes
- localization notes
- blocked claims list

Rules:

- AI draft must not be treated as final content.
- AI draft must not be auto-published.
- AI must mark uncertain claims.
- AI must not invent facts.
- AI must not output medical advice outside allowed safe education.

## 8. Arabic Transcreation Workflow

- Arabic content must be localized/transcreated, not mechanically translated.
- Arabic must preserve facts, disclaimers, and review status from English where applicable.
- Arabic content may adapt phrasing for Oman/GCC context.
- Arabic content must not add claims that are absent from the reviewed source.
- Arabic content must not remove safety disclaimers.
- Arabic content must not be indexable until reviewed and approved.
- Arabic metadata must be written for Arabic search intent, not merely translated word-for-word.

Future checks:

- equivalent intent
- factual parity
- disclaimer parity
- reviewer parity
- no added unsupported medical claim
- no missing high-risk caution
- readable Arabic
- Oman-appropriate phrasing
- no public Persian/Hindi leakage

## 9. Persian Internal Summary Workflow

- Persian may be used for owner/internal review summaries only.
- Persian internal summaries are never public content.
- Persian summaries must not create public routes.
- Persian summaries may explain:
  - topic opportunity
  - why a topic is blocked
  - review risk
  - business value
  - suggested next step
  - owner decision notes
- Persian summaries must not contain private patient data.
- Persian summaries must not be published or indexed.

## 10. Risk Classification and Safety Workflow

AI may assist risk classification, but final risk decisions require human review.

Risk levels:

- low
- medium
- high
- blocked

AI must flag high-risk topics:

- symptoms
- diagnosis
- medications
- treatment decisions
- emergency care
- pregnancy/children/high-risk medical topics
- lab result interpretation
- prescription-related content
- invasive procedures
- before/after claims
- weight loss medication or injection content
- mental health/medical advice

Blocked outputs:

- individualized diagnosis
- prescription instructions
- emergency triage
- lab interpretation advice
- unsupported treatment guarantees
- fake medical claims
- private patient information
- unapproved before/after claims
- content requiring review when reviewer is unavailable

## 11. Prompt Governance

Future implementation must define prompt governance before runtime AI use.

Conceptual future prompt metadata:

- `prompt_id`
- `prompt_name`
- `prompt_version`
- `workflow_type`
- `allowed_input_types`
- `blocked_input_types`
- `expected_output_schema`
- `risk_level`
- `requires_human_review`
- `requires_medical_review`
- `requires_seo_review`
- `created_by`
- `approved_by`
- `approved_at`
- `retired_at`
- `change_reason`

Rules:

- Prompts must be versioned.
- Prompt changes must be auditable.
- High-risk prompts need approval.
- Prompts must include blocked-output instructions.
- Prompts must not be hidden runtime policy replacements.
- Prompt approval does not equal content approval.
- Prompt files or runtime prompts are not created in this PR.

## 12. Output Validation Model

Future AI outputs should be validated for:

- required fields
- language
- content type
- risk level
- blocked phrases/patterns
- missing disclaimers
- invented citations
- invented provider facts
- unsupported medical claims
- public Persian/Hindi leakage
- empty Arabic/localized content
- keyword stuffing
- hidden schema assumptions
- fake FAQ/review/rating assumptions
- route/index/schema decision overreach
- personally identifiable or private health information
- hallucinated services or credentials

Validation outcomes:

- `pass_to_editor_review`
- `send_to_medical_review`
- `send_to_seo_review`
- `needs_human_revision`
- `blocked`
- `discard_ai_output`

No validator implementation is included in this PR.

## 13. Human Approval Gates

- AI output generation does not equal approval.
- Editor approval required for all public content.
- SEO review required before indexable content.
- Medical review required for high-risk content.
- Owner/admin approval required for high-risk, sponsored, legal/trust, and strategic public content.
- Provider-generated AI-assisted content requires admin moderation.
- Any content with unresolved facts must remain draft or blocked.
- Publishing requires future CMS workflow approval, not AI workflow.

## 14. AI Record and Audit Planning

Future AI audit records may track:

- workflow type
- content item id
- brief id
- draft id
- prompt id/version
- input summary
- output summary
- model/provider
- generated_by
- generated_at
- reviewer decision
- rejected reason
- blocked reason
- risk flags
- medical review requirement
- SEO review requirement
- owner approval requirement
- source references used
- whether output became published content later

Rules:

- Future implementation must preserve audit trail.
- Sensitive inputs must be summarized or redacted according to approved privacy rules.
- AI logs must not leak private patient/provider data.

## 15. Source and Citation Rules

AI must:

- distinguish provided sources from inferred statements.
- flag when sources are missing.
- recommend source review for high-risk claims.
- never invent citations.
- never cite fake authorities.
- never imply medical review occurred when it did not.
- never invent provider accreditation, awards, credentials, services, or availability.

Future high-risk content requires:

- source review
- medical reviewer approval
- visible disclaimer where appropriate
- last reviewed date
- reviewer identity policy

## 16. Provider and Doctor Copy Assist

AI may assist future provider/doctor content only with strict rules.

Allowed:

- rewrite approved provider description for clarity.
- suggest profile completeness improvements.
- summarize approved services.
- create draft profile support text from approved facts.
- suggest FAQ questions based on approved services.
- suggest internal links to approved categories/services.

Blocked:

- invent services.
- invent credentials.
- invent doctor qualifications.
- create fake awards.
- imply verification.
- imply sponsorship.
- publish patient stories.
- expose private patient data.
- make medical outcome guarantees.
- create unsupported before/after claims.

## 17. Offer and Sponsored Copy Assist

AI may assist future offer/sponsored content only after offer/sponsorship workflow exists.

Rules:

- sponsored content must be labeled.
- offer terms must be clear.
- expiry and eligibility must be visible.
- no hidden paid ranking claims.
- no unsupported medical/beauty outcome guarantees.
- no fake scarcity.
- no misleading discount claims.
- no publishing without admin/owner approval.

## 18. Refresh and Content Decay AI Workflow

AI may later recommend refresh actions based on approved analytics/reporting inputs.

Inputs later:

- GSC summaries
- GA4 summaries
- rank tracking summaries
- published content inventory
- provider supply status
- route inventory
- content age
- review dates
- keyword intelligence

Possible recommendations:

- update title/meta
- improve intro/H1
- add FAQ
- add Arabic version
- add internal links
- add media
- update provider links
- merge overlapping content
- noindex thin content
- archive outdated content
- send to medical review
- send to SEO review
- hold due to provider supply

Rules:

- AI recommendation does not execute changes.
- Human review required.
- No automatic noindex/canonical/schema change.

## 19. Privacy and Data Handling Planning

Future implementation must define:

- AI provider selection
- data retention policy
- prompt/input logging policy
- output storage policy
- deletion/retention window
- private data redaction
- medical/patient data prohibition
- provider confidential data boundaries
- reviewer access permissions
- audit log visibility
- incident/rollback process

No privacy-sensitive runtime integration is implemented in this PR.

## 20. Explicit Non-Implementation

This PR includes:

- no AI API integration
- no AI SDK
- no runtime prompts
- no prompt files used by runtime
- no environment variables
- no CMS writes
- no article generation
- no route generation
- no publishing automation
- no database tables
- no migrations
- no RLS/API/server actions
- no dashboards
- no analytics integration
- no keyword import
- no content seed
- no public Persian/Hindi content
- no medical advice engine
- no validation code
- no provider/doctor copy generation in runtime

## 21. Future PR Sequence

Recommended future PR sequence:

1. SEO Reporting & Analytics Spec V1
2. Media SEO & Video/Image Performance Spec V1
3. Provider Stories & Comments Spec V1
4. Legal/Trust/AI Editorial Policy Spec V1
5. CMS Database Foundation
6. Admin CMS Read-Only UI
7. Admin CMS Draft/Review/Publish UI
8. AI Prompt Registry Planning Spec
9. AI Draft Assistant Implementation
10. Public Article Route Foundation

These are recommendations only and do not authorize implementation.

## 22. Completion Report Requirements

Final Codex report must include:

- Files created/changed
- Confirmation documentation-only
- Confirmation no source code changed
- Confirmation no routes changed
- Confirmation no migrations/RLS/API/server actions changed
- Confirmation no AI SDK/API/runtime prompt/environment variable was added
- Confirmation no CMS/article/media/story/comment/review/AI behavior was implemented
- Summary of AI brief workflow
- Summary of AI draft workflow
- Summary of blocked outputs and approval gates
- Validation results
- Any blockers/conflicts
