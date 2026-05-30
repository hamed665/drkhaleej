# Landing Page Implementation Plan

## 1. Status and Authority

This document is documentation-only for SEO-D1. It does not authorize implementation, route creation, page generation, page scaffolds, sitemap inclusion, schema output, CMS publishing, keyword-driven page generation, database imports, seed rows, medical content publication, API handlers, UI changes, migrations, RLS changes, validators, analytics events, crawlers, background jobs, AI chat, provider dashboards, branded hospital pages, payment logic, monetization logic, sponsored placement, boosts, or ranking logic.

Future Service / Area / Specialty landing page route families remain `future_approval_required`. Keyword data is planning data only. Keyword `target_url_pattern` and `route_status` values do not authorize route or page generation.

If this document conflicts with V10.4 master-spec files, current repo state, route checks, SEO-A, SEO-B, SEO-C, or stricter guardrails, the stricter/canonical guardrail wins. Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, validation, and human approval.

Medical content requires human approval before publication. Persian and Hindi public SEO routes remain forbidden. Approved launch locales are `en` and `ar`. Approved launch country is `om`. The plural doctor detail route `/[locale]/[country]/doctors/[doctorSlug]` remains forbidden. The approved doctor detail route remains `/[locale]/[country]/doctor/[doctorSlug]`.

No hidden AI-only content is allowed. If schema output is ever approved later, schema must match visible user-facing content.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-D1
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D1

## 3. Recommended Safe Sequencing

SEO-D should proceed only through separately approved phases.

1. SEO-D1 — docs/strategy only
   - Create documentation for landing page strategy, quality gates, implementation sequencing, blockers, and validation expectations.
   - Do not create routes, pages, helpers, sitemap entries, schema, CMS records, keyword imports, or route-check changes.
2. SEO-D2 — route scaffolds only
   - Only if separately approved, create a limited set of route scaffold files.
   - Default to conservative noindex/fail-closed behavior unless explicit approval says otherwise.
   - Do not add sitemap or schema output.
3. SEO-D3 — quality/noindex logic only
   - Only if separately approved, add quality-gate and indexability logic.
   - Define provider-count, unique-content, canonical, hreflang, empty-state, unsupported-locale/country, and medical-review behavior.
4. SEO-D4 — sitemap/schema only if later approved
   - Only if separately approved, add sitemap eligibility and schema output.
   - Schema must match visible content and must be omitted for thin, unsupported, noindex, unreviewed, or ambiguous pages.

## 4. Future Candidate Route/Page Files — `future_approval_required` Only

The following files are candidates only. They must not be created unless a future approved `PHASED_BUILD_ONLY` implementation task explicitly authorizes them.

| Future file | Route family | Status |
| --- | --- | --- |
| `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx` | `/[locale]/[country]/centers/[specialtySlug]` | `future_approval_required` |
| `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx` | `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | `future_approval_required` |
| `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx` | `/[locale]/[country]/areas/[areaSlug]` | `future_approval_required` |
| `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx` | `/[locale]/[country]/services/[serviceSlug]` | `future_approval_required` |
| `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx` | `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | `future_approval_required` |

