# SEO-D3H4-D-A — Public-Safe Projection/View Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H4-D-A. It records a conservative decision map for whether future public landing query helpers should read from direct tables, public-safe database views/projections, RPC/functions, materialized gate tables/views, or remain skeleton/fail-closed.

This document does not authorize SQL, migrations, database views, database projections, RPCs, database functions, materialized views, materialized gate tables, RLS policy implementation, generated database type changes, Supabase client/type changes, Supabase usage, service-role usage, database queries, runtime helpers, data-bearing public query helpers, route integration, route-check changes, metadata, `generateMetadata`, `generateStaticParams`, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, CMS UI, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, landing content, medical copy, service descriptions, specialty descriptions, local area descriptions, content generation, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, migration/RLS impact, generated-type impact, helper impact, route impact, SEO/crawler impact, validation commands, and human approval where required. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, prior SEO decision maps, existing helper contracts, existing route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / public-safe projection and view documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H4-D-A

## 3. Relationship to Prior Phases

### SEO-D3H4-D Plan

SEO-D3H4-D was a PLAN ONLY task. It concluded that no implementation should happen now, that direct raw table reads are not preferred for a future payload-bearing landing content table, that a future public-safe view/projection is the preferred helper read model if implementation is later approved, and that RPCs and materialized gate tables/views should remain deferred unless a projection is insufficient.

### SEO-D3H4-B-A Specialty Relationship Semantics Decision Map

SEO-D3H4-B-A concluded that specialty helpers remain fail-closed, specialty relationship signals must not be treated as interchangeable, and no specialty helper implementation is authorized. This document preserves that result. A future projection must not collapse doctor-level, practice-location-level, doctor-service-level, center-service-level, taxonomy, and slug signals into one interchangeable specialty truth without a separately approved semantics phase.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

SEO-D3H4-A concluded that provider/center roles must not be reused for global landing content, platform admin is not a default medical reviewer, and role/review/publish semantics remain unresolved for implementation. This document does not create roles, review workflows, publishing behavior, helper runtime behavior, or review permissions.

### SEO-D3H3E Query Helper Readiness Recheck

SEO-D3H3E rechecked query helper readiness and kept data-bearing helper work blocked by unresolved content, RLS, review, local relevance, area canonicalization, specialty semantics, and public-safe access questions. This document addresses only the access-model decision map and does not unblock implementation.

### SEO-D3H3D-A Local Relevance Source Decision Map

SEO-D3H3D-A documented that local relevance must come from an approved source for the exact area-bearing landing intent. This document preserves that rule. A future projection may expose `hasLocalRelevance` only as a derived gate-safe boolean and must not expose local copy or infer local relevance from broad provider density, keyword demand, slugs, or generated text.

### SEO-D3H3C-A Landing Content RLS Decision Map

SEO-D3H3C-A documented the future RLS posture for proposed `public.landing_page_contents`. It concluded that RLS is row-level, not column-level, that public helpers must expose derived booleans/status only, and that helpers must not expose title, intro, sections, FAQ, reviewer/admin/internal fields, or raw content rows. It also concluded that strict table RLS is necessary but may not be sufficient for payload-bearing tables and that a future public-safe view/projection may be preferable for helper reads. This document adopts that conservative direction without implementing it.

### SEO-D3H3B-A Landing Content Migration Decision Map

