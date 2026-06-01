# SEO-D3H4-H-A — Landing Public Gate Test Implementation Plan

## 1. Status and Authority

This document is documentation-only for `SEO-D3H4-H-A`. It records a conservative future implementation plan for landing public gate tests, public-safe projection allowlist tests, leakage tests, landing content RLS tests, helper tests, and route/crawler/static guardrail tests.

This document does **not** authorize any implementation beyond this documentation artifact.

This document does **not** authorize:

- SQL implementation;
- SQL migrations;
- database view or projection implementation;
- RPC implementation;
- function implementation;
- materialized views;
- gate tables;
- RLS policy implementation;
- test implementation;
- test script implementation or modification;
- generated database type changes;
- Supabase usage;
- service-role usage;
- route integration;
- data-bearing public query helpers;
- route-check changes;
- metadata output;
- canonical output;
- hreflang output;
- Open Graph output;
- sitemap changes;
- schema output;
- robots changes;
- `llms.txt` changes;
- visible noindex pages;
- indexable pages;
- crawler behavior;
- CMS UI;
- API handlers;
- seed rows;
- analytics jobs;
- background jobs;
- public UI;
- provider listings;
- center listings;
- landing content;
- medical content;
- service descriptions;
- specialty descriptions;
- local area descriptions;
- content generation;
- keyword seed runtime usage;
- payment logic;
- monetization logic;
- sponsored placement;
- ranking logic;
- referral logic;
- commission logic;
- entitlement logic;
- plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, approved files, forbidden files, migration/RLS impact, generated-type impact, helper impact, route impact, SEO/crawler impact, validation commands, and human approval checkpoints.

If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, current helper contracts, current route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing public gate and leakage test implementation plan documentation-only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-H-A

## 3. Relationship to Prior Phases

### SEO-D3H4-H PLAN

The approved `SEO-D3H4-H` plan-only report concluded that actual test implementation should not happen yet. It recommended this documentation-only implementation plan first, a future hybrid staged test strategy, SQL-level RLS/projection tests before helper reads, fail-closed helpers, fail-closed routes, no projection/view SQL now, no RLS policy SQL now, and no route/crawler/metadata/sitemap/schema/UI/content work now.

### SEO-D3H4-D-C Public-Safe Projection/View Implementation Plan

`SEO-D3H4-D-C` documented a future public-safe projection/view strategy and did not authorize implementation. It concluded that no raw `landing_page_contents` exposure should occur, future projection must expose only derived gate-safe values, projection must not expose payload or actor/reviewer/internal fields, `SECURITY INVOKER` or RLS-respecting behavior must be verified before implementation, and `SECURITY DEFINER` must not be used unless separately approved and proven safe.

### SEO-D3H4-G-A Landing Content RLS Implementation Plan

`SEO-D3H4-G-A` documented a conservative future RLS implementation plan and did not authorize RLS policies. It concluded that public SELECT should not be added to the raw `landing_page_contents` table now because the table contains payload, reviewer, actor, and internal workflow fields and RLS is row-level rather than column-level.

### SEO-D3H4-E-A RLS Test Strategy Decision Map

`SEO-D3H4-E-A` concluded that projection/view allowlist and leakage tests are required before helper implementation. It also concluded that unit-only mocked helper tests and static-only RLS checks are insufficient for RLS/security proof. Its preferred future strategy is hybrid: static migration/RLS checks, SQL-level RLS tests, projection/view allowlist tests, helper unit tests, route-check guardrails, and CI validation.

### SEO-D3H4-C-IMPL-A Migration

`SEO-D3H4-C-IMPL-A` created `supabase/migrations/0051_landing_page_contents.sql`, updated generated database types, and updated static validation. It created `public.landing_page_contents`, lifecycle/review enums, constraints, indexes, an `updated_at` trigger, and RLS-enabled/no-policy posture. It intentionally did not create public SELECT policies, mutation policies, anon access, broad authenticated access, views/projections, RPCs, materialized views, seed rows, helper access, route integration, crawler behavior, or public content.

### SEO-D3H4-D-A Public-Safe Projection/View Decision Map

