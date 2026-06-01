# SEO-D3H4-E-A — RLS Test Strategy Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H4-E-A. It records a conservative future test strategy decision map for landing content Row Level Security (RLS), public-safe projection/view behavior, and public landing query helper safety.

This document does not authorize SQL, migrations, RLS policy implementation, test implementation, database views, RPCs, materialized views, gate tables, generated database type changes, Supabase client/type changes, database queries, service-role usage, runtime helpers, data-bearing public query helpers, route integration, route-check changes, metadata, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, CMS UI, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, landing content, medical copy, service descriptions, specialty descriptions, local area descriptions, content generation, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, migration/RLS impact, generated-type impact, helper impact, route impact, SEO/crawler impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, current helper contracts, current route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing content RLS and projection test strategy documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-E-A

## 3. Relationship to Prior Phases

### SEO-D3H4-E Plan

SEO-D3H4-E was the approved PLAN ONLY phase for this document. It concluded that no test implementation should happen now, that a hybrid strategy should be preferred later, that unit-only mocked helper tests and static-only RLS checks are insufficient for RLS/security proof, and that helper implementation remains blocked until RLS/projection tests exist and pass.

### SEO-D3H4-D-A Public-Safe Projection/View Decision Map

SEO-D3H4-D-A concluded that future helpers should preferably read from a public-safe projection/view, not directly from a payload-bearing table. Direct table access is not preferred because RLS is row-level, not column-level. RPC/function access and materialized gate tables/views are deferred. Helper output must not expose content payload, raw rows, reviewer/admin/internal fields, audit actor fields, raw errors, provider/center lists, keyword seeds, or generated text.

### SEO-D3H4-B-A Specialty Relationship Semantics Decision Map

SEO-D3H4-B-A concluded that specialty helper work remains fail-closed, that relationship signals are not interchangeable, and that `specialty_area` remains blocked by specialty semantics, area canonicalization, and local relevance requirements. Future tests must account for conflicting specialty relationship sources and must not treat all specialty links as equivalent.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

SEO-D3H4-A concluded that provider/center-scoped roles must not be reused for global landing content, that platform admin is not a default medical reviewer, and that explicit landing role semantics remain unresolved. Future mutation tests must therefore be conditional on separately approved landing roles.

### SEO-D3H3E Query Helper Readiness Recheck

SEO-D3H3E readiness context preserved the fail-closed helper posture and did not authorize data-bearing helper implementation. This test strategy keeps the helper blocked until table/RLS/projection behavior is implemented and tested in later approved phases.

### SEO-D3H3D-A Local Relevance Source Decision Map

SEO-D3H3D-A established that local relevance cannot be invented from slugs or generic area text. Future projection and helper tests must verify local relevance requirements for area-bearing families and must fail closed when local relevance is missing or unresolved.

### SEO-D3H3C-A Landing Content RLS Decision Map

SEO-D3H3C-A concluded that public SELECT must be strict; drafts, rejected rows, pending rows, and private review fields must remain hidden; helpers must not expose actor/internal fields; service role is forbidden; ambiguous roles block mutation; and RLS uncertainty blocks helper implementation. This document converts those conclusions into future test goals without authorizing implementation.

### SEO-D3H3B-A Landing Content Migration Decision Map

SEO-D3H3B-A recommended the conceptual future table name `public.landing_page_contents`, but did not authorize SQL, migrations, RLS, generated types, helper integration, route integration, public rendering, crawler behavior, or landing content. This test strategy assumes the table remains future-only and non-existent today.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A established that future landing content must be unique per locale/country/family/canonical landing key, published, editorially approved, medically approved or explicitly not required, and tied to resolved canonical identity. Future RLS and projection tests must validate those review gates before any helper can consume landing-derived data.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 concluded that `areaSlug` alone is not canonical because area slug uniqueness is scoped by city context. Future tests must include unresolved area canonical identity, duplicate area slugs, and area-bearing route families that fail closed until an approved canonical area identity exists.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no route integration or data-bearing landing helper work should proceed until blockers are resolved. This document addresses the RLS/projection test-strategy blocker only as documentation and does not remove implementation blockers.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 and SEO-D3F2 integrated service and service-area scaffold routes only in a fail-closed manner. They validate locale/country, call fail-closed skeleton helpers, pass fail-closed input into the decision helper, and still end in `notFound()`. This document does not authorize changing those routes.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced skeleton landing gate helpers. The current helper has no imports, no DB/Supabase usage, no source tables, no content payload, and fail-closed output for all families. This document does not authorize a data-bearing helper.

