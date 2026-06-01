# SEO-D3H3A — Landing Content Review Model Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H3A. It defines a conservative future decision map for landing content and review modeling before any visible noindex page, indexable landing page, data-bearing landing query helper, metadata, sitemap, schema, crawler, or content-generation work.

This document does not authorize implementation. It does not authorize migrations, SQL changes, Supabase usage, database queries, service-role usage, route integration, route-check changes, helper changes, tests, CMS records, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, medical content, service descriptions, local area descriptions, metadata, `generateMetadata`, `generateStaticParams`, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, database/RLS impact, route impact, SEO/crawler impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, project-state files, V10.4 master-spec files, V10.5 addendums, existing SEO decision documents, route-check guardrails, or stricter security/SEO instructions, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / landing content review model documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H3A

## 3. Relationship to Prior Phases

### SEO-D3H3

SEO-D3H3 was a PLAN ONLY task. It concluded that DrMuscat needs a conservative landing content and review model decision map before any public landing page rendering, visible noindex/indexable behavior, data-bearing helper, metadata, sitemap, schema, or content-generation work.

SEO-D3H3A implements only that documentation decision map. It does not move the platform closer to runtime publication by itself.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 created `docs/seo/AREA_CANONICALIZATION_DECISION_MAP.md` and concluded that `areaSlug` alone is not sufficient canonical area identity because current `geo_areas.slug` uniqueness is scoped to `city_id`. Area-bearing routes must remain fail-closed until city-context routing, a canonical area key, or another approved area identity model exists.

SEO-D3H3A preserves that blocker. A future content table must not bypass unresolved area canonicalization.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no further route integration and no data-bearing public landing query helper should proceed until blockers are resolved. SEO-D3H3A documents one blocker class: reviewed, unique, canonical landing content.

### SEO-D3E2 and SEO-D3F2 Fail-Closed Routes

SEO-D3E2 integrated the service landing scaffold route only in a fail-closed manner. SEO-D3F2 integrated the service-area landing scaffold route only in a fail-closed manner. Both routes validate locale/country, call the fail-closed skeleton helper, pass helper input into `decideLandingPageGate(...)`, and still end in `notFound()`.

SEO-D3H3A does not authorize changing either route.

### SEO-D3D2B Skeleton Helper

The skeleton helper in `src/lib/catalog/public-landing-page-queries.ts` exports landing gate helpers for specialty, specialty-area, area, service, and service-area families. All current helpers return fail-closed output and no source tables.

SEO-D3H3A does not authorize a data-bearing helper.

### Decision Helper

The landing decision helper in `src/lib/seo/landing-page-indexability.ts` is a pure evaluator over supplied gate inputs. It does not fetch data, render pages, publish content, or create crawler signals. Its current output keeps `safeForVisibleNoindex` and `safeForIndexing` false.

SEO-D3H3A does not authorize changing the decision helper.

### Route-Check Guardrails

`scripts/routes-check.mjs` currently guards the fail-closed posture by checking the skeleton helper, selected fail-closed service/service-area route integrations, disabled visible noindex/indexing flags, and forbidden runtime/crawler/content tokens.

SEO-D3H3A does not authorize route-check changes.

## 4. Current Public Landing Status

### Integrated Fail-Closed Routes

Current integrated fail-closed landing routes:

- `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx`

Both routes:

- validate locale and country;
- call the fail-closed landing skeleton helper;
- pass input into `decideLandingPageGate(...)`;
- always end in `notFound()`;
- render no public landing content;
- emit no metadata, schema, canonical, hreflang, sitemap, robots, or `llms.txt` behavior;
- use no database query, Supabase access, or public catalog runtime helper.

### Remaining Scaffold Routes

Current remaining scaffold routes are:

- `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx`
- `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx`

They validate locale/country and unconditionally call `notFound()`. They have no landing helper integration and no public rendering.

### Skeleton Helper State

The skeleton helper currently returns:

- `ok: false`;
- `entityExists: false`;
- provider, center, and exact-combination counts of `0`;
- `hasUniqueVisibleIntro: false`;
- `hasLocalRelevance: false`;
- `medicalReviewStatus: 'missing'`;
- `canonicalIsUnique: false`;
- `privateDataExcluded: true`;
- `helperAvailable: false`;
- `sourceTables: []`.