`SEO-D3H4-D-A` preferred future helper reads from a public-safe projection/view rather than the raw payload-bearing table. It deferred RPC/function and materialized gate table/view models. It kept helpers fail-closed and required that helper output not expose content payload, raw rows, reviewer/admin/internal fields, actor fields, raw errors, provider/center lists, keyword seeds, or generated text.

### SEO-D3H4-B-A Specialty Relationship Semantics Decision Map

`SEO-D3H4-B-A` concluded that specialty relationship signals are not interchangeable, that specialty helper work remains fail-closed, and that `specialty_area` remains blocked by specialty semantics, area canonicalization, and local relevance requirements. Future tests must not treat all specialty links as equivalent.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

`SEO-D3H4-A` concluded that provider/center-scoped roles must not be reused for global landing content, platform admin is not automatically a medical reviewer, and explicit landing role semantics remain unresolved. Future mutation/RLS tests must therefore be conditional on separately approved landing roles.

### SEO-D3H3C-A Landing Content RLS Decision Map

`SEO-D3H3C-A` concluded that public SELECT must be strict; drafts, rejected rows, pending rows, and private review fields must remain hidden; helpers must not expose actor/internal fields; service role is forbidden; ambiguous roles block mutation; and RLS uncertainty blocks helper implementation.

### SEO-D3H3B-A Migration Decision Map

`SEO-D3H3B-A` recommended a bounded future table named `public.landing_page_contents` and stated that public visibility must require published status, editorial approval, medical approval or explicit `not_required`, non-deleted state, resolved canonical identity, and safe related entities.

### SEO-D3H3D-A Local Relevance Source Decision Map

`SEO-D3H3D-A` established that local relevance cannot be invented from slugs, generic area text, provider density, counts, or keyword demand. Future projection/helper tests must verify local relevance requirements for area-bearing families and fail closed when local relevance is missing or unresolved.

### SEO-D3H2 Area Canonicalization

`SEO-D3H2` concluded that `areaSlug` alone is not canonical because area slug uniqueness is scoped by city context. Future tests must include unresolved area canonical identity, duplicate area slugs, and area-bearing route families that fail closed until approved canonical area identity exists.

### SEO-D3D2B Skeleton Helper

`SEO-D3D2B` created a public landing query helper skeleton that remains fail-closed. It has no source tables, no Supabase usage, no database queries, and no content payload exposure. This document does not authorize making that helper data-bearing.

### Route-Check Guardrails

Current route-check guardrails protect the fail-closed posture by blocking unauthorized helper, route, crawler, metadata, sitemap, robots, schema, `llms.txt`, Supabase, service-role, keyword seed, private data, and content behavior. This document does not authorize route-check changes.

## 4. Current Test Baseline

### Unit test posture

Current unit tests exist for the public landing helper skeleton and the landing gate decision helper. The helper tests use Vitest and import all five helper families: `specialty`, `specialty_area`, `area`, `service`, and `service_area`.

The helper tests assert fail-closed behavior:

- `ok: false`;
- generic unavailable error message;
- `sourceTables: []`;
- `entityExists: false`;
- zero provider, center, and exact-combination counts;
- missing visible intro;
- missing local relevance;
- `medicalReviewStatus: 'missing'`;
- `canonicalIsUnique: false`;
- `privateDataExcluded: true`;
- `helperAvailable: false`;
- `entityIsAmbiguous: false`;
- `routeFamilyAllowed: true`.

The decision helper tests cover blocker and gate behavior, including unsupported locale, unsupported country, forbidden route family, private data risk, canonical conflict, helper unavailable, ambiguous entity, missing entity, invalid counts, medical review requirements, insufficient public data, and successful future candidates returning `indexable_later_only` while safety flags remain false.

### Static RLS test script posture

`pnpm test:db:rls` currently runs migration validation plus `scripts/db/test-rls-static.mjs`. The static RLS script includes `0051_landing_page_contents.sql` and asserts that `public.landing_page_contents` has RLS enabled, no policies, no anon access, no broad authenticated access, no SELECT/mutation policies, and no `INSERT INTO` seed rows.

### Migration validator posture

