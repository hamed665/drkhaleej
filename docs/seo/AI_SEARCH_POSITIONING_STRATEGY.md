# AI Search Positioning Strategy

## 1. Status and Authority

This document is documentation-only. It does not authorize implementation, product features, routes, migrations, API handlers, UI changes, business logic, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, CMS records, public SEO pages, provider pages, branded hospital pages, or programmatic pages.

This document does not replace V10.4 master-spec files. If this document conflicts with `AGENTS.md`, `README.md`, `docs/project-state/CURRENT_STATE.md`, `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`, `docs/master-spec/*`, `docs/addendums/*`, or any stricter guardrail, the canonical file or stricter guardrail wins.

Retired informal phase labels must not be used. No hidden AI-only content is allowed. Schema must match visible content. Medical content must be human-approved before publication.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with Execution Phase, Lock Scope, Product Module, Subphase ID, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation, and a human approval checkpoint.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-A
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-A

## 3. AI Search Is Discoverability, Not Medical Advice

AI search readiness means making approved public DrMuscat content understandable and citeable by search and answer engines. It does not authorize AI diagnosis, AI treatment advice, AI prescription advice, AI chat, automated medical advice, private-data exposure, or hidden content for bots.

Medical content must be human-approved before publication and must use disclaimers where required by future approved scope.

## 4. Target Answer-Engine Surfaces

Future planning may consider visibility in:

- Google AI Overview / Gemini
- ChatGPT Search / OAI-Searchbot
- Bing/Copilot
- Grok/X
- Perplexity-style answer engines

Planning for these surfaces must not bypass V10.4 route, SEO, RLS/security, medical-safety, or human-approval guardrails.

## 5. Answer-Ready Visible Page Structure

Future answer-ready public pages should use visible, user-facing structure that helps both patients and search systems:

- clear page purpose near the top of the page
- concise visible summaries based on approved public content
- specific entity names and entity types
- Oman/Muscat location context where relevant
- updated/reviewed date signals where applicable
- semantic headings and scannable sections
- internal links to approved canonical public pages only
- disclaimers when medical, pricing, availability, or safety context requires them

No hidden AI-only content is allowed.

## 6. LLM Summary Block Rules

If future approved work introduces LLM summary blocks, each block must:

- be visible to users
- summarize visible, approved, public content only
- avoid diagnosis, prescription advice, guarantees, invented facts, and unsupported medical claims
- avoid private data, admin notes, CRM notes, payment logs, private reviews, license files, claim evidence, receipts, and unpublished provider data
- include updated/reviewed context when the underlying content requires freshness signals
- be omitted or blocked when content is thin, unsupported, unapproved, or compliance-sensitive

SEO-A does not create LLM summary blocks.

## 7. Entity Clarity Rules

Future AI-search-ready content should identify entities clearly:

- DrMuscat as the platform entity
- doctors as individual provider entities only when real and approved
- centers, clinics, hospitals, pharmacies, labs, and service providers as separate organization/location entities only when real and approved
- specialties and services as descriptive categories, not unsupported medical recommendations
- areas, cities, and Oman country context as location entities
- brands only when legally and ethically appropriate and not confusing or impersonating

No invented doctors, clinics, prices, reviews, brands, or medical claims are allowed.

## 8. Updated-Date Rules

Future content should distinguish between:

- date published
- date last updated
- date medically reviewed, if applicable
- date data was last verified, if applicable

Updated dates must not be faked. Medical review dates must require real human review. Stale or unverifiable information should be blocked, noindexed, revised, or excluded according to the approved future scope.

## 9. Source-Like Page Structure

Future pages should be structured like reliable public references:

- visible summary
- entity facts
- location facts
- eligibility or availability caveats where applicable
- disclaimers for medical and safety-sensitive content
- clear distinction between factual directory data and editorial guidance
- internal links to canonical related pages
- visible basis for structured data

This document does not approve articles, author pages, citations, schema output, or public page implementation.

## 10. Schema Visibility Parity

Schema must match visible content. Future structured data must not include hidden claims, invented ratings, invented reviews, invented prices, unsupported services, private data, or facts not visible on the page. Schema must be omitted when visible content is insufficient or human approval is missing.

## 11. AI Visibility Tracking Planning

A future approved task may define manual or semiautomated tracking only. Candidate test query categories may include:

- local healthcare discovery queries
- specialty plus Muscat/Oman queries
- provider-type comparison queries
- branded hospital/clinic queries
- Arabic and English query variants
- safety-sensitive medical-information queries requiring disclaimers or exclusion

Future query sets may include:

- Google AI Overview/Gemini test queries
- ChatGPT Search test queries
- Bing/Copilot test queries
- Grok/X test queries

Tracking must not collect private user data, bypass platform terms, imply AI chat approval, or create analytics tables, dashboards, crawlers, background jobs, or automated tracking without a separate approved task.

## 12. Explicitly Not Approved in SEO-A

SEO-A does not approve:

- `llms.txt`
- AI chat
- crawlers
- background jobs
- analytics tables
- dashboards
- automated tracking
- private-data exposure
- public SEO pages
- schema output
- sitemap or robots changes
- CMS records
- article routes
