# SEO-D3H4-B-A — Specialty Relationship Semantics Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H4-B-A. It records conservative future specialty relationship semantics for DrMuscat public SEO landing pages before any specialty or specialty-area data-bearing landing query helper, route integration, visible noindex page, indexable page, metadata, sitemap, schema, crawler behavior, public UI, or landing content work.

This document does not authorize:

- SQL changes;
- database migrations;
- RLS policy creation or modification;
- generated database type changes;
- Supabase client or server changes;
- Supabase usage in new runtime code;
- service-role usage;
- data-bearing query helper implementation;
- route integration;
- route-check changes;
- metadata, canonical, or hreflang implementation;
- sitemap, schema, robots, or `llms.txt` changes;
- visible noindex pages;
- indexable pages;
- content generation;
- specialty, service, medical, or local area copy;
- keyword seed runtime usage;
- CMS UI or CMS records;
- API handlers;
- tests;
- public UI;
- provider or center listings;
- crawler, analytics, or background-job behavior;
- payment, monetization, sponsored, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, validation requirements, and human approval where required.

## 2. Four-Axis Mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 3 — Public SEO Platform |
| Lock Scope | Phase 4 — Public SEO Pages / specialty relationship semantics documentation-only decision map |
| Product Module | Phase 9 — SEO/CMS and Programmatic Pages |
| Subphase ID | SEO-D3H4-B-A |

## 3. Relationship to Prior Phases

### SEO-D3H4-B Plan

SEO-D3H4-B was a plan-only specialty relationship semantics inspection. It concluded that specialty and specialty-area helpers must not infer relationships from whichever table is easiest. It recommended this documentation-only decision map as the smallest safe next step.

### SEO-D3H4-A Landing Roles/Review Permissions Decision Map

SEO-D3H4-A created `docs/seo/LANDING_ROLES_REVIEW_PERMISSIONS_DECISION_MAP.md`. It concluded that landing content write/review/publish workflow should not proceed until role semantics are documented and later implemented, that provider/center-scoped roles must not be reused for global landing content, and that medical reviewer authority must not be inferred from platform admin authority. SEO-D3H4-B-A does not implement roles, review workflow, RLS, helpers, routes, or crawler behavior.

### SEO-D3H3E Query Helper Readiness Recheck

SEO-D3H3E concluded that no data-bearing public landing query helper should be implemented now. The service helper may be closest to readiness, but specialty and specialty-area remain blocked by specialty relationship ambiguity. SEO-D3H4-B-A records the specialty-specific relationship blocker only and does not unblock helper implementation by itself.

### SEO-D3H3D-A Local Relevance Source Decision Map

SEO-D3H3D-A documented that local relevance must be approved, reviewed, public-safe, tied to canonical landing identity, tied to resolved canonical area identity for area-bearing families, and specific to the requested family/entity/area context. Local relevance must not be inferred from counts, slugs, names, provider density, center density, keyword data, route existence, or generated copy.

### SEO-D3H3C-A Landing Content RLS Decision Map

SEO-D3H3C-A documented that current broad profile helpers and center access helpers are not sufficient global landing content role semantics. SEO-D3H4-B-A does not create landing content RLS and does not use any existing role helper to authorize specialty content, specialty counts, or specialty-area pages.

### SEO-D3H3B-A Landing Content Migration Decision Map

SEO-D3H3B-A documented that no dedicated landing content table exists and no landing content migration is authorized. SEO-D3H4-B-A does not create `landing_page_contents`, does not create a projection/view, and does not add a content source.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A documented that no landing-specific editorial or medical review model exists and future public visibility should require a dedicated approved review model. SEO-D3H4-B-A does not approve medical content, content publishing, or review state transitions.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 documented that `areaSlug` alone is not sufficient canonical area identity because area slugs may be scoped by city context. Specialty-area pages remain blocked by area canonicalization in addition to specialty relationship semantics and local relevance.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that further route integration and data-bearing public landing query helper work should not proceed until blockers are resolved. SEO-D3H4-B-A resolves no runtime blocker by itself; it records the conservative specialty relationship decision map.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 and SEO-D3F2 integrated service and service-area scaffold routes only in fail-closed form. SEO-D3H4-B-A does not change any service route, specialty route, route integration, metadata, or crawler surface.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced skeleton landing gate helpers for specialty, specialty-area, area, service, and service-area families. All helpers remain fail-closed, with no Supabase usage, no database queries, no source tables, and no content payloads.

