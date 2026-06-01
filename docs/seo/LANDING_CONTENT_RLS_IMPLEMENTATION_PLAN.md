# SEO-D3H4-G-A — Landing Content RLS Implementation Plan

## 1. Status and Authority

This document is documentation-only for SEO-D3H4-G-A. It records a conservative implementation plan for future Row Level Security (RLS) decisions for `public.landing_page_contents` after migration `0051_landing_page_contents.sql` created the table and enabled RLS without policies.

This document does not authorize:

- SQL implementation;
- migration creation or modification;
- RLS policy implementation;
- database function implementation;
- database view, public-safe projection, materialized view, or gate-table implementation;
- RPC implementation;
- test implementation;
- generated database type changes;
- Supabase client/type changes;
- Supabase usage in helpers or routes;
- service-role usage;
- route integration;
- data-bearing query helper implementation;
- route-check changes;
- metadata, canonical, hreflang, Open Graph, or social metadata implementation;
- sitemap, schema, robots, or `llms.txt` changes;
- visible noindex pages or indexable pages;
- public UI, CMS UI, API handlers, crawler behavior, analytics jobs, or background jobs;
- seed rows, CMS records, landing content, medical content, service descriptions, specialty descriptions, or local area descriptions;
- keyword seed runtime usage;
- payment, monetization, sponsored, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, migration/RLS impact, generated-type impact, helper impact, route impact, crawler/SEO impact, validation commands, and human approval checkpoints. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, current route-check guardrails, or stricter security/SEO constraints, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing content RLS implementation plan documentation-only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-G-A

## 3. Relationship to Prior Phases

### SEO-D3H4-G PLAN

SEO-D3H4-G was a PLAN ONLY task. It concluded that actual SQL/RLS implementation should not proceed until this implementation plan is documented and humans explicitly approve a policy model, role model, projection/view strategy, and test strategy.

### SEO-D3H4-C-IMPL-A Migration

SEO-D3H4-C-IMPL-A created `supabase/migrations/0051_landing_page_contents.sql`, updated generated database types, and updated static validation. It created `public.landing_page_contents`, lifecycle/review enums, constraints, indexes, an `updated_at` trigger, and enabled RLS. It intentionally did not create public SELECT policies, mutation policies, anon access, broad authenticated access, service-role usage, seed rows, helper integration, route integration, crawler behavior, or public landing content.

### SEO-D3H4-F-A Readiness Gate

The readiness gate keeps landing content blocked until table, review, RLS, projection, helper, canonical, local relevance, test, and human approval prerequisites are satisfied. This document does not pass that gate; it records future sequencing.

### SEO-D3H4-E-A RLS Test Strategy Decision Map

The RLS test strategy decision map establishes that static checks alone are not enough for future policy behavior. Future RLS implementation should include static validator updates and SQL-level tests that cover anon, authenticated non-role, provider/center-scoped, patient, platform-admin-if-approved, and service-role prohibition scenarios.

### SEO-D3H4-D-A Public-Safe Projection/View Decision Map

The public-safe projection/view decision map exists because the raw table contains payload and internal/reviewer/actor fields. Public read should prefer a public-safe projection/view rather than raw table SELECT.

### SEO-D3H4-B-A Specialty Relationship Semantics Decision Map

Specialty relationship semantics remain relevant to landing page eligibility. RLS for content rows must not imply that specialty or specialty-area routes are publishable while relationship semantics remain unresolved.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

Landing roles and review permissions remain unresolved. Future policies should not assume provider, center, patient, or generic platform-admin roles are equivalent to landing editor, editorial reviewer, medical reviewer, publisher, or content admin.

### SEO-D3H3C-A Landing Content RLS Decision Map

The prior RLS decision map was documentation-only and did not authorize SQL, RLS policies, helper changes, route integration, generated type changes, crawler behavior, seed rows, or public content. It identified raw-table public SELECT as risky and emphasized fail-closed behavior until role/review/projection decisions are approved.

### SEO-D3H3B-A Migration Decision Map