This state must remain unchanged until a separate approved implementation phase resolves the content/review/canonical blockers.

### Decision Helper State

The decision helper currently blocks on unsupported locale/country, forbidden family, invalid helper input, private-data risk, canonical conflict, unavailable helper, ambiguous entity, missing entity, invalid counts, missing or required medical review, missing visible intro, and missing local relevance for area-bearing families. It never marks output safe for visible noindex or indexing.

### Route-Check / Crawler Isolation

Route-check currently verifies that selected landing routes remain fail-closed and that public landing route/helper files do not introduce forbidden runtime, SEO, crawler, metadata, schema, monetization, or content behavior.

Crawler-facing files remain isolated from landing scaffolds:

- `src/app/sitemap.ts` lists only current approved route groups;
- `src/app/robots.ts` contains no landing-specific crawl rule;
- `public/llms.txt` lists only current phase public routes and crawler-facing files.

### No-Content / No-Metadata / No-Sitemap Posture

Current landing scaffolds publish no landing copy, no noindex page, no indexable page, no metadata, no canonical output, no hreflang output, no Open Graph output, no structured data, no sitemap entry, no robots rule, and no `llms.txt` entry.

SEO-D3H3A preserves that posture.

## 5. Current Content/Review Schema Inventory

This inventory documents current models that must not be confused with landing content.

### Landing Content / CMS Table

- Exists / not found: not found.
- Content-like fields: no dedicated landing `title`, `intro`, `sections`, `faq`, `canonical_landing_key`, or route-family content table exists.
- Review/status/approval fields: no landing-specific editorial or medical review model exists.
- Localization support: no landing-specific locale/country content workflow exists.
- Public visibility/RLS support: no landing content RLS policy exists.
- Suitability: not suitable because the model does not exist. Runtime helpers must not infer landing content from unrelated tables.

### `taxonomy_groups`

- Exists / not found: exists.
- Content-like fields: `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `metadata`.
- Review/status/approval fields: `is_medical`, `is_active`, `deleted_at`; no landing review workflow.
- Localization support: English and Arabic name/description fields.
- Public visibility/RLS support: public SELECT for active, non-deleted taxonomy groups.
- Suitability: not suitable for landing content because it is taxonomy metadata, not unique reviewed landing copy per locale/country/family/canonical key.

### `service_categories`

- Exists / not found: exists.
- Content-like fields: `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `metadata`.
- Review/status/approval fields: `is_medical`, `is_active`, `deleted_at`; no landing review workflow.
- Localization support: English and Arabic name/description fields.
- Public visibility/RLS support: public SELECT for active, non-deleted service categories.
- Suitability: not suitable because service categories are taxonomy nodes, not landing content records.

### `services`

- Exists / not found: exists.
- Content-like fields: `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `search_keywords_en`, `search_keywords_ar`, `metadata`.
- Review/status/approval fields: `is_medical`, `requires_medical_disclaimer`, `is_active`, `deleted_at`; no landing editorial approval, medical reviewer, or landing publication state.
- Localization support: English and Arabic fields.
- Public visibility/RLS support: public SELECT for active, non-deleted services.
- Suitability: not suitable because service descriptions are taxonomy descriptions, not unique landing intros by locale/country/family/canonical service identity.

### `specialties`

- Exists / not found: exists.
- Content-like fields: `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `metadata`.
- Review/status/approval fields: `is_medical`, `requires_medical_disclaimer`, `is_active`, `deleted_at`; no landing review workflow.
- Localization support: English and Arabic fields.
- Public visibility/RLS support: public SELECT for active, non-deleted specialties.
- Suitability: not suitable because specialty descriptions are generic taxonomy content, not reviewed landing content instances.

### `centers`

- Exists / not found: exists.
- Content-like fields: `name_en`, `name_ar`, `short_description_en`, `short_description_ar`, `description_en`, `description_ar`, image/contact fields, `metadata`.
- Review/status/approval fields: `status`, `verification_status`, `is_active`, `is_claimable`, `is_featured`, `deleted_at`; contact visibility review fields exist for contact exposure, not landing content review.
- Localization support: English/Arabic descriptions and `default_locale`.
- Public visibility/RLS support: public SELECT only when active, non-deleted, and `status = 'active'`.
- Suitability: not suitable because center descriptions are provider profile content, not route-family landing copy or local relevance proof.

