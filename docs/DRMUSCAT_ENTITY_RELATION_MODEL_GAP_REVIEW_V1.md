# DrMuscat Entity Relation Model Gap Review v1

Status: canonical gap review and implementation contract.
Last updated: 2026-06-25.
Scope: documentation and validation only.
Build mode: phased, fail-closed, reuse-first.

## 1. Purpose

This document reviews the current DrMuscat entity relationship foundations and locks the next implementation path for doctor multi-practice relations, facility/location relations, service/specialty relations, nearby/proximity relations, and internal link candidate generation.

The goal is to reuse the existing normalized relational model before adding new schema. DrMuscat must not solve entity relations by creating an uncontrolled generic graph table that duplicates existing source-of-truth tables.

## 2. Non-goals

This phase does not add or change:

- database migrations
- generated Supabase types
- public route rendering
- public noindex publishing
- sitemap output
- robots output
- metadata or JSON-LD runtime
- import staging behavior
- public profile UI
- ad rendering
- appointment or booking behavior

## 3. Existing relation foundations to reuse

### 3.1 Doctor to center/location

Existing source-of-truth foundation:

```text
public.doctor_practice_locations
```

Current supported links:

```text
doctor_id → doctors.id
center_id → centers.id
center_location_id → center_locations.id, optional
primary_specialty_id → specialties.id, optional
```

Current useful fields:

```text
title_override_en/title_override_ar
bio_override_en/bio_override_ar
consultation_note_en/consultation_note_ar
is_primary
is_active
is_accepting_new_patients
sort_order
metadata
deleted_at
```

Decision:

- This table remains the source of truth for doctor multi-practice relationships.
- A doctor can have multiple active practice locations.
- A doctor must keep one canonical doctor profile; locations render as profile blocks.
- No automatic doctor-location public pages are allowed in this phase.

### 3.2 Center/facility to geo

Existing source-of-truth foundation:

```text
public.center_locations
```

Current supported links:

```text
center_id → centers.id
country_id → geo_countries.id
region_id → geo_regions.id
city_id → geo_cities.id
area_id → geo_areas.id, optional
```

Current useful fields:

```text
slug
name_en/name_ar
address lines
landmark
phone / WhatsApp / email
map_url
latitude / longitude
is_primary
is_active
sort_order
metadata
deleted_at
```

Decision:

- This table remains the source of truth for facility-to-location and facility-to-geo linkage.
- Nearby/proximity engines must prefer coordinates when present, then same area, same city/wilayat, same governorate.
- Area slugs are not globally unique; canonical geo parent hierarchy must come from the canonical URL + geo contract.

### 3.3 Center/facility to service/specialty

Existing source-of-truth foundation:

```text
public.center_services
```

Current supported links:

```text
center_id → centers.id
center_location_id → center_locations.id, optional
taxonomy_group_id
service_category_id
service_id
specialty_id
```

Decision:

- This table remains the source of truth for facility service/specialty coverage.
- Location-specific services should use `center_location_id` when a service is only offered at a branch.
- Service and specialty pages must not read raw imported payloads; they should read reviewed public-safe provider relations.

### 3.4 Doctor to service/specialty

Existing source-of-truth foundation:

```text
public.doctor_services
```

Current supported links:

```text
doctor_id → doctors.id
doctor_practice_location_id → doctor_practice_locations.id, optional
center_id → centers.id, optional
center_location_id → center_locations.id, optional
center_service_id → center_services.id, optional
service_id → services.id, optional
specialty_id → specialties.id, optional
```

Decision:

- This table remains the source of truth for doctor-level services and specialty/service relationship display.
- Doctor services can be practice-location-specific when `doctor_practice_location_id` is present.
- Relationship engines should use doctor_services to infer doctor → service, doctor → specialty, doctor → facility, and doctor → area candidates.

## 4. Gaps found before runtime relation graph

The current foundations are useful, but the following gaps must be filled before public noindex publishing scales.

### 4.1 Missing practice type

`doctor_practice_locations` does not currently have a structured practice type.

Required future values:

```text
hospital_staff
clinic_staff
private_practice
visiting_consultant
department_member
unknown
```

Why it matters:

- Doctor profile copy and badges depend on role type.
- Facility pages need to distinguish staff doctors from visiting doctors.
- Internal links and related blocks should not imply a stronger relationship than source evidence supports.

### 4.2 Missing relation review status

The relation itself needs a review lifecycle independent of doctor/profile approval.

Required future values:

```text
draft
pending_review
approved
rejected
hold
archived
```

Why it matters:

- A doctor can be public-safe while one practice location is not confirmed.
- A facility can be public-safe while one doctor assignment is stale.
- Import-derived relations need admin review before public display.

### 4.3 Missing relation source and freshness fields

Required future fields:

```text
source_url
source_name
source_type
last_checked_at
confidence_score
reviewed_by_profile_id
reviewed_at
```

Why it matters:

