# Public Geo Registry Contract

Status: canonical geo registry contract for SEO and local discovery.
Scope: documentation and validation only.
Build mode: geo-first, inventory-gated, noindex-first.

## Purpose

DrKhaleej must rank and recommend by country, governorate, wilayat/city, area, neighborhood, and distance without hardcoding local logic into cards, search results, or profile pages.

Geo must be a shared registry and ranking primitive, not decorative text on provider cards.

## Canonical hierarchy

The public geo hierarchy is:

```text
country
→ governorate
→ wilayat_or_city
→ area
→ neighborhood_or_landmark optional
→ provider_location
```

For Oman, the initial public country is:

```text
om
```

## Required geo node fields

A public geo node must support:

```text
id
countryCode
governorateSlug
citySlug
areaSlug
neighborhoodSlug
nameEn
nameAr
canonicalPath
parentCanonicalPath
latitude
longitude
geoConfidence
inventoryStatus
indexEligibility
```

## Geo confidence

Allowed confidence values:

```text
verified
admin_reviewed
imported_candidate
unknown
```

Public index promotion requires `verified` or `admin_reviewed` unless a later explicit exception is documented.

## Inventory gates

Geo pages are noindex-first.

A geo page may become indexable only when:

```text
minimumProviderCount passed
minimumFamilyDiversity passed
uniqueIntro exists
breadcrumb exists
canonical exists
hreflang ready
internal link coverage exists
sitemap eligibility passes
no imported hospital release blocker is violated
```

## Nearby ranking policy

Nearby recommendations must rank by:

```text
1. same exact area
2. same city or wilayat
3. coordinate distance
4. same specialty or service
5. source quality and verification
6. profile completeness
7. freshness
8. sponsored placement later, separate from organic validity
```

## Search use

Search intent parsing must use geo registry tokens for:

```text
city search
area search
near me search
specialty near area
service near area
pharmacy near area
lab near area
imaging near area
pet service near area
beauty service near area
dental service near area
```

## Page types

Geo registry can feed:

```text
country page
governorate page
city page
area page
category plus geo page
service plus geo page
specialty plus geo page
nearby recommendation section
breadcrumb
sitemap eligibility
hreflang projection
```

## Fail-closed rules

Geo pages must stay noindex and out of sitemap when:

```text
canonical is missing
inventory is below threshold
area is ambiguous without parent city/wilayat
geo confidence is unknown
internal link coverage is missing
content is thin
hreflang is incomplete
```

## Non-goals

This contract does not add or change:

- public geo routes
- sitemap output
- search runtime
- provider ranking runtime
- map UI
- database schema
- imported hospital release