### `center_services`

- Exists / not found: exists.
- Content-like fields: `slug`, `display_name_en`, `display_name_ar`, `description_en`, `description_ar`, `metadata`.
- Review/status/approval fields: `is_available`, `requires_medical_disclaimer`, `is_featured`, `deleted_at`; no landing review workflow.
- Localization support: English and Arabic display/description fields.
- Public visibility/RLS support: public SELECT requires non-deleted, available service linked to an active public center.
- Suitability: not suitable because it describes an individual center offering, not canonical landing content.

### `doctors`

- Exists / not found: exists.
- Content-like fields: `full_name_en`, `full_name_ar`, `display_name_en`, `display_name_ar`, `bio_en`, `bio_ar`, image/license fields, `metadata`.
- Review/status/approval fields: `verification_status`, `status`, `is_active`, `is_claimable`, `is_featured`, `deleted_at`; no landing content review workflow.
- Localization support: English/Arabic bio and display-name fields plus `default_locale`.
- Public visibility/RLS support: public SELECT only when active, non-deleted, and `status = 'active'`.
- Suitability: not suitable because doctor bios are provider profile content, not landing page intro or local relevance content.

### `doctor_services`

- Exists / not found: exists.
- Content-like fields: `slug`, `display_name_en`, `display_name_ar`, `description_en`, `description_ar`, `metadata`.
- Review/status/approval fields: `is_available`, `requires_medical_disclaimer`, `is_featured`, `deleted_at`; no landing review workflow.
- Localization support: English and Arabic display/description fields.
- Public visibility/RLS support: public SELECT requires non-deleted, available service linked to an active public doctor.
- Suitability: not suitable because it describes an individual doctor offering, not canonical landing copy.

### `reviews`

- Exists / not found: exists.
- Content-like fields: `title`, `body`, `rating`, `metadata`.
- Review/status/approval fields: `status`, `source_locale`, `is_verified`, `is_featured`, `submitted_at`, `approved_at`, `rejected_at`, `deleted_at`.
- Localization support: `source_locale` records review source locale; it is not landing content localization.
- Public visibility/RLS support: public SELECT only when non-deleted and `status = 'approved'`.
- Suitability: not suitable because patient reviews are user-generated feedback, not editorial landing copy, local relevance content, or medical-reviewed platform content.

### `review_reports`

- Exists / not found: present in schema/types and private RLS planning.
- Content-like fields: report reason/details are moderation data, not landing content.
- Review/status/approval fields: report status, reviewer references, reviewed timestamps.
- Localization support: none for landing content.
- Public visibility/RLS support: private report access only; not a public landing source.
- Suitability: not suitable because it is review moderation infrastructure.

### `media_assets`

- Exists / not found: exists.
- Content-like fields: asset URL/path, filename, MIME type, dimensions, metadata.
- Review/status/approval fields: `source`, `status`, `created_by_profile_id`, timestamps, `deleted_at`; status includes draft/pending/approved/rejected/hidden/archived.
- Localization support: none in `media_assets`.
- Public visibility/RLS support: public SELECT only for approved, non-deleted media assets.
- Suitability: not suitable because media approval does not approve landing text or medical/local content.

### `entity_media`

- Exists / not found: exists.
- Content-like fields: `alt_text_en`, `alt_text_ar`, `caption_en`, `caption_ar`, `metadata`.
- Review/status/approval fields: `public_media_visible`, `media_review_status`, `media_reviewed_at`, `is_primary`, `is_featured`, `deleted_at`.
- Localization support: English and Arabic alt/caption fields.
- Public visibility/RLS support: hardened public media policy requires public visibility, approved media review, approved asset, allowed entity/usage kind, and approved image MIME type.
- Suitability: not suitable because captions and alt text support media presentation/accessibility, not landing intro or local relevance copy.

### Geo Tables

