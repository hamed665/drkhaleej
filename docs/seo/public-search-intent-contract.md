# Public Search Intent Contract

Status: canonical search intent contract for public discovery.
Scope: documentation and validation only.
Build mode: intent-first, geo-aware, noindex-safe.

## Purpose

Public search must understand provider family, specialty, service, city, area, and near-me intent before it can safely rank results or generate indexable landing pages.

Search must not become a pile of string matching glued to provider cards. That is how local SEO products turn into a drawer full of mystery cables.

## Required intents

The search intent model must support:

```text
provider_name
doctor_by_specialty
center_by_category
service_near_area
specialty_near_area
pharmacy_near_area
lab_near_area
imaging_near_area
emergency_near_area
pet_service_near_area
beauty_service_near_area
charity_near_area
dental_service_near_area
near_me
unknown
```

## Parsed intent fields

A parsed search intent must expose:

```text
rawQuery
normalizedQuery
language
intent
entityFamily
providerFamily
vertical
specialtySlug
serviceSlug
citySlug
areaSlug
nearMe
geoConfidence
minimumResultFamilyDiversity
indexableLandingAllowed
```

## Geo integration

Search must use the public geo registry for city, area, and near-me tokens.

Search must not infer public indexable geo pages from raw text alone.

Geo-aware ranking order:

```text
1. exact provider name match
2. exact area match
3. exact city or wilayat match
4. specialty or service match
5. entity family match
6. coordinate distance
7. source quality and verification
8. profile completeness
9. freshness
```

## Entity integration

Search must use the public entity family registry for entity and vertical interpretation.

The following verticals must be supported:

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

## Landing page policy

Search result pages remain noindex by default.

An indexable landing page may only be created through dedicated geo/service/specialty payloads after:

```text
canonical route resolver passes
geo registry confidence passes
entity family registry supports the family
minimum inventory passes
internal link coverage exists
hreflang is ready
sitemap eligibility passes
content is not thin
```

## Near-me policy

`near_me` intent must never create an indexable static page by itself.

Near-me is runtime personalization only unless transformed into a real geo page with verified area/city context.

## Recommendation policy

Search recommendations must prioritize:

```text
same exact area
same city or wilayat
same specialty or service
same provider family
nearby verified providers
source-reviewed providers
complete profiles
```

## Unsafe shortcuts

Search must not:

```text
build provider URLs directly
render unsafe claims in cards
promote imported hospital results before release blockers pass
create sitemap URLs from search queries
create hreflang from unapproved query pages
use client-side heavy search for public SEO pages
```

## Non-goals

This contract does not add or change:

- search runtime
- public routes
- indexable landing pages
- sitemap output
- cards
- payloads
- database schema
- imported hospital release
