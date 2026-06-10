# DrMuscat SEO Reporting & Analytics Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: SEO reporting, analytics, content performance, and dashboard planning only.
- This specification does not authorize implementation.
- This specification does not authorize analytics integration.
- This specification does not authorize tracking scripts.
- This specification does not authorize dashboard creation.
- This specification does not authorize Google Search Console import.
- This specification does not authorize GA4 import.
- This specification does not authorize rank tracking integration.
- This specification does not authorize AI automation.
- This specification does not authorize noindex, canonical, or schema changes.
- This specification must be read together with:
  - `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_CMS_CONTENT_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval with explicit allowed files, route impact, database impact, RLS/security impact, privacy impact, and validation gates.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-SEO-REPORTING-ANALYTICS-V1`.

## 1. Purpose

This specification defines future SEO reporting and analytics planning for DrMuscat, an Oman-first healthcare, beauty, wellness, pharmacy, lab, hospital, dental, pet clinic, and provider discovery platform. It provides the reporting vocabulary, access-control planning, privacy guardrails, and future dashboard concepts needed before any analytics, reporting, or AI analyst implementation begins.

The future system should support:

- Google Search Console reporting.
- GA4 reporting.
- Rank tracking summaries.
- Backlink and authority summaries later.
- Core Web Vitals, PageSpeed, and CrUX summaries.
- Content performance monitoring.
- Route and index monitoring.
- Keyword opportunity monitoring.
- Content refresh queue.
- Internal linking queue.
- Provider supply gap reporting.
- Arabic content gap reporting.
- AI SEO analyst recommendations.
- Owner/admin reporting dashboard.
- Alerts and issue queues.
- Privacy-safe analytics handling.

This specification does not implement integrations, dashboards, tracking scripts, imports, analytics storage, AI automation, or reporting jobs.

## 2. Data Source Policy

Future approved data source candidates may include only sources explicitly approved in a later implementation phase:

- Google Search Console.
- GA4.
- Approved rank tracking tool.
- Approved backlink/authority tool later.
- PageSpeed Insights, Lighthouse, or CrUX summaries.
- Internal published content inventory.
- Public route inventory.
- Keyword universe/content intelligence planning records.
- CMS content status records later.
- Provider supply data later.
- Approved event taxonomy later.
- Manual editorial annotations.

Blocked data sources include:

- Private patient data.
- Raw personal health information.
- Private provider conversations.
- Unapproved email/message data.
- Unapproved third-party scraped personal data.
- Raw Excel runtime imports.
- Unauthorized ad platform data.
- Personally identifiable analytics unless policy-approved.

Rules:

- Use minimum necessary data.
- Aggregate where possible.
- No private patient or medical data may appear in SEO dashboards.
- Analytics retention policy must be approved before implementation.
- Data connectors require separate approval.
- Any connector must identify source, scope, retention, access role, failure handling, and privacy impact before implementation.

## 3. Metric Taxonomy

### Search visibility

- Impressions.
- Clicks.
- CTR.
- Average position.
- Indexed pages.
- Crawled pages.
- Excluded pages.
- Query growth.
- Branded vs non-branded queries.
- English vs Arabic visibility.

### Ranking

- Target keyword rank.
- Rank movement.
- Top 3 / top 10 / top 20 counts.
- Ranking URL.
- Cannibalization signals.
- Local pack visibility later.
- Provider/category/area keyword visibility.

### Content performance

- Pageviews.
- Entrances.
- Engagement time.
- Conversions/leads where privacy-approved.
- WhatsApp clicks.
- Call clicks.
- Directions clicks.
- Form submissions where approved.
- Scroll depth later.
- Article engagement.
- Offer engagement.
- Provider profile engagement.

### Technical SEO

- Core Web Vitals.
- LCP.
- INP.
- CLS.
- Crawl errors.
- Sitemap status.
- Canonical conflicts.
- Hreflang issues.
- Schema validation issues.
- Noindex/index mismatch.
- 404/redirect issues.
- Slow pages.
- Image/video performance issues.

