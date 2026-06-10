# DrMuscat SEO & AI Content Operating System Spec V1

## Status and Authority

- Status: Documentation-only
- Authority: SEO, AI content, CMS, media, review, and reporting planning only
- Does not authorize implementation
- Must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
- Does not replace V10.4 master spec or stricter guardrails
- Future implementation requires separate `PHASED_BUILD_ONLY` approval
- No code, route, migration, RLS, API, dashboard, CMS, AI, analytics, comments, stories, reviews, article publishing, keyword import, or provider content behavior is approved by this document

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only
- Lock Scope: Phase 0 — Repository Readiness
- Product Module: Phase 0 — Setup Only / documentation alignment
- Subphase ID: `ALIGN-SEO-AI-CONTENT-OS-V1`

## 1. Purpose

DrMuscat needs a full SEO & AI Content Operating System, not just an article writer. The future system must coordinate content opportunity discovery, editorial judgment, healthcare risk controls, localization, media planning, human approval, SEO publishing discipline, monitoring, and refresh decisions.

The system must eventually:

- prioritize content opportunities
- generate SEO briefs
- generate AI drafts
- support English and Arabic public content
- support Persian internal planning/review summaries only
- suggest images/videos
- suggest schema
- suggest internal links
- classify medical/legal risk
- require human approval
- require medical review for high-risk content
- publish only after approval
- monitor SEO impact after publishing
- recommend refreshes or new content based on data

This document is a planning specification only. It does not create content, routes, database objects, automations, AI integrations, dashboards, or publishing behavior.

## 2. Language Policy

- Public site content remains English and Arabic only unless a future approved phase adds more public languages.
- Persian may be used for internal admin planning notes, AI summaries, editorial explanations, and owner review notes.
- Persian public routes must not be created in this phase.
- Arabic content must be localization/transcreation-ready, not a low-quality literal translation.
- English and Arabic versions must maintain equivalent intent, facts, disclaimers, and review status.

Language expansion, localized routing changes, hreflang changes, or public Persian/Hindi content require separate explicit approval.

## 3. Content Types

Future content types may include:

1. SEO articles
2. Category guides
3. Area guides
4. Provider profile support content
5. Doctor profile support content
6. FAQ blocks
7. Offer content
8. Sponsored content
9. Provider stories / updates later
10. Doctor stories / weekly updates later
11. Google Business Profile style post drafts later
12. Video-enhanced articles
13. Image/infographic-enhanced articles
14. Refresh/update tasks for existing content

Clarifications:

- Provider stories are engagement content, not automatically indexable SEO pages.
- Stories should usually expire/archive.
- Stories must not become thin indexable pages.
- Sponsored/provider-generated content requires review and clear labeling.
- Medical-sensitive content requires human medical review.

## 4. SEO Content Intelligence Layer

The future SEO Content Intelligence Layer is an AI-assisted decision engine for planning, not a page factory. It should help DrMuscat decide whether to create, refresh, hold, noindex, merge, or block a content opportunity.

Future inputs may include:

- keyword universe Excel reference
- Google Search Console later
- GA4 later
- rank tracking later
- provider supply
- category coverage
- area coverage
- existing published content
- existing public route inventory
- competitor content manually/through approved sources later
- seasonality
- business value
- medical risk level
- commercial intent
- content gap signals
- internal linking opportunities

Future outputs may include:

- create article
- create category guide
- create area guide
- create FAQ block
- refresh existing article
- improve title/meta
- add internal links
- add media
- wait for provider supply
- noindex recommendation
- block due to risk
- send to medical review
- do not create

Rules:

- Not every keyword becomes a page.
- Not every AI idea becomes content.
- Not every directory route should be indexed.
- No Excel row should become runtime content without approved content workflow.
- The uploaded keyword universe Excel and SEO prompt PDF are planning/reference artifacts only and must not be imported into runtime data by this specification.

## 5. Content Prioritization Model

A future scoring framework may evaluate candidate topics with factors such as:

- Search intent match
- Local/Oman relevance
- Provider supply
- Business value
- Conversion potential
- Keyword priority from keyword universe
- Medical/legal risk
- Content difficulty
- Existing content gap
- Internal link value
- Seasonal timing
- Arabic content opportunity
- LLM/answer-engine usefulness
- User trust value

Suggested pseudo-formula:

