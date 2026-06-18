# DrMuscat GEO-FULL-A Full Regional Geo Catalog Plan V1

## Purpose

Define the safe implementation plan for a complete regional geo catalog supporting DrMuscat location workflows.

The target admin experience is:

1. Select country.
2. Select city belonging to that country.
3. Select area, district, or neighborhood belonging to that city.
4. Save center location with WhatsApp and Google directions data.

This document is a planning and source-control phase only. It does not seed the full catalog yet.

## Non-scope

This phase does not add:

- migrations
- seed rows
- generated type updates
- RLS changes
- public routes
- provider dashboard UI
- public activation
- center publishing
- reviews
- ratings
- insurance
- license data
- media
- offers
- ads
- billing
- AI behavior

## Why this must not be hand-seeded blindly

A complete catalog for Gulf countries, Arab countries, and Iran includes thousands of cities, towns, districts, and neighborhoods.

Manually typing this data into SQL is not acceptable because it causes:

- inconsistent English and Arabic names
- missing cities
- duplicate areas
- invalid slugs
- wrong parent-child relationships
- licensing and attribution problems
- future maintenance failure

The data must be source-backed, versioned, and validated.

## Required country coverage

### Gulf countries

- Oman — `om`
- United Arab Emirates — `ae`
- Qatar — `qa`
- Bahrain — `bh`
- Kuwait — `kw`
- Saudi Arabia — `sa`

### Additional Arab countries

- Iraq — `iq`
- Syria — `sy`
- Jordan — `jo`
- Lebanon — `lb`
- Palestine — `ps`
- Egypt — `eg`
- Yemen — `ye`
- Morocco — `ma`
- Algeria — `dz`
- Tunisia — `tn`
- Libya — `ly`
- Sudan — `sd`
- Mauritania — `mr`

### Additional non-Arab regional country

- Iran — `ir`

## Required hierarchy

The database should keep the existing normalized structure:

```text
country
  region / governorate / emirate / province
    city
      area / district / neighborhood
```

The admin UI should expose a simpler experience:

```text
country
  city
    area / district / neighborhood
```

`region_id` remains required in the database and should be resolved internally from the selected city when possible.

## Current schema impact

The current schema already supports:

- `geo_countries`
- `geo_regions`
- `geo_cities`
- `geo_areas`
- `center_locations.country_id`
- `center_locations.region_id`
- `center_locations.city_id`
- `center_locations.area_id`
- `center_locations.whatsapp_phone`
- `center_locations.map_url`
- `center_locations.latitude`
- `center_locations.longitude`

Before full seeding, confirm that the `country_code` enum supports every required country code.

If it does not, add a separate migration phase:

- `GEO-FULL-B1`: extend `country_code` enum or replace enum dependency with constrained text/domain strategy.

Do not attempt full seed until enum support is confirmed.

## Data source strategy

### Country and city layer

Preferred source: GeoNames export files.

Reason:

- provides country files and global city extracts
- includes ISO country codes
- includes administrative codes
- includes coordinates
- provides daily database exports
- has a clear CC BY 4.0 licensing model

Required handling:

- store source name in seed metadata
- store source version/date in seed metadata
- keep generated output deterministic
- preserve English names
- prefer Arabic names from alternate names where available
- never claim source data is perfect

### Area / district / neighborhood layer

Preferred source: OpenStreetMap-derived data or verified local datasets.

Reason:

- neighborhood and district coverage is usually richer than city-only gazetteers
- supports real-world local naming

Required handling:

- OSM-derived data requires attribution handling
- do not copy Google Maps neighborhood lists
- do not use copyrighted map data without permission
- store source and license metadata
- provide fallback when area coverage is incomplete

## Seed architecture

Full geo seed must be split into batches.

Recommended phases:

### GEO-FULL-B: country catalog

Add or validate all required country rows.

Expected output:

- `geo_countries` rows only
- validator allows only approved country seed file
- no regions/cities/areas yet

### GEO-FULL-C: region catalog

Add first-level administrative divisions.

Examples:

- Oman governorates
- UAE emirates
- Saudi provinces
- Iranian provinces
- Iraqi governorates
- Syrian governorates

Expected output:

- `geo_regions` rows
- no cities or areas yet unless required for referential integrity checks

### GEO-FULL-D: city catalog

Add cities/towns for the supported countries.

Expected output:

- `geo_cities` rows
- each city linked to a valid country and region
- population and source metadata if available

### GEO-FULL-E: area/district catalog

Add areas, districts, or neighborhoods where source coverage is reliable.

Expected output:

- `geo_areas` rows
- each area linked to a valid city
- source metadata
- no fake neighborhoods

### GEO-FULL-F: dependent admin UI

Update center location admin UI:

- country dropdown controls city list
- city dropdown controls area list
- region can remain hidden if resolvable from city
- if a city has no area rows, area remains optional
- free address, Google Maps URL, latitude/longitude remain available

## Required validation rules

Validators must block:

- unapproved seed files
- `insert into public.centers`
- fake centers, doctors, reviews, ratings
- insurance and license data in geo seed
- public activation data
- generated rows without source metadata
- invalid slug format
- city rows without valid parent region/country
- area rows without valid parent city
- duplicate active slugs under the same parent

## UI behavior rules

Admin location form must eventually behave like this:

- Country is required.
- City is required.
- Area is optional.
- Region is hidden or read-only when derived from city.
- If country changes, city and area selections reset.
- If city changes, area selection resets.
- WhatsApp remains required for launch-ready location data.
- Google Maps URL or latitude/longitude remains required for directions-ready location data.
- Saving a location must never activate or publish the center.

## Fallback policy

Because full neighborhood coverage varies by country:

- city must be required
- area must remain optional
- free address fields must remain available
- map URL or coordinates must remain available
- quality gate should distinguish:
  - location exists
  - WhatsApp exists
  - directions data exists
  - area/neighborhood exists

Missing area data must not block saving a valid location if address and map directions are present.

## Acceptance criteria

This phase is accepted when:

- the coverage list is documented
- source strategy is documented
- seed phases are documented
- enum risk is documented
- dependent UI behavior is documented
- stop conditions are documented

No preview is required for this documentation phase.

## Stop conditions

Stop before full seed implementation if:

- source licensing is unclear
- source date/version is unavailable
- country_code enum cannot support required countries
- city-to-region mapping cannot be validated
- area source is incomplete and would be falsely presented as complete
- generated seed cannot be made deterministic
- validators cannot protect against unapproved seed expansion