SEO-D3H3B-A recommended one future bounded table name, `public.landing_page_contents`, but did not authorize SQL, migrations, RLS, generated types, route integration, helpers, crawler behavior, or public content. This document does not create that table and does not expand that authorization.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A established that existing service descriptions, specialty descriptions, provider descriptions, reviews, media captions, slugs, counts, keyword seed data, and generated content are not valid landing content sources. It also established that future landing content must be unique per locale/country/family/canonical landing key, published, editorially approved, medically approved or explicitly not required, and tied to resolved canonical identity. A future projection must reflect those requirements only as gate-safe derived values.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 concluded that `areaSlug` alone is not canonical because `geo_areas.slug` uniqueness is scoped by `city_id`. Area-bearing route families must remain fail-closed until city-context routing, an approved `canonical_area_key`, or another approved canonical area identity model exists. A future projection must not treat ambiguous area slugs as safe.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no further route integration or data-bearing landing query helper work should proceed until foundational blockers are resolved. This document records one blocker-resolution decision map but does not remove blockers.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 and SEO-D3F2 integrated service and service-area scaffold routes only in a fail-closed manner. Those routes validate locale/country, call fail-closed skeleton helpers, pass helper input to the decision helper, and still end in `notFound()`. This document does not authorize changing those routes.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced skeleton landing gate helpers. Current helpers return fail-closed output with no source tables, no content payload, no Supabase usage, and no database queries. This document does not authorize a data-bearing helper.

### Decision Helper

The landing page decision helper remains a pure evaluator over supplied gate inputs. It does not fetch, resolve, canonicalize, publish, render, generate crawler signals, query Supabase, or expose content. This document does not authorize changing it.

### Route-Check Guardrails

Current route-check guardrails protect the fail-closed posture by checking selected route integrations, skeleton helper behavior, forbidden runtime/crawler/content tokens, and absence of forbidden route families. This document does not authorize route-check changes.

## 4. Current Projection/View Readiness

Current repo evidence shows:

- No public-safe landing projection/view exists.
- No `public.landing_page_contents` table exists.
- No landing content RLS exists.
- No generated landing content table type exists.
- No generated public landing projection/view type exists.
- Generated `public.Views` is currently empty (`[_ in never]: never`).
- Generated `public.Functions` exists for current database helper functions such as auth, center access, patient/appointment access, review/media access, monetization access, legal/consent/audit access, and extension functions, but not for landing content projection access.
- Current migrations include RLS helper functions, but no landing-content view/RPC/function.
- Current migrations do not include `CREATE VIEW` or `CREATE MATERIALIZED VIEW` objects.
- The current landing helper has no imports, no DB/Supabase usage, no source tables, and no content payload.
- The current helper returns fail-closed values: `ok: false`, `entityExists: false`, zero counts, `hasUniqueVisibleIntro: false`, `hasLocalRelevance: false`, `medicalReviewStatus: 'missing'`, `canonicalIsUnique: false`, `privateDataExcluded: true`, `helperAvailable: false`, and `sourceTables: []`.

Current readiness decision: public-safe projection/view implementation is not ready because the table, RLS, role/review permissions, public-safe projection design, type regeneration, data-bearing helper plan, and leakage-prevention tests are not approved or implemented.

## 5. Existing Public Safety Patterns

### RLS Row-Level Limitation

RLS determines row visibility. It is not by itself a complete column-projection safety boundary for payload-bearing tables. A future `landing_page_contents` table could contain public-facing payload, reviewer fields, admin/internal fields, audit actor fields, metadata, and workflow fields. Even if strict public SELECT RLS is added, a helper that directly reads the table could accidentally select unsafe columns. Therefore RLS is necessary but not sufficient for helper-safe access to payload-bearing landing content.

### Public SELECT Patterns

Current public catalog policies are explicit and narrow. Public geo and taxonomy rows require active, non-deleted records. Public centers and doctors require active, non-deleted, `status = 'active'` records. Public relationship rows such as center locations, center services, doctor practice locations, and doctor services require their own active/available non-deleted state and public-eligible parent entities.

### Review, Media, Contact, and License Visibility Gates

Current public safety patterns include explicit visibility/review gates:

- Public reviews require approved status and non-deleted rows.
- Public media assets require approved status and non-deleted rows.
- Entity media public visibility is hardened with explicit `public_media_visible`, approved media review status, allowed usage kinds, allowed entity types, approved media assets, and safe mime types.
- Contact visibility fields default to false and include contact review status fields.
- Provider license visibility requires explicit public visibility, approved license review status, non-empty license number, non-deleted rows, and public-eligible center or doctor parent records.
- Private review/report/media policies are authenticated-only and use helper-gated RLS functions.