### Decision Helper

The landing page decision helper remains a pure evaluator over supplied gate inputs. It does not fetch, resolve, canonicalize, publish, render, generate crawler signals, or expose content. This document does not authorize changing it.

### Route-Check Guardrails

Current route-check guardrails protect the fail-closed posture by checking selected route integrations, skeleton helper behavior, forbidden runtime/crawler/content tokens, and absence of forbidden route families. This document does not authorize route-check changes.

## 4. Current Test Readiness

### Existing Unit Test Posture

- Unit tests are Vitest-based and run through `pnpm test:unit`, which maps to `vitest run`.
- Vitest includes `src/**/*.test.ts`, uses the Node environment, and excludes build/output directories.
- Current landing helper tests validate fail-closed output shape, generic unavailable errors, empty source table output, and all five planned helper families.
- Current decision helper tests validate unsupported locale/country, forbidden families, private data risk, canonical conflicts, helper unavailable states, ambiguity, missing entity, invalid counts, medical review gates, insufficient public data, missing local relevance, and the current `indexable_later_only` terminal state.

### Existing RLS Test Posture

- `pnpm test:db:rls` currently runs `pnpm db:validate:migrations` followed by `node scripts/db/test-rls-static.mjs`.
- The RLS harness is static. It validates migration text and policy conventions; it does not run SQL queries against a live database.
- Current static checks include required RLS/helper migration files, approved policy-file allowlists, required policy names, restrictions against unexpected `TO anon`, and special private-table restrictions.

### Existing DB Validation Posture

- `pnpm db:validate:migrations` validates the expected migration sequence and current database migration contract through `0050_provider_onboarding_leads.sql`.
- Migration validation forbids broad unsafe patterns such as `INSERT INTO` and `DROP` in the current phase.
- Migration validation contains specific checks for helper files, RLS policy files, public catalog foundations, admin/provider onboarding lead foundations, and other completed migrations.

### Existing Route-Check Posture

- `pnpm routes:check` runs `node scripts/routes-check.mjs`.
- Route-check currently blocks forbidden service-role imports, keyword seed runtime imports, private/admin/provider imports in landing surfaces, schema output, metadata/canonical/hreflang tokens, sitemap/robots/llms helper references, and premature route/content expansion.
- Route-check verifies the selected service and service-area landing scaffold routes remain fail-closed and do not render public landing content.

### Existing Helper/Decision Tests

- The public landing query helper tests are unit-only and validate skeleton/fail-closed behavior.
- The decision helper tests are unit-only and validate pure gate evaluation.
- Neither test family proves RLS behavior, projection column safety, hidden-row count leakage prevention, or Supabase client behavior.

### Landing Content Table/View/RLS Existence

- No `public.landing_page_contents` table exists.
- No landing public-safe projection/view exists.
- No landing materialized view or gate table exists.
- No landing RPC exists.
- No landing-specific RLS policy exists.
- No generated type for landing content or a landing projection exists.

### Landing-Specific RLS/Projection Tests

- No landing-specific SQL-level RLS tests exist.
- No landing-specific public-safe projection/view tests exist.
- No landing-specific hidden-row count leakage tests exist.
- No landing-specific Supabase client integration tests exist.

## 5. Existing RLS Validation Conventions

### Static Checks

Current RLS validation is static and text-based. It checks that `CREATE POLICY` and `ENABLE ROW LEVEL SECURITY` appear only in approved migration files, that helper files do not contain policy statements, and that approved RLS policy files remain SELECT-only for the current phase.

### Migration Validation

