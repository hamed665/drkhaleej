# SEO-D3D2A — Public Landing Page Schema Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3D2A. It records conservative schema, content, and policy decisions that must be resolved before any public landing page query helper can safely gather quality-gate inputs for DrMuscat SEO landing pages.

This document does not authorize implementation. It does not authorize runtime query helpers, `src/lib/catalog/public-landing-page-queries.ts`, database queries in runtime code, Supabase usage in new runtime code, route rendering, route integration, visible noindex pages, indexable pages, metadata generation, canonical tags, hreflang tags, `generateMetadata`, `generateStaticParams`, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, API handlers, migrations, seed rows, tests, route-check changes, content generation, service descriptions, local area descriptions, medical copy, keyword seed runtime usage, service-role usage, payment logic, sponsored placement, rankings, referrals, commissions, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, article pages, branded hospital or clinic pages, Persian/Hindi routes, GCC routes, or plural doctor detail routes.

Keyword seed data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be imported into runtime code, queried at runtime, used as entity truth, used as content truth, used as route authorization, used as indexability authorization, used as metadata source, used as sitemap source, used as schema source, used as fallback content, or used to bypass missing schema/content decisions.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden scope, database/RLS impact, route impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, `README.md`, project-state files, master specs, addendums, existing route checks, SEO-D3D1, the SEO-D3D2 PLAN ONLY report, or stricter SEO/security guardrails, the stricter instruction wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only schema and policy decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3D2A

## 3. Relationship to Existing Work

### SEO-D3D1

SEO-D3D1 created the public landing page query data-source contract. It documented source boundaries, required output fields for future helpers, forbidden output fields, public/RLS-safe table candidates, count exclusions, unclaimed listing uncertainty, intro/local-relevance/medical-review requirements, canonical uniqueness rules, query failure behavior, and a future implementation split. SEO-D3D2A does not supersede SEO-D3D1; it narrows unresolved schema and policy questions into explicit decisions or blockers.

### SEO-D3D2 PLAN ONLY

The SEO-D3D2 PLAN ONLY report inspected the current schema, public RLS policies, generated types, public catalog helpers, decision helper, route-check guardrails, and SEO-D2 scaffold routes. It concluded that the repository has enough public/RLS-safe catalog tables for limited entity and count probes, but does not have enough approved content/review/canonical relationship policy to safely implement full data-bearing landing helpers that can produce passing gate outputs. SEO-D3D2A records that conclusion as the current decision map.

### Current public catalog contract

The current public catalog contract permits SELECT-only, public/RLS-safe catalog reads through the server-safe public Supabase client pattern for already-approved public catalog surfaces. Existing public catalog helpers do not authorize landing page query helpers. SEO-D3D2A preserves the current contract and does not broaden it.

### Pure decision helper

The pure decision helper accepts explicit `LandingPageGateInput` fields and performs no fetching. SEO-D3D2A does not change the helper, its thresholds, its result shape, or its all-false indexing/noindex safety posture.

### Route-check guardrails

Current route-check guardrails preserve fail-closed SEO-D2 scaffold routes, forbid landing page gate integration in `src/app`, forbid sitemap/robots/`llms.txt` integration with the gate helper, forbid schema output in scaffold files, forbid keyword seed imports, and forbid private/admin/provider/service-role data imports in landing scaffolds. SEO-D3D2A does not modify route-check and does not authorize weakening those guardrails.

## 4. Summary of SEO-D3D2 Blockers

The following blockers remain before data-bearing runtime public landing query helpers can safely produce passing quality-gate inputs:

1. No approved landing intro content source.
2. No approved local relevance source.
3. No approved landing medical review model.
4. Unclaimed listing count policy is unresolved.
5. Specialty relationship semantics are unresolved.
6. `services.slug` is ambiguous across taxonomy groups because slug uniqueness is scoped by `taxonomy_group_id`.
7. `geo_areas.slug` is ambiguous across city context because slug uniqueness is scoped by `city_id`.
8. `doctor_services` does not fully prove public center/location eligibility by itself.