```text
Priority Score =
  Business Value
* Local Intent
* Provider Supply
* Conversion Potential
* Content Gap
* Internal Link Value
* Seasonal Value
- Medical Risk
- Content Difficulty
- Thin Page Risk
```

This formula is planning guidance only. It is not implemented by this document and must not be treated as an approved scoring algorithm, ranking system, CMS workflow, or automation.

## 6. AI Brief Workflow

Future workflow:

1. Topic/keyword candidate selected
2. AI generates SEO brief
3. Editor/Admin reviews brief
4. Risk classification checked
5. Content type confirmed
6. Human approval required before draft generation for high-risk topics if policy requires

AI brief output should include:

- target language(s)
- primary keyword
- secondary keywords
- search intent
- funnel stage
- target audience
- content type
- suggested route family
- title options
- meta title options
- meta description options
- H1
- outline
- FAQ ideas
- internal link candidates
- provider/profile link opportunities
- media suggestions
- schema recommendation
- risk level
- medical/legal review notes
- sources required
- publish/no-publish recommendation

AI brief generation requires future approval for prompts, data handling, logging, review, security, and user-facing workflow.

## 7. AI Draft Workflow

Future workflow:

1. Approved brief
2. AI draft generation
3. English draft
4. Arabic draft/transcreation
5. Persian internal owner summary if useful
6. SEO self-check
7. medical/legal risk self-check
8. media plan
9. internal link plan
10. editor review
11. medical review when required
12. final owner/admin approval
13. publish

Draft output should include:

- title
- slug suggestion
- excerpt
- body
- FAQ block
- image prompts/descriptions
- alt text
- video suggestions
- schema recommendation
- internal link targets
- external citation/source suggestions
- disclaimer block if needed
- author/reviewer block suggestion
- last reviewed date requirement
- risk notes

Hard rule: AI must never publish directly.

## 8. Risk Classification

Low risk examples:

- how to choose a clinic
- what to ask a provider
- local discovery guides
- category explainer without treatment advice
- general wellness discovery

Medium risk examples:

- procedure preparation
- general dental/beauty/wellness explanation
- lab/service overview
- pet care informational content

High risk examples:

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

Rules:

- High-risk content requires medical reviewer approval.
- High-risk content must include strong disclaimer.
- No diagnosis, prescription, emergency triage, or individualized medical advice.
- AI-generated health content must be reviewed by humans before publish.

## 9. CMS Content Lifecycle

Future statuses may include:

- `idea`
- `brief_ready`
- `brief_review`
- `draft`
- `editor_review`
- `medical_review`
- `seo_review`
- `owner_review`
- `approved`
- `scheduled`
- `published`
- `needs_refresh`
- `archived`
- `rejected`

Future required metadata may include:

- created_by
- assigned_editor
- assigned_medical_reviewer
- assigned_seo_reviewer
- approved_by
- published_by
- published_at
- last_reviewed_at
- next_review_due_at
- risk_level
- content_type
- language
- canonical group
- noindex decision
- schema eligibility
- sitemap eligibility

No CMS implementation, database table, status enum, route, admin UI, workflow automation, or publishing behavior is created by this document.

## 10. Human Approval Gates

Low-risk article:

- editor/admin approval required

Medium-risk article:

- editor/admin approval
- SEO review
- optional medical review depending topic

High-risk article:

- editor review
- medical reviewer approval
- SEO review
- owner/admin final approval

Provider-generated content:

- admin moderation required
- medical review when risk classification requires it

Sponsored content:

- admin review
- sponsored label
- medical/legal review when needed
- no hidden ranking boost

Comments/reviews:

- user registration required before commenting
- moderation required before public display in initial phases
- provider response allowed only after moderation rules are defined

Human approval gates must be explicit in future UI, server-side enforcement, audit logging, and RLS plans before implementation.

## 11. Media Support

Future article media may include:

- hero image
- inline images
- image gallery
- infographic
- YouTube embeds first
- self-hosted video later only after performance/storage policy
- provider/doctor video tips later
- before/after media only with strict approval policy

Future media metadata may include:

- filename
- alt text
- caption
- source/credit
- width
- height
- format
- compression target
- lazy loading rule
- LCP eligibility
- image sitemap eligibility
- VideoObject eligibility
- thumbnail
- transcript for videos where possible

Performance rules:

- Prefer AVIF/WebP where possible
- Always define image/video dimensions to avoid CLS
- Lazy-load non-critical images
- Use lazy YouTube facade/placeholder pattern for embeds
- Do not allow heavy videos to harm Core Web Vitals
- Hero/LCP image must be optimized separately

## 12. Provider and Doctor Content

Future provider article requests may follow this pattern:

- provider may request a topic
- AI may help draft
- admin/editor reviews
- medical review when needed
- content may appear on provider profile and/or article hub depending policy

Future doctor content may include:

- doctor profile articles
- doctor tips
- doctor Q&A
- weekly activity updates
- educational notes
- event participation
- new equipment announcements
- public story/update format later

Rules:

- provider cannot directly publish medical-sensitive content
- provider cannot create fake medical claims
- provider cannot self-label sponsored/verified content
- provider content must be reviewed
- patient stories/case examples require anonymization and approval
- no private patient data

## 13. Stories / Updates

Future story/update purpose:

- engagement
- trust
- provider activity
- weekly updates
- offers/events
- behind-the-scenes content

Story rules:

- not automatically indexable
- normally expires/archive after defined duration
- does not replace SEO articles
- can be promoted into article/content only after review
- comments/reactions only after user registration and moderation rules
- media must follow safety/performance rules
- medical claims reviewed

Future story statuses may include:

- draft
- pending_review
- approved
- active
- expired
- archived
- rejected

No story routes, story tables, story widgets, or public story behavior are implemented by this specification.

## 14. Comments and Feedback

Future user rules:

- anonymous users may browse, WhatsApp, call, and get directions
- commenting requires registration/login
- comments are moderated before public display in initial phases
- comments must not contain medical diagnosis demands, private records, abusive content, spam, defamation, or fake reviews

Future statuses may include:

- pending_moderation
- approved
- rejected
- hidden
- reported
- provider_replied
- admin_locked

Future provider replies:

- allowed after moderation policy
- provider replies must be professional
- no disclosure of private patient data
- no diagnosis/prescription in replies

Reviews:

- full ratings/reviews delayed until verification and moderation maturity
- no `AggregateRating` schema until enough real approved reviews
- no fake reviews
- no seeded reviews

## 15. SEO Publishing Requirements

Every future publishable page/content item must define:

- canonical URL
- language
- hreflang group
- x-default behavior where relevant
- sitemap eligibility
- index/noindex decision
- title tag
- meta description
- OG title
- OG description
- structured data eligibility
- breadcrumb eligibility
- internal links
- media metadata
- last reviewed date
- author/reviewer info where appropriate
- disclaimer requirement
- risk level

Rules:

- structured data must match visible content
- no fake FAQ schema
- no fake Review/AggregateRating schema
- no schema for content that is not visible/true
- no thin programmatic pages
- no mass publishing from keyword rows
- no unsupported medical claims
- no public Persian/Hindi routes

## 16. Internal Linking System

Future rules:

- every article links to relevant category/service/provider pages where useful
- every category guide links to relevant providers and related areas
- every area guide links to categories/providers available in that area
- provider profiles link to services, doctors, offers, and relevant articles
- articles should not over-link or spam anchors
- use natural anchor text
- avoid orphan content
- track internal link opportunities in AI recommendations

Internal linking must support users first, then SEO. It must not become keyword-stuffed, misleading, or cannibalizing.

## 17. Performance and Core Web Vitals Gates

Future gates:

- LCP target under 2.5s where possible
- INP target under 200ms where possible
- CLS target under 0.1 where possible
- content pages must avoid heavy client JS
- video embeds must be lazy/facade
- images must have dimensions
- avoid layout shifts from ads/media/stories/comments
- comments and story widgets must not block main content rendering
- provider media must be optimized before public display

No implementation is approved by this section.

## 18. Daily / Weekly AI SEO Analyst

Future data sources later may include:

- Google Search Console
- GA4
- rank tracking tool
- backlink tool later
- Lighthouse/CrUX/PageSpeed data
- internal events
- published content inventory
- provider supply

Future daily output may include:

- top wins
- top drops
- high impressions / low CTR pages
- ranking positions 8-20 needing refresh
- ranking positions 2-5 needing title/meta CTR tests
- new keyword opportunities
- cannibalization risk
- internal link recommendations
- refresh recommendations
- new content recommendations
- pages to noindex/hold
- technical alerts
- Core Web Vitals regressions
- Arabic content gaps
- provider/category supply gaps
- high-risk topics blocked pending review