### Content operations

- Content status.
- Published date.
- Last reviewed date.
- Next review due date.
- Stale content count.
- Refresh candidates.
- Missing Arabic versions.
- Missing metadata.
- Missing schema eligibility review.
- Missing internal links.
- Reviewer bottlenecks.

### Provider supply

- Provider count by category.
- Provider count by area.
- Approved profiles.
- Thin profiles.
- Categories with weak supply.
- Areas with weak supply.
- Acquisition opportunities.

## 4. Reporting Views

Each future reporting view is planning-only and may report, filter, export, or recommend only after separate approval. No view may mutate content, routes, metadata, noindex, canonical, schema, provider data, or analytics settings unless a later implementation phase explicitly permits it.

### 1. Owner Executive Summary

- Purpose: Give owners a concise business and SEO health overview.
- Audience: Owner, super_admin, approved leadership.
- Input data: Aggregated Search Console, GA4, rank summaries, content inventory, technical health summaries, and provider supply summaries.
- Key metrics: Visibility trend, clicks, impressions, CTR, top growth pages, top declines, content production status, Core Web Vitals status, provider supply gaps.
- Allowed actions: Review recommendations, assign human follow-up where future workflow approves assignment, request deeper analysis.
- Blocked actions: Direct publishing, direct route creation, analytics connector changes, automatic noindex/canonical/schema edits.

### 2. SEO Manager Dashboard

- Purpose: Centralize SEO monitoring for rankings, indexation, technical issues, content opportunities, and growth priorities.
- Audience: SEO reviewer, SEO manager, admin, super_admin.
- Input data: Search visibility, rank tracking, public route inventory, content status, technical SEO issue summaries, keyword universe records.
- Key metrics: Ranking movement, query growth, indexability issues, canonical/hreflang/schema warnings, content refresh candidates, opportunity score.
- Allowed actions: Prioritize issues, recommend content briefs, request technical fixes through approved workflow.
- Blocked actions: Automatic fixes, direct code changes, direct metadata changes, schema publication, route generation.

### 3. Content Performance Dashboard

- Purpose: Show how public content, provider profiles, articles, offers, and landing pages perform.
- Audience: Content manager, SEO reviewer, admin.
- Input data: Aggregated analytics, published content inventory, CMS status records later, keyword/query data, manual annotations.
- Key metrics: Pageviews, entrances, engagement time, CTR, refresh triggers, last reviewed date, missing Arabic content, article/provider/offer engagement.
- Allowed actions: Recommend refreshes, send to SEO/medical review, annotate content status.
- Blocked actions: Automatic content editing, publishing, unapproved event instrumentation, private inquiry tracking.

### 4. Technical SEO Dashboard

- Purpose: Monitor technical SEO health and Core Web Vitals risks.
- Audience: SEO reviewer, engineering lead, admin.
- Input data: PageSpeed/Lighthouse/CrUX summaries, crawl reports, route inventory, sitemap/canonical/hreflang/schema validation summaries where approved.
- Key metrics: LCP, INP, CLS, crawl errors, 404s, redirects, sitemap conflicts, schema errors, slow media-heavy pages.
- Allowed actions: Create human-reviewed implementation recommendations.
- Blocked actions: Runtime fixes, route changes, sitemap changes, canonical/noindex/schema changes.

### 5. Content Refresh Queue

- Purpose: Identify pages needing updates, review, consolidation, Arabic expansion, or technical/media improvement.
- Audience: Content manager, SEO reviewer, medical reviewer for assigned sensitive content.
- Input data: Search visibility, content inventory, CMS status later, Core Web Vitals summaries, query/rank data, manual annotations.
- Key metrics: Refresh reason, priority, traffic opportunity, risk level, missing metadata, missing Arabic version, review status.
- Allowed actions: Recommend updates, route to editorial/medical review, mark priority in future approved workflow.
- Blocked actions: Automatic editing, automatic publishing, automatic noindex/canonical/schema changes.

### 6. Keyword Opportunity Queue