The migration decision map recommended a bounded future table named `public.landing_page_contents` and stated that public visibility must require published status, editorial approval, medical approval or explicit `not_required`, non-deleted state, resolved canonical identity, and safe related entities.

### SEO-D3H3D-A Local Relevance Source Decision Map

Local relevance remains unresolved. RLS policies must not be treated as proof that area-bearing landing content is locally relevant, safe, or publishable.

### SEO-D3H2 Area Canonicalization

Area canonicalization remains a blocker for area-bearing route families because `areaSlug` alone is not a canonical identity. RLS policy implementation must not bypass canonical area requirements.

### SEO-D3D2B Skeleton Helper

The current landing query helper remains a skeleton/fail-closed helper with no source tables, no Supabase usage, no database queries, and no content payload exposure. This document does not authorize making that helper data-bearing.

### Route-Check Guardrails

Route-check guardrails currently protect the fail-closed posture by blocking forbidden runtime, Supabase, service-role, crawler, schema, metadata, keyword seed, and public content behavior in landing helpers/routes. This document does not authorize route-check changes.

## 4. Current RLS Baseline

Current baseline for `public.landing_page_contents`:

- `landing_page_contents` exists.
- RLS is enabled.
- No policies exist for `landing_page_contents`.
- No anon access exists.
- No authenticated broad access exists.
- No public SELECT policy exists.
- No mutation policies exist.
- No seed rows exist.
- No public-safe projection/view exists.
- No SQL-level RLS tests for landing content exist.
- No helper reads `landing_page_contents`.
- The helper remains fail-closed.
- Service and service-area routes remain fail-closed.
- Area, specialty, and specialty-area routes remain fail-closed.
- Sitemap, robots, `llms.txt`, metadata, schema, crawler behavior, public UI, and public content remain untouched.

## 5. Current Schema/RLS Evidence

### Table and columns

Migration `0051_landing_page_contents.sql` creates `public.landing_page_contents` with these important column groups:

- identity and scope: `id`, `locale`, `country_code`, `family`, `service_id`, `specialty_id`, `area_id`, `city_id`, `canonical_landing_key`, `canonical_area_key`;
- public payload risk columns: `title`, `intro`, `sections`, `faq`;
- lifecycle/review statuses: `status`, `editorial_review_status`, `medical_review_status`, `is_medical`, `requires_medical_review`;
- internal/reviewer/actor fields: `created_by_profile_id`, `updated_by_profile_id`, `reviewed_by_profile_id`, `reviewed_at`, `medical_reviewer_profile_id`, `medical_reviewed_at`, `published_by_profile_id`, `published_at`;
- timestamps and soft delete: `created_at`, `updated_at`, `deleted_at`.

The payload and internal/reviewer/actor columns are the core reason raw-table public SELECT is unsafe.

### Constraints

Current constraints include:

- Oman-only `country_code`;
- canonical key length and safe-text checks;
- optional canonical area key safe-text checks;
- title and intro length/safe-text checks;
- JSON shape checks for `sections` and `faq`;
- family/scope checks requiring correct service/specialty/area/city combinations;
- reviewed-at status checks;
- medical review requirement checks;
- approved status checks requiring editorial approval, medical approval or `not_required`, title, intro, and non-deleted state;
- published status checks requiring editorial approval, medical approval or `not_required`, title, intro, `published_at`, `published_by_profile_id`, and non-deleted state;
- unpublished publication-field checks requiring publication fields to be empty unless status is `published`.

These constraints are necessary but not sufficient for public access because they do not remove internal columns from raw table reads.

### Indexes

Current indexes include:

- one live published key unique index on `locale`, `country_code`, `family`, `canonical_landing_key` for published, non-deleted rows;
- public lookup index on `locale`, `country_code`, `family`, `canonical_landing_key`, `status` for non-deleted rows;
- service, specialty, and area/city indexes;
- review queue index on status and review statuses;
- published-at index for published, non-deleted rows;
- deleted-at index for soft-deleted rows.

