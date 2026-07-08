# Public Entity Family Registry Contract

Status: canonical entity family registry contract.
Scope: documentation and validation only.
Build mode: registry-first, adapter-driven, cards-last.

## Purpose

DrKhaleej needs one registry for every public provider and care-adjacent entity family so SEO, geo, search, payloads, cards, internal links, and sitemap rules can share the same vocabulary.

Family-specific behavior must live in registry policy or adapters, not scattered through components.

## Required entity families

The registry must include:

```text
doctor
hospital
clinic
dental_clinic
dentist
pharmacy
lab
imaging_center
beauty_clinic
charity_center
pet_clinic
pet_shop
service
specialty
department
article
geo_area
```

## Provider families

Provider-like families are:

```text
doctor
hospital
clinic
dental_clinic
dentist
pharmacy
lab
imaging_center
beauty_clinic
charity_center
pet_clinic
pet_shop
```

Provider families may have profile pages, directory entries, local recommendations, and map/distance ranking after eligibility gates pass.

## Non-provider families

Non-provider families are:

```text
service
specialty
department
article
geo_area
```

They may have landing pages, internal links, topic clusters, and sitemap eligibility, but they are not provider cards.

## Public surface capabilities

Each family must declare whether it can support:

```text
detail page
directory page
geo page
service page
specialty page
search result
internal link target
sitemap entry
structured data
nearby recommendation
```

Capabilities are policy flags, not route approval.

## Route relation

The family registry must not build URLs directly.

It may map a provider family to a route family consumed by the canonical resolver.

Canonical route approval remains owned by the canonical route resolver.

## Search and recommendation use

Search intent and recommendations must use the registry to avoid splitting verticals into parallel systems.

Required vertical coverage:

```text
healthcare
pharmacy
lab
imaging
dental
beauty
pet
charity
geo
content
```

## Imported hospital rule

The registry may include `hospital`, but imported hospital detail/discovery/sitemap release remains blocked until release blockers pass.

Including a family in the registry is not public release approval.

## Non-goals

This contract does not add or change:

- public routes
- sitemap output
- search runtime
- cards
- payloads
- import write behavior
- database schema
