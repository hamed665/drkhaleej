# SQL Runtime Test Harness Implementation Plan

## 1. Status and Authority

This document is documentation-only for `SEO-D3H4-J-C`. It records a conservative future implementation plan for a smallest-safe SQL runtime test harness for DrMuscat landing public gate security, `public.landing_page_contents` deny-by-default RLS behavior, future projection/view testing, anon/authenticated behavior, and hidden-row leakage prevention.

This document authorizes no implementation.

Specifically, this document does **not** authorize:

- runtime harness implementation;
- SQL test implementation;
- package script changes;
- `package.json` changes;
- `pnpm-lock.yaml` changes;
- dependency additions;
- Supabase CLI configuration;
- Docker configuration;
- CI modification;
- SQL or migration changes;
- database views or projections;
- RPCs or functions;
- materialized views or gate tables;
- RLS policies;
- grants;
- seed files or seed rows;
- generated database type changes;
- Supabase usage changes;
- service-role usage;
- route integration;
- data-bearing public query helpers;
- route-check changes;
- metadata, canonical, or hreflang implementation;
- sitemap, schema, robots, or `llms.txt` implementation;
- visible noindex pages;
- indexable pages;
- route, crawler, metadata, or content behavior;
- public UI;
- CMS UI or CMS records;
- API handlers;
- content generation;
- keyword seed runtime usage.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, validation commands, environment/secret posture, CI behavior, test-data strategy, stop conditions, and human approval checkpoints.