### Decision Helper

The landing page decision helper remains a pure evaluator over supplied gate inputs. It requires public data thresholds and still returns `safeForVisibleNoindex: false` and `safeForIndexing: false` for all outcomes. SEO-D3H4-B-A does not modify the decision helper.

### Route-Check Guardrails

`routes-check` guardrails remain unchanged. SEO-D3H4-B-A does not authorize route-check changes or weakening of current fail-closed route posture.

## 4. Current Specialty Schema Inventory

### `specialties` Table

Current schema evidence is in `supabase/migrations/0005_taxonomy.sql` and generated type evidence is in `supabase/types/database.types.ts`.

The `specialties` table contains:

- `id uuid primary key default gen_random_uuid()`;
- `taxonomy_group_id uuid null references public.taxonomy_groups(id)`;
- `slug text not null unique`;
- `name_en text not null`;
- `name_ar text not null`;
- `description_en text null`;
- `description_ar text null`;
- `is_medical boolean not null default true`;
- `requires_medical_disclaimer boolean not null default true`;
- `is_active boolean not null default true`;
- `sort_order integer not null default 0`;
- `metadata jsonb not null default '{}'::jsonb`;
- timestamps;
- `deleted_at timestamptz null`.

Implications:

- `id` is the canonical database identity candidate.
- `slug` is globally unique in the current table definition and is the only current public slug candidate for specialty route identity.
- `taxonomy_group_id` is optional, so specialty identity cannot require taxonomy group presence unless a later task explicitly changes the contract.
- Localized names and descriptions exist but are taxonomy fields, not approved landing content.
- `is_medical` and `requires_medical_disclaimer` imply medical/trust review concerns for future content, but they do not authorize content output.
- `is_active` and `deleted_at` are required public eligibility filters.
- There is no `status` field on `specialties`; active/deleted/RLS visibility is the current public eligibility signal.

### Related Taxonomy Tables

`taxonomy_groups`, `service_categories`, and `services` exist in `supabase/migrations/0005_taxonomy.sql`.

Current implications:

- `taxonomy_groups.slug` is unique and groups taxonomy concepts.
- `service_categories` are scoped by `taxonomy_group_id` and have a `(taxonomy_group_id, slug)` uniqueness constraint.
- `services` are scoped by `taxonomy_group_id` and have a `(taxonomy_group_id, slug)` uniqueness constraint.
- None of these tables creates an approved provider-to-specialty or center-to-specialty relationship by itself.

### Public SELECT / RLS Status

Current public catalog RLS is defined in `supabase/migrations/0032_rls_public_catalog_read_policies.sql`.

Relevant current public SELECT posture:

- `specialties`: visible to `anon` and `authenticated` only when `deleted_at IS NULL AND is_active = true`.
- `service_categories`: visible only when active and not deleted.
- `services`: visible only when active and not deleted.
- `centers`: visible only when active, not deleted, and `status = 'active'`.
- `doctors`: visible only when active, not deleted, and `status = 'active'`.
- `center_services`: visible only when available, not deleted, and tied to a public active center.
- `doctor_practice_locations`: visible only when active, not deleted, and tied to both public active doctor and public active center.
- `doctor_services`: visible only when available, not deleted, and tied to a public active doctor.

Generated database types reflect these tables and relationships, but generated types do not authorize runtime queries or helper implementation.

## 5. Current Specialty Relationship Inventory

### A. `doctors.primary_specialty_id`

| Field | Decision Map |
| --- | --- |
| Meaning | Doctor-level primary specialty candidate. |
| Scope | Global doctor/provider record. |
| Relationship level | Doctor-level. |
| Public visibility dependency | Doctor must be active, not deleted, `status = 'active'`, and RLS-visible. Specialty must be active, not deleted, and RLS-visible. |
| May count toward specialty `providerCount`? | Candidate only. Not approved now. May count only if a future task explicitly defines doctor primary specialty as an approved provider count source. |
| May count toward specialty `centerCount`? | No by itself. It does not prove center specialty availability. |
| May count toward specialty_area `exactCombinationCount`? | No by itself. It has no area/location identity. |
| Risks | Can undercount secondary specialties; can conflict with location-level specialty or service-level specialty; can mislead if converted into center or area evidence. |

### B. `doctor_practice_locations.primary_specialty_id`

