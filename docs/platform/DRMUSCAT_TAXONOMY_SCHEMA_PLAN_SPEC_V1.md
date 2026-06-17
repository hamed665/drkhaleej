# DrMuscat Taxonomy Schema Plan Spec V1

## 1. Purpose

This document is a documentation-only schema plan for extending DrMuscat taxonomy and provider profile foundations after `DRMUSCAT_TAXONOMY_AND_PROVIDER_PROFILE_MODEL_SPEC_V1.md`.

It defines the recommended future table/relation model for verticals, categories, center classification, doctor languages, insurance acceptance, license hardening, profile completeness, public activation gates, and taxonomy-governed public display.

This document does not implement database changes, migrations, RLS, generated types, seed rows, routes, UI, provider dashboard, public publishing, reviews, billing, media upload, ads, offers, or AI behavior.

## 2. Current database foundation

The current repository already has important foundations:

- `taxonomy_groups`
- `service_categories`
- `services`
- `specialties`
- `centers`
- `center_locations`
- `center_services`
- `doctors`
- `doctor_practice_locations`
- `doctor_services`
- `doctor_schedules`
- `doctor_schedule_exceptions`
- `provider_license_records`
- `media_assets`
- `entity_media`
- review foundations and review companion foundations

The next schema work should extend these foundations instead of replacing them.

## 3. Core schema principle

Keep `center_type` broad. Do not turn it into the entire product taxonomy.

Future taxonomy should use dedicated tables and relations:

- verticals: top-level health/wellness/pet/nutrition/diagnostics families
- categories: public browsing groupings under verticals
- services: searchable services/treatments/tests/procedures
- specialties: professional specialties, mainly for doctors/providers
- center category links: what a center publicly belongs to
- center primary vertical/category: public profile identity and SEO grouping
- doctor specialty/language/insurance/license relations

## 4. Existing taxonomy table extension policy

Existing tables are useful and should stay:

- `taxonomy_groups` can remain a broad taxonomy grouping layer.
- `service_categories` can remain category hierarchy for services.
- `services` can remain canonical service/treatment/test/procedure records.
- `specialties` can remain professional specialty records.

Future schema should add missing relational layers rather than mutate old migrations.

Existing SQL migrations must not be edited. Additive future migrations only.

## 5. Recommended future table groups

### 5.1 Vertical catalog

Recommended future table: `public.healthcare_verticals`

Purpose: stable public vertical families that group center categories, services, and specialties.

Suggested columns:

- `id uuid primary key`
- `slug text unique not null`
- `name_en text not null`
- `name_ar text not null`
- `description_en text null`
- `description_ar text null`
- `is_medical boolean not null default true`
- `requires_medical_disclaimer boolean not null default false`
- `is_human_health boolean not null default true`
- `is_veterinary boolean not null default false`
- `is_food_related boolean not null default false`
- `schema_org_hint text null`
- `is_active boolean not null default true`
- `sort_order integer not null default 0`
- `metadata jsonb not null default '{}'::jsonb`
- timestamps and soft delete

Why separate from `taxonomy_groups`:

- verticals are product/public navigation families
- taxonomy_groups currently support service taxonomy
- verticals need public display and schema.org guardrails

Recommended initial vertical slugs:

- `medical`
- `dental`
- `aesthetic`
- `diagnostics`
- `pharmacy`
- `wellness`
- `fitness`
- `nutrition`
- `healthy_food`
- `veterinary`
- `home_care`
- `rehabilitation`
- `mental_health`
- `optical_eye_care`
- `other_health`

### 5.2 Center category catalog

Recommended future table: `public.center_categories`

Purpose: public category layer for centers, not services.

Suggested columns:

- `id uuid primary key`
- `vertical_id uuid not null references healthcare_verticals(id)`
- `parent_category_id uuid null references center_categories(id)`
- `slug text not null`
- `name_en text not null`
- `name_ar text not null`
- `description_en text null`
- `description_ar text null`
- `default_center_type center_type null`
- `is_medical boolean not null default true`
- `requires_medical_disclaimer boolean not null default false`
- `public_directory_enabled boolean not null default false`
- `public_profile_enabled boolean not null default true`
- `schema_org_hint text null`
- `is_active boolean not null default true`
- `sort_order integer not null default 0`
- `metadata jsonb not null default '{}'::jsonb`
- timestamps and soft delete

Unique rule:

- unique `(vertical_id, slug)` where not deleted

Examples:

- medical → clinic
- medical → hospital
- dental → dental clinic
- diagnostics → medical laboratory
- diagnostics → imaging center
- pharmacy → pharmacy
- wellness → wellness center
- fitness → gym / fitness center
- nutrition → nutrition center
- healthy_food → healthy restaurant / healthy cafe, only if approved
- veterinary → pet clinic / veterinary clinic, only if approved

