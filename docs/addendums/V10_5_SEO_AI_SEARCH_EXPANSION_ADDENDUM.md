# V10.5 SEO and AI Search Expansion Addendum

## 1. Status and Authority

- This addendum is documentation-only.
- This addendum does not authorize implementation.
- This addendum does not replace V10.4 master-spec files.
- If this addendum conflicts with V10.4 master-spec files, `README.md`, `AGENTS.md`, `docs/project-state/CURRENT_STATE.md`, `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`, or any stricter guardrail, the V10.4 master-spec files, current-state documentation, agent instructions, alignment matrix, and stricter guardrail win.
- This addendum registers future SEO and AI-search-readiness requirements only.
- This addendum is not evidence that article routes, branded hospital/clinic pages, CMS records, schema output, public SEO pages, tracking tables, dashboards, analytics events, crawlers, background jobs, or AI chat may be implemented.

## 2. Four-Axis Mapping Requirement

Every future implementation task derived from this addendum must use the existing V10.4 four-axis mapping model:

1. Execution Phase
2. Lock Scope
3. Product Module
4. Subphase ID

The future task must map work to existing V10.4 execution phases, lock scopes, product modules, and subphase namespaces. It must not invent replacement phase numbers, informal phase labels, or parallel architecture.

## 3. Non-Implementation Boundary

This addendum does not create, modify, or approve:

- routes
- migrations
- RLS policies
- API handlers
- server actions
- UI components
- business logic
- validators
- Supabase types
- route checks
- SEO checks
- seed data
- article routes
- hospital or clinic branded pages
- CMS records
- schema output
- public SEO pages
- tracking tables
- dashboards
- analytics events
- crawlers
- background jobs
- AI chat

## 4. Future Implementation Gate

Implementation requires a future `PHASED_BUILD_ONLY` task with:

- Execution Phase
- Lock Scope
- Product Module
- Subphase ID
- allowed files
- forbidden scope
- database impact
- route impact
- RLS/security impact
- validation
- human approval checkpoint

No implementation may proceed from this addendum alone.

## 5. Existing V10.4 SEO Contract Preserved

Future SEO and AI search work must preserve the V10.4 SEO contract:

- Public localized routes remain Oman-first unless explicitly approved otherwise.
- Launch locales remain limited to approved English and Arabic routes unless a future phase explicitly approves additional locales.
- Persian and Hindi public SEO routes remain forbidden unless explicitly approved.
- Deprecated route patterns remain forbidden.
- Duplicate route patterns that compete with canonical URLs remain forbidden.
- Public SEO pages must be indexable, semantic, canonicalized, and supported by visible content.
- Admin, provider, private, thin, duplicate, or unsupported pages must not be exposed in public SEO surfaces.

## 6. Google SEO Requirements

Future Google SEO work may include planning for:

- unique titles and meta descriptions
- canonical URLs
- Open Graph basics
- crawlable server-rendered public content
- sitemap discipline
- robots discipline
- internal linking
- content quality gates
- structured data only when supported by visible content

This addendum does not implement metadata, sitemap entries, robots changes, schema markup, pages, or route validation changes.

## 7. Local SEO Oman/Muscat Requirements

Future local SEO planning may include:

- Oman-first healthcare discovery content
- Muscat-focused query coverage where quality and provider supply justify it
- local area and service relevance
- consistent entity naming
- location clarity
- local citation planning
- Google Business Profile support planning
- Arabic and English content quality review

No local SEO page, citation record, Google Business Profile workflow, or location landing page is approved by this addendum.

## 8. AI Search and Answer-Engine Visibility Requirements

Future AI search planning may account for visibility in:

- Google AI Overview / Gemini readiness
- ChatGPT Search / OAI-Searchbot readiness
- Bing/Copilot visibility
- Grok/X search visibility
- Perplexity-style answer engines

Future work must treat AI search visibility as discoverability and answer-readiness, not AI diagnosis, AI treatment advice, AI chat, or automated medical advice. Any AI-specific output must use approved public fields only and must not expose private data.

## 9. AI/LLM Answer-Ready Page Structure

Future public content may be designed to be answer-ready for search engines and LLM-style answer systems through:

- LLM summary blocks
- entity clarity
- schema matching visible content
- no hidden AI-only content

LLM summary blocks must summarize visible, approved, public content. Schema must match visible content. Hidden AI-only content is forbidden. This addendum does not create or approve `llms.txt`, AI summary blocks, schema output, or public pages.

## 10. Medical Content Safety and Human Approval

Future medical content must preserve safety and trust guardrails:

- medical claim safety
- human approval for medical content
- no diagnosis/prescription content
- no invented medical claims
- no guaranteed outcomes
- no unsupported treatment claims
- disclaimers where required by future approved scope

Any medical content requirement that is unclear, compliance-sensitive, or unsupported must stop for human review before implementation.

## 11. Keyword Seed Pack

A future keyword seed pack may classify candidate search themes for later human-approved SEO work, such as:

- provider type keywords
- specialty keywords
- service keywords
- area/location keywords
- branded hospital/clinic keywords
- patient-intent questions
- Arabic/English equivalent terms
- Oman and Muscat modifiers

This addendum does not create keyword files, programmatic pages, CMS content, public URLs, metadata, schema, or indexable surfaces.

## 12. Programmatic SEO Guardrails

Future programmatic SEO must follow strict guardrails:

- thin-page noindex rules
- canonical/hreflang rules
- internal linking
- quality gates
- unique localized metadata
- unique visible content
- useful FAQ content only when supported
- schema only when visible content supports it
- no duplicate canonical URLs
- no unsupported locale or country expansion
- no Persian or Hindi public SEO routes unless explicitly approved
- no deprecated route patterns

Programmatic SEO must not generate thin pages, duplicate pages, fake structured data, unsupported medical claims, or hidden AI-only content.

## 13. AI Visibility Test Query Set

A future AI visibility test query set may define human-reviewed sample queries for checking whether DrMuscat appears in AI or answer-engine results. Candidate categories may include:

- local healthcare discovery queries
- specialty plus Muscat/Oman queries
- provider-type comparison queries
- branded hospital/clinic search queries
- Arabic and English query variants
- safety-sensitive medical-information queries requiring disclaimers or exclusion

This addendum does not implement tests, crawlers, tracking jobs, dashboards, or analytics tables.

## 14. Manual/Semiautomated AI Citation Tracking

Future AI citation tracking may be manual or semiautomated, subject to future approval. It may track whether answer engines cite DrMuscat for approved public queries, but must not collect private user data, bypass platform terms, create private-data exposure, or imply AI chat approval.

Any automated tracking, storage, reporting, dashboarding, or event capture requires a separate approved analytics/RLS/security phase.

## 15. Manual Authority Content Before Broad Programmatic SEO

Future SEO growth should prioritize first manual authority articles before broad programmatic SEO. Manual authority content should be human-reviewed, medically safe, locally relevant, and supported by visible facts.

This addendum does not create articles, article routes, CMS records, author pages, schema, or indexable authority content.

## 16. Branded Search Capture Requirements

Future branded search planning may consider major hospitals, clinics, and provider brands where legally and ethically appropriate. Branded search capture must avoid confusion, impersonation, unsupported claims, duplicate route patterns, and thin pages.

Any branded public page, comparison page, microsite, landing page, or article requires explicit future SEO, legal/compliance, route, and human approval.

## 17. Phase Mapping Table

| Requirement group | Execution Phase | Lock Scope | Product Module | Subphase ID namespace |
| --- | --- | --- | --- | --- |
| Documentation-only SEO/AI registration | Phase 0 | Phase 0 — Repository Readiness | Phase 0 — Setup Only | `ALIGN-*` |
| Google SEO and local SEO implementation | Phase 3 — Public SEO Platform | Phase 4 or Phase 10 depending files | Phase 9 — SEO/CMS and Programmatic Pages | `SEO-*` |
| AI answer-readiness and LLM summary blocks | Phase 3 if public content; Phase 7 if measurement/reporting | Phase 4 or Phase 10 depending files | Phase 9; Phase 12 if tracking/reporting | `SEO-*`, `ANL-*` |
| AI visibility tracking | Phase 7 — Analytics, Support, Quality | Phase 8 or Phase 11 depending implementation | Phase 12 — CRM/Dashboards/Analytics | `ANL-*`, `SEO-*` |
| Manual authority articles and branded search capture | Phase 3 if public SEO; Phase 10 if SEO ops/content tooling | Phase 4 or Phase 10 depending files | Phase 9 — SEO/CMS and Programmatic Pages | `SEO-*` |

## 18. Explicitly Out of Scope

This addendum does not approve or implement:

- article routes
- hospital or clinic branded pages
- CMS records
- schema output
- public SEO pages
- route changes
- sitemap changes
- robots changes
- `llms.txt` changes
- tracking tables
- dashboards
- analytics events
- crawlers
- background jobs
- AI chat
- diagnosis or prescription content
- invented medical claims
- Persian or Hindi public SEO routes
- deprecated route patterns
- seed data
- migrations
- RLS changes
- route checks
- SEO checks

## 19. Future Validation Expectations

A future implementation task derived from this addendum must run the validation commands specified by that task. Depending on approved scope, future validation may include environment checks, route checks, SEO checks, sitemap checks, hreflang/canonical checks, structured-data checks, typecheck, build, lint, RLS validation, and migration validation.

No validation command may be faked, skipped silently, weakened, or replaced with a non-equivalent check.

## 20. Human Approval Requirements

Before implementation of any requirement registered here, a human must approve a future `PHASED_BUILD_ONLY` task that includes the full four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation gate, and human approval checkpoint.

This addendum must not be treated as human approval for SEO implementation, AI search implementation, public pages, article routes, branded search pages, schema output, tracking, analytics, dashboards, crawlers, background jobs, or AI chat.