## 5. Decision Table for Each Blocker

| Blocker | Current schema evidence | Risk | Default fail-closed behavior | Required to unblock | Can runtime helper proceed without resolving? | Future migration/content model required? |
| --- | --- | --- | --- | --- | --- | --- |
| No approved landing intro content source | Existing provider/catalog tables include names/descriptions, reviews, media/contact/license review fields, but no modeled landing intent intro table with locale/country/family/entity mapping and public content approval. | Helpers could infer or generate thin SEO copy from slugs/counts/provider data. | `hasUniqueVisibleIntro: false`; do not count names, descriptions, keywords, slugs, reviews, or provider density as a unique visible intro. | Approved landing content model with human review, public visibility, locale/country/family/entity mapping, and uniqueness constraints. | Only a fail-closed skeleton or non-passing probe can proceed. Passing gate outputs cannot proceed. | Yes, unless an already-approved equivalent source is later identified. |
| No approved local relevance source | `geo_areas`, `geo_cities`, and `geo_countries` provide geography, but no approved area-specific landing relevance table. | Helpers could invent local relevance from area names or provider density. | `hasLocalRelevance: false`; do not infer local relevance from counts, route slugs, or keyword demand. | Approved local relevance source tied to exact landing intent and public review state. | Only fail-closed/non-passing behavior can proceed. | Yes, unless an approved equivalent source is later identified. |
| No approved landing medical review model | Reviews/contact/media/license review statuses exist for other purposes, but no landing content medical review status exists. | Medical landing pages could appear to have reviewed medical content without a real review workflow. | `medicalReviewStatus: 'missing'` or `'required'`; `not_required` only if explicitly modeled and approved. | Approved landing content review model with medical review status, reviewer workflow, and exact content/surface mapping. | Only fail-closed/non-passing behavior can proceed. | Yes. |
| Unclaimed listing count policy unresolved | `centers` and `doctors` include `is_claimable`, `verification_status`, `status`, `is_active`, and `deleted_at`; public RLS allows active status, active rows, and not-deleted rows but does not decide unclaimed SEO threshold eligibility. | Thin landing pages could pass from unclaimed/unverified listings without an approved quality policy. | Exclude unclaimed listings from passing evidence or fail closed when claim status matters and cannot be safely determined. | Product/SEO policy defining whether claimable/unclaimed public active listings count toward landing thresholds and under what verification/quality conditions. | A fail-closed skeleton can proceed. Data-bearing helpers should not count unclaimed rows as passing evidence until resolved. | Policy may be enough; migration may be needed if claim/verification state must be normalized. |
| Specialty relationship semantics unresolved | Specialty signals exist at `doctors.primary_specialty_id`, `doctor_practice_locations.primary_specialty_id`, `doctor_services.specialty_id`, and `center_services.specialty_id`; no `doctor_specialties` or `center_specialties` table exists. | Counts may double-count, conflict, or mix primary specialty, location-specific specialty, service specialty, and center specialty semantics. | Do not treat all specialty sources as interchangeable; mark relationship ambiguity and fail closed on conflicts. | Approved canonical precedence or dedicated relationship tables with public/RLS-safe policies and count rules. | Specialty and specialty-area data-bearing helpers should remain blocked for passing outputs. | Likely yes if dedicated specialty relationship tables are required; otherwise policy can define precedence. |
| Service slug ambiguity across taxonomy groups | `services` has unique `(taxonomy_group_id, slug)`, not global `slug`. | `/services/[serviceSlug]` can match multiple public services in different taxonomy groups. | If more than one public active service matches a route slug, set `entityIsAmbiguous: true` and `canonicalIsUnique: false`; do not choose first row. | Global service slug uniqueness, route taxonomy context, or canonical service alias/route table. | Service helpers can proceed only if they fail closed on duplicate slug. Passing outputs require uniqueness for the requested slug. | Possibly, if canonical service route mapping is added. |
| Area slug ambiguity across city context | `geo_areas` has unique `(city_id, slug)`, not country-wide slug uniqueness. | `/areas/[areaSlug]` can match multiple public areas across cities in Oman. | If more than one public active area matches a route slug in supported country context, set `entityIsAmbiguous: true` and `canonicalIsUnique: false`; do not choose first row. | City context in route, country-wide area slug uniqueness, or canonical area route mapping. | Area helpers can proceed only if they fail closed on duplicate slug. Passing outputs require uniqueness for the requested slug. | Possibly, if canonical area route mapping is added. |
| `doctor_services` alone does not prove public center/location eligibility | Public RLS for `doctor_services` requires the row to be available/not deleted and parent doctor active/not deleted/status active, but does not require linked center, center location, or practice location to be public eligible. | Area/service-area counts could include doctors without verified public location evidence for the requested area or center context. | Do not count `doctor_services` alone for area/service-area evidence; require public active practice-location and/or center-location evidence. | Approved provider count rule requiring public practice location evidence and exact join path for service-area/specialty-area counts. | Service-only probes can use it cautiously for doctor-service association, but service-area and area counts must require location evidence. | Policy may be enough; migration may be needed if relationships need stronger constraints. |

