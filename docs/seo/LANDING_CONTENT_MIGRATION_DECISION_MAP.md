# SEO-D3H3B-A — Landing Content Migration Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H3B-A. It records a conservative future migration decision map for a bounded landing content table and associated review/status model.

This document does not authorize SQL, migrations, RLS, generated database type changes, Supabase client/type changes, database queries, service-role usage, runtime helpers, data-bearing public query helpers, route integration, route-check changes, metadata, `generateMetadata`, `generateStaticParams`, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, CMS UI, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, landing content, medical copy, service descriptions, local area descriptions, content generation, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, migration/RLS impact, route impact, SEO/crawler impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, SEO-D3H3B, SEO-D3H3A, SEO-D3H2, existing helper contracts, existing route checks, or stricter security/SEO guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing content migration documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H3B-A

## 3. Relationship to Prior Phases

### SEO-D3H3B Plan

SEO-D3H3B was a PLAN ONLY task. It concluded that no migration implementation should happen yet, and that the safest next step is a documentation-only migration decision map before any schema, RLS, helper, route, crawler, or content work.

SEO-D3H3B-A implements only that documentation artifact. It does not create migrations, database types, RLS policies, route behavior, helper behavior, crawler signals, or public content.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A established that existing service descriptions, specialty descriptions, provider descriptions, reviews, media captions, slugs, counts, keyword seed data, and generated content are not valid landing content sources. It also established that future landing content must be unique per locale/country/family/canonical entity key, published, editorially approved, medically approved or explicitly `not_required`, and tied to resolved canonical identity.

SEO-D3H3B-A preserves those constraints and narrows the future migration direction to a bounded landing content table only.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 concluded that `areaSlug` alone is not canonical because `geo_areas.slug` uniqueness is scoped by `city_id`. Area-bearing route families must remain fail-closed until city-context routing, an approved `canonical_area_key`, or another approved canonical area identity model exists.

SEO-D3H3B-A does not resolve area canonicalization and does not make area-bearing content publishable.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no further route integration or data-bearing landing query helper work should proceed until blockers are resolved. SEO-D3H3B-A records one future schema direction but does not remove the blockers.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 and SEO-D3F2 integrated the service and service-area landing scaffold routes only in a fail-closed manner. They validate locale/country, call the skeleton helper, pass fail-closed input into the decision helper, and still end in `notFound()`.

SEO-D3H3B-A does not authorize changing those routes. The service and service-area routes must remain fail-closed.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced skeleton landing gate helpers. All current landing helpers return fail-closed output with no source tables, no content payload, no Supabase usage, and no database queries.

SEO-D3H3B-A does not authorize a data-bearing helper.

### Decision Helper

The decision helper remains a pure evaluator over supplied gate inputs. It does not fetch, resolve, canonicalize, publish, render, generate crawler signals, or expose content. Its outputs remain unsafe for visible noindex and unsafe for indexing.

SEO-D3H3B-A does not authorize changing the decision helper.

### Route-Check Guardrails

Current route-check guardrails protect the fail-closed posture by checking selected route integrations, skeleton helper behavior, forbidden runtime/crawler/content tokens, and absence of forbidden route families. SEO-D3H3B-A does not authorize route-check changes.

## 4. Current Blocker Posture

- No dedicated landing content table exists.
- No landing content migration is authorized by this document.
- The skeleton helper remains fail-closed.
- Public helpers cannot expose content payloads such as title, intro, sections, FAQ, reviewer data, admin notes, or metadata payloads.
- No route, crawler, metadata, sitemap, robots, `llms.txt`, schema, visible noindex, indexable page, or public rendering changes are authorized.
- Area canonicalization still blocks area-bearing publishability because `areaSlug` alone is insufficient.
- Local relevance remains unresolved and must not be inferred from slugs, counts, provider density, or generic area names.
- RLS planning remains unresolved and must be handled before any public SELECT policy or public helper can rely on landing content.

## 5. Existing Schema Conventions

### Enum Conventions

Existing enums use lowercase snake_case type names and lowercase snake_case values. Examples include `app_locale`, `country_code`, `provider_status`, `review_status`, `media_asset_status`, `media_asset_source`, and `review_report_status`.

The current launch locale/country primitives are `app_locale` with `en` and `ar`, and `country_code` with `om`. Future landing content should reuse these existing primitives for locale and country rather than inventing duplicate text-only conventions.

### Table Conventions

Tables are plural snake_case names under the `public` schema. Current identity and catalog tables include `geo_countries`, `geo_cities`, `geo_areas`, `services`, `specialties`, `centers`, and `doctors`.