Current migration validation enforces a known migration set, validates core schema assumptions, rejects forbidden migration patterns, and keeps migration phases bounded. Completed migration validation is expected through `0050_provider_onboarding_leads.sql`.

### RLS Policy Expectations

Current policy conventions favor explicit SELECT policies, explicit roles, non-deleted predicates, active/public predicates, approved status checks for content-like data, and safe parent-entity checks. Sensitive private tables are not broadly exposed to `anon` or all authenticated users.

### Public SELECT Policy Patterns

Current public catalog SELECT policies generally use `TO anon, authenticated` with `deleted_at IS NULL`, active flags, approved statuses, and parent entity checks. Future landing content policies must be stricter because landing content may include editorial workflow, medical review, actor fields, private metadata, and content payloads.

### Helper Function Checks

Current SQL helper functions exist for auth/profile, center access, patient/appointment access, review/media access, monetization access, and legal/consent/audit access. Several helpers use `SECURITY DEFINER`, so future landing RPC/function use must be treated as high risk and separately approved only if a projection/view is insufficient.

### Service-Role/Secret Restrictions

Current public Supabase usage is anon-key based. Service-role access is not authorized for public landing helpers or public route paths. Future tests and static checks must continue to prohibit service-role imports, service-role keys, service-role-only data, and service-role bypass behavior in public landing paths.

### CI Commands Available

Current relevant commands are:

- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

### Current Limits of Static Checks

Static checks are necessary but insufficient. They cannot prove actual row visibility, authenticated identity behavior, mutation denial, hidden-row count leakage prevention, projection column allowlists, Supabase client behavior, or runtime helper error normalization. Static-only validation must not be treated as security proof for landing content.

## 6. Future RLS Test Goals

Future RLS tests should be implemented only in a separately approved test implementation phase. They should prove that:

- `anon` cannot see draft rows.
- `anon` cannot see `in_review` rows.
- `anon` cannot see rejected rows.
- `anon` cannot see archived rows.
- `anon` cannot see deleted rows.
- `anon` cannot see editorial-pending rows.
- `anon` cannot see editorial-missing rows.
- `anon` cannot see medical-required rows.
- `anon` cannot see medical-pending rows.
- `anon` cannot see medical-missing rows.
- `anon` cannot see medical-rejected rows.
- `anon` can see only rows that are published, editorial-approved, medical-approved or medical-`not_required`, not deleted, canonical, public-safe, and tied to safe related entities.
- Authenticated non-editor users cannot mutate landing content.
- Provider/center-scoped users cannot mutate global landing content.
- Patient users cannot mutate landing content.
- Editors can draft/update only if an explicit future landing editor role exists and is approved.
- Editorial reviewers can approve only if an explicit future landing editorial reviewer role exists and is approved.
- Medical reviewers can approve or mark `not_required` only if an explicit future landing medical reviewer role exists and is approved.
- Publishers can publish only if an explicit future landing publisher role exists and is approved.
- Platform admin behavior matches a human-approved landing policy and is not assumed to include medical review authority.
- Service role is not used by the public helper or public route path.

## 7. Future Projection/View Test Goals

Future projection/view tests should be required before helper implementation. They should prove that:

- The projection exposes only gate-safe fields.
- The projection does not expose `title`, `intro`, `sections`, or `faq`.
- The projection does not expose generated content or copy payloads.
- The projection does not expose reviewer fields.
- The projection does not expose admin fields.
- The projection does not expose internal workflow fields.
- The projection does not expose actor IDs.
- The projection does not expose private metadata.
- The projection does not expose raw table rows.
- The projection does not expose provider lists.
- The projection does not expose center lists.
- The projection does not leak hidden-row existence through counts, duplicate signals, or distinguishable error states.
- The projection fails closed on ambiguous rows.
- The projection fails closed on multiple canonical candidates.
- The projection fails closed on missing rows.
- The projection respects canonical landing identity.
- The projection respects area canonicalization constraints.
- The projection respects local relevance requirements.
- The projection respects specialty relationship semantics.
- The projection does not bypass RLS.
- The projection does not use unsafe `SECURITY DEFINER` semantics unless separately approved.