`pnpm db:validate:migrations` runs `scripts/db/validate-migrations.mjs`. The migration validator includes `0051_landing_page_contents.sql` in the required migration list and validates landing page enums, table creation, required columns, constraints, indexes, trigger, and RLS enablement. It also forbids policies, inserts, seed rows, service-role references, anon/authenticated grants, SELECT/mutation policy tokens, route references, sitemap/robots/`llms.txt` references, schema/metadata references, public UI references, and provider/center-scoped role references in the landing content migration.

### Seed validator posture

`pnpm db:validate:seeds` runs `scripts/db/validate-seeds.mjs`. `pnpm test:db:seed` runs seed validation plus `scripts/db/test-seed-static.mjs`. These scripts preserve the no-seed posture by failing if SQL seed files exist under `supabase/seed`.

### Route-check guardrail posture

`pnpm routes:check` runs `scripts/routes-check.mjs`. Route-check currently guards the landing helper and selected landing scaffold routes by blocking Supabase/service-role usage, keyword seed runtime usage, public catalog query usage, route/crawler/metadata/schema tokens, monetization tokens, admin/provider/private tokens, and public content rendering. It also requires fail-closed helper tokens and final unconditional `notFound()` posture for selected service and service-area route scaffolds.

### Package scripts and Vitest config posture

`package.json` includes scripts for build, lint, typecheck, routes check, environment check, migration validation, seed validation, database type generation, database reset, static RLS checks, static seed checks, SEO check, and unit tests.

`vitest.config.ts` uses the Node test environment, disables globals, includes `src/**/*.test.ts`, and excludes `node_modules`, `.next`, `out`, and `build`.

### Absent tests and absent projection/view

Current repo evidence indicates:

- no SQL-level landing RLS tests exist;
- no projection/view allowlist tests exist;
- no projection/view exists;
- generated `public.Views` is empty;
- no helper data-bearing tests exist;
- no landing seed rows exist.

### Helper fail-closed posture

The public landing helper remains a skeleton/fail-closed helper. It has no import statements, no Supabase usage, no service-role usage, no database queries, no landing table reads, `PublicLandingGateDataSourceTable = never`, and `sourceTables: []`.

### Route fail-closed posture

Current landing routes remain fail-closed:

- service route validates locale/country, calls the service helper and decision helper, then still ends in `notFound()`;
- service-area route validates locale/country, calls the service-area helper and decision helper, then still ends in `notFound()`;
- area route validates locale/country and calls `notFound()`;
- specialty route validates locale/country and calls `notFound()`;
- specialty-area route validates locale/country and calls `notFound()`.

### Raw table payload/internal fields

`public.landing_page_contents` contains identity/scope fields, payload fields, workflow/review fields, actor/reviewer/internal fields, timestamps, and soft-delete state. Current payload fields include `title`, `intro`, `sections`, and `faq`. Current actor/reviewer/internal fields include `created_by_profile_id`, `updated_by_profile_id`, `reviewed_by_profile_id`, `reviewed_at`, `medical_reviewer_profile_id`, `medical_reviewed_at`, `published_by_profile_id`, and `published_at`.

These fields are the reason raw table public SELECT is unsafe.

### Public helper imports

Current public landing helper code does not import Supabase, service-role, keyword seed JSON, the raw landing table, route modules, crawler modules, or public catalog query modules.

## 5. Future Test Goals

Future tests must prove that future landing public gate behavior is safe before any projection/view SQL implementation, RLS policy implementation, data-bearing helper implementation, route integration, visible noindex page, indexable page, metadata, sitemap, schema, crawler behavior, public UI, or landing content work.

Future test goals are:

1. **Raw table public exposure prevention**
   - Anon must not read `public.landing_page_contents`.
   - Broad authenticated users must not read raw landing rows.
   - Public raw table SELECT must remain forbidden unless a separately approved RLS phase proves it safe. Current planning assumes raw public SELECT remains disallowed.

2. **Projection column allowlist**
   - Future projection/view, if approved, must expose only explicit gate-safe derived fields.
   - The allowlist must be small, documented, and tested.

3. **Forbidden projection fields**
   - Future projection/view must not expose payload fields: `title`, `intro`, `sections`, `faq`.
   - Future projection/view must not expose actor/reviewer/internal fields.
   - Future projection/view must not expose raw workflow state unless separately mapped to safe derived values.