A future landing content table should follow the same plural snake_case convention.

### FK Conventions

Foreign key fields generally use `_id` suffixes and inline references to canonical tables, such as `country_id`, `city_id`, `taxonomy_group_id`, `category_id`, `primary_specialty_id`, `center_id`, and `doctor_id`.

A future landing content table should use explicit FK fields such as `service_id`, `specialty_id`, `area_id`, `city_id`, and profile actor references using `_profile_id` suffixes.

### Timestamp and `deleted_at` Conventions

Mutable tables generally include `created_at timestamptz`, `updated_at timestamptz`, and nullable `deleted_at timestamptz`. Existing tables commonly use an updated-at trigger backed by `public.set_updated_at()`.

Soft deletion is represented with `deleted_at`, and visibility/index patterns commonly distinguish active rows with `deleted_at IS NULL` from deleted rows with partial indexes for `deleted_at IS NOT NULL`.

### Lifecycle, Status, Review, and Moderation Conventions

Existing status fields combine lifecycle and visibility gates:

- providers use `provider_status`, `verification_status`, `is_active`, and `deleted_at`;
- reviews use `review_status` with approved/rejected/hidden/flagged states and approval/rejection timestamps;
- media assets use `media_asset_status`;
- entity media adds `public_media_visible`, `media_review_status`, and `media_reviewed_at`;
- contact visibility fields use `contact_review_status` and `contact_reviewed_at` on provider/contact records;
- license visibility uses `public_license_visible`, `license_review_status`, and `license_reviewed_at`.

Future landing content should use explicit lifecycle, editorial review, and medical review states rather than relying on generic provider, review, media, or contact visibility fields.

### Index and Constraint Conventions

Existing migrations use named constraints, partial indexes for nullable foreign keys, partial indexes for deleted rows, status/queue indexes, and public lookup indexes that match visibility gates.

A future landing content migration should use named constraints, partial lookup indexes, review queue indexes, and one partial uniqueness rule for live published canonical content.

### Public/Private RLS Policy Conventions

Public SELECT policies are fail-closed and generally require non-deleted rows plus explicit visibility/status gates. Geo and taxonomy tables require active and non-deleted rows. Public providers require active, non-deleted, and public status. Reviews and media require approved, non-deleted states. Hardened media/license access requires explicit visibility and approved review status.

Future landing content public SELECT must be at least as strict: published, editorially approved, medically approved or explicitly not required, not deleted, canonical identity resolved, and related public entities safe.

### Generated Database Type Implications

Generated database types reflect current tables and enums. Any future migration that adds landing content enums or tables must be followed by a generated type update in the same approved implementation phase. This document does not authorize generated type changes.

## 6. Future Migration Scope Decision

Conservative decision: a future migration, if separately approved, should create one main table first: `public.landing_page_contents`.

The future migration should not create:

- a broad CMS;
- route/crawler tables;
- content generation tables;
- seed data;
- a local relevance table yet;
- a content versions table yet;
- a separate review table unless later approved;
- helper integration;
- route integration;
- crawler exposure.

A single bounded table is sufficient for the first schema decision because the immediate need is to record unique, reviewed, publishable landing content identity without expanding into CMS, workflow, generation, or crawler infrastructure.

## 7. Proposed Table Name

Recommended future table name: `public.landing_page_contents`.

Reasons:

- It matches plural snake_case table naming.
- It clearly scopes the model to landing-page content.
- It avoids implying a broad CMS.
- It is neutral across SEO helper, content review, and future admin workflows.

Names not recommended now:

- `public.seo_landing_contents`: acceptable but less neutral because it over-emphasizes SEO rather than the bounded content/review model.
- `public.public_landing_content`: confusing because not all fields are public and private review/audit fields must remain hidden.
- `public.cms_landing_pages`: too broad because no CMS is approved and this task must not imply CMS UI, article pages, or general content management.

## 8. Proposed Enum Strategy

This section is conceptual only and does not authorize enum creation.

### `landing_page_family`

Future values:

- `specialty`
- `specialty_area`
- `area`
- `service`
- `service_area`

These values align with current landing gate families and should not add new route families.

### `landing_content_status`

Future values:

- `draft`
- `in_review`
- `approved`
- `published`
- `archived`
- `rejected`

Only `published` should ever be eligible for public SELECT. `approved` alone should not imply publication.

### `landing_editorial_review_status`

Future values:

- `missing`
- `pending`
- `approved`
- `rejected`