## 8. Future Helper Test Goals

Future helper tests should be added only after approved RLS/projection implementation and should prove that:

- The helper reads only from the approved public-safe projection/view if later implemented.
- The helper does not import service-role clients or service-role helpers.
- The helper does not import keyword seed JSON at runtime.
- The helper does not expose content payload fields.
- The helper does not expose raw DB/Supabase errors.
- The helper fails closed on projection denial.
- The helper fails closed on projection query error.
- The helper fails closed on zero rows.
- The helper fails closed on multiple rows.
- The helper fails closed on ambiguous canonical identity.
- The helper returns only derived gate values.
- The helper does not create metadata, schema, sitemap, crawler behavior, public UI, visible noindex pages, or indexable pages.
- Helper tests cover all five families:
  - `service`
  - `service_area`
  - `area`
  - `specialty`
  - `specialty_area`

Derived gate values should remain limited to values such as entity existence, provider count, center count, exact combination count, unique visible intro availability, local relevance, medical review status, canonical uniqueness, private data exclusion, helper availability, ambiguity state, and route family allowance.

## 9. Static Guardrail Test Goals

Future static guardrail tests should ensure that:

- `routes-check` still blocks unauthorized route/helper/crawler changes.
- No `generateMetadata` is added prematurely.
- No `generateStaticParams` is added prematurely.
- No sitemap changes are added prematurely.
- No schema/JSON-LD output is added prematurely.
- No robots changes are added prematurely.
- No `llms.txt` landing helper references are added prematurely.
- No keyword seed JSON runtime usage is introduced.
- No service-role import appears in public helper paths.
- No helper content payload fields are returned.
- No public UI/content rendering occurs before an explicitly approved visible-noindex phase.

## 10. Test Data Strategy

Future test data should be conceptual until a test implementation phase is explicitly approved. No seed rows are authorized by this document.

Future test scenarios should include:

### Visibility Rows

- Published + editorial-approved + medical-approved row.
- Published + editorial-approved + medical-not-required row.
- Draft row.
- `in_review` row.
- Rejected row.
- Archived row.
- Deleted row.
- Editorial-pending row.
- Editorial-missing row.
- Medical-pending row.
- Medical-missing row.
- Medical-rejected row.

### Canonical and Ambiguity Rows

- Duplicate canonical key rows.
- Same slug in multiple area contexts where area identity is unresolved.
- Multiple public-safe-looking rows where only one should be canonical.
- Missing canonical identity.
- Non-canonical candidate row.

### Related-Entity Safety Rows

- Inactive related service.
- Deleted related service.
- Inactive related specialty.
- Deleted related specialty.
- Inactive related area.
- Deleted related area.
- Missing local relevance.
- Conflicting specialty relationship sources.
- Relationship rows tied to inactive/deleted parent entities.

### Mutation Role Scenarios

- Center-scoped user trying to mutate global landing content.
- Provider-scoped user trying to mutate global landing content.
- Patient user trying to mutate global landing content.
- Authenticated non-editor trying to mutate global landing content.
- Future landing editor/reviewer/publisher scenarios only if explicitly approved.
- Platform admin behavior matching exact human-approved policy, not assumed.

## 11. Test Layering

### Migration/Static Validation

Migration/static validation should remain the first guardrail. It can validate migration naming/order, approved RLS files, absence of forbidden SQL patterns, SELECT-only policy posture, and obvious forbidden grants. It cannot prove actual row visibility.

### RLS Tests

SQL-level RLS tests should prove real database visibility and mutation denial under `anon` and authenticated role simulations. They are required for row-level security confidence and must cover hidden content states, approved content states, canonical identity, and mutation denial.

### Projection/View Tests

Projection/view tests should prove column allowlists, hidden-row leakage prevention, canonical identity handling, local relevance handling, specialty semantics, missing/multiple/ambiguous fail-closed behavior, and no RLS bypass.

### Helper Unit Tests

Helper unit tests should prove fail-closed behavior, output shape, safe derived fields, no raw errors, and no forbidden imports. They should not be treated as RLS/security proof.