### 5.3 Center category relation

Recommended future table: `public.center_category_assignments`

Purpose: attach centers to one or more public categories.

Suggested columns:

- `id uuid primary key`
- `center_id uuid not null references centers(id)`
- `vertical_id uuid not null references healthcare_verticals(id)`
- `category_id uuid not null references center_categories(id)`
- `is_primary boolean not null default false`
- `is_public boolean not null default false`
- `review_status content_review_status or text/enum later`
- `reviewed_by_profile_id uuid null`
- `reviewed_at timestamptz null`
- `sort_order integer not null default 0`
- `metadata jsonb not null default '{}'::jsonb`
- timestamps and soft delete

Rules:

- exactly one primary public category per center should be enforced by server validation first
- future partial unique indexes may enforce one active primary category per center
- public pages should use only reviewed/approved assignments

### 5.4 Service-category vertical bridging

Existing services already reference taxonomy groups and service categories. Future schema may add optional vertical links to reduce ambiguity.

Recommended future extension options:

Option A: add `vertical_id` nullable to `service_categories`, `services`, and `specialties`.

Option B: add bridge tables:

- `service_vertical_assignments`
- `specialty_vertical_assignments`

Recommendation:

- Prefer additive nullable `vertical_id` only if each item usually belongs to one vertical.
- Use bridge tables if services/specialties may belong to multiple verticals.
- Start with plan/review before migration.

### 5.5 Doctor languages

Recommended future tables:

- `public.languages`
- `public.doctor_languages`

`languages` suggested columns:

- `id uuid primary key`
- `code text unique not null`
- `name_en text not null`
- `name_ar text not null`
- `native_name text null`
- `is_active boolean not null default true`
- `sort_order integer not null default 0`
- timestamps and soft delete

`doctor_languages` suggested columns:

- `id uuid primary key`
- `doctor_id uuid not null references doctors(id)`
- `language_id uuid not null references languages(id)`
- `proficiency text null`
- `is_public boolean not null default true`
- `sort_order integer not null default 0`
- timestamps and soft delete

Recommended initial language codes:

- `ar`
- `en`
- `fa`
- `hi`
- `ur`
- `ml`
- `tl`
- `fr`
- `other`

No seed rows yet unless a seed phase is approved.

### 5.6 Doctor education and credentials

Recommended future tables:

- `public.doctor_education_entries`
- `public.doctor_credentials`

Education entries:

- doctor_id
- degree_en
- degree_ar
- institution_en
- institution_ar
- country_code
- graduation_year
- sort_order
- public visibility
- review status

Credentials:

- doctor_id
- credential_type
- name_en
- name_ar
- issuing_body_en
- issuing_body_ar
- country_code
- issued_at
- expires_at
- public visibility
- review status

### 5.7 Insurance catalog

Recommended future tables:

- `public.insurance_providers`
- `public.insurance_plans`
- `public.center_insurance_acceptance`
- `public.doctor_insurance_acceptance`

Insurance provider columns:

- slug
- name_en
- name_ar
- country_code
- website_url
- logo_media_id later
- is_active
- sort_order
- metadata

Insurance plan columns:

- provider_id
- slug
- name_en
- name_ar
- plan_type
- is_active
- metadata

Center acceptance columns:

- center_id
- insurance_provider_id
- insurance_plan_id nullable
- accepted boolean
- direct_billing boolean
- reimbursement_support boolean
- notes_en
- notes_ar
- verification_status
- reviewed_by_profile_id
- reviewed_at

Doctor acceptance columns may be added only if doctor-level insurance differs from center-level insurance.

### 5.8 License model hardening

Current license foundation exists. Future schema planning should decide whether to extend current `provider_license_records` or add companion tables.

Recommended future extension fields:

- license type
- issuing authority canonical catalog
- issue date
- expiry date
- renewal status
- public display label en/ar
- private document link
- verification notes

Recommended future table:

- `public.license_authorities`

Suggested columns:

- slug
- name_en
- name_ar
- country_code
- authority_type
- website_url
- is_active

Do not seed Omani regulatory authority names without verification.

### 5.9 Center hours

Center hours should be branch/location-level first.

Recommended future table:

- `public.center_opening_hours`

Suggested columns:

- center_id
- center_location_id nullable
- day_of_week enum or text constrained to Oman week days
- open_time
- close_time
- break_start_time
- break_end_time
- timezone default `Asia/Muscat`
- is_closed boolean default false
- notes_en
- notes_ar
- effective_from
- effective_to

Special hours table later:

- `public.center_special_hours`

### 5.10 Public activation gates

Recommended future table:

- `public.center_profile_quality_checks`

