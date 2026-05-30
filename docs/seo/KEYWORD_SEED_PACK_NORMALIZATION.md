# Keyword Seed Pack Normalization

## 1. Status and Authority

This document is documentation/data-only. It does not authorize implementation, product features, routes, migrations, API handlers, UI changes, business logic, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, CMS records, public SEO pages, provider pages, branded hospital pages, article routes, or programmatic pages.

The keyword JSON created for SEO-B is planning data only. It is not seed data, not database data, not route authorization, not page generation approval, not sitemap approval, not CMS publishing approval, and not medical content approval.

V10.4 master-spec files and stricter guardrails win on conflict. If this document conflicts with `AGENTS.md`, `README.md`, `docs/project-state/*`, `docs/master-spec/*`, `docs/addendums/*`, or a stricter task instruction, the stricter canonical instruction wins.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with four-axis mapping, allowed files, forbidden scope, validation, and human approval. Keyword entries do not authorize route/page/article/CMS/schema/sitemap generation. Medical content requires human approval before publication.

Approved launch languages are English and Arabic only. Approved launch country is Oman only. Persian/Hindi public SEO routes remain forbidden unless explicitly approved. Unsupported locales/countries must not create public SEO targets.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-and-data planning only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-B

## 3. Source File Inventory

- Source: `docs/master-spec/seo_inputs/drmuscat-keywords-full.xlsx`
- Handling: read-only source input. SEO-B must not modify `docs/master-spec/*`.
- Canonical keyword sheet: `۰۱_Master`.
- Canonical keyword rows normalized: 792.
- No keyword invention rule: only source spreadsheet keywords may appear in `data/seo/drmuscat-keyword-seed.json`.

The spreadsheet also includes guide, category, location, tier-specific, tracking, dashboard, content-calendar, and URL-strategy sheets. Tier-specific sheets duplicate master keyword rows, so `۰۱_Master` is used as the canonical row source to avoid duplicate keyword records.

## 4. Normalization Principles

1. Preserve the original source text in `keyword`.
2. Normalize whitespace and case in `normalized_keyword`.
3. Use conservative mappings when source intent, route pattern, or entity type is ambiguous.
4. Retain spreadsheet target URLs only inside `source.source_columns.target_url`; they are not route authorization.
5. Default route status to `planning_only` for supported English/Arabic Oman planning rows unless a row is unsupported or blocked.
6. Mark unsupported locales or countries as unsupported/research-only and do not create public SEO target routes.
7. Require human review for medical, cost, comparison, symptom, condition, emergency, insurance, service-information, and other compliance-sensitive rows.
8. Do not invent provider names, clinic names, prices, reviews, routes, medical claims, or publication approval.

## 5. Field Definitions

| Field | Definition |
| --- | --- |
| `id` | Stable planning identifier derived from the source `#` value. |
| `keyword` | Original source keyword from the spreadsheet. |
| `normalized_keyword` | Whitespace-normalized and case-normalized keyword text. |
| `language` | Normalized language code. Approved launch values are `en` and `ar`; unsupported source languages must not create public SEO routes. |
| `country` | Planning country code. SEO-B constrains output to `om` only. |
| `city` | Conservative city value when directly indicated by the keyword, target metadata, or approved source location list. |
| `area` | Conservative area slug when directly indicated by source keyword, source URL metadata, or the source location sheet. |
| `category` | Slug derived from the spreadsheet `Cluster` column. |
| `specialty` | Specialty-like slug only when the source pattern is specialty/category discovery. |
| `service` | Service-like slug only when the source pattern is service/topic oriented. |
| `entity_type` | Conservative planning entity class, such as `specialty`, `specialty_area`, `medical_topic`, or `planning_topic`. |
| `intent` | Controlled SEO-B intent value. |
| `funnel_stage` | Planning funnel label: `top`, `middle`, `bottom`, or `urgent`. |
| `cluster` | Controlled SEO-B cluster taxonomy value. |
| `subcluster` | Slug derived from the spreadsheet pattern. |
| `priority` | Controlled planning priority (`p0` to `p3` or `blocked`) derived from source priority. |
| `tier` | Controlled planning tier derived from source tier. |
| `content_type` | Planning-only content family hint; not page approval. |
| `target_url_pattern` | Controlled target-pattern placeholder. SEO-B uses `future_approval_required` for supported rows. |
| `route_status` | Controlled planning route status. Default is `planning_only`. |
| `indexability_recommendation` | Planning-only recommendation; no page is indexable from this file alone. |
| `medical_safety_level` | Controlled medical safety flag. |
| `human_review_required` | Boolean requiring human review before any publication-oriented use. |
| `ai_answer_potential` | Planning estimate for future answer-engine suitability after approval. |
| `local_seo_relevance` | Planning estimate for Oman/Muscat/local SEO relevance. |
| `branded_query` | Boolean flag for brand-like query handling. |
| `competitor_query` | Boolean flag for competitor-like query handling. |
| `notes` | Conservative safety, authority, and ambiguity notes. |
| `source` | Read-only source metadata, including sheet, row, source columns, and target URL metadata. |
| `status` | Normalization status; SEO-B uses `normalized_planning_only`. |