Indexes support possible future lookup/review workflows but do not authorize RLS or public reads.

### RLS enabled status

Migration `0051_landing_page_contents.sql` enables RLS on `public.landing_page_contents` and intentionally creates no policies.

### Generated type exposure

Generated database types currently expose row, insert, update, relationship, and enum typings for `landing_page_contents`. The generated types include public payload fields and internal/reviewer/actor fields, so type availability must not be confused with public-read approval.

### Static RLS validator expectations

`scripts/db/test-rls-static.mjs` currently asserts that `0051`:

- enables RLS on `public.landing_page_contents`;
- creates no policies on `public.landing_page_contents`;
- grants no anon access;
- grants no broad authenticated access;
- defines no public SELECT or mutation policies;
- seeds no landing content rows.

Any future policy implementation must update these assertions deliberately and narrowly.

### Migration validator expectations

`scripts/db/validate-migrations.mjs` currently validates that `0051` includes the required enums, table, columns, constraints, indexes, trigger, and RLS enablement. It also rejects forbidden implementation tokens for `0051`, including policy creation, seed rows, service-role usage, anon/authenticated grants, SELECT/INSERT/UPDATE/DELETE policies, route/crawler metadata concepts, and provider/center-scoped role implementation.

### Seed and helper evidence

No seed rows for `public.landing_page_contents` are present. Current public landing helpers do not import Supabase, do not query `landing_page_contents`, and do not expose landing content payloads.

## 6. Current Role/Helper Inventory

### Existing auth/profile helpers

- `public.current_profile_id()` resolves the current profile from `auth.uid()` and non-deleted profiles.
- `public.is_platform_admin()` checks `profiles.is_platform_admin`.
- `public.is_provider_user()` checks `profiles.is_provider_user`.
- `public.is_patient_user()` checks `profiles.is_patient_user`.

These are general role helpers. They do not define landing-specific editor, reviewer, medical reviewer, publisher, or content-admin authority.

### Center membership helpers

Existing center-scoped helpers include:

- `public.is_active_center_member(target_center_id)`;
- `public.can_manage_center(target_center_id)`;
- `public.can_view_center_private_data(target_center_id)`.

These helpers are scoped to center membership and center-private data. They must not be reused to mutate global landing content.

### Existing public SELECT policy style

Existing public catalog policies use explicit public predicates and `TO anon, authenticated` for confirmed public catalog tables. Typical predicates include `deleted_at IS NULL`, active flags, active provider/entity status, approval status, visibility flags, and related-public-entity checks. Provider license public policies are narrower and require explicit public visibility, approval, and active related entities. Public media hardening requires explicit visibility, approved review status, safe entity type, safe usage kind, and approved image assets.

### Existing admin/private policy style

Existing private/admin policies are generally `TO authenticated` and helper-gated. Examples include profile/admin policies, center membership/claim policies, patient appointment/contact read policies, private review/report/media read policies, and monetization private read policies. These patterns support a future helper-gated landing management model but do not authorize it now.

## 7. RLS Goals for `landing_page_contents`

Future RLS goals, if separately approved, should be:

### Public read

Public read should not target the raw table now. A future public read path should likely use a public-safe projection/view and require:

- `status = 'published'`;
- `editorial_review_status = 'approved'`;
- `medical_review_status IN ('approved', 'not_required')`;
- `deleted_at IS NULL`;
- canonical identity is resolved and unique;
- only public-safe columns are exposed.

### Authenticated read

Authenticated read should not be broad. Authenticated users should either see the same public-safe projection as anon users or use role-scoped private management/review policies.

### Draft/update/write

Draft creation and updates should require explicit landing roles or a human-approved temporary platform-admin-only management policy. Provider, center, and patient roles must not create or mutate global landing content.

### Editorial review

Editorial approve/reject actions should require a future explicit landing editorial reviewer role or content-admin authority. Platform admin must not be assumed to be an editorial reviewer unless humans explicitly approve that rule.

### Medical review