### Route-Check Tests

Route-check tests should remain a static guardrail against premature route, helper, crawler, metadata, schema, sitemap, robots, `llms.txt`, service-role, and keyword seed expansion.

### Build/Typecheck/Lint

Build, typecheck, and lint should remain required quality gates after any approved implementation. They do not replace RLS/projection security tests.

### CI Sequencing

Recommended future CI sequencing for approved implementation phases:

1. Migration/static validation.
2. SQL-level RLS tests.
3. Projection/view allowlist and hidden-leakage tests.
4. Helper unit tests.
5. Route-check guardrails.
6. Typecheck.
7. Build.
8. Lint.

## 12. Candidate Testing Models

### Option A — Static-Only RLS Validation

| Dimension | Assessment |
| --- | --- |
| Pros | Fast, deterministic, already aligned with current scripts, no local Supabase runtime required. |
| Cons | Cannot prove actual row visibility, authenticated identity behavior, mutation denial, hidden-row count leakage prevention, or projection column safety. |
| Coverage | Migration structure, approved policy-file placement, obvious forbidden policy actions, broad anon grants, and naming conventions. |
| Setup complexity | Low. |
| CI impact | Low. |
| Security confidence | Low to medium. |
| Implementation risk | Low technical risk, high false-confidence risk. |
| Recommendation | Keep as a required layer, but never rely on it alone for landing RLS/security. |

### Option B — SQL-Level RLS Tests with Anon/Authenticated Role Simulation

| Dimension | Assessment |
| --- | --- |
| Pros | Directly tests database behavior and can prove actual row visibility and mutation denial. |
| Cons | Requires careful role/claim setup, isolated test fixtures, and local database execution conventions. |
| Coverage | Strong coverage for RLS predicates, hidden row states, approved row visibility, authenticated role boundaries, and mutation denial. |
| Setup complexity | Medium. |
| CI impact | Medium. |
| Security confidence | High for row-level behavior. |
| Implementation risk | Medium; fixtures and role simulation must be precise. |
| Recommendation | Required later before helper implementation. |

### Option C — Supabase Client Integration Tests Against Local Supabase

| Dimension | Assessment |
| --- | --- |
| Pros | Exercises application-style access, anon client behavior, Supabase response shapes, and generated type usage. |
| Cons | Slower, more environment-sensitive, and may require local Supabase availability in CI. |
| Coverage | Useful for end-to-end client behavior and runtime integration assumptions. |
| Setup complexity | Medium to high. |
| CI impact | Medium to high. |
| Security confidence | Medium to high when paired with SQL-level RLS tests. |
| Implementation risk | Medium due to environment flakiness and authenticated setup complexity. |
| Recommendation | Optional later as an integration layer; not a replacement for SQL-level RLS tests. |

### Option D — Unit-Only Mocked Helper Tests

| Dimension | Assessment |
| --- | --- |
| Pros | Fast, deterministic, easy to run in current Vitest setup, good for fail-closed helper behavior. |
| Cons | Cannot prove RLS, projection column safety, hidden row invisibility, count leakage prevention, or actual Supabase behavior. |
| Coverage | Helper output shape, error normalization, fail-closed behavior, and forbidden runtime field exposure. |
| Setup complexity | Low. |
| CI impact | Low. |
| Security confidence | Low for RLS/security. |
| Implementation risk | Low technical risk, high risk if misused as security proof. |
| Recommendation | Required as a helper layer, but insufficient for security. |

### Option E — Hybrid Strategy

Hybrid strategy means:

- Static migration/RLS checks.
- SQL-level RLS tests.
- Projection/view allowlist tests.
- Helper unit tests.
- Route-check guardrails.
- CI validation.

