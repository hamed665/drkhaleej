# Public-Safe Projection/View Implementation Plan

## 1. Status and Authority

This document is documentation-only for `SEO-D3H4-D-C`. It records a conservative implementation plan for a future public-safe projection/view strategy for landing page gate data after `public.landing_page_contents` was created in migration `0051_landing_page_contents.sql` with RLS enabled and no access policies.

This document does **not** authorize:

- SQL implementation;
- database migrations;
- database views or projections;
- RPCs or functions;
- materialized views or gate tables;
- RLS policies;
- test implementation;
- generated database type changes;
- Supabase usage;
- service-role usage;
- route integration;
- data-bearing query helpers;
- route-check changes;
- metadata, canonical, or hreflang output;
- sitemap, schema, robots, or `llms.txt` changes;
- visible noindex pages;
- indexable pages;
- public UI;
- content generation;
- keyword seed runtime usage;
- CMS records;
- API handlers;
- crawler behavior;
- analytics or background jobs.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with explicit four-axis mapping, approved files, forbidden scope, validation requirements, and human approval checkpoints.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / public-safe landing projection/view implementation plan documentation-only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-D-C

## 3. Relationship to Prior Phases

This document implements the previously approved `SEO-D3H4-D-B` plan-only report as a documentation-only artifact. It does not expand scope beyond that plan.

Relevant prior planning and implementation context:

- `SEO-D3H4-D-B` plan-only report: recommended documentation-only implementation before any SQL projection/view work.
- `SEO-D3H4-G-A` landing content RLS implementation plan: concluded that raw `landing_page_contents` public SELECT should not be added now, because RLS is row-level rather than column-level and the raw table contains payload and actor/reviewer/internal fields.
- `SEO-D3H4-D-A` public-safe projection/view decision map: preferred future helper reads from a public-safe projection/view, deferred RPC/function and materialized gate models, and kept helpers fail-closed.
- `SEO-D3H4-C-IMPL-A` migration: created `public.landing_page_contents`, lifecycle/review enums, constraints, indexes, trigger, and RLS-enabled/no-policy posture.
- `SEO-D3H4-E-A` RLS test strategy decision map: required projection/view allowlist and leakage tests before helper implementation and stated that unit-only mocked helper tests and static-only RLS checks are insufficient.
- `SEO-D3H4-B-A` specialty relationship semantics decision map: blocked unsafe inference from interchangeable service/specialty relationship signals.
- `SEO-D3H4-A` landing roles/review permissions decision map: documented role/review/publish boundaries and did not authorize public projection implementation.
- `SEO-D3H3C-A` landing content RLS decision map: kept landing content RLS/public-read decisions conservative.
- `SEO-D3H3B-A` migration decision map: planned the landing content storage model before implementation.
- `SEO-D3H3D-A` local relevance source decision map: required reviewed local relevance rather than inference from slugs, counts, provider density, or generated copy.
- `SEO-D3H2` area canonicalization: kept area-bearing routes fail-closed because current route shapes do not prove canonical area identity.
- `SEO-D3D2B` skeleton helper: created fail-closed helper behavior only; no data-bearing queries are authorized by this document.
- Route-check guardrails: continue to block unauthorized helper, route, crawler, metadata, sitemap, robots, schema, and `llms.txt` behavior.

## 4. Current Projection Baseline

Current baseline evidence:

- `public.landing_page_contents` exists.
- RLS is enabled on `public.landing_page_contents`.
- No RLS policies exist for `public.landing_page_contents`.
- No public-safe projection/view exists.
- No materialized gate table/view exists.
- No RPC/function exists for landing gate data.
- No helper reads `landing_page_contents` or any landing projection/view.
- Current service and service-area route skeletons remain fail-closed.
- Current area, specialty, and specialty-area route skeletons remain fail-closed.
- Generated `public.Views` is currently empty in `supabase/types/database.types.ts`.

This baseline is intentionally conservative: the raw table can store landing content and review workflow data, but no public data path is currently authorized.

## 5. Current Schema / Projection Evidence

### Raw Landing Table

`public.landing_page_contents` contains identity fields, content payload fields, lifecycle/review fields, actor/reviewer fields, timestamps, and soft-delete state.

Current payload columns include:

- `title`
- `intro`
- `sections`
- `faq`

Current actor/reviewer/internal workflow fields include:

- `created_by_profile_id`
- `updated_by_profile_id`
- `reviewed_by_profile_id`
- `reviewed_at`
- `medical_reviewer_profile_id`
- `medical_reviewed_at`
- `published_by_profile_id`
- `published_at`