| Field | Decision Map |
| --- | --- |
| Meaning | Practice-location-level primary specialty candidate for a doctor at a center or center location. |
| Scope | Doctor-to-center and optional center-location record. |
| Relationship level | Practice-location-level. |
| Public visibility dependency | Practice location must be active, not deleted, RLS-visible, and tied to public active doctor and public active center. Specialty must be active, not deleted, and RLS-visible. |
| May count toward specialty `providerCount`? | Candidate only. Not approved now. It may be useful later for location-specific doctor specialty semantics. |
| May count toward specialty `centerCount`? | Candidate only. Not approved now. It may imply specialty presence at a center only if future semantics say doctor practice-location specialty counts as center evidence. |
| May count toward specialty_area `exactCombinationCount`? | Candidate only. Not approved now. Requires canonical area identity and a defined exact-combination counting unit. |
| Risks | Can conflict with doctor-level primary specialty; can be incomplete; can be a local override rather than a general specialty; area mapping remains unresolved. |

### C. `doctor_services.specialty_id`

| Field | Decision Map |
| --- | --- |
| Meaning | Doctor service or offer-level specialty candidate. |
| Scope | Doctor service mapping; optionally connected to practice location, center, center location, center service, service, category, specialty, and taxonomy group. |
| Relationship level | Service-level / doctor-offering-level. |
| Public visibility dependency | Doctor service must be available, not deleted, RLS-visible, and tied to a public active doctor. Any future use of center or location fields must also prove center/location public eligibility through approved semantics. |
| May count toward specialty `providerCount`? | Candidate only. Not approved now. It would require deduplication by doctor and precedence rules against primary specialty fields. |
| May count toward specialty `centerCount`? | No by itself. Current public doctor service policy is doctor-parent-based, not a full center-public proof for all center-related fields. |
| May count toward specialty_area `exactCombinationCount`? | Candidate only. Not approved now. It requires canonical specialty, canonical area, public location/center constraints, deduplication, and conflict policy. |
| Risks | Can duplicate one doctor across multiple service rows; can encode service/category/specialty scopes inconsistently; can conflict with doctor primary specialty; can imply center evidence without fully proving center-side public availability. |

### D. `center_services.specialty_id`

| Field | Decision Map |
| --- | --- |
| Meaning | Center service or center-offering specialty candidate. |
| Scope | Center and optional center-location service mapping. |
| Relationship level | Center-level or center-location-level service relationship. |
| Public visibility dependency | Center service must be available, not deleted, RLS-visible, and tied to a public active center. Specialty must be active, not deleted, and RLS-visible. |
| May count toward specialty `providerCount`? | No by itself. It is center-side evidence, not doctor/provider evidence. |
| May count toward specialty `centerCount`? | Candidate only. Not approved now. It may be the cleanest center count signal after explicit semantics and deduplication are approved. |
| May count toward specialty_area `exactCombinationCount`? | Candidate only. Not approved now. Requires approved area mapping from center location/area context and exact combination semantics. |
| Risks | Can count centers with specialty taxonomy offerings but no public active specialty doctors; can conflict with doctor services; can represent marketing/taxonomy availability rather than staffed clinical supply. |

### E. `services`, `service_categories`, and `taxonomy_groups`

| Field | Decision Map |
| --- | --- |
| Meaning | Taxonomy and service/category structure. |
| Scope | Taxonomy-level. |
| Relationship level | Taxonomy-level, not provider/center relationship level. |
| Public visibility dependency | Rows must be active, not deleted, and RLS-visible. |
| May count toward specialty `providerCount`? | No. |
| May count toward specialty `centerCount`? | No. |
| May count toward specialty_area `exactCombinationCount`? | No. |
| Risks | Inferring specialty from service/category/taxonomy group without an explicit relationship model would be a guess and can create misleading medical/SEO claims. |

## 6. Current Blocker Posture

Current blocker posture remains:

- no canonical specialty relationship precedence exists;
- no approved specialty count source exists;
- no approved specialty-area exact-combination source exists;
- no data-bearing helper is authorized;
- no route, crawler, or public rendering is authorized.

Therefore specialty and specialty-area helpers must remain fail-closed.

## 7. Candidate Semantics Models

### Option A — Specialty pages count doctors by `doctors.primary_specialty_id` only