Medical approve/reject/not-required actions should require a future explicit medical reviewer role or approved external/manual process. Platform admin must not be assumed to be a medical reviewer. The `not_required` state is compliance-sensitive and should require explicit authority and tests.

### Publish

Publishing should require editorial approval, medical approval or explicit `not_required`, complete title/intro payload, non-deleted state, a valid publisher actor, and safe status-transition enforcement.

### Archive

Archiving should be publisher/content-admin scoped and must remove rows from public paths.

### Soft-delete

Soft-delete should be content-admin scoped. Public paths must always exclude deleted rows.

### Restore if allowed

Restore requires a separate human decision. If allowed, restore should not automatically republish content; the conservative restore target is draft or archived state unless humans explicitly approve another lifecycle rule.

### Internal/reviewer fields

Internal/reviewer/actor fields must not be exposed publicly. Public read should be column-minimized through a projection/view or equivalent public-safe read model.

### Service-role prohibition

Public paths, helpers, route rendering, crawler behavior, and CMS-like public access must not use service-role access.

## 8. Candidate RLS Implementation Models

### Option A — Keep no policies until role/review implementation exists

- Pros:
  - Safest default.
  - Preserves current RLS validator posture.
  - Prevents payload and internal/reviewer/actor leakage.
  - Avoids assuming landing roles before humans approve them.
- Cons:
  - No CMS/editor/reviewer workflow can use the table yet.
  - No public content can be read from the table.
- Schema impact: none.
- RLS impact: none; current RLS-enabled/no-policy posture remains.
- Helper impact: none; helper remains fail-closed.
- Test impact: existing static tests remain valid.
- Security risk: lowest.
- Medical/legal risk: lowest.
- Implementation risk: lowest.
- Recommendation: recommended current posture unless humans explicitly approve a narrow admin-only private management phase.

### Option B — Add public SELECT policy only for published + editorial approved + medical approved/not_required + not deleted + canonical rows

- Pros:
  - Could enable public reads quickly.
  - Uses existing lifecycle/review columns.
  - Aligns superficially with public catalog SELECT policy style.
- Cons:
  - Raw table includes public payload plus internal/reviewer/actor fields.
  - RLS is row-level, not column-level.
  - Helpers/routes could be tempted to read the raw table directly.
  - Canonical area, specialty relationship, local relevance, and projection blockers remain unresolved.
- Schema impact: none if only a policy is added, but a projection/view is still needed for column safety.
- RLS impact: introduces anon/authenticated raw-table access.
- Helper impact: should remain blocked; direct raw-table helper reads are not acceptable.
- Test impact: requires static validator updates, SQL-level RLS tests, and leakage/projection tests.
- Security risk: medium to high.
- Medical/legal risk: medium to high.
- Implementation risk: medium.
- Recommendation: not recommended now. Do not add public raw-table SELECT.

### Option C — Add platform-admin-only private management policies temporarily

- Pros:
  - Could support limited internal draft management if urgently needed.
  - Reuses existing `public.is_platform_admin()` helper.
  - Avoids public raw-table read access.
- Cons:
  - Platform admin is not automatically medical reviewer, editorial reviewer, publisher, or content admin.
  - Separation of duties could be bypassed.
  - Mutation policies need careful transition/actor safety.
- Schema impact: none if only policies are added; helper functions or transition controls may still be needed.
- RLS impact: adds private authenticated management access.
- Helper impact: no public helper change should be allowed.
- Test impact: requires SQL-level admin/non-admin/provider/patient tests.
- Security risk: medium.
- Medical/legal risk: medium to high if admin can approve medical status or publish.
- Implementation risk: medium.
- Recommendation: only if humans explicitly approve, and preferably limited to draft management rather than review/publish authority.

### Option D — Add explicit landing role helper functions and role-based policies

- Pros:
  - Best long-term separation of duties.
  - Supports distinct editor, editorial reviewer, medical reviewer, publisher, and content-admin authority.
  - Avoids reusing provider/center/patient roles incorrectly.