- Exists / not found: `geo_countries`, `geo_regions`, `geo_cities`, and `geo_areas` exist.
- Content-like fields: slugs, localized names, area coordinates, metadata.
- Review/status/approval fields: `is_active`, `deleted_at`; no landing content review workflow.
- Localization support: English and Arabic names.
- Public visibility/RLS support: public SELECT for active, non-deleted geo records.
- Suitability: not suitable because geo records provide location identity, not reviewed landing content. `geo_areas.slug` is unique by `city_id`, so `areaSlug` alone does not prove canonical area identity.

### Provider Onboarding Leads

- Exists / not found: exists.
- Content-like fields: `center_name`, `area_text`, `city_text`, `preferred_language`, `message`, `metadata`.
- Review/status/approval fields: `status`, `priority`, `handled_at`, `deleted_at`; RLS is enabled.
- Localization support: `locale` and `preferred_language`.
- Public visibility/RLS support: lead data is private/admin operational data, not a public landing source.
- Suitability: not suitable because onboarding leads are intake/CRM-like records, not approved public landing content.

## 6. Explicit Non-Source Policy

The following must not be treated as landing content sources or proof of landing readiness:

- Provider/center descriptions: provider profile copy does not prove route-family uniqueness, canonical landing identity, editorial approval, medical review, or local relevance.
- Service descriptions: taxonomy descriptions are not unique landing intros by locale/country/family/entity and lack landing publication gates.
- Specialty descriptions: generic taxonomy descriptions do not establish landing content uniqueness or review status.
- Patient reviews: user-generated feedback must not be repurposed as editorial intro, medical copy, or local relevance proof.
- Media captions: media alt/caption text is scoped to media context, not landing content approval.
- Keyword seed JSON: keyword data may inform planning only and must not be imported or used as runtime content, entity truth, route authorization, or indexability authorization.
- Generated content: generated text is not approved landing content and must not be used as medical/local copy or as proof of review.
- Route slugs: slugs are request identifiers only; they do not prove entity existence, canonical uniqueness, public visibility, content uniqueness, or review approval.
- Provider counts: counts are insufficient because `hasUniqueVisibleIntro`, `hasLocalRelevance`, medical review, canonical uniqueness, and helper readiness are independent gates.
- Center counts: center counts also cannot substitute for reviewed content, local relevance, or canonical identity.

## 7. Future Landing Content Model

This section is conceptual only and does not authorize migrations or implementation.

### Recommended Table Name Candidates

Potential future names:

- `public.landing_page_contents`
- `public.seo_landing_contents`
- `public.public_landing_content`
- `public.cms_landing_pages`

Preferred naming direction: `public.landing_page_contents` or `public.seo_landing_contents`, because both communicate a bounded landing-specific content model without implying a broad CMS.

### Required Identity Fields

A future model should include:

- `id`
- `locale`
- `country` or `country_id`
- `family`
- `service_id` when the landing family is service or service-area
- `specialty_id` when the landing family is specialty or specialty-area
- `area_id` when the landing family is area-bearing and area identity is resolved
- `city_id` for area-bearing content if current area uniqueness remains scoped by city
- `canonical_landing_key`
- `canonical_area_key` only if later approved by a separate area canonicalization phase

### Content Fields

A future model may include:

- `title`
- `intro`
- structured `sections`, only after validation rules are approved
- FAQ only if separately approved later and only with reviewed, source-supported, non-thin answers

### Lifecycle / Status Fields

A future lifecycle may include:

- `draft`
- `in_review`
- `approved`
- `published`
- `archived`
- `rejected`

`published` should be the only lifecycle state eligible for public SELECT. `approved` alone should not imply publication.

### Editorial Review Fields

A future model should include:

- `editorial_review_status`
- `reviewed_by`
- `reviewed_at`
- optional private `review_notes`

### Medical Review Fields

A future model should include:

- `medical_review_status`
- `medical_reviewer_id`
- `medical_reviewed_at`
- optional private `medical_review_notes`

### Audit Fields

A future model should include:

- `created_by`
- `updated_by`
- `published_by`
- `created_at`
- `updated_at`
- `published_at`
- `deleted_at`

### Uniqueness Constraints

Future uniqueness must enforce one active/published content record per `locale`, `country`, `family`, and canonical entity key.

