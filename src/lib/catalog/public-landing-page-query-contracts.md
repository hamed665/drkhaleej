# SEO-D3D1 — Public Landing Page Query Data Source Contract

## 1. Status and Authority

This file is documentation-only for SEO-D3D1. It maps conservative public data-source requirements for future public landing page query helpers that may later feed `decideLandingPageGate`.

This file does not authorize implementation. It does not authorize runtime query helpers, database queries, Supabase usage in new runtime code, route integration, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, API handlers, migrations, seed rows, tests, route-check changes, content generation, service descriptions, local area descriptions, medical copy, keyword seed runtime usage, service-role usage, payment logic, sponsored placement, rankings, referrals, commissions, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, article pages, branded hospital or clinic pages, Persian/Hindi routes, GCC routes, or plural doctor detail routes.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with explicit allowed files, forbidden scope, database/RLS impact, route impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, `README.md`, project-state files, master specs, addendums, existing route checks, or stricter SEO guardrails, the stricter instruction wins.

Keyword seed data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be imported into runtime code, queried at runtime, or used as entity truth, content truth, route authorization, indexability authorization, metadata source, sitemap source, schema source, or fallback content.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only public landing query data-source mapping
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3D1

## 3. Relationship to Prior SEO-D Tasks

- SEO-D3A documented early landing page quality and query-helper planning only. It did not authorize runtime helpers or route rendering.
- SEO-D3B1 documented a conservative query-helper contract and separated query helpers from route integration.
- SEO-D3C1 planned a pure decision helper and preserved the rule that data fetching must remain outside the decision helper.
- SEO-D3C2A implemented the pure `decideLandingPageGate` helper only; the helper accepts explicit inputs and performs no fetching.
- SEO-D3C2B preserved safe defaults around the decision helper and did not authorize public rendering or indexing.
- SEO-D3C3 validated the decision-helper baseline and route-check constraints without adding landing page data access.
- SEO-D3D PLAN ONLY recommended this SEO-D3D1 documentation-only data-source map as the smallest safe next step before any runtime query helper implementation.

SEO-D3D1 therefore defines source and failure boundaries only. It must not be treated as approval for `src/lib/catalog/public-landing-page-queries.ts` or any route integration.

## 4. Current Public Catalog Contract Summary

Existing public catalog files:

- `src/lib/catalog/public-query-contracts.md`
- `src/lib/catalog/public-queries.ts`
- `src/lib/catalog/public-types.ts`
- Supporting public catalog utilities such as contact, location, and media helpers.

Current documented public catalog tables already used include:

- `public.centers`
- `public.doctors`
- `public.services`
- `public.geo_areas`

Current public query behavior to preserve in future landing helper work:

- Live SELECT-only queries for approved public catalog use cases.
- Generated Supabase `Database` types for typing.
- Existing server-safe anon client path through `createSupabaseServerClient()`.
- RLS as the enforcement layer for public SELECT eligibility.
- Conservative column selection with summary-only, non-sensitive fields.
- Safe limits with a documented default and maximum in the existing public query layer.
- Search input normalization and capped query length where search is relevant.
- Typed result wrappers with explicit success, empty, and error states.
- Generic public errors rather than raw Supabase or database errors.

Future landing helpers must not weaken this contract. If a future helper needs behavior not already approved in the public catalog contract, that behavior must be separately approved.

## 5. Future Helper Families

Future runtime work, if separately approved, may define these helper families:

- `getSpecialtyLandingGateData(...)`
- `getSpecialtyAreaLandingGateData(...)`
- `getAreaLandingGateData(...)`
- `getServiceLandingGateData(...)`
- `getServiceAreaLandingGateData(...)`

These names are planning labels only in SEO-D3D1. They are not implemented here and must not be imported by routes until a later approved SEO-D3E route-integration task.

## 6. Shared Output Fields for `decideLandingPageGate`