- Cons:
  - Requires role-source decisions and possibly new role schema or profile permission model.
  - More implementation and testing complexity.
- Schema impact: likely requires helper functions and possibly future role/permission storage.
- RLS impact: adds explicit role-gated private policies.
- Helper impact: public helper should still wait for public-safe projection/view.
- Test impact: requires SQL-level role matrix tests.
- Security risk: low to medium if implemented carefully.
- Medical/legal risk: lower than admin-only if medical role is truly separated.
- Implementation risk: medium to high.
- Recommendation: recommended long-term, but not before human role-model approval.

### Option E — Add no raw table public policy and wait for public-safe projection/view

- Pros:
  - Best public-read safety model.
  - Avoids public exposure of reviewer/admin/internal fields.
  - Keeps helpers away from raw table.
  - Supports column minimization and leakage tests.
- Cons:
  - Requires a separate projection/view plan and implementation phase.
  - Requires careful Postgres/Supabase view security design.
  - Public route/content remains blocked until later.
- Schema impact: future projection/view migration if approved.
- RLS impact: raw table remains private; projection access is separately controlled.
- Helper impact: future data-bearing helper would read only a public-safe source if approved.
- Test impact: requires projection column tests, public visibility tests, and no-leakage tests.
- Security risk: low if implemented correctly.
- Medical/legal risk: low to medium; review gates still require enforcement.
- Implementation risk: medium.
- Recommendation: recommended future public-read path, after documentation and human approval.

## 9. Recommended Conservative Decision

Recommended current decision:

- Do not add public SELECT on raw `public.landing_page_contents` now.
- Do not add provider/center-scoped mutation policies.
- Do not assume platform admin is a medical reviewer.
- Keep no policies until explicit landing roles and/or public-safe projection/view are ready, unless humans approve narrow admin-only management.
- Public read should wait for public-safe projection/view plus RLS/projection tests.
- The helper remains blocked/fail-closed.
- Routes remain fail-closed.
- Sitemap, robots, `llms.txt`, metadata, schema, crawler behavior, and public UI remain untouched.
- Actual RLS SQL implementation should not happen next unless humans explicitly approve the model.

## 10. Public SELECT Policy Analysis

Raw-table public SELECT is risky because:

- payload columns exist: `title`, `intro`, `sections`, and `faq`;
- reviewer/admin/internal fields exist, including created/updated/reviewed/medical-reviewed/published actor fields and timestamps;
- lifecycle and review statuses are internal workflow fields unless a projection intentionally exposes limited public-safe state;
- RLS is row-level, not column-level, so a raw-table public policy can expose every selectable column on an allowed row;
- the helper must not read the raw table directly;
- public helpers should not rely on service-role access;
- a future projection/view is preferred to enforce column minimization and public-safe output.

Conclusion: no public raw-table SELECT now.

## 11. Mutation Policy Analysis

### Create draft

Future draft creation should be limited to `landing_editor`, `landing_content_admin`, or a human-approved temporary platform-admin-only role. It should set actor fields from trusted profile context and default to safe draft/review-missing states. Provider, center, and patient users must not create global landing content.

### Update draft

Future draft updates should be limited to draft or rejected rows and should not allow ordinary editors to change review, publish, or medical-review fields. Actor fields should be updated from trusted profile context.

### Submit review

Future submit-review behavior should transition draft/rejected rows into review state and mark editorial/medical review pending or required as appropriate. It must not publish content.

### Editorial approve/reject

Editorial approve/reject should require an explicit editorial reviewer or approved content-admin authority. It should set editorial reviewer actor fields and timestamps. Self-approval rules require human approval.

### Medical approve/reject/not_required

Medical approve/reject/not_required should require an explicit medical reviewer role or approved external/manual process. `not_required` must be tightly permissioned and tested because it can bypass medical review.

### Publish

Publish should require editorial approved, medical approved or not_required, non-deleted state, complete title/intro, publisher actor fields, and safe status-transition enforcement.

### Archive

Archive should be publisher/content-admin scoped. Public projection/read paths must exclude archived rows.

