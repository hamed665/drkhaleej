# DrMuscat Keyword Universe & Content Intelligence Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Keyword universe and content intelligence planning only.
- This specification does not authorize implementation.
- This specification does not authorize keyword import.
- This specification does not authorize article creation.
- This specification does not authorize route creation.
- This specification does not authorize CMS database creation.
- This specification does not authorize SEO automation.
- This specification does not authorize AI API integration.
- This specification must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
  - `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-KEYWORD-CONTENT-INTELLIGENCE-V1`.

## 1. Purpose

DrMuscat’s keyword universe is a planning source for future content, SEO, local discovery, provider enablement, and editorial decision-making. It may inform future decisions for:

- SEO articles.
- Arabic/English content planning.
- Persian internal planning summaries only.
- Category pages.
- Area/category pages.
- Provider profile content.
- Doctor profile content.
- FAQ blocks.
- Local landing page candidates.
- Internal linking.
- Content refresh planning.
- Noindex/hold decisions.
- AI content briefing later.
- SEO reporting later.
- LLM/answer-engine readiness later.

The keyword universe is not runtime content and must not be imported directly without future approval. It is a decision-support artifact, not a page-generation source, route-generation source, CMS seed source, or production database source.

## 2. Source Data Policy

- The Excel keyword universe is a planning/reference artifact only.
- Excel rows must not directly create pages, articles, routes, or database records.
- Every keyword candidate must pass quality gates before becoming content.
- Keyword data may be normalized in the future only after a separate approved import/migration specification.
- The planning model must support auditability of where each content idea came from, including source artifact, source version, analyst/editor decision, approval state, and blocked reason where relevant.
- `import_decision = DO_NOT_IMPORT_YET`, or an equivalent planning-only status, must be respected until a future approved import phase changes that decision.
- Planning artifacts may inform future specifications, editorial briefs, route inventories, provider acquisition plans, and review queues, but must not become production data in this PR.

## 3. Recommended Keyword Planning Fields

Future keyword planning artifacts may use fields like the following after separate approval. These are planning fields only; no database tables are created by this PR.

- `keyword_id`
- `keyword`
- `language`
- `arabic_equivalent`
- `english_equivalent`
- `persian_internal_note`
- `topic_cluster`
- `subcluster`
- `intent`
- `funnel_stage`
- `page_type_candidate`
- `route_family_candidate`
- `priority_tier`
- `business_value`
- `conversion_potential`
- `provider_supply_requirement`
- `area_requirement`
- `category_requirement`
- `risk_level`
- `medical_review_required`
- `legal_review_required`
- `ai_allowed`
- `google_seo_allowed`
- `llm_answer_engine_allowed`
- `noindex_default`
- `import_decision`
- `route_status`
- `content_status`
- `recommended_action`
- `blocked_reason`
- `related_specialty`
- `related_service`
- `related_category`
- `related_area`
- `internal_link_targets`
- `cannibalization_group`
- `refresh_candidate`
- `notes`

These fields define a future planning vocabulary. They do not define a runtime schema, migration, CMS table, keyword table, article table, or seed file.

## 4. Keyword Classification

Keyword candidates should be classified across intent, funnel stage, content type, risk, and language before any future content or route decision.

### Intent

- Informational.
- Navigational.
- Commercial.
- Transactional.
- Local discovery.
- Provider comparison.
- Safety/trust.
- Offer-seeking.
- Emergency-sensitive.
- Medical-risk.
- Provider-branded.
- Doctor-branded.

### Funnel Stage

- TOFU.
- MOFU.
- BOFU.
- Provider education.
- Retention.
- Local conversion.

### Content Type

- Article.
- Category guide.
- Area guide.
- Area/category landing page.
- Provider profile enhancement.
- Doctor profile enhancement.
- FAQ block.
- Offer page.
- Sponsored landing page later.
- GBP/local post draft later.
- Story/update later.
- Blocked/no content.

### Risk

- Low.
- Medium.
- High.
- Blocked.