Future helpers should return only quality-gate inputs that can feed `decideLandingPageGate`:

- `family`
- `entityExists`
- `providerCount`
- `centerCount`
- `exactCombinationCount`
- `hasUniqueVisibleIntro`
- `hasLocalRelevance`
- `medicalReviewStatus`
- `canonicalIsUnique`
- `privateDataExcluded`
- `helperAvailable`
- `entityIsAmbiguous`
- `routeFamilyAllowed`

Optional internal diagnostics may include source table names and non-public reason codes, but they must remain internal and must not become rendered content, metadata, schema, sitemap entries, or public copy.

## 7. Forbidden Output Fields

Future landing query helpers must not return:

- SEO copy
- service descriptions
- local area descriptions
- medical advice
- provider names unless separately approved
- center names unless separately approved
- metadata
- canonical URL values
- hreflang values
- schema payloads
- sitemap values
- rankings
- boost, sponsored, payment, referral, or commission fields
- private, admin-only, provider-dashboard-only, CRM, billing, user, moderation, audit, or service-role-only fields
- raw Supabase or database errors
- keyword seed values

## 8. Public Data Source Map by Landing Family

All families share these baseline rules:

- Use SELECT-only, public/RLS-safe data sources.
- Use the anon/server-safe public client path only if separately approved for runtime implementation.
- Do not use service role.
- Do not use keyword seed JSON.
- Do not use private/admin/provider-dashboard/CRM/billing/user data.
- Do not return names, descriptions, medical text, metadata, schema, sitemap, canonical, or hreflang data.
- Fail closed on unsupported locale/country, missing data, ambiguous slugs, query errors, private-risk states, unapproved content, or unclear relationship semantics.

### A. Specialty Landing Family

Planned route family: `/[locale]/[country]/centers/[specialtySlug]`.

Likely tables to inspect or confirm:

- `specialties`
- `doctors`
- `centers`
- `doctor_practice_locations`
- `doctor_services` where `specialty_id` is present
- `center_services` where `specialty_id` is present
- Potential `doctor_specialties` or `center_specialties` equivalents if future schema adds them
- Public content/review table if one is later approved

Required relationships:

- Specialty identity must resolve from a public active specialty slug or equivalent canonical specialty field.
- Provider counts may use `doctors.primary_specialty_id`, `doctor_practice_locations.primary_specialty_id`, or `doctor_services.specialty_id` only after a future implementation task defines the canonical specialty relationship.
- Center counts may use public centers connected through public practice locations or public center service/specialty relationships only after exact relationship semantics are approved.

Required public visibility/RLS filters:

- Specialty must be active, not deleted, and RLS-visible.
- Doctors/providers must be active, not deleted, public/RLS-visible, and have active status.
- Centers must be active, not deleted, public/RLS-visible, and have active status.
- Relationship rows must be active/available, not deleted, public/RLS-visible, and tied only to public eligible parent records.

Entity existence rule:

- `entityExists` may be true only when exactly one public active specialty matches the slug.

Ambiguity rule:

- Multiple public matches, mixed public/private risk, or conflicting relationship interpretations must return `entityIsAmbiguous: true` or fail closed.

Count definitions:

- `providerCount`: distinct public eligible doctors/providers associated with the specialty under the approved relationship definition.
- `centerCount`: distinct public eligible centers associated with the specialty under the approved relationship definition.
- `exactCombinationCount`: for specialty-only pages, this should not be treated as passing evidence unless a future task defines a specific specialty-only combination count. Conservative default is `0` or a non-gating value accepted by the decision helper contract.

Content/review/canonical rules:

- `hasUniqueVisibleIntro`: true only if an approved human-reviewed public intro source exists for the specialty; otherwise false.
- `hasLocalRelevance`: normally false for specialty-only unless an approved non-area local relevance source is modeled; do not invent local facts.
- `medicalReviewStatus`: approved only from a modeled review source; otherwise `missing` or `required` when medical content would be needed. `not_required` only if explicitly modeled and approved.
- `canonicalIsUnique`: true only if specialty slug/entity uniqueness is established; helper must not generate canonical URLs.

