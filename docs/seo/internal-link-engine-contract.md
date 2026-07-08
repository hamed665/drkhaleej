# Internal Link Engine Contract

Status: canonical internal link engine contract.
Scope: documentation and validation only.
Build mode: candidate-first, budgeted, canonical-only, fail-closed.

## Purpose

Internal links must be generated from safe entity relations, geo context, services, specialties, and editorial content without hand-authored card logic or random related links.

The goal is controlled crawl discovery, clean topic clusters, logical PageRank distribution, and local recommendations without turning pages into link confetti. Humanity has already produced enough confetti.

## Candidate model

An internal link candidate must include:

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
canonical_path
public_safe
route_enabled
```

## Source page types

Supported source page types:

```text
doctor_profile
center_profile
hospital_profile
pharmacy_profile
lab_profile
imaging_profile
dental_profile
beauty_profile
pet_profile
charity_profile
geo_page
specialty_page
service_page
article_page
```

## Relation types

Required relation types:

```text
doctor_practices_at_facility
facility_has_doctor
facility_offers_service
doctor_has_specialty
provider_located_in_area
provider_near_provider
service_available_in_area
specialty_available_in_area
article_related_to_entity
article_related_to_service
article_related_to_area
same_specialty_provider
same_service_provider
same_area_provider
nearby_pharmacy
nearby_lab
nearby_imaging
nearby_pet_service
nearby_beauty_service
nearby_dental_service
```

## Candidate acceptance rules

A candidate may be projected only when:

```text
target canonical exists
target publicSafe = true
target publicRouteEnabled = true
review_status is approved or deterministic_approved
canonical path comes from canonical route resolver
source and target are not the same page
target is not duplicated on the same source page
anchor text is not duplicated on the same source page
link budget is not exceeded
imported hospital release blocker is not violated
```

## Link budgets

Initial maximum total links per page type:

```text
doctor_profile: 18
center_profile: 22
hospital_profile: 22
pharmacy_profile: 13
lab_profile: 14
imaging_profile: 14
dental_profile: 18
beauty_profile: 14
pet_profile: 13
charity_profile: 12
geo_page: 30
specialty_page: 24
service_page: 24
article_page: 16
```

Budgets must be enforced before rendering and before sitemap eligibility uses internal-link coverage.

## Budget families

Recommended budget families:

```text
primaryRelations
geo
specialty
services
nearby
articles
faq
sameArea
sameFamily
```

## Anchor policy

Anchors must be useful and natural.

Allowed examples:

```text
Cardiology doctors in Muscat
Heart specialists near Bausher
MRI centers near Al Khuwair
Nearby pharmacies in Qurum
Pet vaccination clinics in Seeb
Dental implant clinics in Muscat
```

Disallowed patterns:

```text
Best cardiologist Muscat repeated everywhere
Exact same anchor repeated on one page
Empty anchor
Click here
Provider name only for every related link
Keyword-stuffed anchors
```

## Geo policy

Nearby links must respect geo registry ranking:

```text
same exact area
same city or wilayat
coordinate distance
same specialty or service
source quality and verification
profile completeness
freshness
```

## Imported hospital rule

Imported hospitals must not be public internal link targets until imported hospital controlled release passes.

The engine may create blocked candidates for reporting, but public projections must exclude them.

## Sitemap dependency

Sitemap eligibility must eventually require minimum internal link coverage.

A page with no incoming or outgoing public-safe internal links is an orphan risk and must not be promoted to sitemap through this engine.

## Non-goals

This contract does not add or change:

- runtime internal links
- public page rendering
- sitemap output
- hreflang output
- database schema
- imported hospital release
- cards
- search runtime
