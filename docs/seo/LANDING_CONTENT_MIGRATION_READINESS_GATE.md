# SEO-D3H4-F-A — Landing Content Migration Readiness Gate

## 1. Status and Authority

This document is documentation-only for SEO-D3H4-F-A. It records a conservative readiness gate decision map for whether DrMuscat is ready to proceed toward a future Landing Content Migration Implementation Plan.

This document does not authorize SQL, migrations, enum creation, table creation, constraints, indexes, Row Level Security (RLS) implementation, database views, public-safe projections, RPCs, functions, materialized views, materialized gate tables, test implementation, generated database type changes, Supabase client/type changes, Supabase usage, service-role usage, database queries, runtime helpers, data-bearing public query helpers, route integration, route-check changes, metadata, `generateMetadata`, `generateStaticParams`, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, CMS UI, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, landing content, medical copy, service descriptions, specialty descriptions, local area descriptions, content generation, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, migration/RLS impact, generated-type impact, helper impact, route impact, SEO/crawler impact, validation commands, and human approval where required. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, existing helper contracts, existing route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing content migration readiness gate documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-F-A

## 3. Relationship to Prior Phases

### SEO-D3H4-F Plan

SEO-D3H4-F was a PLAN ONLY readiness gate recheck. It concluded that a documentation-only readiness gate is green, a future migration implementation plan is yellow, actual migration implementation is red, and RLS/view/helper/route/crawler work is red.

SEO-D3H4-F-A implements only that documentation artifact. It does not create migrations, enums, tables, constraints, indexes, generated types, RLS policies, projections/views, tests, helper behavior, route behavior, crawler signals, public UI, or landing content.

### SEO-D3H4-E-A RLS Test Strategy Decision Map

SEO-D3H4-E-A documented that no landing-specific SQL-level RLS tests, public-safe projection/view tests, hidden-row count leakage tests, or Supabase client integration tests exist. It recommended a hybrid future strategy but did not authorize test implementation.

This readiness gate preserves that result. Test strategy documentation is not enough to make actual RLS, projection/view, helper, route, or crawler implementation ready.

### SEO-D3H4-D-A Public-Safe Projection/View Decision Map

SEO-D3H4-D-A concluded that future helpers should preferably read from a public-safe projection/view if implementation is separately approved, because direct raw table access is not preferred for a payload-bearing landing content table and RLS is row-level rather than column-level.

This readiness gate does not create a projection/view, RPC, function, materialized view, materialized gate table, helper, generated type, or test.

### SEO-D3H4-B-A Specialty Relationship Semantics Decision Map

SEO-D3H4-B-A concluded that specialty helpers remain fail-closed, specialty relationship signals must not be treated as interchangeable, and specialty-area pages remain blocked by specialty semantics, area canonicalization, and local relevance.

This readiness gate does not implement specialty semantics, relationship precedence, specialty helper queries, provider counts, center counts, or exact combination counts.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

SEO-D3H4-A concluded that explicit global landing roles are preferred long-term, provider/center-scoped roles must not be reused for global landing content, platform admin is not a default medical reviewer, and write/review/publish behavior remains blocked until role semantics are implemented or explicitly human-approved as a temporary policy.

This readiness gate does not create roles, permissions, workflow tables, RLS helper functions, review transitions, publisher authority, or medical reviewer authority.

### SEO-D3H3E Query Helper Readiness Recheck

SEO-D3H3E kept data-bearing helper work blocked by unresolved content, RLS, review, local relevance, area canonicalization, specialty semantics, and public-safe access questions.

This readiness gate keeps helpers skeleton/fail-closed and does not authorize Supabase usage, database queries, service-role usage, or data-bearing query helper outputs.

### SEO-D3H3D-A Local Relevance Source Decision Map

SEO-D3H3D-A concluded that `hasLocalRelevance` remains `false` now and that local relevance must not be inferred from slugs, names, counts, provider density, keyword seeds, generated text, or generic local copy.

This readiness gate does not implement a local relevance source. Future local relevance may be considered only from an approved, reviewed source tied to the exact landing intent.

### SEO-D3H3C-A Landing Content RLS Decision Map

SEO-D3H3C-A documented a conservative future RLS posture for the proposed landing content model. It concluded that public SELECT must be strict, draft/review/internal/private fields must remain hidden, and public helpers must not expose payload or actor/internal fields.

This readiness gate does not implement RLS and does not authorize public SELECT policies.

### SEO-D3H3B-A Landing Content Migration Decision Map

SEO-D3H3B-A recommended the conceptual future table name `public.landing_page_contents`, one bounded table first, no broad CMS, no route/crawler tables, no content generation tables, no seed data, no local relevance table yet, no content versions table yet, and no separate review table yet.