4. **No payload leakage**
   - No public helper, route, projection, crawler file, metadata, schema, or test fixture should expose landing content payload or medical/local/service/specialty copy.

5. **No actor/reviewer/internal leakage**
   - No public path should expose profile IDs, reviewer IDs, reviewer timestamps, publisher IDs, admin workflow fields, audit fields, claim evidence, license evidence, CRM fields, or billing fields.

6. **No raw status/workflow leakage unless mapped safely**
   - Raw `status`, `editorial_review_status`, and `medical_review_status` values must not be exposed unless a later approved projection maps them into safe derived gate values.

7. **No hidden-row count leakage**
   - Draft, in-review, rejected, archived, deleted, missing-review, pending-review, ambiguous, or unsafe rows must not change public counts, statuses, timing, response shape, or error messages in a way that reveals hidden existence.

8. **No duplicate canonical leakage**
   - Duplicate canonical records must fail closed without revealing which duplicate exists or leaking hidden row counts.

9. **No ambiguous identity leakage**
   - Ambiguous area identity, specialty relationship ambiguity, and unsafe route/entity identity combinations must fail closed without exposing alternate candidate identities.

10. **No raw error leakage**
    - Raw SQL errors, Supabase errors, RLS errors, constraint errors, and internal exception messages must map to generic fail-closed helper errors.

11. **No service-role public path**
    - Service-role access must not be used by public landing helpers, routes, metadata, sitemap, robots, `llms.txt`, schema, or crawler paths.

12. **No keyword seed runtime usage**
    - Keyword seed JSON and `data/seo` files must not be imported at runtime by landing helpers or routes.

13. **No helper raw table reads**
    - A future data-bearing helper must read only an approved public-safe projection/view if later implemented, not raw `landing_page_contents`.

14. **No route/crawler/metadata/sitemap/schema exposure**
    - Landing route rendering, visible noindex pages, indexable pages, metadata, canonical, hreflang, Open Graph, sitemap, schema, robots, and `llms.txt` exposure must remain blocked until a later approved phase.

## 6. Candidate Test Layers

| Layer | What it checks | Strengths | Limits | Future use |
| --- | --- | --- | --- | --- |
| Static migration validator checks | Migration presence, required SQL patterns, forbidden SQL/crawler/runtime tokens | Fast, simple, catches obvious unsafe SQL/text | Cannot prove runtime RLS visibility or row leakage | Keep and update in approved SQL phases |
| Static RLS/forbidden-pattern checks | Policy names, anon/auth grants, forbidden raw table SELECT/mutation policy tokens | Fast and strong against accidental policy text | Cannot prove actual database behavior | Keep and update alongside RLS changes |
| SQL-level RLS tests | Real anon/auth/provider/patient/admin visibility and mutation behavior | Required for security confidence | Needs DB harness and approved test data strategy | Required before helper reads |
| SQL-level projection/view tests | Projection relation, column allowlist, row exclusions, leakage behavior | Proves projection behavior | Requires approved projection/view SQL | Required before helper reads projection |
| Generated type allowlist checks | Generated TypeScript type surface for views/functions | Helps prevent accidental projection field expansion | Only meaningful after generated types include projection/function | Add after view/function generation if applicable |
| Helper unit tests | Helper mapping, generic errors, fail-closed behavior, all five families | Fast app-layer coverage | Mocked tests do not prove RLS/security | Add after SQL tests exist and helper is approved |
| Route-check guardrails | Premature route/crawler/metadata/schema/Supabase/service-role/content expansion | Fast static protection | Static only; cannot prove DB behavior | Keep; update only in approved guardrail phases |
| Build/typecheck/lint/seo:check | Integration and quality gates | Catches type/build/lint/SEO regressions | Not security proof by itself | Always run validation gates |
| CI sequencing | Enforces safe ordering of validators/tests/build | Prevents unsafe merges | Requires explicit workflow ownership | Add only when approved |

## 7. Candidate Test Implementation Models

### Option A — Static-only tests

- **Pros**
  - Low setup complexity.
  - Fast CI runtime.
  - Fits current validator and route-check posture.
  - Catches forbidden strings, accidental policies, service-role imports, crawler expansion, and metadata/schema exposure.