| Dimension | Assessment |
| --- | --- |
| Pros | Best overall coverage and separates SQL security proof from projection leakage prevention, helper behavior, and route/crawler guardrails. |
| Cons | More implementation work and requires strict phase sequencing. |
| Coverage | Migration structure, real RLS behavior, projection safety, hidden-row leakage prevention, helper fail-closed behavior, route/crawler guardrails, and build/type quality. |
| Setup complexity | Medium to high. |
| CI impact | Medium when introduced carefully. |
| Security confidence | Highest. |
| Implementation risk | Lowest long-term risk if phased conservatively. |
| Recommendation | Preferred conservative future strategy. |

## 13. Recommended Conservative Decision

- No test implementation now.
- Prefer the hybrid strategy later.
- Do not rely on unit-only mocked helper tests for RLS/security.
- Do not rely on static-only checks for row visibility.
- Projection/view allowlist tests are required before helper implementation.
- Helper implementation remains blocked until RLS/projection tests exist and pass.

## 14. Implementation Ordering

Future only, and only with separately approved `PHASED_BUILD_ONLY` tasks:

1. Migration creates table/enums/constraints/indexes.
2. Role/review permissions implementation only if explicitly approved.
3. RLS implementation only in an approved RLS phase.
4. RLS static validation update.
5. SQL-level RLS tests.
6. Public-safe projection/view implementation.
7. Projection/view allowlist and hidden-leakage tests.
8. Generated type regeneration.
9. Helper implementation plan.
10. Helper unit tests.
11. Route-check updates only if explicitly approved.
12. Route visible-noindex plan later.
13. Indexable/crawler/metadata/schema/sitemap work only in later explicit phases.

## 15. Implementation Decision

- No SQL now.
- No RLS now.
- No tests now.
- No projection/view now.
- No RPC now.
- No materialized view or gate table now.
- No generated type changes now.
- No Supabase usage now.
- No service-role usage now.
- No helper/runtime changes now.
- No route changes now.
- No route-check changes now.
- No metadata/canonical/hreflang changes now.
- No sitemap/schema/robots/`llms.txt` changes now.
- No visible noindex or indexable page changes now.
- No content generation now.
- No keyword seed runtime usage now.

## 16. Recommended Next Subphase

Recommended next subphase: **SEO-D3H4-F — Landing Content Migration Readiness Gate Plan**.

Rationale: a readiness gate plan is more conservative than moving directly into landing content migration implementation planning. It can confirm unresolved product/legal/medical, role/review, area canonicalization, local relevance, specialty semantics, RLS test, projection test, generated type, helper, and route/crawler blockers before any migration implementation plan proceeds.

If human product/legal/medical decisions remain unresolved, the safer alternative is no further action until those decisions are made.

## 17. Exact Allowed Files for Next Recommended Task

If the next task is plan-only:

- No files.

If the next task is documentation-only:

- One `docs/seo/*.md` file only.

If the next task is a future implementation plan:

- Still no code changes unless explicitly approved.

## 18. Exact Forbidden Files for Next Recommended Task

- Routes.
- Route-check.
- Helpers.
- Migrations unless an explicit implementation phase is approved.
- Generated types.
- Package files.
- Sitemap/robots/`llms.txt`.
- `data/seo`.
- Tests unless an explicit test implementation phase is approved.
- Public UI/content files.
- Supabase client/server files.
- API handlers.

## 19. Validation Expectations for This Documentation-Only Task

For this documentation-only task, validation should run after the document is created:

- `git status --short`
- `test -f docs/seo/RLS_TEST_STRATEGY_DECISION_MAP.md && echo "SEO-D3H4-E-A RLS test strategy decision map exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Expected result: only `docs/seo/RLS_TEST_STRATEGY_DECISION_MAP.md` is created. No code, routes, route-check, migrations, generated database types, tests, metadata, schema, sitemap, robots, or `llms.txt` behavior should change.

## 20. Final Recommendation

Keep SEO-D3H4-E-A documentation-only. Do not proceed to SQL, RLS, tests, projection/view, generated types, helper/runtime changes, route integration, visible noindex pages, indexable pages, metadata, sitemap, schema, robots, `llms.txt`, crawler behavior, public UI, or landing content.

The safest next step is **SEO-D3H4-F — Landing Content Migration Readiness Gate Plan**, or no further action until required human product/legal/medical decisions are resolved.