Fail-closed behavior:

- Fail closed on missing specialty, duplicate slug, unclear specialty relationship, missing approved intro, missing medical review where required, query errors, or private-data risk.

### B. Specialty-Area Landing Family

Planned route family: `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]`.

Likely tables to inspect or confirm:

- `specialties`
- `geo_areas`
- `geo_cities`
- `geo_countries`
- `doctors`
- `centers`
- `center_locations`
- `doctor_practice_locations`
- `doctor_services` where `specialty_id` is present
- `center_services` where `specialty_id` is present
- Potential specialty relationship tables if future schema adds them
- Public content/review table if one is later approved

Required relationships:

- Specialty slug must map to exactly one public active specialty.
- Area slug must map to exactly one public active area in the supported country context.
- Exact combination must require both specialty and area to be represented by approved public relationship rows, not by keyword demand or inferred text.

Required public visibility/RLS filters:

- Specialty and area must be active, not deleted, and RLS-visible.
- Area's country/city context must be public/RLS-visible and within supported country `om`.
- Doctors, centers, locations, and relationship rows must be public/RLS-visible, active/available, not deleted, and tied only to public eligible parent records.

Entity existence rule:

- `entityExists` may be true only when both specialty and area exist uniquely in public eligible records.

Ambiguity rule:

- Duplicate specialty slug, duplicate area slug in the country context, or unclear specialty-area relationship must return `entityIsAmbiguous: true` or fail closed.

Count definitions:

- `providerCount`: distinct public eligible doctors/providers in the area with the approved specialty relationship.
- `centerCount`: distinct public eligible centers in the area with the approved specialty relationship.
- `exactCombinationCount`: distinct public eligible provider/center relationship count for the exact specialty-area pairing. Do not substitute broad specialty count or broad area count.

Content/review/canonical rules:

- `hasUniqueVisibleIntro`: true only if approved human-reviewed public intro content exists for this exact specialty-area intent; otherwise false.
- `hasLocalRelevance`: true only if approved area-specific source data exists for this exact pairing; otherwise false.
- `medicalReviewStatus`: approved only from modeled review source; otherwise `missing` or `required` conservatively.
- `canonicalIsUnique`: true only if specialty slug, area slug, and entity mapping are unique for the family; helper must not generate canonical URLs.

Fail-closed behavior:

- Fail closed on missing or ambiguous specialty/area, insufficient exact-combination evidence, missing local relevance, missing approved intro, missing medical review, query errors, or private-data risk.

### C. Area Landing Family

Planned route family: `/[locale]/[country]/areas/[areaSlug]`.

Likely tables to inspect or confirm:

- `geo_areas`
- `geo_cities`
- `geo_countries`
- `centers`
- `center_locations`
- `doctors`
- `doctor_practice_locations`
- Public content/review table if one is later approved

Required relationships:

- Area slug must resolve to exactly one public active area in the supported country context.
- Center count should use public active center locations in the area.
- Provider count should use public active doctor practice locations tied to public active centers in the area.

Required public visibility/RLS filters:

- Area, city, and country must be active, not deleted, public/RLS-visible, and scoped to supported country `om`.
- Centers, doctors, center locations, and doctor practice locations must be public/RLS-visible, active, not deleted, and tied to public eligible parent records.

Entity existence rule:

- `entityExists` may be true only when exactly one public active area matches the slug in the supported country context.

Ambiguity rule:

- Duplicate area slugs across unresolved country/city contexts must fail closed; do not choose arbitrarily.

Count definitions:

- `providerCount`: distinct public eligible doctors/providers with active public practice locations in the area.
- `centerCount`: distinct public eligible centers with active public locations in the area.
- `exactCombinationCount`: for area-only pages, this should not be treated as an entity-service/specialty exact combination unless separately defined. Conservative default is `0` or a non-gating value accepted by the decision helper contract.

Content/review/canonical rules:

- `hasUniqueVisibleIntro`: true only if approved human-reviewed public intro content exists for the area; otherwise false.
- `hasLocalRelevance`: true only from approved area-specific source data; otherwise false.
- `medicalReviewStatus`: `not_required` only if explicitly modeled for non-medical area intro; otherwise `missing` or `required` conservatively when content would be needed.
- `canonicalIsUnique`: true only if area slug/entity uniqueness is established in supported country context; helper must not generate canonical URLs.

Fail-closed behavior:

- Fail closed on ambiguous area, missing area, no approved local relevance, missing approved intro, query errors, or private-data risk.

### D. Service Landing Family

Planned route family: `/[locale]/[country]/services/[serviceSlug]`.

Likely tables to inspect or confirm:

- `services`
- `service_categories`
- `center_services`
- `doctor_services`
- `centers`
- `doctors`
- `doctor_practice_locations` where needed to connect doctors to public centers
- Public content/review table if one is later approved

Required relationships:

- Service slug must map to exactly one public active service.
- Center counts may use public available `center_services` rows tied to public active centers.
- Provider counts may use public available `doctor_services` rows tied to public active doctors, and may require public practice location evidence if the future implementation defines provider visibility through center association.

Required public visibility/RLS filters:

- Service and service category must be active, not deleted, and public/RLS-visible.
- Center service rows must be available, not deleted, public/RLS-visible, and tied to public active centers.
- Doctor service rows must be available, not deleted, public/RLS-visible, and tied to public active doctors.
- Centers/doctors must be public eligible.

Entity existence rule:

- `entityExists` may be true only when exactly one public active service matches the slug.

Ambiguity rule:

- Duplicate service slug, unclear service/category mapping, or conflicting service relationship semantics must return `entityIsAmbiguous: true` or fail closed.

Count definitions:

- `providerCount`: distinct public eligible doctors/providers associated with the service under the approved relationship definition.
- `centerCount`: distinct public eligible centers associated with the service under the approved relationship definition.
- `exactCombinationCount`: for service-only pages, this should not be treated as a local exact-combination count unless separately defined. Conservative default is `0` or a non-gating value accepted by the decision helper contract.

Content/review/canonical rules:

- `hasUniqueVisibleIntro`: true only if approved human-reviewed public intro content exists for the service; otherwise false.
- `hasLocalRelevance`: normally false for service-only unless an approved source defines Oman-specific relevance without generating local copy.
- `medicalReviewStatus`: service pages are likely medically sensitive; return approved only from modeled review source, otherwise `missing` or `required` conservatively. `not_required` only if explicitly modeled and approved.
- `canonicalIsUnique`: true only if service slug/entity uniqueness is established; helper must not generate canonical URLs.

Fail-closed behavior:

- Fail closed on missing service, duplicate slug, insufficient public data, missing approved intro, missing medical review, query errors, or private-data risk.

### E. Service-Area Landing Family

Planned route family: `/[locale]/[country]/services/[serviceSlug]/[areaSlug]`.

Likely tables to inspect or confirm:

- `services`
- `service_categories`
- `geo_areas`
- `geo_cities`
- `geo_countries`
- `center_services`
- `doctor_services`
- `centers`
- `center_locations`
- `doctors`
- `doctor_practice_locations`
- Public content/review table if one is later approved

Required relationships:

- Service slug must map to exactly one public active service.
- Area slug must map to exactly one public active area in supported country context.
- Exact service-area evidence must require approved public service relationship rows and approved public location rows in the exact area.

Required public visibility/RLS filters:

- Service, service category, area, city, and country must be active, not deleted, and public/RLS-visible.
- Center service rows must be available, not deleted, public/RLS-visible, and tied to public active centers in the area.
- Doctor service rows must be available, not deleted, public/RLS-visible, and tied to public active doctors with public practice locations in the area.
- Centers/doctors/locations must be public eligible.

Entity existence rule:

- `entityExists` may be true only when both service and area exist uniquely in public eligible records.

Ambiguity rule:

- Duplicate service slug, duplicate area slug in country context, or unclear service-area relationship must return `entityIsAmbiguous: true` or fail closed.

Count definitions:

- `providerCount`: distinct public eligible doctors/providers in the area associated with the service under the approved relationship definition.
- `centerCount`: distinct public eligible centers in the area associated with the service under the approved relationship definition.
- `exactCombinationCount`: distinct public eligible provider/center relationship count for the exact service-area pairing. Do not substitute broad service count or broad area count.

Content/review/canonical rules:

- `hasUniqueVisibleIntro`: true only if approved human-reviewed public intro content exists for this exact service-area intent; otherwise false.
- `hasLocalRelevance`: true only if approved area-specific source data exists for this exact pairing; otherwise false.
- `medicalReviewStatus`: approved only from modeled review source; otherwise `missing` or `required` conservatively.
- `canonicalIsUnique`: true only if service slug, area slug, and entity mapping are unique for the family; helper must not generate canonical URLs.

Fail-closed behavior:

- Fail closed on missing or ambiguous service/area, insufficient exact-combination evidence, missing local relevance, missing approved intro, missing medical review, query errors, or private-data risk.

## 9. Required Public/RLS-Safe Tables to Inspect or Confirm

Before SEO-D3D2 implementation, inspect or confirm public/RLS-safe use of:

- `centers`
- `doctors` / providers
- `services`
- `geo_areas`
- `geo_cities`
- `geo_countries`
- `center_locations`
- `center_services`
- `doctor_services`
- `doctor_practice_locations`
- `specialties` or equivalent taxonomy table if present
- `doctor_specialties` or equivalent relationship table if present
- `center_specialties` or equivalent relationship table if present
- public content/review table if present and separately approved

Current generated types show specialty relationships through `doctors.primary_specialty_id`, `doctor_practice_locations.primary_specialty_id`, `doctor_services.specialty_id`, and `center_services.specialty_id`. Dedicated `doctor_specialties` and `center_specialties` tables were not established by this documentation task and must be treated as blockers unless later confirmed or added in an approved migration phase.

## 10. Records That Must Be Excluded From Counts

Future helpers must exclude records that are:

- deleted
- inactive
- rejected
- draft
- private
- admin-only
- provider-dashboard-only
- service-role-only
- unpublished
- unapproved
- fake seed data
- internal/test records
- unclaimed listings unless explicitly allowed by the public listing contract
- unavailable relationship rows
- private review, claim, license-evidence, billing, CRM, audit, or moderation records

Unknown or partially known records must not be counted as passing evidence.

## 11. Unclaimed Listing Decision

The current public catalog contract documents public listing reads but does not clearly define whether unclaimed public listings count toward SEO landing page quality thresholds.

SEO-D3D1 therefore marks unclaimed listing count policy as a blocker. Default future behavior should be exclude or fail closed until a public listing contract explicitly allows unclaimed public listings to count toward landing page thresholds.

## 12. Unique Visible Intro Planning

Future query helpers must not generate text.

`hasUniqueVisibleIntro` may be true only when a human-reviewed, public-approved content source exists for the exact landing intent. Provider counts, center counts, service names, area names, keyword seed rows, or route slugs must not be treated as unique visible intro content.

If no approved source exists, `hasUniqueVisibleIntro` must be false by default.

## 13. Local Relevance Planning

Future query helpers must not invent local facts.

`hasLocalRelevance` may be true only when an approved area-specific content/source exists for the exact landing intent. Broad provider density, keyword demand, or inferred Muscat/Oman relevance must not substitute for modeled local relevance.