## 6. Unclaimed Listing Policy

Current center fields include `verification_status`, `status`, `is_active`, `is_claimable`, and `deleted_at`. Current doctor fields likewise include `verification_status`, `status`, `is_active`, `is_claimable`, and `deleted_at`. Public RLS for centers and doctors uses active status, active rows, and not-deleted rows; it does not require `verification_status = 'verified'` and does not define claim status as an SEO threshold criterion.

Decision: unclaimed active public listings are not clearly approved for landing-page quality thresholds. Future helpers must not silently count unclaimed listings as passing evidence. Until an explicit public listing/SEO quality policy approves them, default behavior is:

- exclude unclaimed/claimable listings from passing threshold evidence when claim state is needed; or
- fail closed with a policy blocker if excluding them cannot be implemented safely from current fields.

This policy does not hide or change existing public catalog behavior. It only controls future landing-page quality-gate counts.

## 7. Specialty Relationship Policy

Current specialty relationship evidence:

- `doctors.primary_specialty_id`: doctor-level primary specialty. Useful as a broad provider identity signal, but not necessarily center/location-specific.
- `doctor_practice_locations.primary_specialty_id`: doctor-at-practice-location specialty. More location-specific, but it may conflict with doctor-level primary specialty.
- `doctor_services.specialty_id`: doctor service/specialty row. Useful for offered-service context, but may not prove public center/location eligibility by itself.
- `center_services.specialty_id`: center service/specialty row. Useful for center-level specialty/service availability, but may be center-wide or optionally tied to a center location.
- `doctor_specialties`: absent.
- `center_specialties`: absent.

Decision: SEO-D3D2A does not approve treating all specialty sources as interchangeable. Specialty and specialty-area helpers remain blocked for passing data-bearing outputs until a canonical specialty relationship policy is approved.

Recommended future canonical precedence, if no dedicated relationship tables are created:

1. For specialty-area provider counts, prefer `doctor_practice_locations.primary_specialty_id` only when the practice location is public active and tied to the requested public area through public center-location evidence.
2. For specialty-area center counts, prefer `center_services.specialty_id` only when the row is public available and either location-specific to the requested public center location or joined through a clearly approved center-location rule.
3. Use `doctor_services.specialty_id` only when joined to public doctor, public practice location, and public center/location evidence for area-specific counts.
4. Use `doctors.primary_specialty_id` only for broad specialty-only provider identity after an approved policy decides whether broad doctor-level primary specialty can count toward landing thresholds.

Fail-closed behavior:

- conflicting specialty IDs across sources must set `entityIsAmbiguous: true`, `canonicalIsUnique: false`, or `helperAvailable: false`;
- missing relationship evidence must not be converted into passing counts;
- helpers must not choose the first available relationship source arbitrarily.