For non-area service/specialty content, uniqueness should resolve through canonical `service_id` or `specialty_id`, not slugs alone.

For area-bearing content, uniqueness must include `city_id` plus `area_id` or an approved `canonical_area_key` before publication is possible.

### Public Visibility Rules

Public visibility should require all of:

- `status = 'published'`;
- `deleted_at IS NULL`;
- canonical entity identity resolved;
- related public taxonomy/geo entities active and non-deleted;
- editorial review approved;
- medical review approved or explicitly `not_required`;
- no private reviewer, notes, admin, provider-dashboard, CRM, billing, or internal fields exposed.

## 8. Medical vs Non-Medical Classification

### Medical Content

Content is medical if it describes symptoms, diagnosis, treatment, prevention, outcomes, risks, contraindications, procedures, medications, emergency guidance, care expectations, clinical suitability, or medical service/specialty details.

Content should also default to medical when it is tied to services or specialties marked medical or requiring a medical disclaimer.

### Non-Medical Content

Content may be non-medical only when it is purely directory/navigation/platform/location orientation and contains no medical claims, care guidance, treatment language, outcomes, risk statements, or procedure explanations.

### When `medicalReviewStatus` May Be `not_required`

`medicalReviewStatus` may be `not_required` only when an explicit, auditable, future-approved classification marks the content non-medical, editorial review is approved, the content contains no medical claims, and the route family/taxonomy context does not imply clinical advice.

### When Medical Review Is Required / Approved

Medical review must be required and approved for content that discusses medical services, specialties, procedures, conditions, symptoms, treatment, care pathways, outcomes, risks, or clinical claims. Area-bearing medical/local content also requires approved area identity before review can support publication.

### Default Fail-Closed Behavior

The default state is fail-closed: missing, ambiguous, unavailable, pending, rejected, or unclassified review information must not pass as approved or not-required.

## 9. `hasUniqueVisibleIntro` Policy

### When It May Become True

A future public helper may set `hasUniqueVisibleIntro: true` only when:

- landing content exists;
- the intro is unique for the requested locale/country/family/canonical entity;
- the content is published;
- editorial review is approved;
- medical review is approved or explicitly `not_required`;
- canonical identity is resolved;
- the source is public/RLS-safe;
- no private/internal fields are exposed.

### Why It Remains False Now

It remains false now because there is no approved landing intro/content source, no landing review model, no publication workflow, and no content uniqueness model. The current skeleton helper correctly returns `hasUniqueVisibleIntro: false`.

### No Inference

`hasUniqueVisibleIntro` must not be inferred from slugs, counts, provider descriptions, center descriptions, service descriptions, specialty descriptions, reviews, media captions, keyword data, generated content, or route existence.

## 10. `hasLocalRelevance` Policy

Local relevance cannot be inferred from area slug, city name, area name, provider count, center count, or generic taxonomy/provider copy.

A future landing content model should either include reviewed local relevance fields/sections or depend on a separate approved local relevance source. For area-bearing families, local relevance also depends on resolved canonical area identity.

Because `areaSlug` alone is not canonical today, area-bearing local relevance must remain false until area canonicalization is resolved. The current skeleton helper correctly returns `hasLocalRelevance: false`.

## 11. `medicalReviewStatus` Policy

Current public landing helper status remains `missing`.

Allowed future public helper values are:

- `missing`
- `required`
- `approved`
- `not_required`

Internal future workflow states such as `pending` or `rejected` must map fail-closed. Suggested mapping:

- absent/unknown/unclassified -> `missing`
- pending -> `required`
- rejected -> `required` or blocked
- approved medical review -> `approved`
- explicit approved non-medical classification -> `not_required`

For `decideLandingPageGate(...)`, `missing` and `required` must fail the medical review gate. `approved` and explicitly valid `not_required` may pass only if all other gates also pass.

## 12. Canonical Identity Dependency

This decision map depends on `docs/seo/AREA_CANONICALIZATION_DECISION_MAP.md`.

Area-bearing content must not be publishable until area identity is resolved through approved city-context routing, an approved canonical area key, or another approved canonical identity model.

Service and specialty content still require canonical entity uniqueness. Slugs alone must not be treated as sufficient proof if future schema or route mappings can create ambiguity.