No `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, API handler, sitemap change, robots change, `llms.txt` change, schema output, CMS record, seed row, migration, or route-check change is approved by SEO-D1.

## 5. Future Helper Candidates — `future_approval_required` Only

The following helper files are candidates only and must not be created unless a future approved task explicitly authorizes them:

- `src/lib/seo/landing-page-quality.ts`
- `src/lib/seo/landing-page-indexability.ts`
- `src/lib/catalog/public-landing-page-queries.ts`

Any future helper must be TypeScript-first, SELECT-only for public catalog data unless explicitly approved otherwise, RLS-safe, fail-closed, and free of private/admin/provider-dashboard data exposure.

## 6. Required Future Route-Check Additions

Future route-check changes are not approved by SEO-D1. If a future implementation approves route scaffolds or landing-page logic, route checks should be updated in that future task or a paired validation task.

Required future route-check additions should include:

- positive checks only after routes are approved;
- negative checks for forbidden routes;
- no `/fa` or `/hi` public SEO routes;
- no countryless localized routes such as `/[locale]/centers`, `/[locale]/services`, or `/[locale]/areas`;
- no localized admin routes;
- no plural doctor detail route `/[locale]/[country]/doctors/[doctorSlug]`;
- no deprecated shortcut routes such as `/en/dentist/al-khuwair`;
- no article routes unless separately approved;
- no branded hospital/clinic pages unless separately approved;
- no sitemap inclusion until sitemap eligibility is approved;
- no schema output until schema scope is approved;
- no private/admin/provider-only imports or data references in public landing pages.

## 7. Future Query Helper Requirements

Future implementation will likely need approved public query helpers for:

- specialty slug lookup;
- specialty provider counts;
- specialty + area counts;
- service slug lookup;
- service provider counts;
- service + area counts;
- area landing-page aggregates;
- quality-gate inputs such as provider count, localized copy availability, entity clarity, local relevance, canonical eligibility, and medical review state.

These helpers must not use service-role access, private data, admin data, provider-dashboard-only data, fake data, seed rows, or keyword seed rows as live page data. Keyword data may inform planning only.

## 8. Future Implementation Split

### What SEO-D2 May Do if Separately Approved

SEO-D2 may create a narrowly scoped set of route scaffold files only if explicitly approved. It should:

- create only approved route/page files;
- preserve `en`/`ar` and `om` limits;
- preserve approved doctor detail route `/[locale]/[country]/doctor/[doctorSlug]`;
- keep plural doctor detail blocked;
- avoid sitemap/schema/robots/`llms.txt` changes;
- avoid CMS records, migrations, seeds, API handlers, analytics, crawlers, and business logic;
- default to fail-closed/noindex behavior unless a future task approves indexation logic.

### What SEO-D3 May Do if Separately Approved

SEO-D3 may add quality/noindex logic only if explicitly approved. It should:

- evaluate provider counts;
- evaluate localized visible intro availability;
- evaluate entity clarity and local relevance;
- enforce supported locale/country behavior;
- enforce no duplicate canonical behavior;
- enforce empty/thin/noindex behavior;
- require human review for medical content;
- keep noindex pages out of sitemap;
- add route-check and test coverage only within approved scope.

### What SEO-D4 May Do if Separately Approved

SEO-D4 may add sitemap/schema only if explicitly approved. It should:

- include only canonical, indexable, quality-gated, supported locale/country pages in sitemap;
- omit noindex, thin, blocked, unsupported, unreviewed, private, admin, API, search-query, and deprecated routes;
- add schema only where visible content supports it;
- ensure schema has no hidden claims, invented reviews, invented ratings, invented prices, unsupported services, or private data;
- update route/SEO validation only as explicitly approved.

## 9. Required Future Validation Commands

Future SEO-D documentation or implementation tasks should run the applicable validation commands without faking or silently skipping failures:

```bash
git status --short
test -f docs/seo/LANDING_PAGE_STRATEGY.md && test -f docs/seo/LANDING_PAGE_QUALITY_GATES.md && test -f docs/seo/LANDING_PAGE_IMPLEMENTATION_PLAN.md && echo "SEO-D docs exist"
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

Future route, noindex, sitemap, schema, and medical-review phases must add narrower validation for their approved scope.

## 10. Required Human Approval Checkpoints

Future implementation requires human approval before:

- creating any SEO-D route/page file;
- changing route checks;
- adding public query helpers;
- enabling indexable behavior;
- adding sitemap entries;
- adding schema output;
- publishing medical service copy;
- using keyword clusters as page-planning inputs beyond documentation;
- linking to noindex pages for user navigation;
- adding branded/competitor/hospital/clinic pages;
- expanding locales beyond `en`/`ar` or country beyond `om`;
- touching CMS, database, migrations, RLS, analytics, crawlers, provider dashboard, monetization, sponsored placement, boost, ranking, or payment logic.

## 11. Explicitly Out of Scope for SEO-D1

SEO-D1 does not approve or implement:

- routes, page files, layouts, loading/error/not-found files, or public SEO pages;
- sitemap, robots, `llms.txt`, schema, metadata, hreflang, or canonical code changes;
- CMS records, seed rows, keyword imports, database changes, or migrations;
- API handlers, server actions, validators, RLS changes, route checks, or generated Supabase type changes;
- UI components, business logic, provider dashboards, admin mutations, analytics, crawlers, background jobs, or AI chat;
- article routes, branded hospital pages, Persian/Hindi public routes, GCC expansion, payment, monetization, sponsored placement, boosts, or ranking logic;
- medical content publication or human medical-review workflow implementation.

## 12. Blockers Before Route Implementation

The following blockers must be resolved before any SEO-D route implementation:

- Route implementation is not approved.
- Keyword data cannot generate pages.
- Provider-count helpers are incomplete for SEO-D page quality gates.
- Route-check coverage for SEO-D route families is missing.
- Medical review workflow and approved content source are not defined.
- Sitemap, schema, robots, and `llms.txt` changes are not approved.
- CMS publishing, database imports, seed rows, public page generation, and programmatic SEO generation are not approved.
- Exact future allowed files, forbidden files, validation expectations, and human approval checkpoints must be defined in a separate `PHASED_BUILD_ONLY` task.