A future public-safe landing projection should follow the same conservative pattern: explicit visibility gates, approved review states, non-deleted records, safe parent entities, and no private/internal payload.

### Helper Forbidden-Output Rules

Current helper contracts prohibit future landing helpers from exposing generated intros, medical descriptions, service descriptions, local area descriptions, keyword content, schema payloads, metadata payloads, sitemap entries, rankings, scores, sponsored placement data, monetization data, private fields, raw DB/Supabase errors, keyword seed runtime imports, or service-role-only data.

### Route-Check Crawler Isolation

Current route-check logic verifies that the landing decision helper keeps visible noindex and indexing disabled, that the landing skeleton helper has zero imports, that forbidden skeleton tokens are absent, and that app route files do not reference landing query skeleton tokens outside selected service/service-area scaffold routes. This document does not alter crawler behavior or route-check rules.

### Service-Role Prohibition

Current Supabase server client usage is anon-key based, not service-role based. Future landing helpers must not use service role, service-role-only data, or service-role bypass patterns. Any future helper path must be RLS-safe and public-safe.

## 6. Future Helper Data Needs

A future data-bearing helper, if separately approved, may need only derived gate-safe values:

- `entityExists`
- `providerCount`
- `centerCount`
- `exactCombinationCount`
- `hasUniqueVisibleIntro`
- `hasLocalRelevance`
- `medicalReviewStatus` mapped safely
- `canonicalIsUnique`
- `privateDataExcluded`
- `helperAvailable`
- `sourceTables`
- `entityAmbiguous` / `entityIsAmbiguous`
- `routeFamilyAllowed`

A future helper must never read or expose:

- `title`
- `intro`
- `sections`
- `FAQ`
- reviewer/admin/internal fields
- audit actor fields
- private metadata
- raw rows
- raw database/Supabase errors
- provider lists
- center lists
- keyword seeds
- generated text

Derived values must be conservative. Missing, ambiguous, denied, multiple, errored, unpublished, unapproved, deleted, or private-risk states must fail closed rather than producing passing gate outputs.

## 7. Candidate Access Models

### Option A — Direct Table Access with Strict RLS and Strict Selected Columns

| Category | Assessment |
| --- | --- |
| Pros | Simple runtime query model; fewer database objects; table types would be generated after a future approved migration and type regeneration. |
| Cons | Not preferred for payload-bearing landing content. Strict `.select(...)` calls are not a durable safety boundary. Future helper edits could accidentally select payload, reviewer, admin, internal, audit, metadata, or raw row fields. RLS is row-level, not column-level. |
| Schema impact | Requires future `public.landing_page_contents` table migration before use. No schema change is authorized now. |
| RLS impact | Requires strict public SELECT predicates and separate private/admin/editor/reviewer policies if approved. No RLS change is authorized now. |
| Generated type impact | Future table would appear under generated `Database['public']['Tables']` only after approved migration and type regeneration. No generated type change is authorized now. |
| Helper impact | Helper would query a payload-bearing table directly, increasing leakage risk. |
| Test impact | Would require selected-column tests, RLS tests, raw-error suppression tests, denied/ambiguous/multiple/missing-row tests, and leakage-prevention tests. |
| Security risk | Medium/high because payload/internal columns are adjacent to derived gate fields. |
| Implementation risk | High because roles, review semantics, local relevance, and leakage prevention are unresolved. |
| Recommendation | Do not choose as the default helper read model. Defer unless explicitly approved after stronger safeguards. |

### Option B — Public-Safe Database View/Projection Returning Only Gate-Safe Fields