- **Cons**
  - Cannot prove runtime RLS behavior.
  - Cannot prove row visibility for anon/authenticated roles.
  - Cannot prove projection row filtering.
  - Cannot prove hidden-row count leakage prevention.
  - Can create false confidence.

- **Coverage**
  - Good for text/pattern guardrails.
  - Weak for actual database security.

- **Setup complexity**
  - Low.

- **CI impact**
  - Low.

- **Security confidence**
  - Low to medium.

- **Implementation risk**
  - Low technical risk, high false-confidence risk.

- **Recommendation**
  - Do not use alone. Static-only tests are insufficient.

### Option B — SQL-level tests only

- **Pros**
  - Strong runtime proof for RLS and projection behavior.
  - Can directly test anon, authenticated non-role, provider/center-scoped, patient, and platform-admin-if-approved scenarios.
  - Can prove draft/rejected/deleted rows are hidden.

- **Cons**
  - Does not catch app-layer helper imports or route/crawler expansion.
  - Does not verify TypeScript helper result contracts.
  - Does not block sitemap, robots, `llms.txt`, metadata, schema, or public UI changes.
  - Requires DB harness and carefully approved test data strategy.

- **Coverage**
  - Strong for database behavior.
  - Weak for helper/route/crawler/static guardrails.

- **Setup complexity**
  - Medium to high.

- **CI impact**
  - Medium to high, depending on DB startup/reset model.

- **Security confidence**
  - Medium to high for database behavior only.

- **Implementation risk**
  - Medium. Test data and role modeling can be wrong if rushed.

- **Recommendation**
  - Do not use alone. SQL-level tests are required later but must be paired with static/helper/route checks.

### Option C — Unit-only mocked helper tests

- **Pros**
  - Fast and easy to run.
  - Good for all five helper families.
  - Good for fail-closed mapping, generic error behavior, and stable return shapes.
  - No database setup required.

- **Cons**
  - Cannot prove RLS behavior.
  - Cannot prove raw table is inaccessible.
  - Cannot prove projection column allowlist.
  - Cannot prove hidden-row leakage prevention.
  - Mocked inputs can hide real SQL/projection leaks.

- **Coverage**
  - Good for TypeScript helper contract behavior.
  - Poor for DB/security proof.

- **Setup complexity**
  - Low.

- **CI impact**
  - Low.

- **Security confidence**
  - Low if used alone.

- **Implementation risk**
  - Low technical risk, high false-confidence risk.

- **Recommendation**
  - Do not use alone. Unit-only helper tests are insufficient.

### Option D — Hybrid staged test strategy

Future staged strategy:

1. static validator updates;
2. SQL-level RLS tests;
3. SQL-level projection allowlist/leakage tests;
4. generated type allowlist checks after view/function generation if applicable;
5. helper unit tests after helper implementation;
6. route-check/static crawler guardrails;
7. CI validation.

- **Pros**
  - Best overall coverage.
  - Proves runtime DB behavior and static guardrails.
  - Prevents helper reads before RLS/projection tests exist and pass.
  - Covers helper result contracts and all five families.
  - Maintains route/crawler/metadata fail-closed posture.

- **Cons**
  - Requires careful phase sequencing.
  - Requires human approval for SQL, test harness, and data strategy.
  - More CI complexity than static-only or unit-only models.

- **Coverage**
  - Strong across database, generated types, helper behavior, route/crawler guardrails, and validation gates.

- **Setup complexity**
  - Medium to high, but manageable if staged.

- **CI impact**
  - Medium to high, depending on SQL-level harness design.

- **Security confidence**
  - High when implemented in approved sequence.

- **Implementation risk**
  - Medium if staged carefully; high if rushed or bundled with route/content work.

- **Recommendation**
  - Recommended future model, but not implemented now.

### Option E — Keep no new tests until projection/RLS SQL implementation is approved

- **Pros**
  - Avoids speculative tests against nonexistent projection/view SQL.
  - Avoids premature DB harness and test data design.
  - Preserves the current documentation-only scope.
  - Forces explicit human approval before any test/SQL/model work.

- **Cons**
  - Adds no immediate enforcement beyond existing validators and route-check.
  - Future SQL phases must be disciplined and must add tests before or in the same phase as implementation.

