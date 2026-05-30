# Landing Page Query Helper Contract

## 1. Status and Authority

This document is documentation-only for SEO-D3B1. It does not authorize implementation, runtime helpers, query helpers, TypeScript runtime types, database queries, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, database imports, seed rows, migrations, API handlers, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, payment logic, monetization logic, sponsored placement, boosts, ranking logic, article pages, branded hospital/clinic pages, Persian/Hindi routes, GCC expansion routes, plural doctor detail routes, medical content, service descriptions, or local area descriptions.

Keyword data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be used as a runtime source and must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seed rows, database imports, TypeScript runtime data, or medical publication.

Medical content requires human approval before publication. This includes service descriptions, medical explanations, treatment/procedure language, symptom or condition content, safety warnings, disclaimers, AI-search summaries, or any claim that could be interpreted as clinical guidance, pricing, availability, insurance, or outcome information.

If this document conflicts with V10.4 master-spec files, current repository state, route checks, SEO-A, SEO-B, SEO-C, SEO-D docs, addendums, `AGENTS.md`, `README.md`, project-state files, or any stricter guardrail, the stricter guardrail wins.

Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation commands, and human approval checkpoints.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only query-helper contract planning
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3B1

## 3. Relationship to SEO-D3A

SEO-D3A documented future noindex and query-helper planning while preserving the current SEO-D2 fail-closed scaffold behavior. SEO-D3B1 narrows that planning into a future query-helper contract reference.

SEO-D3B1 does not supersede SEO-D3A. It also does not authorize anything that SEO-D3A withheld, including runtime helpers, query helpers, route rendering, visible noindex pages, indexable pages, metadata, sitemap entries, schema output, CMS records, database imports, migrations, API handlers, or medical content.

Current SEO-D2 scaffold routes now exist for:

- `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx`
- `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx`

All current SEO-D2 scaffold pages must remain fail-closed. They:

- validate locale and country;
- call `notFound()`;
- render no indexable content;
- emit no schema;
- emit no canonical or hreflang metadata;
- import no keyword seed data;
- import no private, admin, provider-dashboard, or service-role data.

SEO-D3B1 does not change that behavior.

## 4. Why Query Helpers Are Not Implemented in SEO-D3B1

Query helpers are not implemented in SEO-D3B1 because they would introduce runtime behavior, data access, RLS/security implications, query failure modes, route integration risk, and validation obligations. This phase is documentation-only.

SEO-D3B1 does not create or modify:

- `src/lib/catalog/public-landing-page-queries.ts`;
- `src/lib/seo/landing-page-quality.ts`;
- `src/lib/seo/landing-page-indexability.ts`;
- route files;
- generated Supabase types;
- migrations;
- route checks;
- sitemap, robots, or `llms.txt` files;
- schema or metadata helpers.

Future implementation must be split into separately approved phases.

## 5. Current Public Catalog Query Contract Summary

The current public catalog query layer is already limited to approved public catalog read use cases. Existing principles include:

- SELECT-only public catalog reads;
- generated Supabase `Database` types for table and enum typing;
- anon/server-safe access through the public server client path;
- conservative column selection;
- bounded default and maximum limits;
- normalized and sanitized search input where search is implemented;
- typed result wrappers with explicit success, empty, and error behavior;
- generic public errors instead of raw database errors;
- public RLS as the enforcement layer for public SELECT eligibility.

Existing public catalog helpers do not approve landing page query helpers. Future landing page helpers must be separately approved and must not weaken the existing public query contract.

## 6. Query Helper Purpose Boundaries

Future landing page query helpers, if separately approved, may gather quality-gate inputs only.

They may be used only to determine planning signals such as:

- supported locale state;
- supported country state;
- entity existence;
- entity type;
- public provider count;
- public center count;
- exact combination count;
- whether an approved visible intro exists;
- whether approved local relevance exists;
- medical review status from a separately approved source;
- canonical key uniqueness input;
- source table names used;
- private-data exclusion state.

Future query helpers must not return or generate:

- SEO copy;
- page titles;
- meta descriptions;
- canonical tags;
- hreflang tags;
- Open Graph metadata;
- schema payloads;
- sitemap entries;
- service descriptions;
- local area descriptions;
- medical guidance;
- diagnosis or prescription advice;
- procedure, preparation, recovery, eligibility, or risk copy;
- ranking, boost, sponsored, payment, plan, or monetization data;
- keyword-generated content;
- private fields.

## 7. Future Helper Families

The following helper families are planning-only names. They are not runtime function declarations, not imports, not API contracts, not route contracts, and not implementation authorization.

```ts
getSpecialtyLandingGate(...)
getSpecialtyAreaLandingGate(...)
getAreaLandingGate(...)
getServiceLandingGate(...)
getServiceAreaLandingGate(...)
```

Planned family responsibility:

| Helper family | Future route family | Planning-only responsibility |
| --- | --- | --- |
| `getSpecialtyLandingGate(...)` | `/[locale]/[country]/centers/[specialtySlug]` | Gather public specialty landing gate inputs only. |
| `getSpecialtyAreaLandingGate(...)` | `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | Gather public specialty-area combination gate inputs only. |
| `getAreaLandingGate(...)` | `/[locale]/[country]/areas/[areaSlug]` | Gather public area landing gate inputs only. |
| `getServiceLandingGate(...)` | `/[locale]/[country]/services/[serviceSlug]` | Gather public service landing gate inputs only. |
| `getServiceAreaLandingGate(...)` | `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | Gather public service-area combination gate inputs only. |

## 8. Proposed Input Contracts

Future input contracts, if separately approved, should be explicit, normalized, bounded, and family-specific.

Shared input fields:

- `locale`
  - Allowed planning values: `en`, `ar`.
  - Unsupported values must fail closed as `unsupported_locale`, `not_found`, or `blocked` according to the future approved implementation.
- `country`
  - Allowed planning value: `om`.
  - Unsupported values must fail closed as `unsupported_country`, `not_found`, or `blocked` according to the future approved implementation.

Family-specific input fields:

- `specialtySlug`
  - Required only for specialty and specialty-area helpers.
- `areaSlug`
  - Required only for area, specialty-area, and service-area helpers.
- `serviceSlug`
  - Required only for service and service-area helpers.

Optional limit configuration may be considered only if later approved. If approved, it must:

- be bounded by conservative defaults and maximums;
- never permit unbounded scans;
- never control indexability directly;
- never expose private or raw query behavior;
- fail closed when invalid.

## 9. Proposed Output Contract

Future output contracts, if separately approved, should return quality-gate inputs only.

Planning-only output fields:

- `status`
- `reasons`
- `entityExists`
- `entityType`
- `providerCount`
- `centerCount`
- `exactCombinationCount`
- `hasUniqueVisibleIntro`
- `hasLocalRelevance`
- `medicalReviewStatus`
- `canonicalKey`
- `supportedLocale`
- `supportedCountry`
- `usesPrivateData`
- `sourceTables`
- `safeForVisibleNoindex`
- `safeForIndexing`

Required conservative defaults:

- `usesPrivateData` must always be `false`.
- `safeForVisibleNoindex` must default to `false`.
- `safeForIndexing` must default to `false`.
- Missing, ambiguous, errored, private-risk, unsupported, or medically unreviewed states must fail closed.

The output contract must not include content payloads, metadata payloads, schema payloads, sitemap entries, ranking scores, sponsored placement flags, payment flags, or private fields.

## 10. Required Future Data Sources

Future landing page query helpers, if explicitly approved, may use only public, RLS-safe, read-only sources needed for quality-gate inputs:

- public approved providers/centers only;
- public specialties;
- public services;
- public geo areas;
- public provider-center-specialty relationships if available and separately approved;
- public provider-center-service relationships if available and separately approved;
- human-reviewed content source if medical or local copy appears and if that source is separately approved.

Candidate public tables may include public catalog tables such as centers, doctors, specialties, services, geo areas, and relationship tables, but only within the exact future-approved scope. This document does not authorize queries against those tables.

## 11. Forbidden Future Data Sources

Future landing page query helpers must not use:

- keyword seed JSON as a runtime source;
- private/admin/provider-dashboard data;
- service-role data;
- CRM data;
- user data;
- billing/payment data;
- unpublished moderation data;
- fake seed data;
- admin notes;
- provider claim evidence;
- private license files;
- private reviews;
- receipts;
- analytics events;
- crawled third-party content;
- scraped pricing, availability, insurance, or medical claims;
- reviews or ratings unless separately approved, real, public, visible, and compliant;
- prices, availability, or insurance data unless separately approved, verified, and safe for public use.

Keyword rows may inform planning documents only. They must not be imported into runtime code or treated as entity truth, content truth, route authorization, or indexability authorization.

## 12. RLS/Security Requirements

Future query helpers, if separately approved, must be:

- SELECT-only;
- anon/server-safe;
- RLS enforced;
- free of service-role access;
- free of writes, mutations, and side effects;
- free of RPC usage unless separately approved;
- bounded by conservative limits;
- generic in error messages;
- free of raw Supabase errors;
- free of private fields;
- free of private/admin/provider-dashboard imports;
- free of keyword seed runtime imports;
- fail-closed when data is missing, ambiguous, unavailable, or unsafe.

No helper may bypass RLS or treat server-side execution as permission to access private data.

## 13. Query Failure Behavior

Future query helper failures must fail closed.

Safe failure behavior includes:

- return `helper_unavailable`, `not_found`, or `blocked` according to future approved status rules;
- return generic reason codes only;
- do not expose raw database errors;
- do not render placeholder pages;
- do not render visible noindex pages by default;
- do not emit metadata;
- do not emit canonical or hreflang output;
- do not include sitemap entries;
- do not emit schema;
- do not silently treat failed, unknown, or partial counts as passing.