### Language

- English public.
- Arabic public.
- Persian internal only.

## 5. Priority Tier Rules

### P0

A keyword candidate may be treated as P0 only when it has:

- High local intent.
- Strong business value.
- Low or medium risk.
- Enough provider/category/area supply.
- Clear support for lead generation or trust.
- Suitability for public English/Arabic content soon.
- No major route, canonical, medical-review, legal-review, or implementation blocker.

### P1

A keyword candidate may be treated as P1 when it is a useful content opportunity that:

- Needs supply or content support.
- Has medium implementation/editorial effort.
- Is not urgent but remains valuable.
- May need a future CMS, AI workflow, reviewer workflow, or reporting workflow before execution.

### P2

A keyword candidate may be treated as P2 when it represents:

- Future authority-building content.
- Lower conversion urgency.
- A topic that needs more data or provider supply.
- A long-term topical authority opportunity.

### Blocked

A keyword candidate must be blocked or held when it involves:

- Medical diagnosis, prescription, or unsafe query intent.
- Emergency triage query intent.
- Irrelevance to Oman-first DrMuscat.
- Violation of language or route policy.
- Thin route risk.
- No provider supply.
- No review workflow available.
- Insurance, booking, or reviews dependency that is not ready.
- Fake review, fake rating, or unsupported schema risk.
- High legal/compliance ambiguity.
- Public Persian/Hindi route requirement.

## 6. Recommended Actions

Future planning records may use the following action labels after separate approval:

- `create_article_brief`
- `create_category_page_plan`
- `create_area_page_plan`
- `create_area_category_page_plan`
- `create_faq_block`
- `create_provider_profile_prompt`
- `create_doctor_profile_prompt`
- `create_offer_content_prompt`
- `create_internal_link_plan`
- `refresh_existing_content`
- `hold_until_provider_supply`
- `hold_until_review_policy`
- `hold_until_CMS_ready`
- `hold_until_medical_review_workflow`
- `noindex_if_created`
- `block_keyword`
- `merge_with_existing_topic`
- `avoid_due_to_cannibalization`
- `use_for_internal_planning_only`
- `use_for_provider_sales_enablement`

These action labels are recommendations for future planning only. They do not execute content creation, publishing, routing, provider updates, AI calls, or CMS writes.

## 7. Content Quality Gates

Before a keyword becomes content in a future approved phase, it must satisfy the following gates:

- Clear search intent.
- Clear user value.
- Oman/local relevance where applicable.
- DrMuscat has authority or provider context.
- Enough provider/category/area supply if the candidate is a local page.
- No thin page risk.
- No duplicate or cannibalization risk.
- English/Arabic plan exists.
- Persian is internal-only if used.
- Medical/legal risk is classified.
- Reviewer requirements are defined.
- Media needs are identified.
- Internal links are planned.
- Schema eligibility is checked.
- Index/noindex decision is made.
- No unsupported claims.
- No fake reviews, ratings, or schema.
- No automated publishing.

## 8. Route Decision Gates

Before a keyword becomes a route in a future approved phase, it must satisfy the following gates:

- Route family approved.
- URL pattern approved.
- Locale/country pattern approved.
- Canonical rule approved.
- Hreflang rule approved.
- Sitemap eligibility approved.
- Noindex/index decision approved.
- Minimum content threshold approved.
- Provider supply threshold approved.
- Arabic/English metadata plan approved.
- Structured data eligibility approved.
- No duplicate or deprecated route.
- No Persian/Hindi route unless separately approved.
- No mass route generation.

## 9. Page Type Mapping

Future keyword-to-page planning should use these mapping rules only after separate approval.

### Article

- Use for informational or trust content.
- Must not compete with directory pages.
- Must pass risk and review gates.

### Category Guide

- Use for broad category education or discovery.
- Should link to relevant provider/category pages.

### Area Guide

- Use for local area discovery.
- Requires enough area relevance and provider supply.

### Area/Category Page