- **Coverage**
  - No new coverage now.

- **Setup complexity**
  - None now.

- **CI impact**
  - None now.

- **Security confidence**
  - Current confidence unchanged.

- **Implementation risk**
  - Very low now.

- **Recommendation**
  - Recommended for this subphase. Do not implement actual tests until humans approve the projection/RLS/test model and sequencing.

## 8. Recommended Conservative Decision

The conservative decision for `SEO-D3H4-H-A` is:

- no test implementation now;
- document the test implementation plan first;
- future strategy should be hybrid staged tests;
- static-only is insufficient;
- unit-only helper tests are insufficient;
- SQL-level RLS/projection tests are required before helper reads;
- helper remains blocked until tests exist and pass;
- routes remain fail-closed;
- no projection/view SQL now;
- no RLS policy SQL now;
- no route/crawler/metadata/sitemap/schema/UI/content work now.

This preserves the fail-closed posture and avoids creating a public data path before the database, projection, RLS, helper, and crawler guardrails are proven safe.

## 9. Future Projection Test Plan

Future projection tests must be introduced only after an approved SQL phase creates a projection/view or approved alternative. The tests must not be created in this documentation-only phase.

Future projection tests should verify:

1. **Approved timing**
   - Projection relation exists only after an approved SQL phase.
   - No projection/view is assumed before its migration exists.

2. **Allowlisted gate-safe fields only**
   - Projection exposes only explicitly approved gate-safe derived fields.
   - Any future allowlist must be documented and exact.

3. **No payload fields**
   - Projection does not expose `title`.
   - Projection does not expose `intro`.
   - Projection does not expose `sections`.
   - Projection does not expose `faq`.

4. **No actor/reviewer/internal fields**
   - Projection does not expose created-by, updated-by, reviewed-by, medical reviewer, publisher, admin, audit, CRM, claim evidence, license evidence, or billing fields.

5. **No raw workflow state unless safely mapped**
   - Projection does not expose raw `status`, `editorial_review_status`, or `medical_review_status` unless a later approved model maps them into safe derived gate values.

6. **Lifecycle exclusions**
   - Projection excludes `draft` rows.
   - Projection excludes `in_review` rows.
   - Projection excludes `rejected` rows.
   - Projection excludes `archived` rows.
   - Projection excludes deleted rows.

7. **Editorial review exclusions**
   - Projection excludes editorial `missing` rows.
   - Projection excludes editorial `pending` rows.
   - Projection excludes editorial `rejected` rows.

8. **Medical review exclusions**
   - Projection excludes medical `missing` rows.
   - Projection excludes medical `required` rows.
   - Projection excludes medical `pending` rows.
   - Projection excludes medical `rejected` rows.

9. **Positive inclusion rule**
   - Projection only includes rows that are published, editorial approved, medical approved or medical `not_required`, non-deleted, canonical-safe, and related-entity-safe.

10. **Duplicate canonical behavior**
    - Projection fails closed on duplicate canonical rows.
    - Projection does not leak hidden duplicate counts.

11. **Ambiguous identity behavior**
    - Projection fails closed on ambiguous area identity.
    - Projection fails closed on ambiguous specialty relationship.
    - Projection does not leak alternative candidate identities.

12. **Hidden-row count leakage prevention**
    - Hidden rows do not affect public counts, helper statuses, error shape, timing assumptions, or route behavior.

13. **View security semantics**
    - If a view is chosen, tests must prove it respects RLS and `SECURITY INVOKER` semantics.
    - The projection must not use `SECURITY DEFINER` unless separately approved and proven safe.

## 10. Future RLS Test Plan

Future RLS tests must be SQL-level tests created before or in the same approved phase as landing RLS/projection SQL implementation.

Future RLS tests should verify:

- anon cannot read raw `landing_page_contents`;
- authenticated non-role users cannot read private raw rows;
- provider/center-scoped users cannot mutate global landing content;
- patient users cannot mutate landing content;
- platform admin behavior is tested only if human-approved for landing content roles;
- no broad authenticated policy exists for raw landing content;
- no public raw table SELECT exists;
- no mutation policies exist before an approved landing role model;
- no service-role public path exists;
- no seed rows are introduced.

