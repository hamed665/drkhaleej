# SQL Runtime Test Harness Readiness

## 1. Status and Authority

This document is documentation-only for `SEO-D3H4-J-A`. It records the current readiness posture for introducing SQL-level runtime tests for landing public gate security, `public.landing_page_contents` RLS behavior, future public-safe projection/view behavior, anon/authenticated access behavior, and hidden-row leakage prevention.

This document authorizes no implementation.

Specifically, this document does **not** authorize:

- SQL runtime harness implementation;
- SQL test implementation;
- package script changes;
- `package.json` changes;
- `pnpm-lock.yaml` changes;
- dependency additions;
- Supabase CLI configuration;
- Docker configuration;
- CI modification;
- SQL migrations;
- generated database type changes;
- database views or projections;
- RPCs or functions;
- materialized views or gate tables;
- RLS policies;
- grants;
- seed files or seed rows;
- Supabase usage changes;
- service-role usage;
- route integration;
- data-bearing public query helpers;
- route-check changes;
- metadata, canonical, or hreflang implementation;
- sitemap, schema, robots, or `llms.txt` implementation;
- visible noindex pages;
- indexable pages;
- crawler behavior;
- public UI;
- CMS UI or CMS records;
- API handlers;
- content generation;
- keyword seed runtime usage.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, validation commands, environment/secret posture, and human approval checkpoints.