If no approved local relevance source exists, `hasLocalRelevance` must be false by default.

## 14. Medical Review Planning

Future query helpers must not generate medical copy, medical advice, treatment descriptions, preparation/recovery/risk content, pricing/insurance claims, or service descriptions.

`medicalReviewStatus` may be `approved` only if a modeled human-review source exists and confirms approval for the exact content/surface being evaluated. If no review model exists, future helpers must return `missing` or `required` conservatively when content would be needed.

`not_required` may be returned only if explicitly modeled and approved for the exact landing intent. It must not be inferred from entity existence, provider count, center count, service name, area name, or keyword demand.

## 15. Canonical Uniqueness Planning

Future query helpers must not generate canonical URLs.

`canonicalIsUnique` may only reflect slug/entity uniqueness for the requested family. Duplicate slug states, ambiguous area/country context, ambiguous service/specialty mapping, or competing route intent must set `canonicalIsUnique: false`, `entityIsAmbiguous: true`, or otherwise fail closed.

Canonical URL generation, hreflang generation, metadata generation, sitemap inclusion, and schema output belong to later separately approved SEO phases.

## 16. Query Failure Behavior

Future query-helper failures must fail closed:

- Do not expose raw DB or Supabase errors.
- Return generic internal reason codes only.
- Set `helperAvailable: false` where appropriate.
- Set `entityExists: false` only when the entity is safely known to be absent; use helper unavailable or ambiguity for uncertain states.
- Do not use keyword fallback.
- Do not render placeholder content.
- Do not emit metadata, schema, sitemap, canonical, hreflang, robots, or `llms.txt` fallback behavior.
- Do not silently treat failed, partial, or unknown counts as passing counts.

A failed helper must not create public content, route eligibility, sitemap eligibility, or indexability eligibility.

## 17. Security and RLS Rules

Future runtime implementation, if separately approved, must follow these rules:

- SELECT-only.
- Anon/server-safe.
- RLS-enforced.
- No service-role usage.
- No writes, mutations, upserts, deletes, server actions, or side effects.
- No RPC unless separately approved.
- Bounded limits with conservative defaults and maximums.
- No private fields.
- No raw errors.
- No admin/provider-dashboard/CRM/billing/user imports.
- No keyword seed runtime imports.
- Fail closed on missing, ambiguous, errored, unsupported, or private-risk states.

## 18. Future Implementation Split

Recommended future split:

- SEO-D3D2 — public query helper implementation only, likely in `src/lib/catalog/public-landing-page-queries.ts`, if separately approved.
- SEO-D3D3 — tests/static guardrails for query helper behavior if feasible and separately approved.
- SEO-D3D4 — route-check guardrails if needed and separately approved.
- SEO-D3E — route integration for one page family only, separately approved, preserving fail-closed defaults.

SEO-D3D2 must not include route integration. SEO-D3E must not become broad programmatic generation.

## 19. Validation Expectations for Future Runtime Implementation

Future runtime implementation should run at minimum:

- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Additional static guardrails may be needed to forbid service-role imports, keyword JSON imports, writes, route imports, metadata/schema/sitemap strings, raw errors, and private/admin/provider-dashboard imports.

## 20. Open Blockers Before SEO-D3D2

Open blockers:

- Exact specialty taxonomy table and slug semantics must be confirmed.
- Exact specialty relationship table names or canonical specialty relationship columns must be confirmed.
- Public intro/content source availability is unclear.
- Medical review model availability for landing page intros is unclear.
- Unclaimed listing count policy is unclear.
- Whether reviews/ratings may be used at all is unclear and must remain forbidden unless separately approved.
- Exact RLS public visibility filters for each relationship table must be confirmed before queries are implemented.
- Whether service/provider counts require center-location evidence for all provider cases must be defined.
- Whether center names or provider names may ever be returned by landing helpers requires separate approval; default is no.