Future RLS tests must not assume that provider, center, patient, generic authenticated, or generic platform-admin roles are equivalent to landing editor, editorial reviewer, medical reviewer, publisher, or content admin roles.

## 11. Future Helper Test Plan

Future helper tests must be added only after approved projection/RLS SQL and SQL-level tests exist and pass.

Future helper tests should verify:

- helper reads only the approved projection/view if later implemented;
- helper does not read raw `landing_page_contents`;
- helper does not import service-role;
- helper does not import keyword seed JSON at runtime;
- helper does not expose content payload;
- helper does not expose raw database errors;
- helper does not expose raw Supabase errors;
- helper fails closed on missing projection rows;
- helper fails closed on ambiguous projection rows;
- helper fails closed on multiple projection rows;
- helper returns only gate-safe derived values;
- helper tests cover all five families:
  - `service`;
  - `service_area`;
  - `area`;
  - `specialty`;
  - `specialty_area`.

Future helper outputs must not include SEO copy, medical copy, local copy, provider names, center names, slugs beyond approved inputs, UUIDs, raw database rows, raw Supabase responses, reviewer/admin/internal fields, schema payloads, metadata payloads, sitemap entries, robots directives, `llms.txt` content, ranking scores, sponsored flags, payment data, or private fields.

## 12. Future Route/Crawler/Static Guardrail Test Plan

Future route/crawler/static guardrails should continue blocking premature public exposure.

Future guardrail tests should verify:

- route-check blocks `generateMetadata` prematurely;
- route-check blocks `generateStaticParams` prematurely;
- route-check blocks sitemap changes prematurely;
- route-check blocks schema output prematurely;
- route-check blocks robots changes prematurely;
- route-check blocks `llms.txt` changes prematurely;
- route-check blocks Supabase imports in landing routes/helpers unless explicitly approved;
- route-check blocks service-role imports in landing routes/helpers unless explicitly approved;
- no visible noindex route rendering exists until a later approved phase;
- no indexable route rendering exists until a later approved phase;
- no public UI/content rendering exists;
- no metadata/canonical/hreflang/schema/crawler exposure exists;
- no keyword seed runtime usage exists;
- no route integration expands beyond explicitly approved family/scope.

Any future route-check change must itself be explicitly approved and must not silently authorize route rendering, metadata, sitemap, schema, robots, `llms.txt`, or public content.

## 13. Future Test Data Strategy

Future test data strategy is conceptual only in this document. No seed rows or test rows are authorized now.

Future SQL-level tests may need isolated, approved test data for:

- published approved row;
- draft row;
- `in_review` row;
- rejected row;
- archived row;
- deleted row;
- editorial missing row;
- editorial pending row;
- editorial rejected row;
- medical missing row;
- medical required row;
- medical pending row;
- medical rejected row;
- medical `not_required` row;
- duplicate canonical rows;
- ambiguous area identity;
- ambiguous specialty relationship;
- inactive/deleted related service;
- inactive/deleted related specialty;
- inactive/deleted related area;
- inactive/deleted related city;
- missing local relevance;
- provider/center user;
- patient user;
- authenticated non-role user;
- platform admin only if approved;
- explicit no-service-role public path case.

Future test data must not become production seed data. It must not include real medical content, SEO content, local area copy, specialty copy, service descriptions, keyword seed runtime data, provider listing content, center listing content, patient data, claim evidence, license evidence, CRM data, billing data, or private notes.

## 14. Future Implementation Sequencing

Recommended future sequence:

1. **Documentation-only test implementation plan first**
   - This document records the plan and does not implement tests.

2. **Human approval**
   - Humans must approve the test model, SQL/projection/RLS sequencing, DB harness strategy, and allowed files.

3. **Projection/RLS SQL implementation plan or actual SQL only if approved**
   - No raw public SELECT.
   - No projection/view unless security semantics are approved.
   - No RLS policies unless an explicit RLS phase approves them.

4. **Static validators updated with SQL phase**
   - Migration validator and static RLS checks should be updated only in the approved SQL/RLS/test phase.

5. **SQL-level tests created before or in the same phase as projection/RLS**
   - SQL-level RLS tests and projection allowlist/leakage tests must exist before helper reads.