### Constraints and Indexes

The current table includes constraints for:

- Oman-only country code;
- canonical landing key length and safety;
- canonical area key length and safety;
- title and intro safety;
- JSON shape for `sections` and `faq`;
- family-specific identity shape;
- editorial and medical review timestamp coherence;
- medical review requirement coherence;
- approved and published status readiness;
- unpublished publication field consistency.

The current table includes indexes for:

- one live published row per `(locale, country_code, family, canonical_landing_key)`;
- public lookup fields;
- `service_id` lookup;
- `specialty_id` lookup;
- `(area_id, city_id)` lookup;
- review queue lookup;
- `published_at` lookup;
- `deleted_at` lookup.

### Projection / View Posture

Current inspection evidence shows:

- no `CREATE VIEW` for landing gate data;
- no `CREATE MATERIALIZED VIEW` for landing gate data;
- no public-safe projection pattern for `landing_page_contents`;
- generated `public.Views` is empty;
- no landing helper imports Supabase or reads `landing_page_contents`;
- no landing helper reads a projection/view;
- no route exposes landing public content;
- sitemap, robots, and `llms.txt` do not expose landing content routes.

Existing public catalog helpers may use the server-safe anon Supabase client for already-approved public catalog surfaces, but the landing page helper remains a skeleton/fail-closed helper and must not be treated as data-bearing.

## 6. Future Projection Purpose

A future public-safe projection/view should provide only gate-safe data for future helpers. It should be a narrow public-read boundary that helps a future helper decide whether a landing page is eligible for a later gate state.

The projection/view must not provide renderable content payload. It must not expose title text, intro text, sections, FAQ data, generated copy, reviewer identities, actor IDs, raw rows, provider lists, center lists, or raw database errors.

Projection readiness is not public page readiness. A future projection/view must not authorize:

- routes;
- metadata;
- canonical tags;
- hreflang tags;
- sitemap entries;
- schema output;
- robots behavior;
- `llms.txt` behavior;
- crawler behavior;
- visible noindex pages;
- indexable pages;
- public UI;
- medical, specialty, service, or local copy;
- keyword seed runtime usage.

## 7. Candidate Projection Access Models

### Option A — SQL View Over `landing_page_contents` Exposing Only Gate-Safe Columns

| Dimension | Analysis |
| --- | --- |
| Pros | Simple SQL object; easy to inspect; can present a single allowlisted relation to future helpers; generated Supabase types should include the view after regeneration. |
| Cons | Plain view security semantics can be unsafe if the view bypasses underlying table RLS; a loose allowlist could expose payload or workflow fields; route/helper teams may mistake view existence for route readiness. |
| Schema impact | Requires a new migration in a future approved implementation phase. |
| RLS impact | Must not bypass RLS; raw table public SELECT must remain disallowed. |
| Generated type impact | Requires generated database types to be regenerated after the view exists; `public.Views` should change from empty to include the new view. |
| Helper impact | Future helper could query only this approved projection after tests exist; current helper remains blocked/fail-closed. |
| Test impact | Requires column allowlist, forbidden column, payload leakage, actor/reviewer leakage, hidden-row count leakage, ambiguity, and RLS behavior tests. |
| Security risk | Medium unless view security semantics are verified. |
| Medical/legal risk | Medium if review workflow or content publication meaning is exposed too broadly. |
| Implementation risk | Medium because a simple view is easy to implement incorrectly. |
| Recommendation | Do not implement now. Keep as a candidate only after RLS/security semantics and tests are approved. |

### Option B — SQL View With `SECURITY INVOKER` / RLS-Respecting Behavior If Supported and Verified

| Dimension | Analysis |
| --- | --- |
| Pros | Best view-based candidate if the project database supports the desired security semantics and tests prove invoker/RLS behavior. |
| Cons | Requires DB/Postgres/Supabase version verification; unsupported or misunderstood semantics must block implementation. |
| Schema impact | Requires a future migration after the current latest migration. |
| RLS impact | Intended to respect invoker privileges and RLS, but must be proven by SQL-level tests before helper use. |
| Generated type impact | Requires generated database type regeneration after view creation. |
| Helper impact | Future helper may read this projection only after it is approved and tested. |
| Test impact | Requires explicit anon/authenticated behavior tests proving RLS is not bypassed. |
| Security risk | Lower than a default/ambiguous view if verified; high if assumed without proof. |
| Medical/legal risk | Lower if limited to booleans, counts, and mapped gate-safe statuses. |
| Implementation risk | Medium because support and behavior must be verified in the actual DB environment. |
| Recommendation | Preferred technical direction only if humans approve the model and DB security semantics are verified. Do not implement now. |