Purpose: record computed/admin-reviewed readiness checks before public activation.

Suggested fields:

- center_id
- has_name_en
- has_name_ar
- has_primary_category
- has_public_contact
- has_location
- has_short_description_en
- has_short_description_ar
- has_license_review
- has_media_optional
- has_services_optional
- is_ready_for_public_review
- checked_at
- metadata

This may also be implemented as a server helper first before table storage. Do not overbuild storage before workflow is clear.

## 6. Recommended migration phases

TAX-C should not be one giant migration.

Recommended split:

### TAX-C1 vertical/category catalog foundation

Adds:

- healthcare_verticals
- center_categories
- center_category_assignments

No seed rows unless approved.

### TAX-C2 language catalog and doctor languages

Adds:

- languages
- doctor_languages

No seed rows unless approved.

### TAX-C3 doctor education and credentials

Adds:

- doctor_education_entries
- doctor_credentials

### TAX-C4 insurance catalog foundation

Adds:

- insurance_providers
- insurance_plans
- center_insurance_acceptance
- optional doctor_insurance_acceptance if approved

### TAX-C5 license authority catalog and license extension plan

Adds or extends license authority support after regulatory terminology is verified.

### TAX-C6 center opening hours

Adds center opening hours and special hours foundations.

### TAX-C7 public activation gate helper/table

Adds readiness helper and/or quality check table after exact publish rules are approved.

## 7. RLS planning

RLS must be a separate approved phase when new tables are added.

Suggested RLS posture:

- public can read active approved taxonomy labels only
- platform admin can manage through service-role gated admin actions
- provider users later can read own center relations and submit pending edits only after provider dashboard approval
- no public read of internal notes, metadata containing private workflow data, rejected reviews, or private license documents

## 8. Seed planning

No real seed rows until a seed phase is explicitly approved.

When seed phase is approved, seed data must be:

- bilingual
- Oman-first
- minimal but useful
- reviewed by human
- not fake providers
- not fake ratings
- not fake licenses

Suggested future seed sets:

- verticals
- center categories
- core specialties
- common services
- languages
- insurance providers only after verified

## 9. Public URL impact

Future taxonomy schema will affect routes later, but this plan does not implement routes.

Potential future public route families:

- `/:locale/:country/categories`
- `/:locale/:country/categories/:slug`
- `/:locale/:country/specialties`
- `/:locale/:country/specialties/:slug`
- `/:locale/:country/services/:slug`
- `/:locale/:country/areas/:areaSlug/:categorySlug` only after thin-page checks

Route creation must be a separate SEO-approved phase.

## 10. Admin UI impact

Future admin UI should eventually support:

- category assignment on center edit
- primary category selection
- service assignment
- doctor languages
- doctor education/credentials
- insurance acceptance
- license authority review
- opening hours
- profile completeness checks

This plan does not implement UI.

## 11. Open decisions before migration

Before TAX-C implementation, decide:

1. Should verticals be separate from taxonomy_groups, or should taxonomy_groups be extended?
2. Should service/specialty vertical links be nullable direct fields or bridge tables?
3. Should doctor insurance be separate from center insurance in MVP?
4. Should healthy food and veterinary launch now, or remain planned-but-disabled?
5. What are the exact public activation minimum requirements?
6. Which Omani license authority labels are correct?
7. Which insurance providers are verified enough to seed?
8. Should center hours be center-level only first, or location-level from day one?

## 12. Recommended answer defaults

Unless product leadership decides otherwise:

- Use separate `healthcare_verticals` table.
- Use `center_categories` and `center_category_assignments` for public center classification.
- Keep `center_type` broad and stable.
- Keep healthy food and veterinary planned but disabled until explicitly approved.
- Add insurance catalog only after verified data source or manual verified admin entry workflow exists.
- Do not seed insurance or license authority names from memory.
- Keep public activation blocked until profile minimum gates are implemented.

## 13. Stop conditions

Future agents must stop if asked to:

- edit existing migrations instead of adding new ones
- add hardcoded public categories directly in React only
- add public activation before categories/contact/location/copy checks exist
- seed insurance providers without verified names
- seed license authorities without verified regulatory terminology
- create route pages from taxonomy without anti-thin-page rules
- add provider dashboard edits before ownership/RLS scope is approved
- expose metadata or private workflow details publicly

## 14. Acceptance criteria

This TAX-B spec is complete when it defines:

- what current taxonomy foundations exist
- what new tables are recommended
- why center_type should stay broad
- how center categories attach to centers
- how doctor languages, education, credentials, insurance, license authority, hours, and activation gates should be modeled
- how migration phases should be split
- what RLS, seed, route, admin UI, and stop-condition constraints apply

This spec makes no product behavior live.