| Dimension | Analysis |
| --- | --- |
| Pros | Simple; doctor-level; naturally deduplicates by doctor; aligns with primary specialty wording. |
| Cons | Ignores service-level offerings and location-specific specialty overrides; cannot prove center supply; undercounts secondary specialties. |
| Schema impact | No immediate schema change for planning. Future helper would query doctor primary specialty only if separately approved. |
| RLS impact | Must rely on public doctor and public specialty RLS. |
| Helper impact | Could define provider count but not center count or specialty-area exact combination. |
| SEO risk | May create thin or misleading pages if center availability is inferred. |
| Medical/trust risk | May misrepresent location-specific practice or secondary specialty availability. |
| Implementation risk | Low for provider count; high if stretched beyond provider count. |
| Recommendation | Do not adopt now. Candidate only. |

### Option B — Specialty pages count doctors by `doctor_services.specialty_id` only

| Dimension | Analysis |
| --- | --- |
| Pros | Captures service-level specialty offerings; may include doctors with specialty-related services beyond primary specialty. |
| Cons | Duplicate risk per doctor; optional center/location fields require careful public proof; may conflict with primary specialty. |
| Schema impact | No immediate schema change for planning. Future helper would require deduplication and conflict rules. |
| RLS impact | Must respect doctor-service RLS and must not infer center visibility from optional center fields without approved policy. |
| Helper impact | Could define provider count only after dedupe and precedence rules. |
| SEO risk | Can inflate counts from multiple service rows. |
| Medical/trust risk | Can imply specialty expertise from service taxonomy alone. |
| Implementation risk | Medium/high due optional fields and dedupe. |
| Recommendation | Do not adopt now. Candidate only. |

### Option C — Specialty pages count centers by `center_services.specialty_id` only

| Dimension | Analysis |
| --- | --- |
| Pros | Cleanest current center-side specialty signal; center service RLS ties rows to public active centers. |
| Cons | Does not prove public doctors/providers; can represent center taxonomy offering without visible clinical staffing. |
| Schema impact | No immediate schema change for planning. Future helper would require center dedupe and location/area rules if area-bearing. |
| RLS impact | Must rely on center-service and center public RLS. |
| Helper impact | Could support center count only after approval; does not solve provider count. |
| SEO risk | Center supply can appear stronger than provider supply. |
| Medical/trust risk | May promote a specialty at a center without provider evidence. |
| Implementation risk | Medium. Simpler than doctor service semantics but incomplete. |
| Recommendation | Do not adopt alone. Candidate center-count source only. |

### Option D — Documented hybrid model later

Future hybrid model, if separately approved, could define:

- `providerCount` from `doctors.primary_specialty_id` or approved `doctor_services.specialty_id` under explicit precedence and dedupe rules;
- `centerCount` from centers with approved `center_services.specialty_id` or another approved center-specialty relationship;
- `exactCombinationCount` from an approved specialty/area relationship only when all canonical identities resolve.

| Dimension | Analysis |
| --- | --- |
| Pros | Separates provider evidence from center evidence; can account for service-level and center-level relationships; best fit for future specialty-area semantics when canonical area and local relevance are solved. |
| Cons | Requires explicit precedence, dedupe, conflict handling, identity resolution, and local relevance rules. |
| Schema impact | No immediate schema change for documentation. Future implementation may require a public-safe projection/view decision or additional planning. |
| RLS impact | Must combine only public/RLS-safe sources and fail closed on ambiguity or denial. |
| Helper impact | Future helper would return only derived gate values, not raw rows or content. |
| SEO risk | Lower if implemented conservatively; high if relationship sources are mixed without precedence. |
| Medical/trust risk | Lower if provider and center evidence remain distinct and content review remains separate. |
| Implementation risk | High until documented in a later implementation plan. |
| Recommendation | Prefer as a documented future direction only. No implementation now. |

### Option E — Keep specialty helpers fail-closed until explicit relationship model is implemented

| Dimension | Analysis |
| --- | --- |
| Pros | Safest; prevents inferred medical/SEO claims; preserves current blockers; avoids unauthorized public pages. |
| Cons | No runtime specialty landing progress. |
| Schema impact | None. |
| RLS impact | None. |
| Helper impact | Current helpers remain fail-closed with zero counts, non-unique canonical state, unavailable helper status, no source tables, and no database access. |
| SEO risk | Lowest; no accidental crawlable specialty pages. |
| Medical/trust risk | Lowest; no inferred specialty availability. |
| Implementation risk | Lowest. |
| Recommendation | Recommended now. |