This readiness gate does not create `public.landing_page_contents` and does not authorize the future migration.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A established that existing service descriptions, specialty descriptions, provider descriptions, reviews, media captions, slugs, counts, keyword seed data, and generated content are not valid landing content sources. It established that future landing content must be unique per locale/country/family/canonical landing key, published, editorially approved, medically approved or explicitly not required, and tied to resolved canonical identity.

This readiness gate preserves those constraints and does not create or approve landing content.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 concluded that `areaSlug` alone is not canonical because `geo_areas.slug` uniqueness is scoped by `city_id`. Area-bearing route families must remain fail-closed until city-context routing, an approved `canonical_area_key`, or another approved canonical area identity model exists.

This readiness gate does not resolve area canonicalization.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no further route integration or data-bearing landing query helper work should proceed until blockers are resolved.

This readiness gate records the current blocker posture but does not remove runtime, schema, RLS, helper, route, crawler, or content blockers.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 and SEO-D3F2 integrated service and service-area scaffold routes only in fail-closed form. Those routes validate locale/country, call fail-closed skeleton helpers, pass fail-closed input into the decision helper, and still end in `notFound()`.

This readiness gate does not change service, service-area, specialty, specialty-area, area, sitemap, robots, or `llms.txt` behavior.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced skeleton landing gate helpers for specialty, specialty-area, area, service, and service-area families. The helpers return fail-closed output with no source tables, no content payload, no Supabase usage, no service-role usage, and no database queries.

This readiness gate does not modify the skeleton helper.

### Decision Helper

The landing decision helper remains a pure evaluator over supplied gate input. It does not fetch data, resolve canonical identity, publish content, render pages, emit metadata, or create crawler signals. Its outputs remain unsafe for visible noindex and unsafe for indexing.

This readiness gate does not modify the decision helper.

### Route-Check Guardrails

`scripts/routes-check.mjs` guards the current fail-closed posture by checking selected route integrations, skeleton helper behavior, forbidden runtime/crawler/content tokens, and absence of forbidden crawler exposure.

This readiness gate does not modify route-check.

## 4. Current Readiness Snapshot

| Area | Status | Current evidence / implication |
| --- | --- | --- |
| Content table readiness | Not ready | `public.landing_page_contents` is documented as a future conceptual table only. It does not exist and this task does not authorize it. |
| Enum readiness | Partial | Future landing enum strategy is documented conceptually, but no landing content enums exist in generated types and enum creation is not authorized. |
| Role/review workflow readiness | Requires human approval | Landing editor, editorial reviewer, medical reviewer, publisher, and workflow semantics are documented but not implemented. Provider/center roles must not be reused. Platform admin is not a default medical reviewer. |
| RLS readiness | Not ready | Future RLS boundaries are documented, but no landing content RLS policies exist and RLS implementation is not authorized. |
| Public-safe projection/view readiness | Not ready | Future public-safe projection/view is preferred if separately approved, but no view/projection/RPC/materialized gate object exists. |
| RLS/projection test readiness | Not ready | Future hybrid strategy is documented, but landing-specific SQL-level RLS tests, projection/view allowlist tests, hidden-row leakage tests, and Supabase client integration tests do not exist. |
| Helper readiness | Skeleton/fail-closed only | Current helper has zero imports, no Supabase usage, no source tables, no content payload, and returns fail-closed output. |
| Route/crawler readiness | Fail-closed / isolated | Service and service-area scaffold routes remain fail-closed; area, specialty, and specialty-area scaffolds still end in `notFound()`. Sitemap, robots, and `llms.txt` do not expose landing helper behavior. |
| Generated type readiness | Not ready | Generated types do not include `landing_page_contents` or a landing public-safe projection/view. Current `public.Views` remains empty. |
| Validation script readiness | Baseline ready; landing-specific dynamic coverage missing | Package scripts support unit, env, migration, static RLS, routes, typecheck, build, and lint checks. Static RLS checks exist, but landing-specific runtime/projection tests do not. |
| Migration and seed/test data readiness | Baseline ready; landing-specific content absent | Current migrations stop at the expected `0050_provider_onboarding_leads.sql`. Inspection found no landing content seed rows or landing content test data, and this document does not authorize seeds or content fixtures. |

## 5. Migration Prerequisites Matrix

