# Landing Page Noindex Logic

## 1. Status and Authority

This document is documentation-only for SEO-D3A. It does not authorize implementation, runtime helpers, query helpers, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, database imports, seed rows, migrations, API handlers, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, payment logic, monetization logic, sponsored placement, boosts, ranking logic, article pages, branded hospital/clinic pages, Persian/Hindi routes, GCC expansion routes, plural doctor detail routes, medical content, service descriptions, or local area descriptions.

Keyword data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be used as a runtime source and must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seeds, imports, or medical publication.

Medical content requires human approval before publication. This includes medical explanations, service descriptions, treatment/procedure language, symptom or condition content, safety warnings, disclaimers, AI-search summaries, or any claim that could be interpreted as clinical guidance, pricing, availability, insurance, or outcome information.

If this document conflicts with V10.4 master-spec files, current repository state, route checks, SEO-A, SEO-B, SEO-C, SEO-D1, SEO-D2, addendums, `AGENTS.md`, `README.md`, project-state files, or any stricter guardrail, the stricter guardrail wins.

Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation commands, and human approval checkpoints.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only quality-and-noindex planning
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3A

## 3. Relationship to SEO-A, SEO-B, SEO-C, SEO-D1, and SEO-D2

SEO-D3A narrows and documents future noindex, `notFound()`, and indexability decision rules for landing pages. It does not replace earlier SEO planning documents.

- SEO-A established SEO/GEO/AI-search foundation requirements and forbids hidden AI-only content, unsupported schema, unapproved medical content, and unapproved implementation.
- SEO-B normalized keyword planning data as documentation/data-only. Keyword rows remain non-authorizing and must not be used as runtime inputs.
- SEO-C documented the route contract, canonical route discipline, forbidden routes, admin/API/crawler-facing exclusions, and sitemap eligibility principles.
- SEO-D1 documented landing page strategy, quality gates, future helper candidates, and implementation sequencing.
- SEO-D2 created fail-closed route scaffolds only. Those scaffolds do not render content and do not authorize noindex pages, indexable pages, metadata, sitemap, schema, or query integration.

SEO-D3A is the next documentation-only planning layer. It defines future status names and conservative behavior expectations while preserving the current fail-closed state.

## 4. Current SEO-D2 Fail-Closed Contract

SEO-D2 scaffold routes now exist for:

- `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx`
- `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx`

All current SEO-D2 scaffold pages must be treated as fail-closed scaffolds. They:

- validate locale and country;
- call `notFound()`;
- render no indexable content;
- emit no schema;
- emit no canonical or hreflang metadata;
- import no keyword seed data;
- import no private, admin, provider-dashboard, or service-role data.

SEO-D3A does not change this behavior. Future work must keep `notFound()` as the default until a separately approved integration task authorizes a narrower behavior.

## 5. Landing Page Families Covered

This document covers planning rules for these future landing page families only:

| Family | Future route family | Current SEO-D3A status |
| --- | --- | --- |
| Specialty | `/[locale]/[country]/centers/[specialtySlug]` | Planning only; current scaffold fails closed. |
| Specialty + area | `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | Planning only; current scaffold fails closed. |
| Area | `/[locale]/[country]/areas/[areaSlug]` | Planning only; current scaffold fails closed. |
| Service | `/[locale]/[country]/services/[serviceSlug]` | Planning only; current scaffold fails closed. |
| Service + area | `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | Planning only; current scaffold fails closed. |

These families must not be broadly generated from keyword combinations. They must not become visible, noindex, indexable, sitemap-eligible, schema-eligible, or metadata-enabled without future explicit approval.

## 6. Indexability Status Model

Future implementation tasks may use these planning statuses, but SEO-D3A does not implement them.