- Use for high local conversion intent.
- Requires provider supply and unique visible content.

### Provider Profile Enhancement

- Use for provider-branded terms or profile quality improvements.
- Must not create fake provider claims.

### Doctor Profile Enhancement

- Use for doctor-branded terms or doctor specialty context.
- Must preserve doctor identity rules.

### FAQ Block

- Use only where useful and visible.
- Must not create fake FAQ schema.

### Offer Page

- Use only after offer workflow approval.

### Sponsored Landing Page

- Use later only, with sponsored label and review.

### Blocked

- Use for unsafe, thin, irrelevant, or unsupported intent.

## 10. AI Use Rules

AI may later help with:

- Clustering keywords.
- Identifying topic gaps.
- Drafting briefs.
- Suggesting outlines.
- Generating English/Arabic drafts.
- Writing Persian internal summaries.
- Suggesting internal links.
- Suggesting FAQ blocks.
- Suggesting media.
- Identifying risk flags.
- Recommending refreshes.

AI must not:

- Import keywords.
- Auto-create pages.
- Auto-publish.
- Generate medical advice.
- Create diagnosis/treatment recommendations.
- Bypass human approval.
- Create fake reviews.
- Create unsupported schema.
- Generate public Persian/Hindi pages.
- Create keyword-stuffed content.
- Generate pages from every keyword row.

## 11. LLM / Answer Engine Readiness

Future DrMuscat content intended for Google SEO, LLM retrieval, or answer-engine visibility should follow these principles:

- Clear entity definitions.
- Concise summaries.
- Fact-based content.
- Visible source-backed claims.
- Structured headings.
- FAQ blocks only when useful.
- Author/reviewer information when appropriate.
- Updated/reviewed dates.
- Provider/category/area entity consistency.
- No hallucinated claims.
- No fake citations.
- No hidden content.
- No spammy keyword stuffing.
- No medical advice.
- No unsupported treatment recommendations.

## 12. Local SEO Integration

Local SEO planning should follow these constraints:

- Area-specific content only when enough provider supply exists.
- Category + area pages must be quality-gated.
- NAP consistency support later.
- GBP prompt workflows later.
- Local review response strategy later.
- Local citation strategy later.
- Near-me variants handled carefully.
- Arabic local search terms mapped to English service/category concepts.
- Oman-first local terminology preferred.
- Muscat area terms should not create pages unless useful and non-thin.

## 13. Provider Supply Gate

A local/category page should not be indexed unless:

- Enough relevant providers exist.
- Provider data quality is acceptable.
- Public cards have useful information.
- There is unique visible content.
- The page has meaningful user value.
- Internal links are available.
- Arabic/English metadata exists.
- No duplicate route already serves the same intent.

If provider supply is weak:

- Hold the page.
- Noindex if created for navigation.
- Use content internally for planning.
- Prioritize provider acquisition first.
- Mark as a sales opportunity.

## 14. Content Refresh Intelligence

Future refresh triggers may include:

- High impressions / low CTR.
- Ranking position 8-20.
- Ranking drop.
- Outdated content.
- Weak internal linking.
- Missing Arabic version.
- Missing FAQ/media.
- Missing schema eligibility.
- Cannibalization.
- Provider supply changes.
- Seasonal opportunity.
- Low engagement.
- Content risk changed.
- New competitor content.
- Offer/provider changes affecting page value.

Future refresh recommendations may include:

- Update title/meta.
- Add FAQ.
- Add internal links.
- Add provider links.
- Add media.
- Expand content.
- Add Arabic version.
- Improve intro/H1.
- Merge overlapping content.
- Noindex thin page.
- Archive outdated content.

## 15. Cannibalization Rules

- Maintain one primary page per intent cluster.
- Avoid multiple pages targeting the same keyword intent.
- Category pages should not compete with articles unless intent differs.
- Provider profile pages should not compete with generic category guides.
- Area/category pages should target local discovery, not generic medical advice.
- Arabic and English relationships must use hreflang/canonical correctly.
- Refresh/merge should be preferred over duplicate article creation.
- Content intelligence must flag `cannibalization_group`.