A failed helper must not create public content.

## 14. Medical Safety Behavior

Future query helpers must treat medical safety as a blocking quality-gate input, not as a content generation feature.

Required behavior:

- return a medical review status signal only if the source is separately approved;
- return `medical_review_required` or another fail-closed status when medical review is required but incomplete;
- never generate medical explanations;
- never generate service descriptions;
- never provide diagnosis;
- never provide prescription advice;
- never provide treatment guarantees;
- never provide procedure, preparation, recovery, eligibility, or risk copy;
- never infer medical approval from provider counts, entity existence, or keyword demand.

Medical and local copy must be human-reviewed before publication where required.

## 15. AI-Search/GEO Constraints

Future query helpers must not create AI-search runtime output.

They must not add or authorize:

- hidden AI-only content;
- LLM summary blocks;
- crawler-only pages;
- schema output;
- `llms.txt` changes;
- AI diagnosis or advice;
- AI chat;
- crawlers;
- background jobs;
- summaries based on private/admin/provider-dashboard data.

AI-search readiness must use only visible, approved, public content on approved canonical route families in later separately approved work.

## 16. Route Integration Constraints

Current SEO-D2 route scaffolds must stay fail-closed unless a future task explicitly approves route integration.

SEO-D3B1 does not authorize:

- route imports from future helpers;
- route rendering;
- visible noindex pages;
- indexable pages;
- generated metadata;
- `generateMetadata`;
- `generateStaticParams`;
- canonical or hreflang output;
- sitemap inclusion;
- schema output;
- internal linking to noindex landing pages for SEO purposes;
- broad programmatic page generation.

Future route integration must be one family at a time and must keep `notFound()` as the default until a stricter approved behavior exists.

## 17. Route-Check / Validation Needs for Future Tasks

Future documentation-only tasks should verify only documentation scope unless route-check changes are explicitly approved.

Future runtime helper tasks, if separately approved, should add validation for:

- no service-role imports in landing helper files;
- no admin/provider-dashboard imports in landing helper files;
- no keyword seed JSON imports in runtime files;
- no writes, mutations, or side effects;
- no raw database errors in public-facing results;
- bounded query limits;
- fail-closed status behavior;
- no route rendering side effects;
- no metadata, schema, sitemap, robots, or `llms.txt` side effects;
- no Persian/Hindi routes;
- no plural doctor detail routes;
- no article or branded hospital/clinic routes.

Baseline validation for future approved tasks should include the repository validation gate plus any narrower task-specific checks.

## 18. Future Implementation Split

Future work should remain split into narrow, separately approved tasks:

### SEO-D3B2 — Type contract doc only if separately approved

- Documentation-only type examples.
- No runtime `.ts` files.
- No query helpers.
- No route integration.

### SEO-D3C — Pure decision helper implementation only

- Future approval required.
- Pure deterministic decision helper only.
- Prefer no database access.
- No Supabase client.
- No route rendering.
- No metadata, sitemap, or schema.
- Tests required if implementation is approved.

### SEO-D3D — Public query helper implementation only if separately approved

- Future approval required.
- SELECT-only public query helpers.
- Anon/server-safe public client path.
- RLS enforced.
- No service role.
- No writes.
- No route integration.
- No content generation.

### SEO-D3E — Route integration for one family only

- Future approval required.
- One route family only.
- Preserve `notFound()` as default.
- No generated metadata unless separately approved.
- No sitemap or schema unless separately approved.
- No broad programmatic generation.

## 19. Out-of-Scope Items

SEO-D3B1 does not approve or implement:

- runtime helpers;
- query helpers;
- TypeScript runtime types;
- database queries;
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
- payment, monetization, sponsored placement, boost, or ranking logic;
- article pages;
- branded hospital/clinic pages;
- Persian/Hindi routes;
- GCC expansion routes;
- plural doctor detail routes;
- runtime keyword seed JSON use;
- medical content;
- service descriptions;
- local area descriptions.

## 20. Stop Conditions and Human Approval Requirements

Future agents must stop and report a blocker instead of guessing when any of the following occurs:

- unclear allowed files or task scope;
- route ambiguity;
- query helper data source ambiguity;
- missing public RLS-safe data path;
- private-data exposure risk;
- proposed service-role use;
- proposed keyword seed runtime use;
- missing entity relationship for an exact combination;
- provider or center count uncertainty;
- medical review uncertainty;
- canonical or hreflang ambiguity;
- sitemap or schema ambiguity;
- failed validation command;
- missing dependency;
- migration, RLS, or schema conflict.

Human approval is required before any future task creates or changes runtime helpers, query helpers, TypeScript runtime types, route rendering, visible noindex pages, indexable pages, metadata, sitemap, schema, robots, `llms.txt`, CMS records, database imports, migrations, seed rows, medical content, route-check logic, or validation logic beyond an explicitly approved scope.