### Option C — RPC / Function Returning Gate-Safe Shape

| Dimension | Analysis |
| --- | --- |
| Pros | Can encapsulate fail-closed logic, ambiguity handling, and normalized gate result shape. |
| Cons | Function security is risky; `SECURITY DEFINER` can bypass RLS if misused; function logic can obscure leakage paths; generated function types must be reviewed. |
| Schema impact | Requires a future migration and possibly a custom return type. |
| RLS impact | Must be RLS-respecting; `SECURITY DEFINER` is forbidden unless separately approved with proof it cannot leak. |
| Generated type impact | Requires generated database type updates under `public.Functions`. |
| Helper impact | Future helper would call an RPC instead of querying a view, but this remains deferred unless projection/view is insufficient. |
| Test impact | Requires result-shape, forbidden-field, anon/authenticated, no-service-role, raw-error suppression, and RLS behavior tests. |
| Security risk | Medium to high because function semantics can bypass RLS if incorrect. |
| Medical/legal risk | Medium because a function can accidentally encode publication decisions without enough review evidence. |
| Implementation risk | Higher than a narrow view because data access and decision logic may become coupled. |
| Recommendation | Defer. Use only if an RLS-respecting projection cannot express the safe gate contract. |

### Option D — Materialized Gate Table / Materialized View

| Dimension | Analysis |
| --- | --- |
| Pros | Can precompute a narrow gate-safe result and avoid runtime joins. |
| Cons | Freshness, invalidation, deletion, unpublishing, review rollback, and refresh authorization become complex; stale data can leak previously eligible states. |
| Schema impact | Requires a table or materialized view, indexes, refresh strategy, invalidation protocol, and likely operational jobs or triggers. |
| RLS impact | Requires separate RLS policy design and can become an independent leakage source. |
| Generated type impact | Requires generated database type changes. |
| Helper impact | Future helper could query the materialized gate object, but this is broader than the current need. |
| Test impact | Requires refresh, revocation, staleness, leakage, RLS, and concurrency tests. |
| Security risk | Medium to high due to stale gate state. |
| Medical/legal risk | High if stale publication/review signals remain visible after rollback. |
| Implementation risk | High. |
| Recommendation | Do not choose now. Defer until there is a proven operational need and refresh/revocation protocol. |

### Option E — Keep No Projection/View Until RLS Policies and Tests Exist

| Dimension | Analysis |
| --- | --- |
| Pros | Safest current posture; preserves fail-closed routes and helpers; no schema exposure; no generated type changes; no public/helper/crawler risk. |
| Cons | Does not unlock public landing helper reads. |
| Schema impact | None. |
| RLS impact | None now; raw table remains protected by RLS-enabled/no-policy posture. |
| Generated type impact | None; generated `public.Views` remains empty. |
| Helper impact | Helper remains skeleton/fail-closed. |
| Test impact | No new tests now; future tests must be designed and approved before implementation. |
| Security risk | Lowest. |
| Medical/legal risk | Lowest. |
| Implementation risk | Lowest. |
| Recommendation | Choose now. Do not proceed with SQL implementation until human product/legal/medical and security approval. |

## 8. Recommended Conservative Decision

Recommended current decision:

- No implementation now.
- Do not expose the raw `landing_page_contents` table.
- Prefer public-safe projection/view planning before any public read helper.
- A future projection must expose only derived gate-safe values.
- A future projection must not expose `title`, `intro`, `sections`, or `faq`.
- A future projection must not expose actor, reviewer, admin, audit, or internal workflow fields.
- A future projection should respect RLS and must not use service-role access.
- If view security semantics are uncertain, do not implement.
- Helper implementation remains blocked until projection and tests exist.
- Routes remain fail-closed.
- Sitemap, robots, `llms.txt`, metadata, schema, crawler behavior, and public UI remain untouched.

## 9. Projection Output Contract

If a future projection is separately approved, it may expose only a conceptual gate-safe shape such as:

- `locale`
- `country_code`
- `family`
- `canonical_landing_key`
- `entityExists`
- `providerCount`
- `centerCount`
- `exactCombinationCount`
- `hasUniqueVisibleIntro`
- `hasLocalRelevance`
- `medicalReviewStatus` mapped to a gate-safe value
- `canonicalIsUnique`
- `privateDataExcluded`
- `helperAvailable`
- `entityAmbiguous` / `entityIsAmbiguous`
- `sourceTables` or source-family marker only if safe
- `routeFamilyAllowed`
- updated or published gate timestamp only if safe and needed