## 16. Noindex and Hold Rules

Noindex or hold decisions may be required for:

- Thin content.
- Low provider supply.
- Duplicate intent.
- Review workflow missing.
- Medical risk unresolved.
- Legal/compliance ambiguity.
- Unsupported schema requirement.
- Temporary campaign page.
- Story/update content.
- Internal planning page.
- Search/filter results page.
- Pagination/filter combinations unless separately approved.

## 17. Monitoring and Reporting Readiness

Future reporting models may include fields such as:

- Keyword.
- Target URL.
- Language.
- Content type.
- Topic cluster.
- Priority tier.
- Recommended action.
- Page status.
- Index status.
- Impressions.
- Clicks.
- CTR.
- Average position.
- Rank movement.
- Last updated.
- Last reviewed.
- Next review date.
- Owner.
- Risk level.
- Provider supply status.
- Cannibalization group.
- Refresh status.

No integrations are implemented by this specification. It does not implement GSC, GA4, rank tracking, analytics dashboards, reporting dashboards, keyword storage, or content status automation.

## 18. Example Decision Outcomes

These examples are generic planning illustrations and are not extracted spreadsheet rows.

### Example 1

- Keyword intent: Dentist in Al Khuwair.
- Decision: Area/category page candidate.
- Gate: Requires enough dental providers in Al Khuwair.
- Action: Hold until provider supply or create noindex navigation page if needed in a separately approved phase.

### Example 2

- Keyword intent: How to choose a dentist in Muscat.
- Decision: Low-risk article.
- Gate: Editor/admin review.
- Action: `create_article_brief` later.

### Example 3

- Keyword intent: Tooth pain medicine.
- Decision: High-risk/blocked medical advice.
- Gate: Medical reviewer and strict disclaimer required; likely avoid prescriptive content.
- Action: `block_keyword` or create safe “when to see a dentist” content only after review.

### Example 4

- Keyword intent: Best clinic near me.
- Decision: Local discovery page or search UX support, not a thin article.
- Gate: Route/search UX decision.
- Action: `use_for_internal_planning_only` until route inventory is approved.

### Example 5

- Keyword intent: Provider brand name.
- Decision: Provider profile enhancement.
- Gate: Verified provider/profile data.
- Action: `create_provider_profile_prompt` later.

## 19. Explicit Non-Implementation

This PR implements none of the following:

- No Excel import.
- No keyword database.
- No CMS database.
- No article routes.
- No page generation.
- No sitemap changes.
- No schema changes.
- No AI calls.
- No reporting dashboard.
- No GSC integration.
- No GA4 integration.
- No rank tracking integration.
- No route generation.
- No seed data.
- No public Persian/Hindi routes.
- No mass programmatic SEO.

## 20. Future PR Sequence

The following sequence is recommended only. It does not authorize implementation:

1. Public Route & SEO Inventory Spec.
2. CMS Content Model Spec.
3. AI Brief/Draft Workflow Spec.
4. SEO Reporting & Analytics Spec.
5. Media SEO & Video/Image Performance Spec.
6. Keyword Import Readiness Spec.
7. CMS Database Foundation.
8. Content Planning Admin UI.
9. AI Draft Assistant.
10. SEO Reporting Dashboard.

Each item requires separate `PHASED_BUILD_ONLY` approval, allowed-file scope, validation scope, and human approval where required.

## 21. Completion Report Requirements

Final Codex reports for this phase must include:

- Files created/changed.
- Confirmation documentation-only.
- Confirmation no source code changed.
- Confirmation no routes changed.
- Confirmation no migrations/RLS/API/server actions changed.
- Confirmation no keyword import, content generation, CMS, AI, analytics, or route generation was implemented.
- Summary of keyword universe planning model.
- Summary of gates and blocked actions.
- Validation results.
- Any blockers/conflicts.
