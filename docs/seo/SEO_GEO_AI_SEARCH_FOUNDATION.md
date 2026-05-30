# SEO / GEO / AI Search Foundation

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

## 3. Relationship to V10.4 and V10.5

This document records SEO, GEO, and AI-search foundation requirements for future planning only. V10.4 remains the canonical execution-control framework. V10.5 addendums remain documentation-only and do not authorize implementation. SEO-A narrows the scope further: only these documentation files may be created in the approved implementation task.

Future tasks must preserve the existing Oman-first route contract, English/Arabic launch locale limits, canonical URL discipline, sitemap exclusions, structured-data safety, and no-guessing stop rules.

## 4. Google SEO Baseline Requirements

Future Google SEO work must capture these requirements before implementation:

- Public SEO content must be crawlable and must not rely on client-only rendering for SEO-critical content.
- Indexable pages must be explicitly eligible for indexing and must not be thin, duplicate, unsupported, private, admin-only, provider-only, or quality-gate failures.
- Each indexable page must have one canonical URL.
- Hreflang alternates must be valid for approved English/Arabic counterparts only.
- Titles and meta descriptions must be unique, localized where applicable, useful, and aligned with visible content.
- Heading structure must be semantic, with a clear page topic and non-duplicative hierarchy.
- Internal links must support discovery, user navigation, and canonical route consistency without linking to deprecated or unsupported route patterns.
- Sitemap inclusion must be limited to canonical, indexable, quality-gated pages.
- Thin pages must be excluded from indexing and sitemap surfaces.
- Structured data must not be fake; schema must match visible, approved, public content.

## 5. Local SEO Oman/Muscat Requirements

Future local SEO work must capture these requirements before implementation:

- Launch remains Oman-first.
- Launch public locales remain English and Arabic only.
- Muscat area relevance must be based on real visible provider, center, service, and location information.
- Provider and location entity clarity must distinguish doctors, centers, specialties, services, areas, and country context.
- Local citation planning may be documented later, but citation workflows are not approved here.
- Google Business Profile planning may be documented later, but no profile workflow, synchronization, or automation is approved here.
- Branded search capture planning must avoid impersonation, confusion, unsupported claims, duplicate route patterns, and thin pages.
- GCC expansion is not authorized unless a future approved phase explicitly allows it.

## 6. Shared GEO / AI Search Readiness Requirements

Future GEO and answer-engine readiness must be based on visible, approved, public information. Pages should be easy for humans and search systems to understand through clear summaries, entity definitions, location context, updated-date signals, and source-like structure. Hidden AI-only content is forbidden. AI readiness is discoverability work only; it is not AI diagnosis, AI treatment advice, AI chat, or automated medical advice.

## 7. Indexability and Sitemap Discipline

Future indexability rules must define when a page is `index`, `noindex`, sitemap-eligible, or excluded. Sitemap-eligible pages must be canonical, public, supported by visible content, language/country approved, and quality-gate passing. Thin pages, deprecated routes, search query pages, admin/provider/private pages, unsupported locales, duplicate canonical pages, and pages lacking entity clarity must be excluded.

## 8. Canonical, Hreflang, and Locale Rules

Future canonical and hreflang rules must preserve the approved route model:

- Approved launch country: `om`.
- Approved launch public locales: `en` and `ar`.
- Persian and Hindi public SEO routes remain forbidden unless explicitly approved.
- Deprecated shortcuts such as `/en/dentist/al-khuwair` remain forbidden.
- Duplicate route families competing for the same canonical intent remain forbidden.
- Hreflang must point only to valid approved counterparts and must not invent unsupported country or locale URLs.

## 9. Forbidden Scope

SEO-A does not approve routes, migrations, API handlers, UI components, business logic, Supabase generated types, validators, route checks, RLS tests, SEO checks, seed rows, article routes, public SEO pages, CMS records, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, provider pages, branded hospital pages, or programmatic pages.

## 10. Future Implementation Gate

Any implementation derived from this document requires a new `PHASED_BUILD_ONLY` task that defines:

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

The task must stop after its approved phase and wait for human approval.

## 11. Validation Expectations

A future implementation task derived from this document must run the validation commands explicitly approved for that task. For SEO-A documentation creation, expected validation is:

- `git status --short`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

No validation command may be faked, silently skipped, weakened, or replaced with a non-equivalent check.