6. **Generated type checks after view/function generation if applicable**
   - Type allowlist checks should be added only after generated types include approved projection/view/function surfaces.

7. **Helper implementation only after tests exist and pass**
   - Helper remains blocked until RLS/projection tests exist and pass.
   - Helper must read only approved projection/view if later implemented.

8. **Route visible noindex/indexing/crawler much later**
   - Visible noindex pages, indexable pages, metadata, canonical, hreflang, Open Graph, sitemap, schema, robots, and `llms.txt` behavior require separate later approval.

## 15. Recommended Next Subphase

Recommended next subphase:

- **No further action until human product/legal/medical decision.**

Do not proceed directly to:

- `SEO-D3H4-H-B — Landing Public Gate Test Implementation`;
- `SEO-D3H4-D-D — Public-Safe Projection/View SQL Implementation`;
- `SEO-D3H4-G-B — Landing Content RLS SQL Implementation`.

Actual test implementation should not happen until humans explicitly approve the projection/RLS/test model and sequencing.

## 16. Exact Allowed Files for Next Recommended Task

Because the recommended next subphase is no further action until human product/legal/medical decision:

- no files.

If a future implementation phase is later approved, that phase must explicitly list its own allowed files before any editing begins.

## 17. Exact Forbidden Files for Next Recommended Task

For the recommended no-action posture, all files are forbidden until a new approved `PHASED_BUILD_ONLY` task is provided.

At minimum, future tasks must continue to treat the following as forbidden unless explicitly approved by that task:

- routes;
- helpers;
- route-check unless explicitly required by validation protocol;
- migrations unless explicit projection/RLS implementation phase;
- generated types unless explicit view/function changes require it;
- package files;
- sitemap;
- robots;
- `llms.txt`;
- `data/seo`;
- tests unless explicit test implementation phase;
- `scripts/db` unless explicit validation implementation phase;
- public UI/content files;
- Supabase client/server files;
- API handlers.

## 18. Validation Expectations

For this documentation-only task, expected validation commands are:

- `git status --short`;
- `test -f docs/seo/LANDING_PUBLIC_GATE_TEST_IMPLEMENTATION_PLAN.md && echo "SEO-D3H4-H-A landing public gate test implementation plan exists"`;
- `pnpm env:check`;
- `pnpm db:validate:migrations`;
- `pnpm test:db:rls`;
- `pnpm typecheck`;
- `pnpm test:unit`;
- `pnpm routes:check`;
- `pnpm build`;
- `pnpm lint`;
- `pnpm seo:check` if applicable.

Validation must not be faked or skipped silently. If any command fails because of a dependency, environment, route ambiguity, schema conflict, RLS ambiguity, or unclear requirement, the phase must stop and report the blocker.

## 19. Out of Scope

The following remain out of scope for this document and for `SEO-D3H4-H-A`:

- actual test implementation;
- SQL-level RLS tests;
- projection/view allowlist tests;
- helper data-bearing tests;
- route/crawler test changes;
- SQL migrations;
- database views;
- projections;
- RPCs;
- materialized views;
- gate tables;
- RLS policies;
- generated database type changes;
- Supabase usage;
- service-role usage;
- helper implementation;
- route integration;
- route-check modification;
- metadata;
- canonical;
- hreflang;
- Open Graph;
- sitemap;
- schema;
- robots;
- `llms.txt`;
- visible noindex pages;
- indexable pages;
- public UI;
- content generation;
- keyword seed runtime usage;
- CMS UI;
- API handlers;
- seed rows;
- analytics/crawler/background jobs;
- provider listings;
- center listings;
- medical content;
- service descriptions;
- specialty descriptions;
- local area descriptions;
- payment, monetization, sponsored, ranking, referral, commission, entitlement, or plan logic.

## 20. Final Recommendation

Keep the platform fail-closed. Do not implement landing public gate tests yet. Do not implement projection/view SQL yet. Do not implement landing RLS policies yet. Do not implement data-bearing helpers yet. Do not integrate routes yet. Do not expose metadata, sitemap, schema, robots, `llms.txt`, public UI, visible noindex pages, indexable pages, or landing content.

The safest next state after this document is no further action until humans explicitly approve the product/legal/medical/security test model and the projection/RLS/test sequencing.