### Soft-delete

Soft-delete should be content-admin scoped and must remove rows from public paths.

### Restore

Restore requires human approval. If allowed, restore should not automatically return a row to published status unless all review/publish prerequisites are still valid and explicitly approved.

### Actor fields

Actor fields must not be client-trusted arbitrary values. Future implementation should use current authenticated profile context or another approved trusted server-side mechanism.

### Status transition safety

RLS policies may not be enough to enforce complex transition rules. A future approved phase must choose whether transitions are enforced by policy predicates, helper functions, triggers, RPCs, or a combination. This document does not authorize any of those implementations.

## 12. Role Policy Analysis

### Platform admin

Platform admin exists today through `public.is_platform_admin()`. Platform admin may be considered for temporary draft management only if humans approve. Platform admin must not automatically imply medical reviewer, editorial reviewer, publisher, or content admin.

### Future `landing_editor`

Can create and update drafts if approved. Cannot approve editorial review, approve medical review, or publish unless additional explicit roles are granted.

### Future `landing_editorial_reviewer`

Can approve/reject editorial review if approved. Cannot approve medical review. Cannot publish unless separately authorized.

### Future `landing_medical_reviewer`

Can approve/reject medical review and possibly mark `not_required` if explicitly approved. This role should be separate from provider, center, patient, and generic platform-admin roles.

### Future `landing_publisher`

Can publish only after all review gates pass. Should not bypass editorial or medical review.

### Future `landing_content_admin`

Can manage broader lifecycle if approved. Whether this role can override review separation is a human product/legal/medical decision.

### Provider/center roles explicitly not reused

Provider and center roles are scoped to provider/center operations. They must not create, update, review, publish, archive, delete, or restore global landing content.

### Patient users explicitly no content mutation

Patient users must have no landing content mutation authority.

## 13. Future RLS SQL Plan If Later Approved

### Future migration filename after `0051`

If actual RLS SQL is later approved, the likely next migration filename would be:

- `supabase/migrations/0052_landing_page_contents_rls.sql`

If projection/view planning or role helper functions are approved first, numbering should be adjusted against the then-current migration list. A conservative split could be:

- `0052_landing_role_helpers.sql` for helper functions only;
- `0053_landing_page_contents_private_rls.sql` for private management/review policies;
- `0054_landing_page_public_projection.sql` for public-safe projection/view if approved;
- `0055_landing_page_public_projection_access.sql` for projection access controls if separate.

These names are planning examples only and do not authorize migrations.

### Exact allowed files for a future actual RLS implementation phase

Only if separately approved:

- a new future migration under `supabase/migrations/`;
- `scripts/db/test-rls-static.mjs` for exact static expectations;
- `scripts/db/validate-migrations.mjs` for exact migration validation expectations;
- future SQL-level RLS test files only if the phase explicitly approves them;
- `supabase/types/database.types.ts` only if schema/helper function changes require generated type updates.

### Helper functions needed?

- Option A: no.
- Option C: possibly no new helper if platform-admin-only draft management is approved, but transition/actor safety may still need helper logic.
- Option D: yes, explicit landing role helpers are likely needed.
- Option E: public-safe projection/view may require its own access strategy; public helpers should still wait for separate approval.

### Separate policy migration from helper functions?

Recommended: yes. Helper functions and policies should be separated when landing roles are introduced so each security surface can be reviewed and tested independently.

### Static RLS validator update?

Yes. Any policy implementation must update the current no-policy assertions deliberately and narrowly.

### SQL-level RLS tests timing

SQL-level RLS tests should be created first or in the same approved implementation phase. Do not ship RLS policies without tests that prove allow/deny behavior.

### No helper/route/crawler changes

An RLS SQL phase must not change helpers, routes, route-check, sitemap, robots, `llms.txt`, metadata, schema output, crawler behavior, public UI, API handlers, or landing content unless a separate phase explicitly approves that scope.

## 14. Future Test Plan

Future implementation should include:

- static RLS validator update for exact policy names and forbidden broad grants;
- SQL-level RLS tests for anon, authenticated non-role, provider/center-scoped users, patient users, platform admin if approved, and explicit landing roles if implemented;
- no-public-payload-leakage tests for projections/views;
- assertions that anon cannot see draft, in_review, rejected, archived, or deleted rows;
- assertions that anon cannot see pending, missing, required, or rejected editorial/medical review states;
- assertions that provider/center-scoped users cannot mutate global landing content;
- assertions that patient users cannot mutate landing content;
- assertions that platform admin behavior exists only if human-approved;
- assertions that no service-role public path is used;
- route/helper non-regression checks proving helpers/routes remain fail-closed unless a separate route/helper phase approves changes.

## 15. Human Approval Checkpoints

Humans must decide:

1. Whether to keep no policies or allow narrow admin-only management policies.
2. Whether public SELECT must wait for a public-safe projection/view.
3. Whether explicit landing roles are required before any private management policy.
4. Whether platform admin can manage drafts temporarily.
5. Whether platform admin can ever review, medically approve, publish, archive, delete, or restore content.
6. Whether medical reviewer remains external/manual or becomes a database-backed role.
7. RLS test implementation timing.
8. Status transition enforcement model: RLS predicates, helper functions, triggers, RPCs, or another approved mechanism.
9. Restore policy and safe target status after restore.
10. Whether `not_required` medical state requires medical reviewer, content admin, or external legal/medical approval.

## 16. Recommended Next Subphase

Recommended next subphase: **SEO-D3H4-D-B — Public-Safe Projection/View Implementation Plan**.

Rationale:

- Actual RLS SQL implementation is not recommended yet.
- Public raw-table SELECT is not recommended.
- Public read should wait for a public-safe projection/view strategy and tests.
- Human product/legal/medical decisions are still required before private management/review/publish policies.

If humans are not ready to approve projection/view planning, the alternative is **no further action until human product/legal/medical decision**.

## 17. Exact Allowed Files for Next Recommended Task

If the next task is documentation-only projection/view planning, the allowed file should be limited to a future documentation file such as:

- `docs/seo/LANDING_PUBLIC_SAFE_PROJECTION_VIEW_IMPLEMENTATION_PLAN.md`

If the next task is plan-only, no files should be edited.

If a future implementation task is approved, it must explicitly list only its future allowed files before editing.

## 18. Exact Forbidden Files for Next Recommended Task

Unless a future phase explicitly approves them, forbidden files/scopes include:

- routes;
- helpers;
- route-check unless explicitly required by validation protocol;
- migrations unless explicit RLS or projection implementation phase;
- generated types unless explicit schema/helper function changes require them;
- package files;
- sitemap, robots, and `llms.txt`;
- `data/seo`;
- tests unless explicit RLS/projection test implementation phase;
- public UI/content files;
- Supabase client/server files;
- API handlers;
- public metadata, canonical, hreflang, Open Graph, schema, crawler, or sitemap behavior;
- seed rows and landing content.

## 19. Validation Expectations

For this documentation-only task, validation should include:

- `git status --short`;
- `test -f docs/seo/LANDING_CONTENT_RLS_IMPLEMENTATION_PLAN.md && echo "SEO-D3H4-G-A landing content RLS implementation plan exists"`;
- `pnpm env:check`;
- `pnpm db:validate:migrations`;
- `pnpm test:db:rls`;
- `pnpm typecheck`;
- `pnpm test:unit`;
- `pnpm routes:check`;
- `pnpm build`;
- `pnpm lint`;
- `pnpm seo:check` if applicable.

No validation command may be faked. If a command fails because of an environment limitation or real project issue, the result must be reported honestly.

## 20. Final Recommendation

Do not implement actual RLS SQL next unless humans explicitly approve the model. Do not add public raw-table SELECT. Do not add helper or route integration. Prefer public-safe projection/view implementation planning before any public-read RLS. Keep `public.landing_page_contents` RLS-enabled with no policies until role/review/projection/test decisions are approved.