## 8. Service Slug Ambiguity Policy

Current `services` uniqueness is `(taxonomy_group_id, slug)`, not global `slug`. Therefore, `/[locale]/[country]/services/[serviceSlug]` and `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` cannot safely assume `serviceSlug` alone identifies exactly one service.

Decision: service routes using only `serviceSlug` are safe only when the helper can prove exactly one public active service matches the slug in the supported context. If multiple public active services match, future helpers must fail closed with `entityIsAmbiguous: true` and `canonicalIsUnique: false`. They must not choose the first row.

To unblock consistently, a future phase should add or approve one of:

- global public service slug uniqueness;
- taxonomy context in the route;
- a canonical service route mapping table;
- a canonical service alias table with public uniqueness constraints.

## 9. Area Slug Ambiguity Policy

Current `geo_areas` uniqueness is `(city_id, slug)`, not country-wide slug uniqueness. Therefore, `/[locale]/[country]/areas/[areaSlug]` and area-bearing landing routes cannot safely assume `areaSlug` alone identifies exactly one area across Oman.

Decision: area routes using only `areaSlug` are safe only when the helper can prove exactly one public active area matches the slug in supported country context. If multiple public active areas match, future helpers must fail closed with `entityIsAmbiguous: true` and `canonicalIsUnique: false`. They must not choose the first row.

To unblock consistently, a future phase should add or approve one of:

- city context in the route;
- country-wide area route slug uniqueness;
- a canonical area route mapping table;
- a canonical area alias table with public uniqueness constraints.

## 10. Provider Count Policy

Decision: future landing-page provider counts should count distinct public eligible `doctors.id` only when public practice-location evidence is available for landing families where location or center eligibility matters.

Required baseline provider filters:

- doctor row is public/RLS-visible;
- `doctors.deleted_at IS NULL`;
- `doctors.is_active = true`;
- `doctors.status = 'active'`;
- relationship row is public/RLS-visible, active/available, and not deleted;
- for area, specialty-area, and service-area families, a public active practice-location and public center-location path must prove the requested area.

`doctor_services` alone is insufficient for area and service-area counts because it does not by itself prove public center/location eligibility. For service-only pages, `doctor_services` may be considered as a doctor-service association only if the helper remains fail-closed for missing public center/practice-location policy and does not produce passing gate outputs until provider-count policy is approved.

Default fail-closed behavior:

- missing public practice-location evidence means the doctor does not count for area or exact combination thresholds;
- conflicting doctor-service/practice-location/center-location evidence means ambiguity;
- doctors without public active practice locations do not count toward passing landing thresholds by default.

## 11. Center Count Policy

Decision: future center counts should count distinct public eligible `centers.id` only when the center and required relationship/location rows are public eligible.

Required baseline center filters:

- center row is public/RLS-visible;
- `centers.deleted_at IS NULL`;
- `centers.is_active = true`;
- `centers.status = 'active'`;
- for area-bearing families, a public active `center_locations` row must prove the requested area;
- for service-bearing families, a public available `center_services` row must prove the requested service;
- for specialty-bearing families, a public available `center_services.specialty_id` row may be considered only after specialty relationship policy is approved.

Default fail-closed behavior:

- center rows without required public relationship evidence do not count;
- center service rows without clear location evidence do not count for exact area combinations unless a center-wide-to-location policy is approved;
- unclaimed/claimable centers do not count as passing threshold evidence unless explicitly approved.

## 12. Exact Combination Count Policy

### Service-area exact combination

A future service-area exact combination count may be safe only when all of the following are true:

- service slug resolves to exactly one public active service;
- area slug resolves to exactly one public active area in supported country context;
- center evidence uses public active centers, public active center locations in the requested area, and public available center service rows for the requested service;
- provider evidence uses public active doctors, public active practice locations/center locations in the requested area, and public available doctor service rows for the requested service;
- no duplicate/ambiguous service, area, or relationship path exists.

