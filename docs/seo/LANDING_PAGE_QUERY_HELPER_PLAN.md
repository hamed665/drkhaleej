# Landing Page Query Helper Plan

## 1. Status and Authority

This document is documentation-only for SEO-D3A. It does not authorize implementation, runtime helpers, query helpers, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, database imports, seed rows, migrations, API handlers, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, payment logic, monetization logic, sponsored placement, boosts, ranking logic, article pages, branded hospital/clinic pages, Persian/Hindi routes, GCC expansion routes, plural doctor detail routes, medical content, service descriptions, or local area descriptions.

Keyword data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be used as a runtime source and must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seeds, imports, or medical publication.

Medical content requires human approval before publication. Query helper planning must not create or imply medical copy, service descriptions, area descriptions, treatment guidance, pricing claims, availability claims, insurance claims, or AI-search summaries.

If this document conflicts with V10.4 master-spec files, current repository state, route checks, SEO-A, SEO-B, SEO-C, SEO-D1, SEO-D2, addendums, `AGENTS.md`, `README.md`, project-state files, or any stricter guardrail, the stricter guardrail wins.

Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation commands, and human approval checkpoints.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only quality-and-noindex planning
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3A

## 3. Why Query Helpers Are Not Implemented in SEO-D3A

Query helpers are not implemented in SEO-D3A because this task is documentation-only. Query helpers would introduce runtime behavior, data access, RLS/security implications, failure modes, validation requirements, and future route integration risk.

SEO-D3A only documents future helper boundaries. It does not create `src/lib/seo/landing-page-quality.ts`, `src/lib/seo/landing-page-indexability.ts`, `src/lib/catalog/public-landing-page-queries.ts`, tests, route imports, database queries, metadata, sitemap logic, schema logic, or page rendering.

The current SEO-D2 scaffold contract remains unchanged: landing page scaffold routes validate locale/country and then call `notFound()`.

## 4. Current Public Catalog Query Contract Summary

The current public catalog query layer is SELECT-only and server-safe for approved public catalog read use cases. Existing public catalog query principles include:

- live SELECT queries only for confirmed public catalog tables;
- generated Supabase database types for typing;
- anon server-client access through the public server client path;
- conservative column selection;
- bounded default and maximum limits;
- normalized/sanitized search input where search is implemented;
- typed result wrappers with explicit success, empty, and error behavior;
- generic public errors rather than raw database errors;
- public RLS as the enforcement layer for public SELECT eligibility.

Existing public catalog query scope does not approve landing page query helpers. Future landing page helpers must be separately approved and must not weaken the existing public query contract.

## 5. Required Future Data Sources

Future landing page query helpers, if explicitly approved, may use only public, RLS-safe, read-only sources needed for quality-gate inputs:

- public approved providers/centers only;
- public specialties;
- public services;
- public geo areas;
- public provider-center-service relationships if available and approved;
- public provider-center-specialty relationships if available and approved;
- human-reviewed content source if medical or local copy appears and if that source is separately approved.

These data sources must be used only to calculate quality-gate inputs such as entity existence, provider counts, exact-combination counts, supported locale/country state, content availability flags, medical review flags, canonical uniqueness flags, and private-data exclusion.

## 6. Forbidden Future Data Sources

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
- scraped pricing, availability, insurance, or medical claims unless a future approved source and review workflow explicitly allows it.

Keyword rows may inform planning documents only. They must not be imported into runtime code or treated as entity truth, content truth, or route authorization.

## 7. Future Query Helper Requirements

If future query helpers are approved, they must be:

- SELECT-only;
- RLS-safe;
- anon/server-safe;
- bounded by conservative default and maximum limits;
- free of writes, mutations, RPCs, server actions, and side effects unless a future approved task explicitly permits a narrower mechanism;
- free of service-role access;
- free of private fields;
- free of private/admin/provider-dashboard imports;
- free of keyword seed runtime imports;
- generic in error messages;
- typed with explicit success, empty, blocked, and error states;
- fail-closed when data is missing, ambiguous, or unsafe;
- limited to quality-gate inputs, not SEO copy.

Helpers must not return generated intros, medical descriptions, service descriptions, local area descriptions, keyword content, schema payloads, metadata payloads, sitemap entries, rankings, scores, sponsored placement data, monetization data, or private fields.

## 8. Planning-Only Helper Contract Shapes

The following function shapes are planning-only. They must not be implemented without a future approved task.

```ts
getSpecialtyLandingGate({
  locale,
  country,
  specialtySlug
}): Promise<LandingGateResult>
```

```ts
getSpecialtyAreaLandingGate({
  locale,
  country,
  specialtySlug,
  areaSlug
}): Promise<LandingGateResult>
```

```ts
getAreaLandingGate({
  locale,
  country,
  areaSlug
}): Promise<LandingGateResult>
```

```ts
getServiceLandingGate({
  locale,
  country,
  serviceSlug
}): Promise<LandingGateResult>
```

```ts
getServiceAreaLandingGate({
  locale,
  country,
  serviceSlug,
  areaSlug
}): Promise<LandingGateResult>
```