A future content table must not bypass canonical blockers. Content existence is only one gate; canonical uniqueness remains independently required.

## 13. RLS / Security / Public Access Plan

Future landing content should be public SELECT only when published and approved under the future content/review model.

Drafts, internal review notes, rejected content, archived content, reviewer identities as raw public fields, admin comments, provider-dashboard data, CRM data, billing data, and private moderation data must remain private.

Public helpers must not use service-role access, bypass RLS, expose raw Supabase errors, or treat server-side execution as permission to access private data.

Public helpers should expose derived gate booleans/status only, such as `hasUniqueVisibleIntro`, `hasLocalRelevance`, `medicalReviewStatus`, `canonicalIsUnique`, and safe counts if separately approved. They should not expose content payloads, reviewer fields, admin notes, metadata payloads, schema payloads, sitemap entries, ranking scores, sponsored flags, payment data, or private fields.

## 14. Query Helper Implications

The current skeleton helper must remain fail-closed now.

No data-bearing landing helper should be implemented until the content model, review workflow, canonical identity, public visibility rules, and RLS plan are approved.

Future helper behavior, if separately approved:

- may set `hasUniqueVisibleIntro: true` only from approved/published landing content;
- may set `hasLocalRelevance: true` only from an approved local relevance source;
- may set `medicalReviewStatus` only from an approved review model;
- must fail closed on missing, ambiguous, unavailable, unsafe, pending, or rejected states;
- must not generate content;
- must not query private/admin/provider-dashboard/CRM/billing data;
- must not use service-role access.

## 15. Route / Crawler Implications

SEO-D3H3A authorizes no route integration now.

There must be no visible noindex pages, no indexable pages, no metadata/canonical/hreflang output, no Open Graph output, no sitemap changes, no schema output, no robots changes, and no `llms.txt` changes from this task.

Future crawler publication must wait for all of:

- approved content model;
- approved canonical identity;
- approved RLS/security model;
- approved query helper readiness;
- route-check updates in a separate approved phase;
- human approval;
- explicit metadata/canonical/hreflang/sitemap/schema planning in a later approved phase.

## 16. Recommended Future Phases

Conservative sequence:

1. SEO-D3H3B — Landing Content Migration Plan only.
2. SEO-D3H3C — Landing Content RLS Plan only.
3. SEO-D3H3D — Local Relevance Source Plan.
4. SEO-D3H3E — Query Helper Readiness Recheck.
5. Later data-bearing helper planning only after content, review, canonical, local relevance, RLS, and route-check blockers are resolved.

No phase in this list authorizes route publication or crawler exposure by default.

## 17. Next Step Choice

Recommended next step: SEO-D3H3B — Landing Content Migration Plan only.

This should still be documentation-only. It should not create migrations. Migration planning is acceptable only as a single `docs/seo/*.md` planning file because the content/review decision map now exists, but schema implementation remains blocked until a separate explicit implementation phase.

## 18. Exact Allowed Files for Next Recommended Task

If SEO-D3H3B proceeds, the allowed file should be exactly one documentation file, for example:

- `docs/seo/LANDING_CONTENT_MIGRATION_PLAN.md`

No other file should be edited.

## 19. Exact Forbidden Files for Next Recommended Task

Forbidden for the next recommended documentation-only planning task:

- routes under `src/app/**`;
- `scripts/routes-check.mjs`;
- helpers under `src/lib/catalog/**`;
- decision helpers under `src/lib/seo/**`;
- migrations unless an explicit implementation phase approves them;
- package files;
- sitemap, robots, and `llms.txt`;
- `data/seo/**`;
- tests;
- public UI/content files;
- Supabase client/server files;
- generated database types unless an explicit approved phase requires regeneration.

## 20. Validation Expectations

For SEO-D3H3A, required validation commands are:

- `git status --short`
- `test -f docs/seo/LANDING_CONTENT_REVIEW_MODEL_DECISION_MAP.md && echo "SEO-D3H3A landing content review model doc exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Expected result: only `docs/seo/LANDING_CONTENT_REVIEW_MODEL_DECISION_MAP.md` is created. No code, routes, route-check, migrations, tests, metadata, schema, sitemap, robots, or `llms.txt` behavior should change.
