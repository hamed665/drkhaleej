# Programmatic SEO Guardrails

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

## 3. Programmatic SEO Is Not Approved Yet

This document defines future guardrails only. It does not create programmatic pages, route patterns, metadata, sitemap entries, robots rules, noindex logic, CMS records, schema output, content templates, provider pages, branded hospital pages, service pages, or article routes.

Programmatic SEO may proceed only after a future approved task defines exact page families, route impact, data sources, thresholds, noindex rules, canonical rules, validation, and human approval.

## 4. Approved-for-Planning Page Families

The following page families may be discussed for future planning only:

- specialty pages
- area pages
- specialty + area pages
- future service pages only if approved

Planning does not authorize page generation, indexation, route creation, sitemap inclusion, metadata generation, schema output, or CMS publication.

## 5. Minimum Quality Thresholds

Future programmatic pages must define minimum thresholds before indexability, such as:

- enough real approved providers, centers, or relevant entities
- unique visible content for the page intent
- unique localized title and meta description
- unique intro copy and useful explanatory text
- clear Oman/Muscat/local relevance where applicable
- internal links to approved canonical routes
- no unsupported medical claims
- human approval for medical or compliance-sensitive content
- schema eligibility only when visible content supports it

Pages failing thresholds must be noindexed, excluded, consolidated, deferred, or not created.

## 6. Noindex Rules for Thin / Unsupported Pages

Future noindex rules must apply to pages that are thin, duplicate, unsupported, stale, private, admin/provider-only, route-conflicting, missing entity clarity, missing provider/content thresholds, unsupported by approved locales/country, or medically/compliance-sensitive without approval.

Thin pages must not be included in sitemaps and must not be made indexable through metadata, internal linking, schema, or AI-only summaries.

## 7. Canonical and Hreflang Rules

Future programmatic SEO must preserve:

- one canonical URL per search intent/entity combination
- valid English/Arabic hreflang pairs only where approved counterparts exist
- no duplicate canonical route families
- no unsupported locales or country expansion
- no canonical URLs pointing to thin or unsupported pages
- no hidden AI-only content and no schema beyond visible content

## 8. Sitemap Eligibility Rules

Future sitemap eligibility must require:

- approved public route pattern
- approved locale and country
- canonical indexable status
- visible content meeting quality thresholds
- active public entity or approved editorial value
- no duplicate canonical URL
- no deprecated route pattern
- human approval where medical content is present

Sitemap inclusion is forbidden for thin pages, unsupported pages, private pages, admin/provider pages, search query pages, deprecated routes, unsupported locales, or pages with unresolved medical/safety claims.

## 9. Forbidden Route Patterns

Future programmatic SEO must not create or link to:

- deprecated route patterns such as `/en/dentist/al-khuwair`
- Persian/Hindi public SEO routes unless explicitly approved
- duplicate canonical route families
- unsupported country or GCC expansion routes
- route variants that compete with approved canonical URLs
- branded hospital, clinic, provider, or service pages without separate explicit approval

## 10. Manual Authority Content Before Broad Programmatic SEO

Future SEO growth should prioritize manual authority content before broad programmatic generation. Manual authority content must be human-reviewed, medically safe, locally relevant, and supported by visible facts. Broad programmatic generation must not be used to create thin pages, duplicate pages, fake structured data, unsupported medical claims, hidden AI-only summaries, or sitemap bloat.

## 11. Future Validation Gate

A future implementation task derived from this document must define validation for route contracts, forbidden routes, canonical URLs, hreflang pairs, sitemap eligibility, noindex behavior, structured data visibility parity, typecheck, build, lint, RLS/security impact, and medical-content approval where applicable.

No validation command may be faked, silently skipped, weakened, or replaced with a non-equivalent check.

## 12. Explicitly Out of Scope

SEO-A does not approve specialty pages, area pages, specialty + area pages, service pages, article routes, public SEO pages, CMS records, schema output, sitemap changes, robots changes, `llms.txt`, metadata generation, noindex implementation, route checks, SEO checks, crawlers, background jobs, analytics tables, dashboards, provider pages, branded hospital pages, or any runtime programmatic SEO logic.