If this document conflicts with `AGENTS.md`, `README.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, current helper contracts, current route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / SQL runtime test harness implementation plan documentation-only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-J-C

## 3. Relationship to Prior Phases

### SEO-D3H4-J-B PLAN

`SEO-D3H4-J-B` produced the approved plan-only report for this document. It recommended a hybrid staged model, no actual runtime harness scaffold next, no Supabase/Docker/CI/package changes now, and a documentation-only implementation plan as the next conservative step.

### SEO-D3H4-J-A SQL Runtime Test Harness Readiness

`SEO-D3H4-J-A` created `docs/seo/SQL_RUNTIME_TEST_HARNESS_READINESS.md`. It concluded that no approved SQL runtime harness exists, static-only validation remains useful but insufficient long-term, current static guardrails must stay, the preferred future direction is a hybrid staged model, future runtime harness work must avoid production secrets, and no helper, route, projection SQL, or RLS SQL should be implemented before the runtime test approach is approved.

### SEO-D3H4-H-B Landing Public Gate Static Guardrail

`SEO-D3H4-H-B` created `scripts/db/test-landing-public-gate-static.mjs`, updated `package.json`, and added `test:landing:public-gate`. That phase concluded that the static guardrail is the smallest safe implementation currently approved and that SQL-level runtime tests remain blocked pending explicit database runtime harness approval.

### SEO-D3H4-I-A Public Landing Data Path Readiness Gate

`SEO-D3H4-I-A` created `docs/seo/PUBLIC_LANDING_DATA_PATH_IMPLEMENTATION_READINESS_GATE.md`. It concluded that documentation-only readiness is GREEN, raw table public SELECT is RED, data-bearing helper work is RED, route/crawler/metadata/indexing is RED, and projection/RLS/test implementation is YELLOW/BLOCKED pending approval.

### SEO-D3H4-H-A Landing Public Gate Test Implementation Plan

`SEO-D3H4-H-A` created `docs/seo/LANDING_PUBLIC_GATE_TEST_IMPLEMENTATION_PLAN.md`. It concluded that static-only checks and unit-only helper tests are insufficient for security proof and that future testing should be hybrid and staged.

### SEO-D3H4-D-C Public-Safe Projection/View Implementation Plan

`SEO-D3H4-D-C` documented future public-safe projection/view implementation expectations. It did not authorize implementation. Its conservative direction remains that raw payload-bearing landing content should not be exposed directly and that any future projection/view must be narrow, allowlisted, and leakage-tested before helper reads.

### SEO-D3H4-G-A Landing Content RLS Implementation Plan

`SEO-D3H4-G-A` documented future landing content RLS implementation expectations. It did not authorize RLS SQL. It concluded that public SELECT should not be added to the raw `public.landing_page_contents` table now and that role/review/publisher semantics remain approval-gated.

### SEO-D3H4-C-IMPL-A Landing Content Migration

`SEO-D3H4-C-IMPL-A` created `supabase/migrations/0051_landing_page_contents.sql`, updated generated database types, and updated static validation. Migration `0051` created `public.landing_page_contents`, lifecycle/review enums, constraints, indexes, an `updated_at` trigger, and an RLS-enabled/no-policy posture. It intentionally did not create public SELECT policies, mutation policies, anon access, broad authenticated access, views/projections, RPCs, materialized views, seed rows, helper access, route integration, crawler behavior, or public content.

### Route-Check and Static Guardrails

Current route-check and static guardrails help ensure routes, helpers, crawlers, migrations, seeds, and generated types remain in the approved fail-closed posture. They are necessary but not a substitute for future SQL runtime tests.

## 4. Current Implementation Baseline

### No Approved Runtime Harness

No approved SQL runtime harness exists. Current evidence remains:

- `supabase/tests/rls` exists as scaffolding only.
- `supabase/tests/seed` exists as scaffolding only.
- no SQL test files are present under `supabase/tests`;
- no pgTAP usage is present;
- no psql runtime test scripts are present;
- no package script runs runtime database tests.

### Supabase CLI Dependency and Script Posture

The repository already includes a Supabase CLI dependency and a CLI availability check script. `package.json` also contains `db:types` and `db:reset` scripts that depend on Supabase CLI availability.

This is not an approved runtime harness. Supabase CLI presence does not authorize local Supabase runtime tests, Supabase config creation, Docker assumptions, runtime SQL assertions, CI DB jobs, or any production/data-bearing behavior.

### Missing `supabase/config.toml`

`supabase/config.toml` is absent. Therefore, any Supabase CLI local DB runtime model would require a future explicit approval to create or modify Supabase configuration.

### Missing Docker DB Support

No Docker DB support is currently present for runtime tests:

- `docker-compose.yml` is absent;
- `Dockerfile` is absent;
- CI does not define Docker/Postgres/Supabase service containers.

### CI DB-Service Absence

The current CI workflow runs Node/pnpm validation only. It does not define a database service, Supabase local runtime, Postgres service, Docker service, Supabase start/reset step, psql execution, pgTAP execution, or SQL runtime test job.

### `supabase/tests` Scaffold-Only Posture

`supabase/tests/rls/.gitkeep` and `supabase/tests/seed/.gitkeep` are present. No real SQL tests are present under `supabase/tests`.

### No pgTAP

No pgTAP tests, pgTAP extension setup, or pgTAP runner convention exists. pgTAP would be a new database testing standard and must not be introduced without explicit approval.

### No psql Runtime Scripts

No psql runtime test scripts exist. A future psql model would need explicit approval for how it applies migrations, emulates Supabase roles/claims, manages credentials, and reports failures.

### No Runtime DB Package Scripts

Current package scripts include static migration/seed/RLS checks, static landing public gate checks, unit tests, routes check, env check, build, lint, typecheck, and SEO check. There is no `test:db:runtime`, `test:landing:runtime`, or `test:landing:projection` command.

### Current Static Guardrails

Current approved static guardrails include:

- `pnpm env:check`;
- `pnpm db:validate:migrations`;
- `pnpm db:validate:seeds`;
- `pnpm test:db:rls`;
- `pnpm test:db:seed`;
- `pnpm test:landing:public-gate`;
- `pnpm routes:check`;
- `pnpm seo:check`.

These guardrails must stay in place. Future runtime tests should complement them, not replace or weaken them.

### Current Env and Secret Posture

Current `.env.example` includes public app/site values, Supabase URL and anon key placeholders, and a server-only `SUPABASE_SERVICE_ROLE_KEY` placeholder. Current env validation checks public app/Supabase env keys. It does not define or validate `DATABASE_URL`, `POSTGRES_URL`, local Postgres credentials, Supabase local runtime variables, pgTAP variables, or runtime test credentials.

A future runtime harness must avoid production secrets, avoid production databases, avoid committed `.env.local`, avoid hardcoded service-role keys, and avoid service-role use in public helper or route code.

### Current Seed and Test-Data Posture

Seed SQL remains forbidden unless a future seed phase is explicitly approved. Current seed validators require `supabase/seed` to contain no SQL seed files. The current landing public gate static guardrail also forbids seed SQL inserting `public.landing_page_contents` rows.

A future runtime harness therefore needs an explicit isolated test-data strategy. It must not weaken seed policy or introduce production seed rows.

### Current Landing Table and RLS Posture

`public.landing_page_contents` exists and RLS is enabled. The current posture is deny-by-default:

- RLS enabled on `public.landing_page_contents`;
- no policies on `public.landing_page_contents`;
- no anon access;
- no broad authenticated access;
- no public SELECT or mutation policies;
- no seed rows.

This is a source/static baseline, not a runtime proof.

### Current Generated Type Posture

Generated `public.Views` remains empty. Generated database types do not include a public-safe landing projection/view. A future projection/view or RPC phase would need explicit approval for SQL changes and generated type refresh.

### Current Helper, Route, and Crawler Fail-Closed Posture

The public landing helper remains a fail-closed skeleton with zero imports and no Supabase/service-role/table/projection access. The current landing routes remain fail-closed. Sitemap, robots, and `llms.txt` do not expose landing content. The static landing gate script checks these postures across helper, route, crawler-facing files, generated types, seeds, and migrations.

## 5. Proposed Future Implementation Model

The recommended future model is the **hybrid staged model**.

Required properties:

- preserve current static guardrails;
- start with the smallest approved deny-by-default runtime tests;
- avoid production secrets;
- avoid production databases;
- avoid helper changes in the first harness implementation;
- avoid route changes in the first harness implementation;
- avoid projection/view SQL in the first harness implementation;
- avoid RLS policy SQL in the first harness implementation;
- avoid grants in the first harness implementation;
- avoid seed rows and content in the first harness implementation;
- add projection/view runtime tests only after a projection/view exists;
- add helper integration tests only after projection/RLS tests pass;
- require explicit human approval before each stage.

This model is preferred because it adds security proof in layers without widening the public data path prematurely.

## 6. Future Implementation Phases

### J-B1 / J-C — Documentation-Only Implementation Plan

This document is the documentation-only implementation plan. It records the future model, sequencing, file scopes, data strategy, env/secret strategy, CI strategy, first-harness assertions, deferred assertions, approvals, stop conditions, and next-step recommendation.

No runtime harness is implemented in this phase.

### J-D — Minimal Runtime Harness Scaffold, Local-Only or CI-Optional

A future `SEO-D3H4-J-D` phase may be considered only after human approval. Its narrowest possible scope would scaffold the selected runtime harness model without adding RLS policies, projections/views, helper access, route access, seed rows, content, or public data behavior.

The conservative default should be local-only or CI-optional first, not CI-required.

### J-E — Deny-by-Default Raw Landing Table Runtime Tests

A future `SEO-D3H4-J-E` phase may add actual runtime assertions for the raw `public.landing_page_contents` table deny-by-default posture after the harness scaffold exists and is approved.

The first assertions should prove migration application, table existence, RLS enabled, anon/authenticated denial, lack of public SELECT, lack of mutation policies, no service-role public path, and no seed data requirement if possible.

### J-F — CI-Required Runtime Tests if Stable

A future `SEO-D3H4-J-F` phase may promote runtime tests to required CI only after local/advisory runtime testing is stable and humans approve CI DB services, failure behavior, runtime cost, and env/secret posture.

### J-G — Projection/View Runtime Tests After Projection Exists

A future `SEO-D3H4-J-G` phase may add projection/view runtime tests only after a separately approved projection/view exists. These tests should cover allowlisted fields, hidden-row leakage prevention, published/approved visibility, and private payload exclusion.

### J-H — Helper Integration Tests After Projection/RLS Tests Pass

A future `SEO-D3H4-J-H` phase may add helper integration tests only after projection/RLS runtime tests pass. These tests should prove that helpers use only approved public-safe sources, fail closed, do not use service-role credentials, and do not leak hidden-row or workflow details.

## 7. Recommended First Actual Implementation Scope

No actual implementation should happen now.

The first actual implementation should happen only after this documentation-only plan and explicit human approval of harness model, exact file scope, env/secret posture, CI behavior, test data strategy, and stop conditions.

If approved later, the smallest possible first harness must include:

- no production DB;
- no production secrets;
- no helper changes;
- no route changes;
- no RLS policies;
- no projection/view;
- no grants;
- no migrations;
- no generated type changes;
- no seed rows;
- no content;
- no seed policy weakening;
- no service-role in public helper or route code.

## 8. Candidate File Scopes for Future Actual Harness

These are candidate scopes only and are not approved by this document.

| Candidate scope | Possible purpose | Risk | Conservative rule |
| --- | --- | --- | --- |
| `package.json` script | Add one approved runtime test command | Can change project command/CI expectations | Only if explicitly approved |
| `scripts/db/*` runtime runner | Follow existing DB script convention for a runner | Can introduce env/secret assumptions | Only one minimal runner if approved |
| `supabase/tests/rls` SQL test files | Store SQL assertions if Supabase CLI test convention is approved | Current folder is scaffold-only | Only after harness model approval |
| `supabase/config.toml` | Configure local Supabase CLI runtime | Introduces Supabase/Docker runtime assumptions | Only if Supabase CLI model is approved |
| `.github/workflows/ci.yml` | Add DB service or runtime test job | Affects CI reliability and required checks | Defer until local/advisory tests are stable |
| `.env.example` | Document local-only runtime DB variables | Changes env contract | Only if env docs are explicitly approved |

No production routes, helpers, migrations, generated types, sitemap, robots, `llms.txt`, public UI, API handlers, crawler behavior, metadata, content, or route-check changes should be included in a harness-only phase.

## 9. Test Data Strategy

### No Data Needed for Empty-Table Deny-by-Default Tests

This is the preferred first strategy if the selected harness can prove raw-table denial without fixture rows.

Benefits:

- smallest blast radius;
- no seed policy changes;
- no content rows;
- no production seed path;
- enough to prove table existence, RLS enabled, and denied anon/authenticated raw table behavior.

Limitations:

- cannot prove hidden-row leakage;
- cannot prove published/approved filtering;
- cannot prove duplicate canonical fail-closed behavior.

### Transaction-Scoped Fixture Inserts

This is a later strategy for leakage and projection tests that need rows. Fixtures must be inserted and rolled back within the runtime test transaction or equivalent isolated lifecycle.

Benefits:

- can test hidden/published/draft/deleted rows;
- avoids persistent content;
- avoids production seed path.

Risks:

- requires privileged setup inside the harness;
- requires strict rollback discipline;
- requires approved role switching and fixture ownership semantics.

### Temp Schema or Test Table Strategy

This can validate harness mechanics but is not sufficient as the main landing RLS proof because it does not prove `public.landing_page_contents` behavior.

### Local-Only Isolated Seed Under `supabase/tests`

This may be considered only if humans approve a Supabase CLI test convention. Test fixtures under `supabase/tests` must remain isolated from production seed behavior and must not weaken `supabase/seed` restrictions.

### Production Seed Path Prohibited

The production seed path remains prohibited for this harness. No future runtime test should require SQL seed files or landing content rows under `supabase/seed` unless a separate seed phase explicitly approves it.

### Service-Role Setup Boundary

If privileged setup is ever required, it must exist only inside the isolated test harness. Service-role credentials must never be used in public helper or route code and must never become part of public landing behavior.

## 10. Secret and Environment Strategy

Required strategy for any future runtime harness:

- no production secrets;
- no production database;
- no committed `.env.local`;
- no hardcoded service-role keys;
- no service-role in public helper code;
- no service-role in public route code;
- no service-role in client bundles;
- CI secrets avoided if possible;
- `.env.example` changes only if separately approved;
- no logging of tokens, database passwords, auth cookies, webhook secrets, or service keys.

If a Supabase CLI model is chosen later, prefer local generated Supabase credentials from the local Supabase runtime. Do not use production Supabase project credentials.

If a psql/ephemeral Postgres model is chosen later, use ephemeral local or CI database credentials only. Prefer credentials scoped to the local process or CI job, not repository secrets.

## 11. CI Strategy

### Local-Only First

Recommended first actual posture if implementation is later approved. This avoids immediate CI service complexity and lets the team prove harness stability before making it required.

### CI Advisory or Manual

A later advisory/manual CI mode may be useful after local stability. It can validate feasibility without blocking all pull requests while flakiness, runtime, and service configuration are evaluated.

### CI Required

CI-required runtime tests should be deferred until the harness is stable and humans approve DB services, failure behavior, runtime cost, env/secret posture, and local/CI parity.

### GitHub Actions DB Service

A GitHub Actions Postgres service may be viable if a psql model is chosen, but it must address Supabase role/claim emulation. It must not use production credentials.

### Supabase CLI in CI

Supabase CLI in CI may better match Supabase behavior, but it likely requires `supabase/config.toml`, Docker availability, Supabase local runtime steps, and explicit CI approval. It must not be introduced in this documentation-only phase.

### Failure Behavior

Failure behavior must be explicit before implementation. The team must decide whether a command is local-only, advisory/manual, or CI-required, and whether failures block merges.

## 12. Runtime Test Assertions for First Harness

The first harness should prove only the minimal deny-by-default raw landing table behavior.

Candidate first-harness assertions:

1. migrations apply successfully;
2. `public.landing_page_contents` exists;
3. RLS is enabled on `public.landing_page_contents`;
4. anon cannot read the raw table;
5. authenticated non-role users cannot read the raw table;
6. anon cannot insert into the raw table;
7. anon cannot update the raw table;
8. anon cannot delete from the raw table;
9. authenticated non-role users cannot insert into the raw table;
10. authenticated non-role users cannot update the raw table;
11. authenticated non-role users cannot delete from the raw table;
12. no public SELECT policy exists on the raw table;
13. no mutation policies exist on the raw table;
14. no service-role public helper or route path exists;
15. no seed data is required for initial empty-table deny-by-default tests if possible.

These assertions should not create content, routes, helper reads, projections/views, policies, grants, or public data exposure.

## 13. Explicitly Deferred Assertions

The following assertions are explicitly deferred until later approved phases:

- projection/view allowlist tests;
- hidden-row count leakage tests;
- duplicate canonical fail-closed tests;
- ambiguous identity fail-closed tests;
- helper integration tests;
- route/crawler/metadata tests beyond current static guardrails;
- medical review workflow tests;
- landing editor mutation tests;
- landing reviewer mutation tests;
- landing publisher mutation tests;
- published/approved content visibility tests;
- draft content leakage tests;
- deleted content leakage tests;
- rejected content leakage tests;
- private content leakage tests;
- canonical URL runtime tests;
- hreflang runtime tests;
- indexability runtime tests;
- sitemap runtime exposure tests;
- schema runtime exposure tests;
- robots runtime exposure tests;
- `llms.txt` runtime exposure tests.

## 14. Human Approval Checkpoints

Before any actual runtime harness implementation, humans must explicitly approve:

- harness model;
- whether Supabase CLI config is allowed;
- whether psql is allowed;
- whether a GitHub Actions DB service is allowed;
- CI behavior: local-only, advisory/manual, or required;
- test data strategy;
- env/secret posture;
- package/script changes;
- exact script name, if any;
- exact allowed files;
- exact forbidden files;
- confirmation that no production route changes are allowed;
- confirmation that no production helper changes are allowed;
- confirmation that no RLS policy SQL is included in the first harness;
- confirmation that no projection/view SQL is included in the first harness;
- stop conditions;
- failure behavior.

Approval cannot be assumed. The agent must stop after each phase and wait for explicit approval before continuing.

## 15. Stop Conditions

Stop immediately if any of the following occur:

- Supabase CLI model is selected but `supabase/config.toml` creation is not approved;
- Docker is unavailable when the selected model requires Docker;
- CI DB service is unavailable when selected CI behavior requires it;
- production secrets are required;
- production database access is required;
- seed policy weakening is required;
- route changes are required;
- helper changes are required;
- route-check relaxation is required;
- RLS policy SQL is required before approval;
- projection/view SQL is required before approval;
- generated type changes are required before approval;
- package changes exceed the approved scope;
- validation fails;
- a migration fails;
- a protected table lacks RLS;
- a secret-like string appears;
- Supabase auth/role/claim emulation is ambiguous;
- guessing is required.

Stopping is the correct outcome when continuing would require unsafe assumptions.

## 16. Recommended Next Subphase

Recommended next subphase: **no further action until human product/legal/medical decision**.

Do not proceed directly to:

- `SEO-D3H4-J-D — SQL Runtime Test Harness Scaffold Implementation`;
- `SEO-D3H4-G-B — Landing Content RLS SQL Implementation`;
- `SEO-D3H4-D-D — Public-Safe Projection/View SQL Implementation`.

A future implementation phase may be appropriate only after humans approve the runtime harness model, exact file scope, env/secret posture, CI behavior, test-data strategy, stop conditions, and failure behavior.

## 17. Exact Allowed Files for Next Recommended Task

Because the recommended next subphase is no further implementation until human decision, the next recommended task has no allowed implementation files.

If humans later approve a future implementation phase, that phase must explicitly list only the files needed for the approved model.

## 18. Exact Forbidden Files for Next Recommended Task

Until a future task explicitly approves otherwise, the following remain forbidden:

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

## 19. Validation Expectations for This Documentation-Only Task

For this documentation-only task, expected validation commands are:

- `git status --short`;
- `test -f docs/seo/SQL_RUNTIME_TEST_HARNESS_IMPLEMENTATION_PLAN.md && echo "SEO-D3H4-J-C SQL runtime test harness implementation plan exists"`;
- `pnpm env:check`;
- `pnpm db:validate:migrations`;
- `pnpm test:db:rls`;
- `pnpm test:landing:public-gate`;
- `pnpm typecheck`;
- `pnpm test:unit`;
- `pnpm routes:check`;
- `pnpm build`;
- `pnpm lint`;
- `pnpm seo:check` if applicable.

No validation command may be faked or skipped silently.

## 20. Final Recommendation

Final recommendation for `SEO-D3H4-J-C`:

- keep this phase documentation-only;
- do not implement a runtime harness now;
- do not implement SQL tests now;
- do not modify package scripts now;
- do not modify CI now;
- do not add Supabase or Docker config now;
- do not implement projection/view SQL now;
- do not implement landing RLS policies now;
- do not add grants now;
- do not add seed rows or content now;
- do not implement data-bearing helpers now;
- do not integrate routes/crawlers/metadata/sitemap/schema/robots/`llms.txt` now;
- wait for human approval of the runtime harness model and all associated file, CI, dependency, test data, env/secret, stop-condition, and failure-behavior decisions before any implementation.