- Provider pages need visible trust/freshness facts.
- Index promotion should block stale, unsourced relation facts.
- Relation candidates must not become public facts without provenance.

### 4.4 Missing department model

Hospitals and larger facilities need departments.

Required future source-of-truth tables:

```text
facility_departments
doctor_department_assignments
department_services
```

Why it matters:

- Hospitals need department blocks.
- Doctor profiles need department context when the doctor works inside a hospital.
- Internal linking needs department → doctors → services → area paths.

### 4.5 Missing relation candidates

The import pipeline can create public-safe entity candidates, but not reviewed relation candidates yet.

Required future staging/protected table:

```text
import_relation_candidates
```

Minimum fields:

```text
batch_id
source_raw_row_id
source_entity_candidate_id
relation_type
source_entity_type
source_entity_id
target_entity_type
target_entity_id
candidate_payload
match_score
match_reason
resolution_status
metadata
```

Allowed statuses:

```text
pending
approved
rejected
needs_manual_review
ignored
```

### 4.6 Missing internal link candidates

Entity relations should produce reviewed link candidates before runtime internal links render.

Required future protected table or projection:

```text
internal_link_candidates
```

Minimum fields:

```text
source_page_type
source_entity_type
source_entity_id
target_page_type
target_entity_type
target_entity_id
relation_type
anchor_en
anchor_ar
priority
reason
review_status
metadata
```

## 5. Required relation families

The relation graph must support these first-class families:

```text
doctor_practices_at_facility
doctor_practices_at_location
doctor_has_private_practice
doctor_visits_facility
doctor_member_of_department
facility_has_department
facility_offers_service
facility_offers_specialty
doctor_offers_service
doctor_has_specialty
facility_located_in_area
facility_near_facility
pharmacy_near_facility
lab_near_facility
area_contains_provider
specialty_available_in_area
service_available_in_area
article_related_to_entity
article_related_to_area
```

## 6. Public display rules

A relation cannot be displayed publicly unless:

```text
relation review status is approved
source or source_name exists when required
last_checked_at exists when required
source and target entities are public-safe
canonical URL exists for source and target when linked
private/admin/raw payload fields are excluded
contact/directions visibility rules pass
```

A relation can be stored internally before public display, but it must not generate public links or schema claims until approved.

## 7. Doctor multi-practice public behavior

A doctor profile can display multiple practice locations.

Display rules:

- Show the primary location first.
- Group locations by facility when multiple branches exist.
- Display practice type when approved.
- Display facility profile link only when facility canonical URL is public-safe.
- Display location/directions only when contact/location review rules pass.
- Do not imply appointment availability from `is_accepting_new_patients` unless appointment/availability has a reviewed public policy.

Forbidden behavior:

- No separate doctor-location SEO page by default.
- No booking promise.
- No unreviewed hospital affiliation claim.
- No staff/consultant label without reviewed practice type.

## 8. Facility public behavior

A facility profile can display:

```text
locations
doctors
departments
services
specialties
nearby pharmacies
nearby labs
nearby hospitals or clinics
area/wilayat links
```

Display rules:

- Doctors listed on a facility page must come from approved doctor-practice relations.
- Department blocks require approved facility department records.
- Nearby blocks require the proximity engine and canonical URL readiness.

## 9. Nearby/proximity implications

Future nearby logic should rank by:

```text
same exact area
same wilayat/city
coordinate distance
entity type relevance
specialty/service relevance
quality score
public-safe status
non-sponsored organic rank
```

Sponsored placements can be layered later, but must not replace organic relationship validity.

## 10. Internal linking implications

The future internal link generator must use relation facts and canonical URL rules.

Required first generated links:

```text
doctor → facility
doctor → practice location area
doctor → primary specialty
doctor → services
facility → doctors
facility → services
facility → area
area → providers
area → nearby areas
specialty → providers
service → providers
article/guide → related providers/services/areas
```

Links must remain candidates until approved or until deterministic rules are validated.

## 11. Schema implications

Structured data must not claim relationships that are not visible and approved.

Examples:

- A `Physician` schema should not claim `worksFor` unless the practice relation is approved and visible.
- A `Hospital` or `MedicalClinic` schema should not list departments or doctors unless visible on page.
- `areaServed` should follow canonical geo hierarchy and approved relation coverage.

## 12. Implementation dependency order

After this review, the safe implementation order is:

```text
1. doctor_practice_locations hardening migration
2. facility department foundation
3. import relation candidate staging
4. relation candidate generator from public-safe projection
5. admin relation review workflow
6. nearby/proximity helper
7. internal link candidate generator
8. page readiness v2 integration
9. public noindex publisher
```

## 13. Validation expectations

A static validator should ensure this document preserves the following required concepts:

```text
source-of-truth reuse
Doctor to center/location
Center/facility to geo
Center/facility to service/specialty
Doctor to service/specialty
practice type
relation review status
source and freshness fields
department model
relation candidates
internal link candidates
doctor multi-practice public behavior
nearby/proximity implications
schema implications
implementation dependency order
```