## 6. Enum Definitions

### Intent

- `discovery`
- `local_provider`
- `cost`
- `comparison`
- `branded`
- `service_information`
- `symptom_or_condition`
- `insurance`
- `appointment`
- `emergency_or_urgent`
- `commercial_provider`

### Clusters

- `specialty_discovery`
- `service_discovery`
- `area_discovery`
- `specialty_area`
- `provider_discovery`
- `center_discovery`
- `cost_pricing`
- `comparison`
- `branded`
- `competitor`
- `insurance`
- `appointment`
- `urgent_emergency`
- `condition_symptom`
- `ai_answer_candidate`
- `unsupported_locale_research`
- `unsupported_country_research`

### Medical Safety Levels

- `low`
- `medium`
- `high`
- `blocked_until_review`

### Route Statuses

- `planning_only`
- `approved_later_required`
- `noindex_required`
- `blocked`
- `unsupported_locale`
- `unsupported_country`

## 7. Language and Locale Constraints

Approved launch languages are English and Arabic only. Approved launch country is Oman only. Persian/Hindi public SEO routes remain forbidden unless explicitly approved. Unsupported locales/countries must not create public SEO targets.

A keyword may be recorded as planning/research data only if future approval permits that handling. It must not become a public route, article, CMS record, sitemap entry, schema object, or page-generation input through this file.

## 8. Route Status and URL Target Pattern Rules

- `planning_only`: default supported-language planning state; not route authorization.
- `approved_later_required`: reserved for a future task that explicitly permits further route/page review.
- `noindex_required`: reserved for future noindex-only handling if explicitly approved.
- `blocked`: forbidden, unsafe, deprecated, or conflicting route/page concept.
- `unsupported_locale`: unsupported source language; no public SEO target.
- `unsupported_country`: unsupported country; no public SEO target.

Spreadsheet target URLs remain source metadata only. They do not override the approved route contract and do not authorize deprecated routes, article routes, CMS routes, sitemap entries, schema output, or programmatic pages.

## 9. Medical Safety Review Rules

Medical content requires human approval before publication. Human review is required for symptom, condition, treatment, emergency, cost, comparison, insurance, service-information, and commercial healthcare terms. Keywords must not be transformed into diagnosis, prescription advice, treatment instructions, guaranteed outcomes, invented prices, invented reviews, or unsupported claims.

Rows marked `high` or `blocked_until_review` must not become public content until a future approved scope defines content source, visible user-facing content, disclaimers, route impact, indexability, validation, and human approval.

## 10. AI-search / GEO Field Rules

AI-search and GEO fields are planning-only. `ai_answer_potential` and `local_seo_relevance` do not authorize AI summaries, `llms.txt`, schema, hidden AI-only content, crawlers, background jobs, AI chat, or public page implementation.

Future AI-search content must be visible to users, based on approved public content only, avoid private data, avoid diagnosis/prescription advice, and require human approval for medical topics.

## 11. Quality Control Checklist

- Source spreadsheet was read-only.
- `۰۱_Master` was used as the canonical keyword row source.
- Original keywords were preserved.
- Normalized keywords were whitespace/case normalized.
- Source target URLs were retained only as source metadata.
- English/Arabic and Oman-only constraints were preserved.
- Unsupported locales/countries are not allowed to create public targets.
- Medical and compliance-sensitive rows require human review.
- No routes, pages, articles, CMS records, database rows, seeds, schema output, sitemap entries, robots changes, or `llms.txt` were created.

## 12. Validation Commands

Run after implementation:

```bash
git status --short
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('data/seo/drmuscat-keyword-seed.json','utf8')); console.log('keyword seed json valid')"
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

No validation command may be faked, skipped silently, or weakened. `pnpm lint` may show warnings only, but must have no errors.

## 13. Out-of-Scope Items

SEO-B does not approve product features, routes, migrations, API handlers, UI components, business logic, Supabase generated types, validators, route checks, RLS tests, SEO checks, seed rows, database imports, article routes, public SEO pages, CMS records, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, provider pages, branded hospital pages, or programmatic pages.

SEO-B also does not approve edits to `AGENTS.md`, `README.md`, `docs/project-state/*`, `docs/master-spec/*`, `docs/addendums/*`, existing SEO-A docs, `src/*`, `scripts/*`, `supabase/*`, or `package.json`.

## 14. Blockers and Human Approval Requirements

Stop and report a blocker if source parsing fails, column mappings are ambiguous, unsupported language/country handling is unclear, medical safety status is unclear, route status conflicts with the route contract, or future work would require files outside an approved PHASED_BUILD_ONLY task.

Future publication, page generation, article generation, CMS import, schema output, sitemap inclusion, database import, seed rows, or medical content use requires explicit human approval in a separate PHASED_BUILD_ONLY task.