## 8. Recommended Conservative Decision

SEO-D3H4-B-A recommends:

- no helper implementation now;
- no data-bearing specialty helper now;
- no data-bearing specialty-area helper now;
- no counting from multiple sources without explicit precedence;
- do not treat `doctors.primary_specialty_id`, `doctor_practice_locations.primary_specialty_id`, `doctor_services.specialty_id`, and `center_services.specialty_id` as interchangeable;
- prefer documented hybrid semantics later, but no implementation now;
- keep specialty helpers fail-closed until canonical semantics exist;
- keep specialty-area blocked by specialty semantics, area canonicalization, and local relevance requirements;
- do not use specialty taxonomy descriptions as landing content;
- do not use keyword seed data as relationship truth, content truth, or route authorization.

## 9. Specialty Page Semantics

A future specialty page should conceptually mean:

> A public, active, canonical specialty in the supported country context with sufficient public provider and center evidence under an approved specialty relationship model, plus approved reviewed content gates where required.

### `entityExists` for Specialty

`entityExists` may be true only when exactly one public, active, non-deleted, RLS-visible specialty resolves from the requested `specialtySlug`.

It must be false or fail closed when:

- no specialty matches;
- more than one identity is possible;
- the row is inactive or deleted;
- RLS visibility fails;
- canonical identity policy is incomplete.

### `canonicalIsUnique` for `specialtySlug`

`canonicalIsUnique` should mean the requested slug resolves to exactly one canonical specialty identity and does not conflict with any other route or entity identity. The helper must not generate canonical URLs; it may only provide a derived gate value if a future task authorizes it.

### `providerCount`

`providerCount` should mean distinct public eligible doctors/providers associated with the specialty under the approved relationship definition.

It must be:

- public/RLS-safe;
- active and non-deleted;
- deduplicated;
- based on explicit approved precedence;
- not a sum of multiple relationship signals.

### `centerCount`

`centerCount` should mean distinct public eligible centers associated with the specialty under the approved relationship definition.

It must be:

- public/RLS-safe;
- active and non-deleted;
- status-active where applicable;
- deduplicated;
- based on explicit approved center relationship semantics.

### Why Specialty Description or Content Alone Is Not Enough

`specialties.description_en` and `specialties.description_ar` are taxonomy descriptions, not approved landing page content. They do not prove provider supply, center supply, medical review, editorial review, canonical uniqueness, or local relevance. Future helpers must not return content payloads or generate specialty copy.

## 10. Specialty_Area Semantics

A future specialty-area page should conceptually mean:

> A public, active, canonical specialty and a public, active, canonical area have an approved public local relationship with enough exact public supply evidence under the approved specialty-area semantics model.

### Required Specialty Identity

The specialty identity must resolve to exactly one public, active, non-deleted, RLS-visible specialty. Specialty identity must fail closed on missing, duplicate, inactive, deleted, private, or ambiguous rows.

### Required Area Identity

The area identity must resolve to exactly one public, active, non-deleted, RLS-visible area within supported country context. Because current area canonicalization remains unresolved for area-bearing pages, `areaSlug` alone must not be treated as enough canonical proof unless a future task approves a canonical area model.

### `exactCombinationCount`

For specialty-area pages, `exactCombinationCount` should mean a distinct count of approved public relationship evidence proving the requested specialty and requested canonical area combination.

It must not be:

- keyword demand;
- route existence;
- inferred from slugs;
- inferred from names;
- inferred from content text;
- inferred from provider density or center density alone;
- a mixed count across relationship sources without approved precedence.

### Relationship to Local Relevance

Specialty-area pages are area-bearing and must satisfy approved local relevance. Local relevance must be specific to the requested specialty/area context and must not be inferred from counts, route existence, generated copy, keyword seed data, or taxonomy descriptions.

### Relationship to Area Canonicalization

Specialty-area pages remain blocked until area canonicalization is resolved. A canonical specialty relationship model does not resolve ambiguous area identity, city context, local relevance, or content review requirements.

### Why Current Helper Must Stay Fail-Closed

Current helpers do not query the database, do not use Supabase, do not provide source tables, and return fail-closed gate values. Specialty-area requires specialty identity, area identity, exact combination count, provider count, center count, local relevance, medical/content review, and canonical uniqueness. These requirements are not implemented or authorized now.