| Category | Assessment |
| --- | --- |
| Pros | Best separation between payload storage and helper consumption; can expose only derived booleans, safe statuses, safe counts, and ambiguity flags; reduces accidental content leakage; aligns with current RLS and helper safety decisions. |
| Cons | Requires careful SQL design, RLS-aware behavior, count-leakage prevention, type regeneration, and tests. A projection that bypasses RLS or counts hidden rows would be unsafe. |
| Schema impact | Requires a future approved migration after table/RLS/role/review decisions. No view/projection is authorized now. |
| RLS impact | Must not bypass RLS. Must use explicit public-safe predicates and avoid service-role assumptions. Underlying and/or projection access must be tested. |
| Generated type impact | Future view/projection should appear under generated `Database['public']['Views']` after approved type regeneration. Current generated public views are empty. |
| Helper impact | Helper could read one gate-safe shape rather than raw content rows. Helper would still need fail-closed handling and no raw error exposure. |
| Test impact | Requires projection column allowlist tests, RLS tests, count-leakage tests, hidden/deleted/unpublished/unapproved row tests, ambiguity tests, and helper leakage-prevention tests. |
| Security risk | Lower than direct table access if predicates and columns are correct. |
| Implementation risk | Medium because projection predicates and source semantics must be exact. |
| Recommendation | Preferred future model if implementation is separately approved. Do not implement now. |

### Option C — RPC/Function Returning Gate-Safe Shape

| Category | Assessment |
| --- | --- |
| Pros | Can centralize canonical resolution, ambiguity handling, and gate-safe return shape; may express logic that is hard to model in a simple view. |
| Cons | Higher complexity; function security mode can accidentally bypass RLS; RPCs can hide unsafe joins or hidden-row counts; return typing can be less transparent than a view. |
| Schema impact | Requires a future approved database function migration. No RPC/function is authorized now. |
| RLS impact | Must avoid unsafe `SECURITY DEFINER` leakage and service-role assumptions. Existing RLS helper functions use `SECURITY DEFINER`, so any future landing RPC requires careful security review. |
| Generated type impact | Future functions would appear under generated `Database['public']['Functions']` after approved migration and type regeneration. No generated type change is authorized now. |
| Helper impact | Helper would call an RPC and map the response, but must still fail closed and hide raw errors. |
| Test impact | Requires function-level RLS/leakage tests, malformed input tests, ambiguity tests, hidden-row count tests, and raw-error suppression tests. |
| Security risk | Medium/high if function security mode or predicates are wrong. |
| Implementation risk | Medium/high due to unresolved semantics and database-function complexity. |
| Recommendation | Defer unless a public-safe view/projection cannot express the required gate-safe shape. |

### Option D — Materialized Gate Table/View

| Category | Assessment |
| --- | --- |
| Pros | Fast helper reads; can precompute expensive counts and gate values; may reduce runtime aggregation cost. |
| Cons | Adds refresh, invalidation, staleness, hidden-row leakage, deletion/unpublish handling, and operational complexity. Stale gate rows could expose or preserve information from rows that are no longer public-safe. |
| Schema impact | Requires future materialized view/table, refresh strategy, indexes, and possibly jobs/triggers. No materialized object is authorized now. |
| RLS impact | Needs strict RLS or public-safe-only stored contents. Refresh logic must not leak service-role-only or hidden data. |
| Generated type impact | Future materialized views/tables would affect generated types only after approved migration and type regeneration. No generated type change is authorized now. |
| Helper impact | Helper could read precomputed gate rows, but would depend on freshness and revocation guarantees. |
| Test impact | Requires refresh tests, staleness tests, delete/unpublish/reject tests, RLS tests, count-leakage tests, and helper fail-closed tests. |
| Security risk | Medium with additional stale-data leakage risk. |
| Implementation risk | High because refresh architecture is not approved. |
| Recommendation | Defer. Not appropriate before base table/RLS/projection/helper implementation exists. |

### Option E — Keep Helpers Skeleton/Fail-Closed Until Table/RLS/View/Roles/Content Are Implemented