| Status | Meaning | Default SEO-D3A handling |
| --- | --- | --- |
| `not_found` | The route should fail closed because the entity is absent, unsupported, ambiguous, unsafe, unapproved, or outside scope. | Return `notFound()` in future route integration unless a later task explicitly authorizes a different behavior. |
| `noindex_required` | A visible page may be useful later but must not be indexable because it is thin, temporary, duplicate-risk, content-incomplete, medically unreviewed, or otherwise not index-safe. | Not implemented in SEO-D3A; visible noindex pages require future approval. |
| `indexable_later_only` | Gates appear potentially satisfiable, but indexability is not approved in the current phase. | Do not render indexable pages, metadata, sitemap entries, or schema. |
| `blocked` | Forbidden route, duplicate canonical, private-data risk, unsafe medical claim, deprecated route pattern, unsupported scope, or compliance conflict. | Do not generate, render, link, index, or include in sitemap. |
| `unsupported_locale` | Locale is outside approved launch locales `en` and `ar`. | Return `notFound()` or block in future logic. |
| `unsupported_country` | Country is outside approved launch country `om`. | Return `notFound()` or block in future logic. |
| `medical_review_required` | Medical or compliance-sensitive content would require human approval before publication. | Return `notFound()` or block until a later approved medical review workflow exists. |
| `insufficient_public_data` | Real entity may exist, but public data thresholds are not met. | Return `notFound()` by default; visible noindex only if later approved. |

SEO-D3A intentionally uses `indexable_later_only` instead of `indexable` to avoid implying that any landing page is currently approved for indexing.

## 7. When to Return `notFound()`

Future route integration should return `notFound()` by default when any of the following applies:

- locale is not `en` or `ar`;
- country is not `om`;
- slug does not resolve to a real approved public entity;
- specialty, service, or area entity is ambiguous;
- exact specialty-area or service-area combination has no valid public matches;
- provider/entity threshold is not met;
- unique visible intro is missing;
- local relevance is missing or invented;
- canonical family is ambiguous or duplicate;
- medical review is required but missing;
- private, admin, provider-dashboard, service-role, CRM, billing, user, unpublished moderation, or fake seed data would be needed;
- helper data is unavailable, failed, inconsistent, or outside approved scope;
- route is deprecated, forbidden, unsupported, or duplicate;
- future task scope does not explicitly approve visible noindex rendering.

The safest default is `notFound()` rather than a thin, empty, placeholder, keyword-stuffed, or unsupported page.

## 8. When Visible Noindex May Be Allowed Later

Visible noindex pages may be considered only in a future approved task with explicit authorization for:

- the exact landing page family;
- visible route rendering;
- noindex metadata behavior;
- human-reviewed content source where required;
- public RLS-safe data source;
- private-data exclusion;
- sitemap exclusion;
- schema exclusion unless separately approved later;
- internal linking rules for user navigation only;
- validation and route-check coverage.

Visible noindex pages must provide real user value. They must not be empty, placeholder-like, duplicated at scale, keyword-generated, hidden from users, AI-only, medically unreviewed, or supported only by keyword seed rows.

## 9. Why Visible Noindex Pages Are Not Approved in SEO-D3A

Visible noindex pages are not approved in SEO-D3A because they require runtime rendering, metadata behavior, content decisions, data source decisions, route integration, and validation that are explicitly outside this documentation-only task.

SEO-D3A creates only planning documentation. It does not authorize noindex metadata, page rendering, content blocks, route integration, query helpers, sitemap exclusions beyond current behavior, or internal links to noindex pages.

## 10. Why Indexable Pages Are Not Approved in SEO-D3A

Indexable landing pages are not approved in SEO-D3A because indexability requires all of the following future approvals and implementations:

- validated public data sources;
- provider/entity thresholds;
- unique visible localized content;
- canonical and hreflang metadata;
- medical review where applicable;
- no private-data exposure;
- route integration;
- sitemap eligibility rules;
- schema rules if schema is ever approved;
- route-check, typecheck, build, lint, RLS, and SEO validation.

SEO-D3A does not implement any of these. Any potentially eligible page remains `indexable_later_only` at most.

## 11. Family-Specific Quality Gates

Every future family must pass these gates before it can move beyond fail-closed planning. Passing these gates does not itself authorize rendering or indexing.

### Specialty

- Provider count: enough visible public providers/centers tied to the specialty.
- Exact combination count: not applicable unless a later task adds sub-combinations.
- Real entity existence: real approved specialty entity required.
- Unique visible intro: required for each locale.
- Local relevance: Oman context must be grounded in public data.
- Medical review status: required if specialty copy includes medical explanations or claims.
- Supported locale/country: `en`/`ar` and `om` only.
- Canonical uniqueness: must not compete with `/centers`, `/doctors`, `/services`, deprecated shortcuts, or plural doctor detail routes.
- Private-data exclusion: required.