- Purpose: Surface queries and topics that may deserve content, route review, provider profile improvement, or Arabic coverage.
- Audience: SEO reviewer, content manager, admin.
- Input data: Search Console queries, keyword universe records, public route inventory, provider supply summaries, content inventory.
- Key metrics: Impressions, rank position, CTR, content coverage, Arabic gap, provider supply score, medical/legal risk.
- Allowed actions: Recommend brief creation through the AI brief workflow after gate checks.
- Blocked actions: Automatic page/route creation, public Persian/Hindi route creation, AI publishing.

### 7. Arabic Content Gap Dashboard

- Purpose: Monitor missing or underperforming Arabic content for approved public page types.
- Audience: Content manager, SEO reviewer, admin.
- Input data: Route inventory, content inventory, keyword universe, language metadata, Search Console language/query summaries.
- Key metrics: Missing Arabic versions, Arabic query impressions, Arabic CTR, Arabic rank opportunities, review status.
- Allowed actions: Recommend Arabic content briefs and translation/review priorities.
- Blocked actions: Automatic translation, automatic publishing, unsupported language route creation.

### 8. Provider Supply Gap Dashboard

- Purpose: Identify categories and areas where SEO demand exceeds provider supply.
- Audience: Sales/marketer, admin, owner.
- Input data: Provider supply data later, category/area taxonomy, keyword opportunity data, route inventory.
- Key metrics: Provider count, approved profile count, thin profile count, weak-supply categories/areas, acquisition opportunity score.
- Allowed actions: Recommend provider acquisition priorities and profile improvement targets.
- Blocked actions: Provider data mutation, public profile creation, sales automation, private provider data exposure.

### 9. Route Indexability Monitor

- Purpose: Track whether approved public routes are indexable as intended and detect conflicts.
- Audience: SEO reviewer, engineering lead, admin.
- Input data: Public route inventory, crawl/index status, sitemap summaries, robots/noindex/canonical/hreflang summaries where approved.
- Key metrics: Indexed pages, excluded pages, noindex/index mismatch, sitemap/noindex conflict, canonical conflict, 404/redirect issue.
- Allowed actions: Report and prioritize issues.
- Blocked actions: Automatic route, robots, sitemap, noindex, canonical, hreflang, or schema changes.

### 10. Core Web Vitals Monitor

- Purpose: Monitor page experience and performance risks, especially media-heavy pages.
- Audience: SEO reviewer, engineering lead, content manager for media issues.
- Input data: PageSpeed, Lighthouse, CrUX summaries, public route inventory, media performance annotations later.
- Key metrics: LCP, INP, CLS, slow pages, heavy image/video pages, missing dimensions, render-blocking risks.
- Allowed actions: Recommend performance investigation and media optimization work.
- Blocked actions: Automatic code changes, package changes, media processing, embed replacement.

### 11. AI SEO Recommendations Queue

- Purpose: Collect AI-generated recommendations for human review.
- Audience: SEO reviewer, content manager, admin.
- Input data: Approved aggregated reporting summaries, keyword records, content status, route inventory, technical issue summaries.
- Key metrics: Recommendation type, confidence, evidence, impact estimate, risk level, required reviewer.
- Allowed actions: Human review, accept/reject/annotate recommendations in a future approved workflow.
- Blocked actions: AI content edits, publishing, route creation, schema/noindex/canonical changes, automatic ticket creation unless approved later.

### 12. Provider/Category/Area Growth Report

- Purpose: Connect SEO demand with Oman-first provider/category/area growth planning.
- Audience: Owner, admin, sales/marketer, SEO reviewer.
- Input data: Keyword opportunities, provider supply summaries, route inventory, profile completeness summaries, content performance.
- Key metrics: Category demand, area demand, provider supply, profile thinness, growth opportunity, acquisition priority.
- Allowed actions: Recommend sales/content priorities.
- Blocked actions: Provider data mutation, public route creation, sponsored placement changes, hidden ranking boosts.

## 5. Daily AI SEO Analyst Report

A future daily AI SEO analyst report may summarize:

- Top wins.
- Top drops.
- High impressions / low CTR pages.
- Ranking positions 8-20 needing refresh.
- Ranking positions 2-5 needing CTR tests.
- Newly discovered queries.
- Pages with indexing issues.
- Pages with Core Web Vitals regressions.
- Pages missing Arabic content.
- Provider/category/area supply gaps.
- Cannibalization risks.
- Internal linking recommendations.
- Content refresh recommendations.
- Noindex/hold recommendations.
- Schema review recommendations.
- High-risk topics requiring medical review.

Rules:

- Daily AI report may recommend only.
- AI must not edit content.
- AI must not change noindex, canonical, or schema.
- AI must not publish.
- AI must not create tickets automatically unless a future workflow approves it.
- AI must show evidence and uncertainty where available.
- AI must escalate medical, legal, privacy, and provider-trust risks to humans.

## 6. Weekly SEO Operating Report

A future weekly SEO operating report should include:

- Visibility trend.
- Clicks/impressions trend.
- CTR trend.
- Top growing pages.
- Top declining pages.
- Top growing queries.
- Content refresh queue.
- Route/index issues.
- Technical issues.
- Core Web Vitals status.
- Arabic content gaps.
- Provider supply gaps.
- Content production bottlenecks.
- Competitor notes where approved.
- Next-week priorities.
- Owner decision items.

Weekly reports should distinguish observed metrics from interpretations, recommendations, and owner decisions. Any competitor data source requires separate approval.

## 7. Content Refresh Queue Rules

Refresh candidate triggers include:

- High impressions / low CTR.
- Rank 8-20.
- Rank drop.
- Outdated content.
- Missing Arabic version.
- Missing FAQ, media, or internal links.
- Stale `last_reviewed_at`.
- Core Web Vitals issue.
- Cannibalization signal.
- Provider supply changed.
- Offer/provider status changed.
- Medical/trust policy changed.

Allowed recommendations:

- Update title/meta.
- Improve intro/H1.
- Add FAQ.
- Add Arabic version.
- Add internal links.
- Add media.
- Update provider links.
- Merge content.
- Noindex thin content.
- Archive outdated content.
- Send to medical review.
- Send to SEO review.

Blocked actions:

- Automatic content editing.
- Automatic noindex.
- Automatic canonical/schema changes.
- Automatic publishing.
- Automatic route generation.

## 8. Keyword Opportunity Queue

Future keyword opportunities may include:

- Queries with impressions but no dedicated content.
- Queries where DrMuscat ranks 8-20.
- Queries where Arabic content is missing.
- Local/category queries with provider supply.
- Provider-branded queries needing profile improvement.
- Doctor-branded queries needing profile improvement.
- Offer-related queries.
- Seasonal queries.

Each opportunity must pass through:

- Keyword universe/content intelligence spec.
- Route inventory spec.
- CMS content model.
- AI brief workflow.
- Provider supply gate.
- Medical/legal risk gate.
- Human approval gate.

A keyword opportunity is not approval to create a route, generate an article, publish content, or instrument tracking.

## 9. Technical SEO Issue Queue

Future issue types may include:

- 404.
- Redirect chain.
- Duplicate canonical.
- Missing canonical.
- Hreflang mismatch.
- Missing hreflang.
- Sitemap/noindex conflict.
- Indexed search/filter page.
- Noindex page in sitemap.
- Schema validation error.
- Fake/ineligible schema warning.
- Thin indexed page.
- Slow LCP.
- Poor INP.
- High CLS.
- Missing image dimensions.
- Heavy video embed.
- Missing alt text.
- Broken internal link.

Rules:

- Issues can be reported.
- Fixes require a separate approved implementation PR.
- No automatic fixes are allowed in a reporting phase.
- Any issue involving routes, sitemap, noindex, canonical, hreflang, schema, code, or migrations must follow its future approved phase gate.

## 10. Privacy and Consent Planning

Future analytics implementation must respect the approved privacy policy and consent model. Planning rules:

- No private patient data.
- No personal health information.
- No medical inquiry tracking without approved policy.
- No hidden tracking beyond approved analytics.
- Event names must avoid storing sensitive user text.
- IP/user identifiers must be handled only according to approved policy.
- Retention windows must be defined before implementation.
- Provider dashboard analytics must not expose private patient data.
- User deletion/data request policy must be considered.
- Consent, opt-out, cookie, regional compliance, and analytics retention rules must be approved before any tracking code or connector is introduced.

## 11. Future Event Taxonomy Planning

Future public event categories may include:

- `page_view`.
- `provider_profile_view`.
- `doctor_profile_view`.
- `category_page_view`.
- `area_category_page_view`.
- `article_view`.
- `offer_view`.
- `whatsapp_click`.
- `call_click`.
- `directions_click`.
- `list_your_center_click`.
- `claim_center_click`.
- `search_submit`.
- `filter_apply`.
- `language_switch`.
- `internal_link_click`.
- `media_play`.
- `video_start`.
- `video_complete`.
- `form_start`.
- `form_submit`.

Rules:

- Event taxonomy is planning only.
- No event code is added in this PR.
- No sensitive search terms or private medical text may be stored unless future policy approves it.
- Events must map to future analytics privacy rules.
- Event payloads must be minimal, documented, and non-sensitive by default.

## 12. Dashboard Access Control Planning

Future access roles may include:

- `super_admin`: all reporting.
- `admin`: operational SEO/content reports.
- `content_manager`: content performance and refresh queue.
- `SEO reviewer`: SEO dashboards and technical queue.
- `medical reviewer`: assigned content risk/review reports only.
- `sales/marketer`: provider supply gaps and acquisition reports only.
- `provider_owner`: own profile/reporting only later.
- Public users: no private dashboard.

Rules:

- Dashboard access must be server-side enforced.
- Provider analytics must be scoped to the provider's own entities.
- No cross-provider leakage is allowed.
- No private patient data is allowed.
- Role names and permissions are planning labels only until approved by a future auth/RLS phase.

## 13. AI Reporting Guardrails

AI may:

- Summarize metrics.
- Explain possible causes.
- Recommend investigations.
- Recommend refresh candidates.
- Recommend content opportunities.
- Recommend internal links.
- Flag risks.

AI must not:

- Edit content.
- Publish.
- Create routes.
- Change metadata.
- Change canonical/noindex/schema.
- Access private patient data.
- Expose private provider data.
- Claim causation without evidence.
- Create medical advice.
- Create public Persian/Hindi content.

AI recommendations must remain explainable, evidence-linked, human-reviewed, and reversible through an approved workflow.

## 14. Explicit Non-Implementation

This specification implements none of the following:

- No analytics integration.
- No GSC import.
- No GA4 import.
- No rank tracking integration.
- No backlink integration.
- No dashboard.
- No reporting tables.
- No event tracking.
- No tracking scripts.
- No AI reporting automation.
- No tickets/tasks automation.
- No route changes.
- No sitemap/canonical/hreflang/schema changes.
- No CMS changes.
- No provider analytics implementation.
- No package/env/config changes.
- No code changes.

## 15. Future PR Sequence

Recommended future PR sequence:

1. Analytics/Event Taxonomy Spec.
2. Reporting Data Model Spec.
3. Privacy/Consent Analytics Policy Spec.
4. SEO Reporting Dashboard UI Spec.
5. GSC/GA4 Connector Implementation only after approval.
6. Content Refresh Queue Implementation only after CMS foundation.
7. AI SEO Analyst Implementation only after reporting data exists.

These are recommendations only. They do not approve implementation, database changes, connectors, dashboards, tracking scripts, AI automation, or route changes.

## 16. Completion Report Requirements

Final Codex report for this file must include:

- Confirmation documentation-only.
- Files created/changed.
- No code/routes/migrations/RLS/API/server actions changed.
- No analytics/tracking/dashboard implementation.
- No AI automation.
- Summary of reporting model.
- Validation results.
- Blockers/conflicts.