Current decision: service-area exact counts are partially possible as conservative probes but are not approved for passing outputs until service slug ambiguity, area slug ambiguity, provider location policy, unclaimed listing policy, intro/local relevance, and medical review blockers are resolved.

### Specialty-area exact combination

A future specialty-area exact combination count may be safe only when all of the following are true:

- specialty slug resolves to exactly one public active specialty;
- area slug resolves to exactly one public active area in supported country context;
- canonical specialty relationship precedence is approved or dedicated relationship tables exist;
- center/provider evidence is public active and area-specific;
- no conflicting specialty source exists.

Current decision: specialty-area exact counts are blocked for passing outputs because specialty relationship semantics are unresolved.

Default fail-closed behavior for all exact combinations:

- return `exactCombinationCount: 0` or a conservative non-passing value when exact evidence is missing;
- mark ambiguity when duplicate entities or conflicting relationships appear;
- never substitute broad service/specialty counts or broad area counts for exact combination counts.

## 13. Content Source Policy

`hasUniqueVisibleIntro` must be `false` unless a human-reviewed, public-approved landing content source exists for the exact locale, country, family, and entity/combination.

`hasLocalRelevance` must be `false` unless an approved local relevance source exists for the exact area-bearing landing intent.

Future helpers must not generate text. They must not use service names, specialty names, area names, provider density, center counts, reviews, keyword demand, metadata, descriptions, or `data/seo/drmuscat-keyword-seed.json` as fallback intro/local relevance content.

Decision: no current schema source unblocks these fields. Passing gate outputs are blocked.

## 14. Medical Review Policy

`medicalReviewStatus` must be `'missing'` or `'required'` unless an approved landing content review model exists for the exact landing content/surface.

`not_required` may be returned only when explicitly modeled and approved for the exact landing intent. It must not be inferred from an area-only family, service name, specialty name, entity existence, provider count, center count, or keyword demand.

Future helpers must not generate medical copy, medical advice, treatment descriptions, preparation/recovery/risk content, pricing claims, insurance claims, outcome claims, or service descriptions.

Decision: no current landing content medical review model exists. Passing gate outputs are blocked for any landing intent that needs reviewed content.

## 15. Canonical Uniqueness Policy

`canonicalIsUnique` may reflect only slug/entity uniqueness for the requested family. The helper must not generate canonical URLs and must not output canonical URL values, hreflang values, metadata, schema, sitemap entries, robots rules, or `llms.txt` content.

Ambiguous slug states must return `canonicalIsUnique: false`, `entityIsAmbiguous: true`, `helperAvailable: false`, or another conservative fail-closed state. Examples include:

- multiple public active services matching the same `serviceSlug`;
- multiple public active areas matching the same `areaSlug` in supported country context;
- conflicting specialty relationship sources;
- unsupported family/locale/country;
- private-risk or mixed public/private uncertainty.

## 16. Recommended Next Runtime Path

Recommended next runtime path: **fail-closed skeleton only**, and only if a separate future `PHASED_BUILD_ONLY` implementation task explicitly approves it.

Reasoning:

- Full helper implementation is blocked by missing content/review/local relevance models and unresolved relationship/count policies.
- A limited data-bearing subset could still create ambiguity around service slugs, area slugs, provider location evidence, and unclaimed listings.
- No runtime helper is still the safest path, but if implementation sequencing requires a code artifact, a fail-closed skeleton can establish types and signatures without database queries or passing outputs.

SEO-D3D2A itself does not authorize even the skeleton. It only recommends it as the narrowest future runtime path if separately approved.

## 17. Allowed Shape of a Future Fail-Closed Skeleton

If separately approved, a fail-closed skeleton may:

- export types for result/error/source-table names;
- export function signatures for the five planned helper families;
- validate locale, country, and family values;
- return `helperAvailable: false` or conservative `LandingPageGateInput`-compatible data;
- set `privateDataExcluded: true` only if no private source is touched;
- set `entityExists: false` only when safely known without DB access, otherwise use helper unavailable;
- set `hasUniqueVisibleIntro: false`;
- set `hasLocalRelevance: false`;
- set `medicalReviewStatus: 'missing'` or `'required'`;
- set `canonicalIsUnique: false` when uniqueness is not proven;
- produce no passing gate outputs.