| Category | Assessment |
| --- | --- |
| Pros | Safest current posture; no data access; no route/crawler/content changes; no leakage risk from runtime helper queries; matches current skeleton helper and route-check guardrails. |
| Cons | Does not unlock landing pages, data-bearing helper outputs, noindex pages, or indexability. |
| Schema impact | None. |
| RLS impact | None. |
| Generated type impact | None. |
| Helper impact | Helpers remain fail-closed, no-import, no-source-table skeletons. |
| Test impact | Existing skeleton and decision helper tests remain relevant. Future tests are deferred until a separate implementation phase. |
| Security risk | Lowest. |
| Implementation risk | Lowest. |
| Recommendation | Current required posture. Choose now. |

## 8. Recommended Conservative Decision

- No implementation now.
- Prefer a future public-safe view/projection for helper reads if implementation is separately approved.
- Direct table access is not preferred because RLS is row-level, not column-level, and a future `landing_page_contents` table would likely be payload-bearing.
- RPC/function access is deferred unless a view/projection is insufficient.
- Materialized gate table/view access is deferred because freshness and revocation complexity are not approved.
- Helpers remain skeleton/fail-closed now.
- Route/crawler/metadata/sitemap/schema behavior remains unchanged.

## 9. Public-Safe Projection Requirements

If a future view/projection is chosen, it must be designed conceptually with these requirements:

- no content payload;
- no `title`, `intro`, `sections`, or `faq`;
- no reviewer/admin/internal fields;
- no actor IDs;
- no private metadata;
- no raw relationship rows;
- no raw database/Supabase errors;
- only derived gate-safe booleans/status/counts;
- only published, editorial-approved, medical-approved-or-not-required, non-deleted landing content rows;
- canonical identity resolved;
- related entities public active and non-deleted;
- area/local relevance gates respected;
- specialty relationship semantics respected;
- no hidden-row leakage through counts;
- no keyword seed runtime usage;
- no generated text;
- no provider lists or center lists;
- no metadata/canonical/hreflang/schema/sitemap/robots/`llms.txt` output.

A projection may expose only the minimum shape required for a future helper to decide safe gate values, and every value must fail closed when evidence is missing, ambiguous, denied, duplicated, unpublished, unapproved, deleted, or private-risk.

## 10. RLS and Security Implications

- Public SELECT must remain strict and explicit.
- A future view/projection must not bypass RLS.
- Service-role usage is forbidden.
- A future helper must use an RLS-safe path.
- Denied, ambiguous, multiple, missing, malformed, errored, private-risk, or mixed public/private states must fail closed.
- A view/projection must not leak hidden rows through counts.
- A helper must not expose raw query errors.
- A helper must not expose raw rows.
- A helper must not expose payload, reviewer, admin, internal, audit actor, or private metadata fields.
- A helper must not use keyword seeds, generated content, provider lists, or center lists as gate truth.

## 11. Generated Types Implications

Supabase generated types include tables, views, and functions when they exist in the generated schema. Current evidence shows:

- current `public.Views` is empty (`[_ in never]: never`);
- current `public.Functions` contains existing functions such as RLS/auth/access helper functions and extension functions;
- no generated type for `public.landing_page_contents` exists;
- no generated type for a public-safe landing projection/view exists;
- no generated type for a landing gate RPC/function exists.

Type regeneration belongs only to a future approved migration/schema implementation phase. This documentation-only task does not authorize generated type changes.

## 12. Query Helper Implications

- No helper implementation now.
- No data-bearing helper now.
- No Supabase usage in landing helpers now.
- A future helper may read only a public-safe projection if separately approved.
- A future helper must not read raw `landing_page_contents` payload directly unless explicitly approved by a later task.
- A future helper must remain separated from routes, crawler behavior, metadata, sitemap, schema, robots, and `llms.txt`.
- Future helper tests must cover fail-closed behavior and leakage prevention, including no raw rows, no raw errors, no unsafe payload fields, no hidden-row count leakage, no service-role access, and no keyword seed runtime use.

## 13. Route and Crawler Implications