### `landing_medical_review_status`

Future values:

- `missing`
- `not_required`
- `required`
- `pending`
- `approved`
- `rejected`

### Public Helper Mapping

Future data-bearing helpers, if separately approved, should map internal review states to public gate values conservatively:

| Internal status | Public gate value |
| --- | --- |
| `approved` | `approved` |
| `not_required` | `not_required` |
| `missing` | fail-closed as `missing` |
| `pending` | fail-closed as `required` or `missing` |
| `rejected` | fail-closed as `required` or `missing` |
| `required` | fail-closed as `required` |

Unknown, unavailable, ambiguous, or unclassified review status must fail closed.

## 9. Proposed Conceptual Fields

This section is conceptual only and does not authorize SQL implementation.

### Identity Fields

- `id`
- `locale`
- `country_code` or `country_id`
- `family`
- `service_id`
- `specialty_id`
- `area_id`
- `city_id` for area-bearing content
- `canonical_landing_key`
- `canonical_area_key` only if later approved by area canonicalization planning

### Content Fields

- `title`
- `intro`
- `sections` as nullable structured data
- `faq` as nullable structured data, disabled for public use unless separately approved

### Lifecycle and Review Fields

- `status`
- `editorial_review_status`
- `medical_review_status`
- `is_medical`
- `requires_medical_review`

### Audit Fields

- `created_by_profile_id`
- `updated_by_profile_id`
- `reviewed_by_profile_id`
- `reviewed_at`
- `medical_reviewer_profile_id`
- `medical_reviewed_at`
- `published_by_profile_id`
- `published_at`
- `created_at`
- `updated_at`
- `deleted_at`

## 10. Proposed Conceptual Constraints

This section is conceptual only and does not authorize constraint creation.

Future constraints should cover:

- `locale` uses supported `app_locale` values.
- Country identity uses supported `country_code` or is consistent with a `geo_countries` FK.
- Family and entity references are consistent.
- Service families require `service_id`.
- Specialty families require `specialty_id`.
- Area family requires approved area identity.
- Non-area families must not have `area_id`, `city_id`, or `canonical_area_key`.
- Area-bearing families must have `area_id` and `city_id`, or an approved `canonical_area_key` model.
- Published rows require editorial review approved.
- Published rows require medical review approved or explicitly `not_required`.
- Published rows require non-empty `title` and `intro`.
- Published rows require `canonical_landing_key`.
- Published rows require `published_at` and `published_by_profile_id`.
- Published rows require `deleted_at` to be absent.
- There can be only one live/published content record per locale/country/family/canonical landing key.

Draft, pending, rejected, and archived rows may need different uniqueness behavior later, but they must never create public helper ambiguity.

## 11. Proposed Conceptual Indexes

This section is conceptual only and does not authorize index creation.

Future indexes should include:

- public lookup by locale, country, family, canonical landing key, status, and deletion state;
- partial uniqueness for published, non-deleted canonical content;
- `service_id` lookup for service/service-area families;
- `specialty_id` lookup for specialty/specialty-area families;
- `area_id` and `city_id` lookup for area-bearing families;
- review queue indexes by status, editorial review status, and medical review status;
- `published_at` index for published content ordering/auditing;
- partial `deleted_at` index for deleted rows.

Indexes should support future fail-closed helper checks without requiring broad scans or exposing private draft/review data.

## 12. RLS Planning Boundary

No RLS implementation is authorized now.

Future public SELECT should be allowed only for rows that are all of:

- `published`;
- editorial review approved;
- medical review approved or explicitly `not_required`;
- not deleted;
- canonical identity resolved;
- related public taxonomy/geo entities active and non-deleted.

Drafts, rejected rows, pending rows, archived rows, internal notes, private review fields, admin-only fields, CRM/provider-dashboard/billing fields, and reviewer/admin actor fields must remain hidden from public helpers and public clients.

Public helpers must not use service-role access and must not bypass RLS. RLS implementation requires SEO-D3H3C — Landing Content RLS Plan first, followed by a separate approved implementation phase if authorized.

## 13. Data-Bearing Helper Implications

Data-bearing helpers remain blocked now.

Future helper behavior, if separately approved, must obey these boundaries:

- read derived gate status only;
- do not expose `title`, `intro`, `sections`, `faq`, reviewer fields, admin notes, or metadata payloads;
- fail closed on ambiguous, missing, multiple, inconsistent, pending, rejected, unavailable, or unsafe content;
- do not use service-role access;
- do not use keyword seed JSON at runtime;
- do not set `hasUniqueVisibleIntro: true` until one published, approved, unique content record exists for the requested locale/country/family/canonical key;
- do not set `hasLocalRelevance: true` until an approved local relevance source exists.