A fail-closed skeleton must not:

- perform DB queries;
- import or instantiate Supabase clients;
- import service-role code;
- import keyword seed JSON;
- read files at runtime;
- return SEO copy or medical copy;
- return metadata/canonical/hreflang/schema/sitemap/robots/`llms.txt` outputs;
- integrate with routes.

## 18. Data-Bearing Helper Subset Decision

No data-bearing helper subset is approved by this document.

If a future task nevertheless proposes a data-bearing subset, the least risky candidates are entity/count probes for `area`, `service`, and `service_area`, but only with strict fail-closed handling for duplicate area slugs, duplicate service slugs, provider location evidence, unclaimed listings, missing intro, missing local relevance, and missing medical review. Specialty and specialty-area helpers remain blocked for passing outputs until specialty relationship semantics are approved.

## 19. Future Migration / Content-Model Needs

Future phases may need an approved schema/content model such as `landing_page_content` or an equivalent. Any such model requires a separate migration/RLS/content approval phase and must not be created by SEO-D3D2A.

Potential future needs:

- landing content table or equivalent with locale, country, family, and entity/combination mapping;
- content review status fields;
- public visibility fields;
- human reviewer workflow fields;
- medical review status fields;
- local relevance fields or source links;
- uniqueness constraints for one approved public intro per landing intent;
- canonical route/entity uniqueness constraints if needed;
- dedicated `doctor_specialties` and/or `center_specialties` tables if canonical specialty policy requires them;
- service canonicalization or service alias/route mapping if `serviceSlug` remains route-only;
- area canonicalization or area alias/route mapping if `areaSlug` remains route-only;
- RLS policies for any new public content or relationship tables;
- validation/static checks to prevent private content or unapproved medical copy from reaching public helpers.

## 20. Validation Expectations for This Documentation-Only Task

After creating this documentation-only file, run:

- `git status --short`
- `test -f src/lib/catalog/public-landing-page-schema-decision-map.md && echo "SEO-D3D2A decision map exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Expected result:

- only `src/lib/catalog/public-landing-page-schema-decision-map.md` is created;
- no runtime code changes;
- no tests are added;
- no route integration is added;
- no query helper is created;
- no schema, sitemap, metadata, robots, or `llms.txt` files change;
- no command result is faked or silently skipped;
- `pnpm lint` may show warnings only, but must have no errors.

## 21. Open Blockers After This Document

Open blockers remain:

1. Approve or create a landing intro content source.
2. Approve or create a local relevance source.
3. Approve or create a landing medical review model.
4. Decide unclaimed listing count policy.
5. Decide canonical specialty relationship precedence or create dedicated relationship tables.
6. Resolve service slug ambiguity through route context, global uniqueness, or canonical mapping.
7. Resolve area slug ambiguity through city context, country-wide uniqueness, or canonical mapping.
8. Decide provider count rules requiring public active practice-location evidence.
9. Decide center-wide service/specialty rows versus location-specific exact combination rules.
10. Define future static tests/route checks before any data-bearing helper or route integration.

## 22. Final Recommendation

Do not approve full runtime public landing query helpers yet.

The next safe implementation, if a runtime step is required, is a separately approved fail-closed skeleton in `src/lib/catalog/public-landing-page-queries.ts` only. That skeleton should export types and function signatures, validate locale/country/family, and return conservative non-passing outputs without database queries, Supabase imports, service-role usage, route integration, metadata, sitemap/schema/robots/`llms.txt` changes, keyword seed runtime usage, content generation, or medical copy.

Before data-bearing helpers can be approved, DrMuscat should complete a separate schema/content/policy phase for landing content, local relevance, medical review, unclaimed listing thresholds, specialty relationships, service canonicalization, area canonicalization, and public/RLS-safe count semantics.