- No route integration now.
- No visible noindex pages now.
- No indexable pages now.
- No metadata, canonical, or hreflang changes now.
- No sitemap, schema, robots, or `llms.txt` changes now.
- Projection readiness does not authorize public rendering.
- Projection readiness does not authorize indexing.
- Projection readiness does not authorize crawler behavior.
- Projection readiness does not authorize landing content, medical copy, service descriptions, specialty descriptions, local area descriptions, provider listings, or center listings.

## 14. Implementation Ordering

Future only, and only after separate approval:

1. Landing content table migration.
2. Role/review permissions implementation, if approved.
3. RLS implementation and tests.
4. Public-safe projection/view plan and implementation.
5. Generated type regeneration.
6. Helper plan and implementation.
7. Helper tests.
8. Route visible noindex plan later.
9. Crawler/metadata/sitemap/schema later.

This ordering is not an authorization to perform any step. Each step requires its own explicit `PHASED_BUILD_ONLY` scope, allowed files, forbidden files, validation commands, and approval.

## 15. Implementation Decision

For SEO-D3H4-D-A:

- no SQL now;
- no migrations now;
- no database view now;
- no database projection now;
- no RPC/function now;
- no materialized view/gate table now;
- no RLS now;
- no generated type changes now;
- no Supabase client/type changes now;
- no helper/runtime changes now;
- no route changes now;
- no route-check changes now;
- no metadata/crawler/content/UI changes now.

## 16. Recommended Next Subphase

Recommended next subphase: **SEO-D3H4-E — RLS Test Strategy Decision Map Plan**.

Reasoning:

- The access-model decision map now records that a future public-safe projection/view is preferred, but only if RLS and hidden-row/count-leakage risks can be tested conservatively.
- Before landing content migration implementation or public-safe projection implementation, a plan-only RLS test strategy should define how future table policies, projection access, hidden-row count leakage, raw-error suppression, service-role prohibition, and helper fail-closed behavior will be validated.
- This recommendation does not authorize tests, SQL, RLS, migrations, generated types, helpers, routes, crawler changes, or content.

## 17. Exact Allowed Files for Next Recommended Task

If the next task is plan-only:

- no files

If the next task is documentation-only:

- one `docs/seo/*.md` file only

## 18. Exact Forbidden Files for Next Recommended Task

Forbidden for the next recommended task unless explicitly approved by its own scope:

- routes;
- route-check;
- helpers;
- migrations unless explicit implementation phase;
- generated types;
- package files;
- sitemap/robots/`llms.txt`;
- `data/seo`;
- tests unless explicit test phase;
- public UI/content files;
- Supabase client/server files;
- API handlers.

## 19. Validation Expectations

For this documentation-only task, expected validation commands are:

- `git status --short`
- `test -f docs/seo/PUBLIC_SAFE_PROJECTION_VIEW_DECISION_MAP.md && echo "SEO-D3H4-D-A public-safe projection view decision map exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Expected validation posture:

- only `docs/seo/PUBLIC_SAFE_PROJECTION_VIEW_DECISION_MAP.md` is created;
- no existing files are modified;
- no code changes;
- no route changes;
- no route-check changes;
- no migration added;
- no generated database type changes;
- no tests added;
- no metadata/schema/sitemap/robots/`llms.txt` behavior changes;
- no validation command is faked or skipped silently;
- `pnpm lint` may show warnings only, but must have no errors.

## 20. Final Recommendation

Keep the platform fail-closed now. Do not implement SQL, views, RPCs, materialized views, RLS, generated type changes, data-bearing helpers, route integration, visible noindex pages, indexable pages, crawler signals, or landing content.

Future helper reads should prefer a public-safe view/projection returning only derived gate-safe fields, but only after separately approved table, role/review, RLS, projection, type-regeneration, helper, and test phases. Direct payload-table reads should not be the default helper model because RLS is row-level, not column-level. RPCs and materialized gate tables/views remain deferred.