The helper should continue to expose only derived booleans/status values needed by the gate contract.

## 14. Area and Canonical Dependency

`areaSlug` alone remains insufficient.

Area-bearing future rows require `city_id` plus `area_id`, or an explicitly approved `canonical_area_key` model. A migration must not imply current area route publishability, and content existence must not be treated as proof of canonical uniqueness.

The service-area route must remain fail-closed until area identity, content review, local relevance, RLS, helper readiness, route-check updates, and crawler/metadata planning are separately approved.

## 15. Local Relevance Dependency

This migration map does not solve local relevance fully.

Local relevance should be deferred to SEO-D3H3D — Local Relevance Source Plan. If local relevance later lives inside `sections`, those sections must still require approved review, medical review or explicit not-required classification, canonical identity, publication status, and RLS-safe public visibility.

Local relevance must not be inferred from slugs, route existence, provider density, counts, city names, area names, taxonomy names, provider descriptions, or generated copy.

## 16. Migration Ordering Plan

Future only, if an implementation phase is separately approved:

1. Create future landing content enum types.
2. Create the bounded landing content table.
3. Add constraints.
4. Add indexes.
5. Add an updated-at trigger consistent with current mutable table conventions.
6. Enable RLS only if explicitly approved in that implementation phase, otherwise defer to the RLS phase.
7. Do not create broad public SELECT until the RLS plan is approved.
8. Regenerate generated database types only in the migration implementation phase.
9. Add no seed data.
10. Add no route, helper, route-check, sitemap, robots, `llms.txt`, schema, metadata, crawler, UI, or content integration.

## 17. Rollback Considerations

- Enum rollback is harder than table/index rollback because future columns may depend on enum types.
- Table and index rollback is simpler before seed data, helper integration, route integration, and RLS policies depend on the table.
- No seed data should be added in the first migration.
- No runtime dependency should exist yet.
- Avoid broad CMS, local relevance, versioning, route, or generation tables now to reduce rollback and scope risk.

## 18. Migration Implementation Decision

No migration implementation should happen next.

Reasons:

- RLS planning remains unresolved.
- Local relevance remains unresolved.
- Area identity remains unresolved for area-bearing content.
- Public helper behavior remains blocked.
- Route/crawler/metadata/indexability planning remains blocked.
- Human product/legal/medical review may still be required before schema implementation.

A table plan alone does not make landing pages publishable or safe for public indexing.

## 19. Recommended Next Subphase

Recommended next subphase: SEO-D3H3C — Landing Content RLS Plan.

This is conservative because public visibility rules must be specified before any migration implementation can safely expose or protect landing content. SEO-D3H3D — Local Relevance Source Plan should follow or run later as a separate planning task before any area-bearing/helper publication work.

If human product/legal/medical stakeholders are unavailable to approve review semantics, stop before migration implementation.

## 20. Exact Allowed Files for Next Recommended Task

If SEO-D3H3C is documentation-only, allowed files should be limited to one `docs/seo/*.md` file.

No code, routes, migrations, generated types, package files, tests, crawler-facing files, public UI, public content, or data files should be edited by default.

## 21. Exact Forbidden Files for Next Recommended Task

Forbidden unless a later task explicitly approves them:

- routes under `src/app/**`;
- `scripts/routes-check.mjs`;
- helpers under `src/lib/catalog/**`;
- decision helpers under `src/lib/seo/**`;
- migrations under `supabase/migrations/**`;
- generated types under `supabase/types/**`;
- Supabase client/type files under `src/lib/supabase/**`;
- `package.json`;
- `pnpm-lock.yaml`;
- `vitest.config.ts`;
- `src/app/sitemap.ts`;
- `src/app/robots.ts`;
- `public/llms.txt`;
- `data/seo/**`;
- tests;
- public UI/content files.

## 22. Validation Expectations

For this documentation-only task, validation should confirm that exactly one allowed documentation file was created and no forbidden files were edited. Expected commands:

- `git status --short`
- `test -f docs/seo/LANDING_CONTENT_MIGRATION_DECISION_MAP.md && echo "SEO-D3H3B-A landing content migration decision map exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

No validation command may be faked or skipped silently. If any validation fails, the failure must be reported with the smallest safe follow-up recommendation and without weakening TypeScript, lint, migrations, RLS, route checks, or SEO guardrails.