## 11. RLS and Security Implications

Future specialty helpers, if separately approved, must:

- use only public/RLS-safe sources;
- use only anon/server-safe public access paths if runtime Supabase usage is approved;
- never use service role;
- never use private provider/admin fields;
- never use provider-dashboard, CRM, billing, user, audit, or moderation data;
- never expose raw relationship rows;
- never expose provider lists;
- never expose center lists;
- never expose raw Supabase or database errors;
- fail closed on RLS denial;
- fail closed on ambiguous rows;
- fail closed on query errors;
- fail closed on private-data risk;
- fail closed on conflicting relationship sources.

Public count gates must be computed from only public eligible rows and must not reveal hidden, draft, inactive, deleted, or private records by side channel.

## 12. Query Helper Implications

No data-bearing specialty helper is authorized now.

Future helper requirements, if separately approved:

- must not expose content payloads;
- must not expose provider lists;
- must not expose center lists;
- must not expose raw relationship rows;
- must return only derived gate values, counts, status, and non-public internal diagnostics if approved;
- must fail closed on zero, multiple, or ambiguous specialty identity;
- must fail closed on conflicting relationship sources;
- must fail closed on incomplete review/content/canonical blockers;
- must fail closed on unresolved area canonicalization for specialty-area;
- must fail closed on missing local relevance for area-bearing families;
- must not generate metadata, schema, sitemap entries, crawler signals, canonical URLs, hreflang, Open Graph, or public copy.

## 13. Route and Crawler Implications

SEO-D3H4-B-A authorizes no route or crawler changes.

Current and future posture unless separately approved:

- no specialty route integration now;
- no specialty-area route integration now;
- no visible noindex pages now;
- no indexable pages now;
- no metadata implementation now;
- no canonical implementation now;
- no hreflang implementation now;
- no sitemap changes now;
- no schema output now;
- no robots changes now;
- no `llms.txt` changes now;
- no crawler, analytics, or background-job behavior now.

## 14. Implementation Decision

Implementation decision for SEO-D3H4-B-A:

- no implementation now;
- no migration now;
- no SQL now;
- no RLS now;
- no helper changes now;
- no runtime changes now;
- no route changes now;
- no route-check changes now;
- no generated type changes now;
- no tests now;
- no public UI now;
- no content now;
- no crawler changes now.

## 15. Recommended Next Subphase

Recommended next subphase:

**SEO-D3H4-D — Public-Safe Projection/View Decision Map Plan**

Rationale:

- Specialty relationship semantics remain blocked for implementation.
- Landing content migration planning also remains important, but public landing helpers will eventually need a conservative strategy for public-safe derived counts/projections before any runtime helper can query relationship data.
- This recommendation is plan-only. It does not authorize SQL views, migrations, RLS, helper implementation, or route integration.

If human product/legal/medical stakeholders decide that specialty semantics require clinical governance before any projection/view planning, then the safer alternative is no further action until that decision is made.

## 16. Exact Allowed Files for Next Recommended Task

If the next task is plan-only:

- no files should be edited.

If a future task is documentation-only:

- exactly one `docs/seo/*.md` file should be allowed.

No runtime, schema, route, helper, crawler, generated type, package, test, or public UI file should be edited without a separate explicit implementation task.

## 17. Exact Forbidden Files for Next Recommended Task

Forbidden unless separately and explicitly approved:

- routes;
- route-check;
- helpers;
- migrations unless explicit implementation phase;
- generated types;
- package files;
- sitemap/robots/llms;
- `data/seo`;
- tests unless explicit test phase;
- public UI/content files;
- Supabase client/server files;
- API handlers;
- CMS files;
- crawler/analytics/background-job files.

## 18. Validation Expectations

For SEO-D3H4-B-A documentation-only implementation, expected validation commands are:

```bash
git status --short
test -f docs/seo/SPECIALTY_RELATIONSHIP_SEMANTICS_DECISION_MAP.md && echo "SEO-D3H4-B-A specialty relationship semantics decision map exists"
pnpm test:unit
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

Expected file posture:

- only `docs/seo/SPECIALTY_RELATIONSHIP_SEMANTICS_DECISION_MAP.md` is created;
- no existing files are modified;
- no code changes;
- no route changes;
- no route-check changes;
- no migrations;
- no generated database type changes;
- no tests added;
- no metadata, schema, sitemap, robots, or `llms.txt` behavior changes.