If this document conflicts with `AGENTS.md`, `README.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, current helper contracts, current route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / SQL runtime test harness readiness documentation-only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-J-A

## 3. Relationship to Prior Phases

### SEO-D3H4-J PLAN

The approved `SEO-D3H4-J` plan concluded that DrMuscat should not implement a SQL runtime harness immediately. It recommended documenting readiness first, preserving current static guardrails, recognizing that static-only validation is insufficient long-term, and preferring a hybrid staged model before any data-bearing helper, route, projection, or RLS SQL implementation.

### SEO-D3H4-H-B Landing Public Gate Static Guardrail

`SEO-D3H4-H-B` created `scripts/db/test-landing-public-gate-static.mjs`, updated `package.json`, and added `test:landing:public-gate`. That phase concluded that the repository has no approved SQL runtime test harness yet and that static guardrails are the smallest safe implementation currently approved.

### SEO-D3H4-I-A Public Landing Data Path Readiness Gate

`SEO-D3H4-I-A` created `docs/seo/PUBLIC_LANDING_DATA_PATH_IMPLEMENTATION_READINESS_GATE.md`. It concluded that documentation-only readiness is GREEN, raw-table public SELECT is RED, data-bearing helper work is RED, route/crawler/metadata/indexing is RED, and projection/RLS/test implementation is YELLOW/BLOCKED pending approval.

### SEO-D3H4-H-A Landing Public Gate Test Implementation Plan

`SEO-D3H4-H-A` created `docs/seo/LANDING_PUBLIC_GATE_TEST_IMPLEMENTATION_PLAN.md`. It concluded that static-only checks and unit-only helper tests are insufficient for security proof, and that future testing should be hybrid and staged.

### SEO-D3H4-D-C Public-Safe Projection/View Implementation Plan

`SEO-D3H4-D-C` documented future public-safe projection/view implementation expectations. It did not authorize implementation. Its conservative direction remains that raw payload-bearing landing content should not be exposed directly, and any future projection/view must be narrow, allowlisted, and leakage-tested before helper reads.

### SEO-D3H4-G-A Landing Content RLS Implementation Plan

`SEO-D3H4-G-A` documented future landing content RLS implementation expectations. It did not authorize RLS SQL. It concluded that public SELECT should not be added to the raw `public.landing_page_contents` table now and that role/review/publisher semantics remain approval-gated.

### SEO-D3H4-C-IMPL-A Landing Content Migration

`SEO-D3H4-C-IMPL-A` created `supabase/migrations/0051_landing_page_contents.sql`, updated generated database types, and updated static validation. Migration `0051` created `public.landing_page_contents`, lifecycle/review enums, constraints, indexes, an `updated_at` trigger, and RLS-enabled/no-policy posture.

Migration `0051` intentionally did not create public SELECT policies, mutation policies, anon access, broad authenticated access, views/projections, RPCs, materialized views, seed rows, helper access, route integration, crawler behavior, or public content.

### SEO-D3H4-E-A RLS Test Strategy Decision Map

`SEO-D3H4-E-A` documented that future projection/view allowlist and leakage tests are required before helper implementation, and that static-only RLS checks are not sufficient proof of actual row visibility or security behavior.

### Route-Check and Static Guardrails

Current route-check and static guardrails help ensure routes, helpers, crawlers, migrations, seeds, and generated types remain in the approved fail-closed posture. They are necessary but not a substitute for future SQL runtime tests.

## 4. Current Runtime Test Harness Baseline

### Existing Static Validators

The repository currently has approved static validators, including:

- `pnpm env:check`;
- `pnpm db:validate:migrations`;
- `pnpm db:validate:seeds`;
- `pnpm test:db:rls`;
- `pnpm test:db:seed`;
- `pnpm test:landing:public-gate`;
- `pnpm routes:check`;
- `pnpm seo:check`.

`db:validate:migrations` reads migration files and validates required files, migration ordering, forbidden patterns, approved RLS files, and current landing-content constraints statically. It does not execute migrations against a database.

`test:db:rls` runs migration validation and static RLS checks. It verifies approved policy-file placement, forbidden broad anon/authenticated access patterns, and current `landing_page_contents` deny-by-default posture by reading SQL source text.

`test:landing:public-gate` statically checks that landing content remains fail-closed across migrations, seeds, generated types, helpers, routes, crawler-facing files, and route-check guardrails.

### Existing Unit Tests

The repository uses Vitest for unit tests under `src/**/*.test.ts`. Current landing helper/indexability tests are unit-level tests and do not exercise a runtime database.

### Existing Package Scripts

Current package scripts include development/build/lint/typecheck, route checks, env checks, static migration/seed/RLS checks, Supabase CLI detection, type generation, database reset, unit tests, and the static landing public gate guardrail. There is no runtime DB test command such as `test:db:runtime`, `test:landing:runtime`, or `test:landing:projection`.

### Existing CI Posture

The current CI workflow runs Node/pnpm checks: install, lint, typecheck, build, routes check, env check, migration validation, seed validation, static RLS tests, static seed tests, and SEO check.

CI does not currently define Supabase services, Postgres services, Docker services, Supabase local start/reset steps, psql execution, pgTAP execution, or runtime DB test jobs.

### SQL Runtime Harness Presence

No approved SQL runtime harness exists.

Evidence:

- `supabase/tests/rls` exists as scaffolding only.
- `supabase/tests/seed` exists as scaffolding only.
- No SQL test files are present under `supabase/tests`.
- No pgTAP usage was found.
- No psql test scripts were found.
- No package script runs runtime database tests.

### Supabase CLI Config Posture

The repository includes a Supabase CLI dependency and a CLI availability check script. `package.json` also contains `db:types` and `db:reset` scripts that depend on Supabase CLI availability.

However, `supabase/config.toml` is absent. Therefore, the presence of Supabase CLI dependency/scripts is not itself an approved local Supabase runtime test harness.

### Docker DB Support Posture

No Docker DB support is currently present for runtime tests.

Evidence:

- `docker-compose.yml` is absent.
- `Dockerfile` is absent.
- CI does not define Docker/Postgres/Supabase service containers.

### Seed and Test-Data Posture

Seed SQL remains forbidden unless a future seed phase is explicitly approved.

Current seed validators require `supabase/seed` to contain no SQL seed files. The current landing public gate static guardrail also forbids seed SQL inserting `public.landing_page_contents` rows.

A future runtime harness therefore needs an explicit, isolated test-data strategy. It must not weaken the seed protocol or introduce seed rows through the normal seed path without approval.

### Environment and Secret Requirements

Current `.env.example` includes public app/site values, Supabase URL and anon key placeholders, and a server-only `SUPABASE_SERVICE_ROLE_KEY` placeholder.

Current env validation checks public app/Supabase env keys. It does not define or validate `DATABASE_URL`, local Postgres credentials, Supabase local runtime variables, pgTAP variables, or runtime test credentials.

A future runtime harness must avoid production secrets. It should prefer local generated test credentials, local ephemeral database credentials, or CI-local service credentials. Service-role credentials must not become part of public route/helper behavior.

### Current `landing_page_contents` RLS Baseline

Current migration `0051_landing_page_contents.sql` creates `public.landing_page_contents` and enables RLS.

Current static RLS posture requires:

- RLS enabled on `public.landing_page_contents`;
- no policies on `public.landing_page_contents`;
- no anon access;
- no broad authenticated access;
- no public SELECT or mutation policies;
- no seed rows.

This is a deny-by-default baseline, not a runtime proof.

### Generated `public.Views` Posture

Generated database types currently keep `public.Views` empty. No generated public-safe landing projection/view type exists.

### Helper Fail-Closed Posture

The public landing query helper remains fail-closed:

- no source tables;
- no imports;
- no Supabase reads;
- no service-role usage;
- no database queries;
- no content payload reads;
- returns unavailable/fail-closed gate data.

### Route and Crawler Fail-Closed Posture

Current landing route scaffolds remain fail-closed with `notFound()` behavior. Current sitemap, robots, and `llms.txt` do not expose landing content or landing helper output.

## 5. SQL Runtime Test Goals

Future SQL runtime tests, if separately approved, should prove behavior that static source scans cannot prove.

### Initial Deny-by-Default Goals

A first runtime harness should test that:

- `anon` cannot read raw `public.landing_page_contents`;
- authenticated users without an approved landing role cannot read raw `public.landing_page_contents`;
- provider/center-scoped users cannot mutate global landing content;
- patient users cannot mutate global landing content;
- there is no raw public SELECT path for `public.landing_page_contents`;
- mutation policies do not exist before an approved role/review/publisher model;
- public route/helper paths do not use service-role access.

### Later Projection/View Goals

Projection/view runtime tests should wait until a projection/view is explicitly approved and exists. Those tests should prove that:

- the projection/view exposes only allowlisted gate-safe fields;
- payload fields are not exposed;
- reviewer, actor, admin, workflow, and internal fields are not exposed;
- provider/center lists are not exposed;
- raw rows are not exposed;
- hidden-row existence is not leaked through counts, duplicates, errors, or timing-sensitive helper states;
- hidden-row count leakage is prevented;
- duplicate canonical candidates fail closed;
- ambiguous identity fails closed;
- missing rows fail closed;
- area canonicalization constraints are respected;
- specialty relationship semantics are respected;
- RLS is not bypassed.

## 6. Candidate Runtime Harness Models

### Option A — Keep Static-Only for Now

- Pros:
  - No new files, dependencies, CI services, Docker setup, or Supabase config.
  - Preserves current fail-closed guardrails.
  - No production secret risk.
  - Lowest immediate implementation risk.
- Cons:
  - Cannot prove runtime row visibility.
  - Cannot prove role switching, Postgres RLS behavior, Supabase auth-claim behavior, hidden-row leakage, or helper/database integration behavior.
- Repo fit:
  - Strong immediate fit because current approved checks are static.
- Dependencies:
  - None beyond current dependencies.
- CI impact:
  - None.
- Local developer impact:
  - None.
- Secret/env requirements:
  - None beyond current env checks.
- Security confidence:
  - Medium for source guardrails; low for runtime proof.
- Implementation risk:
  - Low.
- Recommendation:
  - Acceptable only as the current temporary posture. Not sufficient long-term before data-bearing helper/route/projection/RLS implementation.

### Option B — Supabase CLI Local DB Runtime Tests

- Pros:
  - Closest future fit for Supabase/Postgres semantics.
  - Can apply migrations locally and test RLS under local anon/authenticated/service setup.
  - Can later align with Supabase SQL test conventions if approved.
- Cons:
  - `supabase/config.toml` is currently absent.
  - Likely requires local Docker/Supabase runtime decisions.
  - Can increase CI duration and flakiness.
- Repo fit:
  - Medium. Supabase CLI dependency and check scripts exist, but no local config/harness is approved.
- Dependencies:
  - Supabase CLI and likely Docker/local service support.
- CI impact:
  - Requires approval for DB services or Supabase local runtime in CI.
- Local developer impact:
  - Requires developers to install/run local Supabase prerequisites.
- Secret/env requirements:
  - Should use local generated credentials only; no production secrets.
- Security confidence:
  - High if implemented carefully.
- Implementation risk:
  - Medium.
- Recommendation:
  - Preferred future candidate if humans approve Supabase CLI config, local runtime requirements, CI service posture, and test data strategy.

### Option C — psql Against Ephemeral Postgres in CI

- Pros:
  - Simple and explicit SQL execution model.
  - Can use CI-local Postgres credentials.
  - Avoids production secrets.
  - Can prove migration application and direct RLS behavior in a real database.
- Cons:
  - May not fully match Supabase auth/JWT/PostgREST semantics.
  - Requires careful emulation of Supabase roles/claims.
  - No current psql test scripts exist.
- Repo fit:
  - Medium as a future fallback if Supabase CLI is rejected.
- Dependencies:
  - Postgres service, psql, runtime SQL assertions.
- CI impact:
  - Requires CI database service and migration/test execution steps.
- Local developer impact:
  - Requires local Postgres or containerized Postgres.
- Secret/env requirements:
  - CI/local ephemeral credentials only.
- Security confidence:
  - Medium to high for direct SQL/RLS behavior; lower for Supabase-specific behavior.
- Implementation risk:
  - Medium.
- Recommendation:
  - Viable future fallback, but should not be implemented before human approval of auth emulation and CI DB services.

### Option D — pgTAP-Based Database Tests

- Pros:
  - SQL-native test assertions.
  - Strong fit for database contract testing.
  - Can express RLS and projection expectations close to the database.
- Cons:
  - No pgTAP usage currently exists.
  - Requires extension/package support.
  - Adds dependency and maintenance complexity.
- Repo fit:
  - Low to medium because there is no existing pgTAP convention.
- Dependencies:
  - pgTAP extension and test runner support.
- CI impact:
  - Requires DB image or setup step with pgTAP installed.
- Local developer impact:
  - Requires local pgTAP availability.
- Secret/env requirements:
  - Local/CI database credentials only; no production secrets.
- Security confidence:
  - High for SQL assertions if stable.
- Implementation risk:
  - Medium to high.
- Recommendation:
  - Defer unless the team explicitly approves pgTAP as the database testing standard.

### Option E — Node Integration Tests Against Local Supabase/Postgres

- Pros:
  - Fits current TypeScript/Vitest testing ecosystem.
  - Useful later for helper integration and error normalization behavior.
  - Can test app-level Supabase client behavior after SQL harness basics exist.
- Cons:
  - Still requires local database/Supabase runtime setup.
  - Can blur boundaries if introduced before SQL-layer deny/projection tests.
  - Can accidentally normalize service-role patterns if not strictly guarded.
- Repo fit:
  - Medium for future helper integration, not first-line SQL proof.
- Dependencies:
  - Local Supabase/Postgres runtime and possibly additional test env configuration.
- CI impact:
  - Requires CI database/runtime services if CI-required.
- Local developer impact:
  - Requires local database/runtime setup.
- Secret/env requirements:
  - Local anon/auth credentials only; no production service role for public paths.
- Security confidence:
  - Medium to high for app integration; should complement SQL tests rather than replace them.
- Implementation risk:
  - Medium.
- Recommendation:
  - Defer until deny-by-default SQL tests and projection/view tests exist and pass.

### Option F — Hybrid Staged Model

- Pros:
  - Preserves current static guardrails.
  - Adds the smallest approved runtime layer later.
  - Tests deny-by-default RLS first.
  - Adds projection/view allowlist and leakage tests only after projection exists.
  - Adds helper integration tests only after projection/RLS tests pass.
  - Minimizes blast radius and aligns with `PHASED_BUILD_ONLY`.
- Cons:
  - Requires multiple explicit approvals and staged work.
  - Slower than implementing all layers at once.
- Repo fit:
  - Strong. This matches current documentation, current static guardrails, and the approved conservative sequence.
- Dependencies:
  - None now; future dependency choices depend on approved harness model.
- CI impact:
  - None now; future impact depends on whether CI DB services are approved.
- Local developer impact:
  - None now; future impact can be staged local-only first if approved.
- Secret/env requirements:
  - No production secrets; future local/CI-only credentials.
- Security confidence:
  - Highest over time because it layers static, SQL runtime, projection, and helper tests in order.
- Implementation risk:
  - Low now; controlled later.
- Recommendation:
  - Recommended conservative direction.

## 7. Recommended Conservative Decision

Current decision for `SEO-D3H4-J-A`:

- Do not implement a runtime harness now.
- Document readiness first.
- Treat static-only validation as useful but insufficient long-term.
- Keep current static guardrails.
- Prefer the hybrid staged model.
- Choose the smallest future runtime harness that does not require production secrets.
- Do not add helper, route, projection SQL, RLS SQL, seed data, crawler behavior, metadata, sitemap, schema, robots, `llms.txt`, visible pages, indexable pages, or content before the runtime test approach is approved.

## 8. Future File-Scope Proposal

If a later SQL runtime harness implementation is explicitly approved, likely files could include:

- `package.json` only if a script is needed;
- `scripts/db/*` only if following the current script convention;
- `supabase/tests/*` only if Supabase CLI SQL test convention is approved;
- `.github/workflows/*` only if CI needs a DB service or runtime test job;
- `supabase/config.toml` only if Supabase CLI local DB is approved.

Future runtime harness work should not modify production routes, helpers, migrations, generated types, sitemap, robots, `llms.txt`, public UI, API handlers, or crawler behavior except in a separately approved SQL/RLS/projection/helper/route phase.

Generated database types should not change unless a schema change, view/projection, RPC/function, or generated-type refresh is explicitly approved.

## 9. Future Validation Commands

### Existing Commands to Keep

Future readiness or implementation phases should continue to consider the current validation set:

- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm test:landing:public-gate`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm routes:check`
- `pnpm build`
- `pnpm lint`
- `pnpm seo:check`

### Candidate Future Command Names

Potential future command names, if separately approved and implemented, could include:

- `test:db:runtime`
- `test:landing:runtime`
- `test:landing:projection`

These command names are not implemented or authorized by this document.

## 10. Human Approval Checkpoints

Before any runtime harness implementation, humans must explicitly approve:

- runtime harness model;
- whether Supabase CLI is acceptable;
- whether CI may run DB services;
- whether new dependencies/extensions are allowed;
- test data strategy;
- environment/secret posture;
- CI failure behavior;
- whether runtime tests are local-only first or CI-required;
- ordering relative to RLS/projection SQL;
- confirmation that no helper, route, crawler, sitemap, metadata, schema, `robots.ts`, or `llms.txt` changes are included in the runtime harness phase.

## 11. Recommended Next Subphase

Recommended next subphase: no further implementation until human decision.

Do not proceed directly to:

- `SEO-D3H4-J-B — SQL Runtime Test Harness Implementation`;
- `SEO-D3H4-D-D — Public-Safe Projection/View SQL Implementation`;
- `SEO-D3H4-G-B — Landing Content RLS SQL Implementation`.

A future implementation phase may be appropriate only after humans approve the runtime harness model, env/secret posture, CI posture, test data strategy, failure behavior, ordering relative to RLS/projection SQL, and exact allowed files.

## 12. Exact Allowed Files for Next Recommended Task

Because the recommendation is no further implementation until human decision, the next recommended task has no allowed implementation files.

If humans later approve runtime harness implementation, exact allowed files must be listed in that future task and should be limited to the minimum necessary files for the approved harness model.

## 13. Exact Forbidden Files for Next Recommended Task

Until a future task explicitly approves otherwise, the following remain forbidden for the next task:

- `package.json`;
- `pnpm-lock.yaml`;
- `scripts/db/*`;
- `.github/*`;
- `supabase/*`;
- `src/app/*`;
- `src/lib/*`;
- routes;
- helpers;
- route-check;
- migrations;
- generated types;
- sitemap, robots, and `llms.txt`;
- `data/seo`;
- tests;
- Docker/Supabase config;
- public UI/content files;
- API handlers.

## 14. Risks

- Static checks may create false confidence if treated as runtime security proof.
- A psql-only harness may miss Supabase-specific auth and claim behavior.
- Supabase CLI runtime testing may require new config, Docker assumptions, and CI service decisions.
- pgTAP may add extension and maintenance complexity.
- Node integration tests may be introduced too early and bypass SQL-level proof.
- Runtime tests need isolated fixtures without violating current seed restrictions.
- Service-role credentials must not become part of public landing helper or route paths.
- Projection/RLS/helper implementation before runtime harness approval could expose payload, workflow, reviewer, actor, or hidden-row information.

## 15. Final Recommendation

Final recommendation for `SEO-D3H4-J-A`:

- Keep this phase documentation-only.
- Do not implement SQL runtime tests now.
- Do not implement projection/view SQL now.
- Do not implement landing RLS policies now.
- Do not implement data-bearing helpers now.
- Do not integrate routes/crawlers/metadata/sitemap/schema/robots/`llms.txt` now.
- Wait for human approval of the runtime harness model and all associated file, CI, dependency, test data, and env/secret decisions before any implementation.