### Specialty + area

- Provider count: enough visible public providers/centers in the exact specialty-area combination.
- Exact combination count: exact specialty + area match required.
- Real entity existence: real approved specialty and real approved area required.
- Unique visible intro: localized and area-specific intro required.
- Local relevance: must be grounded in public data for the area.
- Medical review status: required if medical or local healthcare claims appear.
- Supported locale/country: `en`/`ar` and `om` only.
- Canonical uniqueness: one canonical family only; no deprecated shortcut route usage.
- Private-data exclusion: required.

### Area

- Provider count: enough visible public providers/centers or category-rich density.
- Exact combination count: not applicable unless category sections are introduced later.
- Real entity existence: real approved Oman area required.
- Unique visible intro: localized area intro required.
- Local relevance: required and must not invent facility counts, population facts, rankings, reviews, or availability.
- Medical review status: required if medical or compliance claims appear.
- Supported locale/country: `en`/`ar` and `om` only.
- Canonical uniqueness: must not compete with city, country, category, or search URLs.
- Private-data exclusion: required.

### Service

- Provider count: enough visible public providers/centers offering the service.
- Exact combination count: required service-provider relationship if providers are listed.
- Real entity existence: real approved service required.
- Unique visible intro: localized intro required.
- Local relevance: Oman relevance must be grounded in public data.
- Medical review status: required for service copy, treatment/procedure language, safety, pricing, or outcomes.
- Supported locale/country: `en`/`ar` and `om` only.
- Canonical uniqueness: must not compete with `/services` listing or specialty pages.
- Private-data exclusion: required.

### Service + area

- Provider count: enough visible public providers/centers in the exact service-area combination.
- Exact combination count: exact service + area match required.
- Real entity existence: real approved service and real approved area required.
- Unique visible intro: localized and area-specific intro required.
- Local relevance: strong area relevance required and must be based on public data.
- Medical review status: required for service copy, local healthcare claims, treatment/procedure language, safety, pricing, or outcomes.
- Supported locale/country: `en`/`ar` and `om` only.
- Canonical uniqueness: one canonical family only.
- Private-data exclusion: required.

## 12. Suggested Planning Thresholds

These thresholds are planning-only minimums. Future approved implementation may require stricter thresholds.

| Page family | Suggested threshold for future indexable candidacy | Failure behavior |
| --- | --- | --- |
| Specialty | At least 3 visible public providers/centers or stricter future-approved threshold. | `insufficient_public_data`, `noindex_required`, or `not_found` depending on future approved scope. |
| Specialty + area | At least 2 visible public providers/centers in exact combination. | `insufficient_public_data`, `noindex_required`, or `not_found`. |
| Area | At least 3 visible public providers/centers or category-rich public catalog density. | `insufficient_public_data`, `noindex_required`, or `not_found`. |
| Service | At least 3 visible public providers/centers offering the service. | `medical_review_required`, `insufficient_public_data`, `noindex_required`, or `not_found`. |
| Service + area | At least 2 visible public providers/centers in exact service-area combination. | `medical_review_required`, `insufficient_public_data`, `noindex_required`, or `not_found`. |

## 13. Medical Safety and Human Approval Model

Future landing pages must distinguish directory facts from medical education. They must not publish diagnosis, prescription advice, treatment instructions, guaranteed outcomes, invented prices, invented reviews, fake availability, unsupported medical claims, or emergency triage guidance.

Human approval is required before publishing any medical explanations, service guidance, condition/symptom content, safety warnings, medical disclaimers, treatment/procedure descriptions, AI-search summaries, or medical/local claims that could affect patient decision-making.

If medical safety is unclear, the future status should be `medical_review_required` or `blocked`, not `indexable_later_only`.

## 14. AI-search / GEO Constraints

Future AI-search and GEO readiness must be based on visible, approved, public content only.

SEO-D3A does not authorize:

- hidden AI-only content;
- AI diagnosis or medical advice;
- AI treatment, prescription, or emergency guidance;
- AI chat;
- `llms.txt` changes;
- schema output;
- LLM summary blocks;
- bot-specific text that is not visible to users.

Any future answer-ready content must be visible to users, grounded in public facts, medically safe, and human-reviewed where required.

## 15. Canonical / Hreflang Constraints

Future canonical and hreflang implementation is not approved in SEO-D3A.

When later approved, canonical and hreflang logic must preserve:

- one canonical URL per intent/entity combination;
- approved route families only;
- approved locales `en` and `ar` only;
- approved country `om` only;
- no Persian/Hindi public SEO URLs;
- no GCC expansion URLs;
- no deprecated shortcut routes;
- no plural doctor detail route;
- no duplicate canonical families;
- no canonical pointing to thin, noindex, blocked, unsupported, private, admin, API, or search-query surfaces;
- no hreflang references to unsupported, blocked, deprecated, private, admin, API, thin, or duplicate URLs.

## 16. Sitemap / Robots / llms.txt Constraints

SEO-D3A does not authorize sitemap, robots, or `llms.txt` changes.

Future landing pages must remain excluded from sitemap until a later SEO-D4-or-later task explicitly approves sitemap eligibility. No noindex, thin, blocked, unsupported, unreviewed, private, admin, API, search-query, deprecated, duplicate, or merely `indexable_later_only` page may be sitemap-eligible.

Robots rules must not be used to hide poor-quality pages while making them appear eligible elsewhere. `llms.txt` must not be expanded with unapproved landing pages, hidden AI content, unsupported medical claims, or routes that are not approved public surfaces.

## 17. Route-Check and Validation Expectations for Future Tasks

Future implementation tasks should add route-check coverage only within their approved scope. Candidate future checks include:

- SEO-D2 scaffold contract remains fail-closed until integration approval;
- no keyword seed imports in runtime code;
- no service-role imports in public landing pages or helpers;
- no private/admin/provider-dashboard imports in public landing pages or helpers;
- no schema output before schema approval;
- no generated metadata before metadata approval;
- no sitemap inclusion before sitemap approval;
- no Persian/Hindi/GCC routes;
- no countryless localized routes;
- no localized admin routes;
- no plural doctor detail routes;
- no deprecated shortcut routes;
- no article routes unless separately approved;
- no branded hospital/clinic pages unless separately approved.

Future validation should include, as applicable:

```bash
git status --short
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

## 18. Out-of-Scope Items

SEO-D3A does not approve or implement:

- runtime helpers;
- query helpers;
- route rendering;
- visible noindex pages;
- indexable pages;
- metadata, canonical, or hreflang output;
- `generateMetadata`;
- `generateStaticParams`;
- sitemap changes;
- robots changes;
- `llms.txt` changes;
- schema output;
- CMS records;
- database imports;
- seed rows;
- migrations;
- API handlers;
- analytics events;
- crawlers;
- background jobs;
- AI chat;
- provider dashboard pages;
- payment, monetization, sponsored placement, boosts, or ranking logic;
- article pages;
- branded hospital/clinic pages;
- Persian/Hindi routes;
- GCC expansion routes;
- plural doctor detail routes;
- runtime keyword seed JSON use;
- medical content;
- service descriptions;
- local area descriptions.

## 19. Stop Conditions and Human Approval Requirements

Future agents must stop and report a blocker instead of guessing when any of the following occurs:

- route ambiguity;
- canonical or hreflang ambiguity;
- sitemap eligibility ambiguity;
- schema eligibility ambiguity;
- unsupported locale or country;
- provider count or exact-combination uncertainty;
- missing public entity source;
- missing public RLS-safe data path;
- private-data exposure risk;
- keyword data is proposed as runtime input;
- medical or compliance-sensitive claim uncertainty;
- missing human approval for medical content;
- failed validation command;
- missing dependency;
- migration, RLS, or schema conflict;
- unclear task scope or allowed files.

Human approval is required before any future task creates or changes runtime helpers, query helpers, route rendering, visible noindex pages, indexable pages, metadata, sitemap, schema, robots, `llms.txt`, CMS records, database imports, migrations, seed rows, medical content, or route-check logic beyond an explicitly approved scope.