Future weekly output may include:

- content calendar recommendation
- refresh queue
- technical SEO queue
- internal linking queue
- provider content opportunities
- media opportunities
- local SEO/GBP post ideas
- performance summary for owner

No automation is implemented by this document.

## 19. Refresh and Content Decay Workflow

Future refresh triggers may include:

- rankings drop
- impressions up but CTR low
- position 8-20 for priority keywords
- outdated info
- missing Arabic version
- missing FAQ
- missing schema eligibility
- missing media
- weak internal links
- cannibalization
- provider supply changed
- seasonal opportunity

Future refresh statuses may include:

- refresh_candidate
- refresh_brief_ready
- refresh_in_progress
- refresh_review
- refresh_approved
- refreshed
- no_action

Future monitoring windows:

- 7 days for index/crawl
- 30 days for impressions/CTR
- 60 days for ranking movement
- 90 days for keep/refresh/merge/noindex decision

## 20. Local SEO and GBP Content Support

Future local SEO support may include:

- GBP category audit prompts
- GBP attribute audit prompts
- review response strategy prompts
- local keyword research prompts
- local landing page blueprint prompts
- GBP post calendar prompts
- NAP/citation audit prompts

Rules:

- GBP/local SEO outputs are planning tools
- no external posting automation unless separately approved
- no fake reviews
- no misleading NAP
- no unsupported provider claims

## 21. Legal, Trust, and Compliance

Required future policies include:

- Medical Disclaimer
- AI Content Policy
- Editorial Policy
- Medical Review Policy
- Provider Content Policy
- Comment/Review Policy
- Sponsored Content Policy
- Media Policy
- Before/After Media Policy
- Privacy Policy
- Terms of Use
- Data Removal Request
- Report Incorrect Information

No legal text is implemented by this PR.

## 22. Explicitly Not Implemented Yet

This document does not implement:

- no AI API integration
- no auto-publishing
- no CMS database
- no article routes
- no story routes
- no comment system
- no review system
- no Persian public content
- no Hindi public content
- no YouTube embed component
- no video upload
- no keyword import
- no GSC integration
- no GA4 integration
- no rank tracking integration
- no daily automation
- no provider content dashboard
- no medical advice
- no diagnosis
- no prescription guidance
- no lab result interpretation
- no payment/billing changes

## 23. Future PR Sequence

Recommended future PRs:

1. Keyword Universe & Content Intelligence Spec
2. Public Route & SEO Inventory Spec
3. CMS Content Model Spec
4. AI Brief/Draft Workflow Spec
5. SEO Reporting & Analytics Spec
6. Media SEO & Video/Image Performance Spec
7. Provider Stories & Comments Spec
8. Legal/Trust/AI Editorial Policy Spec
9. CMS Database Foundation
10. Public Article Route Foundation
11. Admin CMS Read-Only
12. Admin CMS Draft/Review/Publish
13. AI Draft Assistant
14. GSC/GA4 Reporting Integration

These are recommendations only. They do not approve implementation, database changes, route creation, AI integration, CMS behavior, dashboards, analytics integrations, comments, stories, reviews, or publishing workflows.

## 24. Readiness Gates Before Implementation

Before CMS implementation:

- content model approved
- language policy approved
- status workflow approved
- review workflow approved
- RLS plan approved
- public/private boundary approved
- SEO metadata fields approved
- media rules approved
- audit rules approved

Before AI implementation:

- AI provider/security approved
- prompt logging/data retention rules approved
- medical review rules approved
- no auto-publish rule enforced
- output validation approved
- human approval UI approved

Before comments/stories:

- user auth behavior approved
- moderation workflow approved
- abuse/spam rules approved
- provider reply policy approved
- private data rules approved

Before SEO reporting:

- GSC/GA4 integration method approved
- event taxonomy approved
- privacy boundary approved
- dashboard scope approved

## 25. Completion Report Requirements

The final Codex report must include:

- Files created/changed
- Confirmation this is documentation-only
- Confirmation no source code changed
- Confirmation no routes changed
- Confirmation no migrations/RLS/API/server actions changed
- Confirmation no CMS/AI/analytics/story/comment/review behavior was implemented
- Summary of SEO/AI content system documented
- Summary of approval gates
- Summary of future PR sequence
- Validation results
- Any blockers or conflicts