```ts
decideLandingPageIndexability({
  locale,
  country,
  family,
  entityExists,
  providerCount,
  exactCombinationCount,
  hasUniqueVisibleIntro,
  hasLocalRelevance,
  medicalReviewStatus,
  canonicalIsUnique,
  privateDataExcluded
}): LandingGateStatus
```

These shapes are not API contracts, not route contracts, and not implementation authorization. They are only planning references for future scoped tasks.

## 9. Proposed Planning Types

The following planning types are examples only and must not be added to runtime code in SEO-D3A.

```ts
type LandingGateStatus =
  | 'not_found'
  | 'noindex_required'
  | 'indexable_later_only'
  | 'blocked'
  | 'unsupported_locale'
  | 'unsupported_country'
  | 'medical_review_required'
  | 'insufficient_public_data';
```

```ts
type LandingGateInput = {
  locale: 'en' | 'ar';
  country: 'om';
};
```

```ts
type LandingGateResult = {
  status: LandingGateStatus;
  reasons: string[];
  providerCount: number;
  exactCombinationCount?: number;
  entityExists: boolean;
  hasUniqueVisibleIntro: boolean;
  hasLocalRelevance: boolean;
  medicalReviewStatus: 'not_required' | 'required' | 'approved' | 'missing';
  canonicalKey: string | null;
  usesPrivateData: false;
};
```

Future implementation may choose stricter or different types if explicitly approved. It must preserve fail-closed behavior and private-data exclusion.

## 10. Separation of Responsibilities

Future landing page architecture should separate responsibilities:

- Query helpers gather public quality-gate inputs only.
- Decision helpers decide status from explicit inputs.
- Route components remain fail-closed until future integration approval.
- Content source and human review remain separate from query helpers.
- Metadata/canonical/hreflang logic remains separate and unapproved in SEO-D3A.
- Sitemap/schema logic remains separate and unapproved in SEO-D3A.
- Medical content approval remains a human process and must not be inferred from entity existence or keyword demand.

This separation prevents query helpers from becoming hidden CMS, SEO copy generators, ranking systems, medical content publishers, or sitemap/schema emitters.

## 11. Route Integration Model, Planning Only

Future route integration, if explicitly approved, should follow this conservative model:

1. Validate locale and country.
2. Return `notFound()` for unsupported locale/country.
3. Keep `notFound()` as the default even after helper calls.
4. Call only the approved family-specific helper for the current route family.
5. Return `notFound()` if helper data is missing, ambiguous, unsafe, blocked, unsupported, or insufficient.
6. Do not render visible noindex pages unless a future task explicitly approves visible noindex rendering.
7. Do not render indexable pages unless a future task explicitly approves indexable rendering.
8. Do not add generated metadata until later explicit approval.
9. Do not add canonical or hreflang metadata until later explicit approval.
10. Do not add sitemap eligibility until SEO-D4 or later.
11. Do not add schema until SEO-D4 or later.

SEO-D3A does not authorize any route integration.

## 12. Future Implementation Split

Future work should remain split into narrow approved tasks:

### SEO-D3B — Query helper contract only

- Define exact query input/output contract.
- No live queries unless explicitly approved.
- No route integration.
- No metadata, sitemap, schema, CMS, or content.

### SEO-D3C — Pure quality/indexability helper implementation only

- Implement pure decision helpers only if approved.
- Prefer no database access in the decision helper.
- Fail closed for missing or ambiguous inputs.
- Add tests for status decisions.
- No route rendering.

### SEO-D3D — Route integration for one page family only

- Integrate one family only if approved.
- Preserve `notFound()` default.
- No generated metadata unless separately approved.
- No sitemap/schema.
- No broad programmatic generation.

### SEO-D3E — Visible noindex pages only if later approved

- Render visible noindex pages only if explicitly approved.
- Exclude from sitemap.
- Avoid SEO-purpose internal linking unless future user-navigation scope approves it.
- Require visible user value and human-reviewed content where needed.

## 13. Future Validation Requirements

Future query-helper or route-integration tasks should run validation appropriate to their approved scope. Baseline commands should include:

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

If helper files are later created, validation should also verify:

- no service-role imports;
- no private/admin/provider-dashboard imports;
- no keyword seed JSON imports;
- no writes or mutations;
- no route rendering side effects;
- no schema or metadata output;
- bounded query limits;
- generic errors only;
- fail-closed behavior for unsupported locale/country, missing entities, insufficient data, and medical review requirements.

## 14. Out-of-Scope Items

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

## 15. Stop Conditions and Human Approval Requirements

Future agents must stop and report a blocker instead of guessing when any of the following occurs:

- unclear allowed files or task scope;
- route ambiguity;
- query helper data source ambiguity;
- missing public RLS-safe data path;
- private-data exposure risk;
- proposed service-role use;
- proposed keyword seed runtime use;
- missing entity relationship for an exact combination;
- provider count uncertainty;
- medical review uncertainty;
- canonical/hreflang ambiguity;
- sitemap/schema ambiguity;
- failed validation command;
- missing dependency;
- migration, RLS, or schema conflict.

Human approval is required before any future task creates or changes runtime helpers, query helpers, route rendering, visible noindex pages, indexable pages, metadata, sitemap, schema, robots, `llms.txt`, CMS records, database imports, migrations, seed rows, medical content, or route-check logic beyond an explicitly approved scope.