| ID | Prerequisite | Status | Gate rationale |
| --- | --- | --- | --- |
| A | Future table name accepted | Ready | `public.landing_page_contents` is the preferred future table name for planning only. |
| B | Enum strategy accepted | Partial | Conceptual enum names/values are documented, but enum creation is not authorized and generated types do not include landing enums. |
| C | Conceptual fields accepted | Partial | Conceptual identity, content, lifecycle, review, canonical, and audit fields are documented, but implementation is not authorized. |
| D | Constraints/indexes accepted | Partial | Future constraint/index direction is documented, but no constraint or index creation is authorized. |
| E | Role/review workflow decided | Requires human approval | Role/review workflow is documented but not implemented; temporary/admin policy would need explicit approval. |
| F | Medical review boundary decided | Requires human approval | Platform admin is not a default medical reviewer and medical reviewer authority is not implemented. |
| G | Editorial review boundary decided | Requires human approval | Editorial reviewer authority is not implemented. |
| H | Publisher boundary decided | Requires human approval | Publisher authority and publish workflow are not implemented. |
| I | Local relevance source decided | Partial | Reviewed local relevance inside future landing content may be preferred later, but no runtime source exists and `hasLocalRelevance` remains false now. |
| J | Area canonicalization dependency resolved | Blocked | `areaSlug` alone is not canonical because `geo_areas.slug` is scoped by `city_id`. |
| K | Specialty semantics decided | Partial | Specialty semantics are documented conservatively, but no specialty semantics implementation or helper logic exists. |
| L | RLS boundary decided | Partial | Strict future boundary is documented, but no landing RLS implementation exists or is authorized. |
| M | Public-safe projection/view path decided | Partial | Future projection/view is preferred, but no projection/view exists or is authorized. |
| N | RLS test strategy decided | Partial | Hybrid future test strategy is documented, but tests are not implemented. |
| O | Migration protocol ready | Ready | Existing migration validation expects migrations through `0050_provider_onboarding_leads.sql`; a future migration would require explicit approval. |
| P | Generated type regeneration plan ready | Partial | `db:types` script exists, but generated type changes are allowed only in a future approved schema implementation phase. |
| Q | Route/crawler separation preserved | Ready | Route-check and current crawler files preserve landing scaffold isolation. |
| R | No seed/public content dependency | Ready | No seed rows are allowed now, and prior migration planning excluded seed data and public content dependency. |

## 6. Blocker-by-Blocker Analysis

### Role/review permissions are documented but not implemented

No explicit landing editor, editorial reviewer, medical reviewer, publisher, landing content admin, SEO admin, CMS editor, or content governance role exists. Provider/center-scoped roles must not be reused for global landing content. Platform admin must not be treated as a default medical reviewer without explicit human product/legal/medical approval.

### RLS boundary is documented but not implemented

A conservative public SELECT boundary has been documented, but no `public.landing_page_contents` table or landing-specific RLS policy exists. RLS implementation remains blocked until a separate approved RLS/schema task.

### Public-safe projection/view is documented but not implemented

Future helper reads should preferably use a public-safe projection/view if separately approved. No public-safe landing projection/view exists now, and this document does not authorize one.

### RLS/projection tests are documented but not implemented

A hybrid future strategy is documented, but no landing-specific SQL-level RLS tests, projection/view allowlist tests, hidden-row count leakage tests, or Supabase client integration tests exist.

### Area canonicalization remains unresolved for area-bearing families

`area`, `service_area`, and `specialty_area` families remain blocked because `areaSlug` under `[country]` alone is not a proven canonical area identity.

### Local relevance remains non-implemented

`hasLocalRelevance` remains false now. It must not be inferred from slugs, names, counts, provider density, keyword seeds, generated text, or generic local copy.

### Specialty semantics remain non-implemented

Specialty relationship signals must not be treated as interchangeable. Specialty and specialty-area helper implementation remains blocked until approved semantics, safe public sources, and tests exist.

### Helper remains skeleton/fail-closed

The helper still has no imports, no source tables, no database queries, no Supabase usage, no service-role usage, no content payload, and fail-closed output.

### Routes remain fail-closed

Current landing scaffold routes remain fail-closed and do not expose visible noindex or indexable landing pages. No route integration is authorized by this readiness gate.

### No landing content table exists

`public.landing_page_contents` does not exist. Actual migration implementation remains blocked.

## 7. Migration Readiness Gate Decision

| Gate | Decision | Meaning |
| --- | --- | --- |
| Documentation-only readiness gate | GREEN | This documentation-only artifact is safe and complete within the approved scope. |
| Future migration implementation plan | YELLOW | A future plan-only task may be safe if it performs no SQL and no file edits, and only proposes a future migration plan and approval checkpoints. |
| Actual migration implementation now | RED | Do not create SQL, enums, tables, constraints, indexes, generated types, or seed/content data now. |
| RLS/view/helper/route/crawler work now | RED | Do not implement RLS, projections/views, RPCs, materialized views, helpers, routes, metadata, sitemap, schema, robots, `llms.txt`, visible noindex pages, or indexable pages now. |

## 8. Is Migration Implementation Plan Ready Now?

Conservative answer: possibly yes for a future PLAN ONLY migration implementation plan, but not for actual SQL migration.

A future plan-only task could inspect the latest migration number, propose an exact future migration filename, propose future allowed files, propose validation commands, and identify required human approval checkpoints.