Explicitly forbidden projection fields:

- `title`
- `intro`
- `sections`
- `faq`
- `created_by_profile_id`
- `updated_by_profile_id`
- `reviewed_by_profile_id`
- `medical_reviewer_profile_id`
- `published_by_profile_id`
- `reviewed_at`
- `medical_reviewed_at`
- internal workflow notes
- raw status fields if not needed
- raw rows
- raw errors
- provider lists
- center lists
- keyword seeds
- generated copy

## 10. Row Eligibility Predicates

A future projection must include only rows satisfying all of the following predicates:

- `status = 'published'`;
- `editorial_review_status = 'approved'`;
- `medical_review_status IN ('approved', 'not_required')`;
- `deleted_at IS NULL`;
- `canonical_landing_key` exists and is unique;
- family-specific identity exists;
- related service, specialty, area, and city entities are active, public-safe, and non-deleted where applicable;
- area-bearing rows satisfy canonical area dependency if later resolved;
- local relevance is true only from a reviewed source, not inferred from slugs, counts, provider density, or generated copy;
- specialty semantics are respected and not inferred from interchangeable relationship signals.

If any predicate cannot be proven, the future projection/helper path must fail closed.

## 11. Hidden Leakage Analysis

### Hidden-Row Count Leakage

The projection must not reveal the existence or number of draft, rejected, archived, deleted, editorial-pending, medical-pending, or otherwise hidden rows. Counts must be derived only from public-safe eligible evidence or must fail closed.

### Duplicate Canonical Row Leakage

Duplicate or competing canonical rows must not produce distinguishable public signals. Multiple canonical candidates should fail closed without exposing diagnostic details.

### Ambiguous Identity Leakage

Ambiguous service, specialty, area, city, or combined identity must not leak as a public discovery signal. Ambiguity should produce a generic unavailable/fail-closed outcome.

### Error-Message Leakage

Raw database, Supabase, SQL, RLS, constraint, or internal errors must never be exposed through helper output or routes. Future helpers must normalize failures to generic fail-closed errors.

### Actor / Reviewer Leakage

Actor IDs, reviewer IDs, admin identities, publication actors, and internal workflow timestamps must not be exposed through the projection.

### Payload Leakage

Renderable content payload fields, generated copy, `sections`, and `faq` must not be exposed through the projection.

### Medical Workflow Leakage

Raw medical review workflow states should not be exposed unless mapped to a minimal gate-safe value. Medical review state must not imply medical content publication unless all approved route/content phases exist.

### Local Relevance False Positives

Local relevance must not be inferred from slug text, provider density, center density, generated copy, or keyword seeds. It must come from a reviewed and approved source.

### Area / Specialty Ambiguity

Area-bearing route identity and specialty relationship semantics remain blockers until separately resolved. Projection logic must not infer canonical area or specialty truth from insufficient relationship signals.

## 12. RLS / Security Analysis

Future projection security requirements:

- The projection must not bypass RLS.
- Raw table public SELECT remains disallowed.
- Service-role access remains forbidden for public/helper paths.
- `SECURITY DEFINER` must not be used unless separately approved with proof it cannot leak.
- `SECURITY INVOKER` or equivalent RLS-respecting behavior must be verified before implementation.
- No broad authenticated grants may be added.
- Ambiguity, unsupported DB view semantics, missing rows, duplicate rows, denied rows, raw errors, or private-risk states must fail closed.
- If the project database version cannot prove the desired view security semantics, implementation must stop.

## 13. Future Implementation Plan

If later approved, a future projection implementation should be split into a separate `PHASED_BUILD_ONLY` task.

Future implementation sequencing:

1. Confirm human approval for view vs RPC vs no projection yet.
2. Confirm database version and security semantics for the selected model.
3. Decide whether RLS policies must be implemented before the projection. Conservative default: public helper use should wait until RLS policies and projection tests exist.
4. If approved, create a new migration after the current latest migration. Candidate filename: `supabase/migrations/0052_public_safe_landing_projection.sql`.
5. Regenerate generated database types only if schema objects are actually created.
6. Update `scripts/db/validate-migrations.mjs` only if the future migration validation protocol requires recognizing the new projection object.
7. Update `scripts/db/test-rls-static.mjs` only if the future RLS/projection phase requires static checks.
8. Create SQL-level projection tests before helper implementation.
9. Keep helper, route, route-check, crawler, sitemap, robots, `llms.txt`, metadata, schema, and public UI changes out of the projection implementation phase.