Actual SQL migration remains blocked until explicit human approval confirms migration scope and role/review/publish policy direction, including either an approved temporary/admin policy or an explicit landing role model.

## 9. Should Actual Migration Happen Next?

No. Actual migration should not happen next.

No enum, table, constraint, index, RLS policy, view, projection, RPC, materialized view, generated type, test, helper, route, crawler signal, UI, seed, or landing content implementation should happen now.

## 10. Smallest Safe Next Phase

Recommended smallest safe next phase: **SEO-D3H4-C — Landing Content Migration Implementation Plan**.

This recommendation is only for a future PLAN ONLY phase. It is not a recommendation to implement SQL, RLS, views, generated types, tests, helpers, routes, crawler behavior, UI, or content.

If human product/legal/medical decisions about role/review/publish authority are not ready, the safer alternative is **no further action until human product/legal/medical decision**.

## 11. If SEO-D3H4-C Is Approved Next, What It May Do

A future SEO-D3H4-C plan-only task may:

- remain plan only;
- make no SQL changes;
- make no file edits;
- inspect the latest migration number;
- propose an exact future migration filename;
- propose future allowed files;
- propose future validation commands;
- identify required human approval checkpoints;
- identify role/review/publish policy decisions required before actual implementation;
- identify generated type regeneration expectations for a later approved implementation phase;
- stop without implementing.

It must not implement migrations, RLS, views, RPCs, materialized views, generated types, tests, helpers, routes, route-check changes, metadata, sitemap, schema, robots, `llms.txt`, public UI, content, seeds, Supabase usage, or service-role usage.

## 12. Exact Forbidden Files for Next Recommended Task

For the next recommended plan-only task, the following remain forbidden unless a later explicit implementation/test phase approves them:

- routes;
- route-check;
- helpers;
- migrations unless explicit implementation phase;
- generated types;
- package files;
- sitemap/robots/`llms.txt`;
- `data/seo`;
- tests unless explicit test implementation phase;
- `scripts/db` unless explicit test implementation phase;
- public UI/content files;
- Supabase client/server files;
- API handlers.

## 13. Validation Expectations

For SEO-D3H4-F-A, expected validation commands are:

1. `git status --short`
2. `test -f docs/seo/LANDING_CONTENT_MIGRATION_READINESS_GATE.md && echo "SEO-D3H4-F-A landing content migration readiness gate exists"`
3. `pnpm test:unit`
4. `pnpm env:check`
5. `pnpm db:validate:migrations`
6. `pnpm test:db:rls`
7. `pnpm routes:check`
8. `pnpm typecheck`
9. `pnpm build`
10. `pnpm lint`

A validation failure must be reported honestly. Validation commands must not be faked. Lint warnings may be acceptable only if there are no lint errors.

## 14. Out of Scope

The following are out of scope for this document and for SEO-D3H4-F-A:

- actual migration implementation;
- SQL;
- enum/table/constraint/index creation;
- generated type changes;
- RLS policy implementation;
- views/projections;
- RPCs/functions;
- materialized views or gate tables;
- test implementation;
- helper implementation;
- Supabase usage;
- service-role usage;
- route integration;
- route-check changes;
- metadata/canonical/hreflang;
- sitemap/schema/robots/`llms.txt` changes;
- visible noindex pages;
- indexable pages;
- CMS UI;
- API handlers;
- seed rows;
- crawler behavior;
- analytics/background jobs;
- public UI;
- provider/center listings;
- medical/specialty/service/local copy;
- content generation;
- keyword seed runtime usage;
- payment, monetization, sponsored, ranking, referral, commission, entitlement, or plan logic.

## 15. Risks

- Premature schema implementation could encode unsafe role/review/publish assumptions before human approval.
- Raw table access could leak payload, reviewer, admin, actor, audit, or private metadata fields because RLS is row-level rather than column-level.
- Static RLS checks alone cannot prove runtime row visibility, projection allowlist safety, hidden-row leakage prevention, or Supabase client behavior.
- Area-bearing landing pages remain unsafe until canonical area identity is resolved.
- Local relevance remains unsafe if inferred from slugs, names, provider density, keyword seeds, generated text, or generic area copy.
- Specialty relationship signals remain unsafe if collapsed into one interchangeable source without approved semantics.
- Any route/crawler exposure before schema/RLS/projection/helper/test readiness could expose thin, ambiguous, unreviewed, or unsafe landing pages.
- Seed/content dependency remains unsafe because seed rows are not approved.

## 16. Final Recommendation

Final recommendation: **SEO-D3H4-C — Landing Content Migration Implementation Plan** may proceed only as a future PLAN ONLY task.

Actual SQL migration implementation remains blocked. RLS/view/helper/route/crawler work remains blocked. If human product/legal/medical decisions about role/review/publish authority are not ready, the safer alternative is no further action until those decisions are made.