## 14. Future Test Plan

Future projection/RLS tests should include:

- projection column allowlist test;
- forbidden column test;
- no payload leakage test;
- no actor/reviewer leakage test;
- no admin/internal workflow leakage test;
- no hidden-row count leakage test;
- ambiguous duplicate canonical row fail-closed test;
- missing row fail-closed test;
- multiple canonical candidates fail-closed test;
- RLS-respecting behavior test;
- anonymous behavior tests;
- authenticated behavior tests;
- no service-role public path test;
- raw-error normalization test;
- static validator update;
- generated type check if the view appears in generated types;
- route-check preservation test if route-check is touched in a later explicit validation phase.

Unit-only mocked helper tests are not enough. Static-only checks are not enough to prove row visibility. Future strategy should be hybrid and include SQL-level evidence before helper implementation.

## 15. Human Approval Checkpoints

Human approval is required to:

- choose view vs RPC vs no projection yet;
- confirm DB/Postgres/Supabase version supports desired security semantics;
- choose whether projection waits for RLS policies;
- choose whether projection exposes only booleans, mapped statuses, and counts;
- choose whether any timestamp can be exposed;
- choose local relevance storage source;
- choose area blocker handling;
- choose specialty blocker handling;
- choose SQL-level tests timing;
- confirm no public content rendering;
- confirm no crawler/indexing behavior;
- confirm no metadata, canonical, hreflang, schema, sitemap, robots, or `llms.txt` behavior;
- confirm no route integration;
- confirm no data-bearing helper implementation;
- confirm no raw table public SELECT.

## 16. Recommended Next Subphase

Recommended next step: **no further action until human product/legal/medical and security decision**.

Do not recommend `SEO-D3H4-D-D — Public-Safe Projection/View SQL Implementation` yet unless humans explicitly approve the view/RPC model, DB security semantics, RLS posture, and required tests.

Do not recommend `SEO-D3H4-G-B — Landing Content RLS SQL Implementation` from this document alone unless humans explicitly approve the RLS policy model and test implementation scope.

## 17. Exact Allowed Files for Next Recommended Task

If the next decision is no implementation:

- no files

If a future projection SQL implementation is separately approved, allowed files must be explicitly listed in that future task. A conservative future file set may include only:

- one new migration after `0051_landing_page_contents.sql`;
- `supabase/types/database.types.ts` only if generated type regeneration is required;
- `scripts/db/validate-migrations.mjs` only if validation protocol requires a static migration check update;
- `scripts/db/test-rls-static.mjs` only if the approved phase includes static RLS/projection checks;
- SQL-level projection/RLS tests only if the approved phase explicitly authorizes tests.

No helper, route, crawler, sitemap, robots, `llms.txt`, metadata, schema, public UI, package, or Supabase client/server files should be included in a projection-only implementation phase.

## 18. Exact Forbidden Files for Next Recommended Task

Unless a future task explicitly authorizes a narrower implementation scope, the following remain forbidden:

- routes;
- helpers;
- route-check unless explicitly required by validation protocol;
- migrations unless there is an explicit projection implementation phase;
- generated types unless explicit view/function changes require regeneration;
- package files;
- sitemap;
- robots;
- `llms.txt`;
- `data/seo/*`;
- tests unless there is an explicit projection/RLS test implementation phase;
- `scripts/db/*` unless there is an explicit validation implementation phase;
- public UI/content files;
- Supabase client/server files;
- API handlers.

## 19. Validation Expectations

For this documentation-only task, expected validation commands are:

- `git status --short`
- `test -f docs/seo/PUBLIC_SAFE_PROJECTION_VIEW_IMPLEMENTATION_PLAN.md && echo "SEO-D3H4-D-C public-safe projection view implementation plan exists"`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm routes:check`
- `pnpm build`
- `pnpm lint`
- `pnpm seo:check` if applicable

No validation command may be faked or skipped silently. Warnings must be reported as warnings. Failures must be reported as failures with blockers and smallest safe fixes.

## 20. Final Recommendation

Choose **no further action until human product/legal/medical and security decision**.

This document does not recommend actual SQL implementation yet. It preserves the current fail-closed posture: no public-safe projection/view, no public SELECT on the raw table, no helper reads, no route exposure, no crawler exposure, no generated type changes, and no public content behavior.
